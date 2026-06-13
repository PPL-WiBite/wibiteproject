<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FoodController extends Controller
{
    public function index(): JsonResponse
    {
        $foods = Food::orderBy('created_at', 'desc')->get()
            ->map(function (Food $food) {
                $food->remaining_portions = $food->remainingPortions();
                return $food;
            });

        return response()->json($foods);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'portions' => 'required|integer|min:1',
            'weight_kg' => 'nullable|numeric|min:0',
            'pickup_address' => 'required|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'expired_date' => 'nullable|string',
            'expired_at' => 'nullable|date',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|max:4096',
        ]);

        $user = $request->user();

        $imageUrl = $validated['image'] ?? null;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('foods', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $expiredAt = $validated['expired_at'] ?? null;
        $expiredDateLabel = $validated['expired_date'] ?? ($expiredAt ?: 'Hari ini');

        $food = Food::create([
            'name' => $validated['name'],
            'portions' => $validated['portions'],
            'claimed_portions' => 0,
            'weight_kg' => $validated['weight_kg'] ?? 1,
            'pickup_address' => $validated['pickup_address'],
            'lat' => $validated['lat'] ?? null,
            'lng' => $validated['lng'] ?? null,
            'expired_date' => $validated['expired_date'] ?? 'Hari ini',
            'description' => $validated['description'] ?? '',
            'category' => $validated['category'] ?? 'Makanan Matang',
            'status' => 'available',
            'donor_id' => $user->id,
            'donor_name' => $user->name,
            'image' => $imageUrl ?: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
        ]);

        $food->remaining_portions = $food->remainingPortions();

        return response()->json($food, 201);
    }

    public function update(Request $request, Food $food): JsonResponse
    {
        $user = $request->user();

        if ($food->donor_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'portions' => 'nullable|integer|min:1',
            'weight_kg' => 'nullable|numeric|min:0',
            'pickup_address' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'expired_date' => 'nullable|string',
            'expired_at' => 'nullable|date',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'status' => 'nullable|in:available,claimed,completed',
            'image' => 'nullable|string',
            'image_file' => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('foods', 'public');
            $validated['image'] = url('storage/' . $path);
        }

        // Pastikan portions baru tidak lebih kecil dari yang sudah diklaim
        if (array_key_exists('portions', $validated) && $validated['portions'] !== null) {
            if ($validated['portions'] < $food->claimed_portions) {
                return response()->json([
                    'error' => "Porsi baru ({$validated['portions']}) tidak boleh lebih kecil dari porsi yang sudah diklaim ({$food->claimed_portions}).",
                ], 422);
            }
        }

        unset($validated['image_file']);
        $payload = array_filter($validated, fn ($v) => $v !== null);

        // Kalau expired_at diubah, update juga label expired_date supaya konsisten
        if (array_key_exists('expired_at', $payload) && !array_key_exists('expired_date', $payload)) {
            $payload['expired_date'] = $payload['expired_at'];
        }

        $food->update($payload);

        // Recalculate status kalau portions berubah
        if (array_key_exists('portions', $payload)) {
            if ($food->claimed_portions >= $food->portions) {
                $food->status = $food->status === 'completed' ? 'completed' : 'claimed';
            } else {
                $food->status = $food->status === 'completed' ? 'completed' : 'available';
            }
            $food->save();
        }

        $food->remaining_portions = $food->remainingPortions();

        return response()->json($food);
    }

    public function destroy(Request $request, Food $food): JsonResponse
    {
        $user = $request->user();

        if ($food->donor_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $food->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Claim sebagian atau seluruh porsi dari sebuah makanan.
     * Status food hanya berubah jadi "claimed" saat semua porsi habis diklaim.
     */
    public function claim(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'food_id' => 'required|exists:foods,id',
            'pickup_time' => 'required|string',
            'portions' => 'nullable|integer|min:1',
        ]);

        $user = $request->user();
        $requestedPortions = 1;

        $claim = DB::transaction(function () use ($validated, $user, $requestedPortions) {
            // Pastikan user belum punya claim aktif lain
            $hasActiveClaim = Claim::where('receiver_id', $user->id)
                ->where('status', 'active')
                ->lockForUpdate()
                ->exists();
            if ($hasActiveClaim) {
                abort(response()->json([
                    'error' => 'Kamu masih punya klaim aktif. Selesaikan klaim sebelumnya dulu untuk mengklaim makanan baru.',
                ], 400));
            }

        $portionsToClaim = $validated['portions'] ?? 1;
        $remainingPortions = $food->portions - $food->claimed_portions;

        if ($portionsToClaim > $remainingPortions) {
            return response()->json(['error' => "Hanya tersisa {$remainingPortions} porsi yang tersedia."], 400);
        }

        // Validate that pickup_time does not exceed expired_date
        $pickupTime = new \DateTime($validated['pickup_time']);
        $expiredDate = new \DateTime($food->expired_date);

        if ($pickupTime > $expiredDate) {
            return response()->json(['error' => 'Waktu penjemputan tidak boleh melebihi batas waktu pengambilan.'], 400);
        }

        $newClaimedPortions = $food->claimed_portions + $portionsToClaim;
        $newStatus = $newClaimedPortions >= $food->portions ? 'claimed' : 'available';

        $food->update([
            'status' => $newStatus,
            'claimed_portions' => $newClaimedPortions,
            'claimed_by' => $user->id,
            'claimed_at' => now(),
        ]);

        $verificationCode = strval(rand(100000, 999999));

        Claim::create([
            'food_id' => $food->id,
            'receiver_id' => $user->id,
            'portions' => $portionsToClaim,
            'status' => 'active',
            'pickup_time' => $validated['pickup_time'],
            'code' => $verificationCode,
        ]);

            $remaining = $food->remainingPortions();

            if ($remaining <= 0) {
                abort(response()->json(['error' => 'Porsi makanan sudah habis diklaim.'], 400));
            }

            if ($requestedPortions > $remaining) {
                abort(response()->json([
                    'error' => "Porsi yang diminta melebihi sisa porsi. Sisa: {$remaining}.",
                ], 400));
            }

            $food->claimed_portions = $food->claimed_portions + $requestedPortions;

            // Tandai "claimed" hanya kalau semua porsi sudah diambil
            if ($food->claimed_portions >= $food->portions) {
                $food->status = 'claimed';
                if (!$food->claimed_by) {
                    $food->claimed_by = $user->id;
                }
                if (!$food->claimed_at) {
                    $food->claimed_at = now();
                }
            } else {
                $food->status = 'available';
            }

            $food->save();

            return Claim::create([
                'food_id' => $food->id,
                'receiver_id' => $user->id,
                'portions' => $requestedPortions,
                'status' => 'active',
            ]);
        });

        $claim->load(['food', 'receiver:id,name,role']);

        return response()->json([
            'success' => true,
            'claim' => $claim,
            'food' => [
                'id' => $claim->food->id,
                'remaining_portions' => $claim->food->remainingPortions(),
                'status' => $claim->food->status,
            ],
        ]);
    }

    /**
     * Baik donor maupun receiver perlu konfirmasi "Selesai" sebelum claim benar-benar selesai.
     * Receiver: konfirmasi makanan sudah diterima.
     * Donor: konfirmasi makanan sudah diserahkan ke receiver.
     * Claim dianggap "completed" kalau kedua pihak sudah konfirmasi.
     * Food baru dianggap "completed" kalau semua claim-nya completed dan semua porsi habis.
     */
    public function completeClaim(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'claim_id' => 'nullable|exists:claims,id',
            'food_id' => 'nullable|exists:foods,id',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            $claim = null;

            if (!empty($validated['claim_id'])) {
                $claim = Claim::with('food')
                    ->where('id', $validated['claim_id'])
                    ->lockForUpdate()
                    ->first();
            } elseif (!empty($validated['food_id'])) {
                // Fallback lama: cari claim aktif milik user pada food tsb
                $claim = Claim::with('food')
                    ->where('food_id', $validated['food_id'])
                    ->where('receiver_id', $user->id)
                    ->where('status', 'active')
                    ->lockForUpdate()
                    ->first();
            }

            if (!$claim) {
                return response()->json(['error' => 'Claim tidak ditemukan.'], 404);
            }

            $food = $claim->food;
            if (!$food) {
                return response()->json(['error' => 'Makanan tidak ditemukan.'], 404);
            }

            $isReceiver = $claim->receiver_id === $user->id;
            $isDonor = $food->donor_id === $user->id;

            if (!$isReceiver && !$isDonor && !$user->isAdmin()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $role = null;
            if ($isReceiver) {
                if ($claim->receiver_completed_at) {
                    return response()->json([
                        'error' => 'Kamu sudah mengonfirmasi penerimaan sebelumnya.',
                    ], 400);
                }
                $claim->receiver_completed_at = now();
                $role = 'receiver';
            } elseif ($isDonor) {
                if ($claim->donor_completed_at) {
                    return response()->json([
                        'error' => 'Kamu sudah mengonfirmasi penyerahan sebelumnya.',
                    ], 400);
                }
                $claim->donor_completed_at = now();
                $role = 'donor';
            } else {
                // Admin bantu selesaikan manual dari dua sisi
                $claim->receiver_completed_at = $claim->receiver_completed_at ?? now();
                $claim->donor_completed_at = $claim->donor_completed_at ?? now();
                $role = 'admin';
            }

            if ($claim->donor_completed_at && $claim->receiver_completed_at) {
                $claim->status = 'completed';
            }
            $claim->save();

            // Update status food jika semua claim sudah selesai
            $food = Food::lockForUpdate()->findOrFail($claim->food_id);

            $hasActiveClaim = Claim::where('food_id', $food->id)
                ->where('status', 'active')
                ->exists();

            if (!$hasActiveClaim && $food->claimed_portions >= $food->portions) {
                $food->status = 'completed';
                $food->save();
            }

            return response()->json([
                'success' => true,
                'role' => $role,
                'claim' => $claim->fresh()->load(['food', 'receiver:id,name,role']),
                'food' => [
                    'id' => $food->id,
                    'status' => $food->status,
                    'remaining_portions' => $food->remainingPortions(),
                ],
            ]);
        });
    }

    /**
     * Daftar claim milik user yang login, dipakai dashboard Penerima.
     */
    public function myClaims(Request $request): JsonResponse
    {
        $user = $request->user();

        $claims = Claim::with(['food', 'receiver:id,name,role'])
            ->where('receiver_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($claims);
    }

    /**
     * Daftar claim yang masuk pada makanan milik donor yang login.
     */
    public function incomingClaims(Request $request): JsonResponse
    {
        $user = $request->user();

        $claims = Claim::with(['food', 'receiver:id,name,role'])
            ->whereHas('food', fn ($q) => $q->where('donor_id', $user->id))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($claims);
    }

    public function getClaims(Request $request): JsonResponse
    {
        $user = $request->user();
        $claims = Claim::with('food')
            ->where('receiver_id', $user->id)
            ->latest()
            ->get();

        return response()->json($claims);
    }

    public function getDonorClaims(Request $request): JsonResponse
    {
        $user = $request->user();
        $claims = Claim::with(['food', 'receiver'])
            ->whereHas('food', function ($query) use ($user) {
                $query->where('donor_id', $user->id);
            })
            ->latest()
            ->get();

        return response()->json($claims);
    }

    public function completeSingleClaim(Request $request, Claim $claim): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|size:6',
        ]);

        if ($claim->code && $claim->code !== $validated['code']) {
            return response()->json(['error' => 'Kode verifikasi salah. Silakan periksa kembali kode dari penerima.'], 400);
        }

        $claim->update(['status' => 'completed']);

        // Check if all portions of the food are claimed and completed
        $food = $claim->food;
        if ($food) {
            $allClaims = Claim::where('food_id', $food->id)->get();
            $activeClaimsCount = $allClaims->whereIn('status', ['active', 'confirmed'])->count();

            if ($activeClaimsCount === 0 && $food->claimed_portions >= $food->portions) {
                $food->update(['status' => 'completed']);
            }
        }

        return response()->json(['success' => true]);
    }

    public function confirmClaim(Request $request, Claim $claim): JsonResponse
    {
        $food = $claim->food;
        if (!$food || $food->donor_id !== $request->user()->id) {
            return response()->json(['error' => 'Anda tidak memiliki akses.'], 403);
        }

        if ($claim->status !== 'active') {
            return response()->json(['error' => 'Klaim tidak dalam status aktif/menunggu konfirmasi.'], 400);
        }

        $claim->update(['status' => 'confirmed']);

        return response()->json(['success' => true]);
    }

    public function rejectClaim(Request $request, Claim $claim): JsonResponse
    {
        $food = $claim->food;
        if (!$food || $food->donor_id !== $request->user()->id) {
            return response()->json(['error' => 'Anda tidak memiliki akses.'], 403);
        }

        if (!in_array($claim->status, ['active', 'confirmed'])) {
            return response()->json(['error' => 'Klaim tidak dapat ditolak.'], 400);
        }

        // Revert the portions
        $revertedClaimedPortions = max(0, $food->claimed_portions - $claim->portions);
        $food->update([
            'claimed_portions' => $revertedClaimedPortions,
            'status' => 'available',
        ]);

        $claim->update(['status' => 'rejected']);

        return response()->json(['success' => true]);
    }
}
