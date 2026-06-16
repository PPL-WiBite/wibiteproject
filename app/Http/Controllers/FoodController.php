<?php
// PBI

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodController extends Controller
{
    public function index(): JsonResponse
    {
        $foods = Food::orderBy('created_at', 'desc')->get();
        return response()->json($foods);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'portions' => 'required|integer|min:1',
            'weight_kg' => 'nullable|numeric|min:0',
            'pickup_address' => 'required|string',
            'expired_date' => 'nullable|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $user = $request->user();

        $food = Food::create([
            'name' => $validated['name'],
            'portions' => $validated['portions'],
            'weight_kg' => $validated['weight_kg'] ?? 1,
            'pickup_address' => $validated['pickup_address'],
            'expired_date' => $validated['expired_date'] ?? 'Hari ini',
            'description' => $validated['description'] ?? '',
            'category' => $validated['category'] ?? 'Makanan Matang',
            'status' => 'available',
            'donor_id' => $user->id,
            'donor_name' => $user->name,
            'image' => $validated['image'] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
        ]);

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
            'expired_date' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|in:available,claimed,completed',
        ]);

        $food->update(array_filter($validated, fn($v) => $v !== null));

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

    public function claim(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'food_id' => 'required|exists:foods,id',
        ]);

        $user = $request->user();
        $portionsToClaim = $validated['portions'] ?? 1;

        $claim = DB::transaction(function () use ($validated, $user, $portionsToClaim) {
            // Lock food row untuk mencegah race condition
            $food = Food::lockForUpdate()->findOrFail($validated['food_id']);

            // Pastikan user belum punya claim aktif lain
            $hasActiveClaim = Claim::where('receiver_id', $user->id)
                ->where('status', 'active')
                ->exists();
            if ($hasActiveClaim) {
                abort(response()->json([
                    'error' => 'Kamu masih punya klaim aktif. Selesaikan klaim sebelumnya dulu untuk mengklaim makanan baru.',
                ], 400));
            }

            // Cek sisa porsi
            $remainingPortions = $food->portions - $food->claimed_portions;
            if ($remainingPortions <= 0) {
                abort(response()->json(['error' => 'Porsi makanan sudah habis diklaim.'], 400));
            }
            if ($portionsToClaim > $remainingPortions) {
                abort(response()->json(['error' => "Hanya tersisa {$remainingPortions} porsi yang tersedia."], 400));
            }

            // Validasi pickup_time tidak melebihi expired_date
            try {
                $pickupTime = new \DateTime($validated['pickup_time']);
                $expiredDate = new \DateTime($food->expired_date);
                if ($pickupTime > $expiredDate) {
                    abort(response()->json(['error' => 'Waktu penjemputan tidak boleh melebihi batas waktu pengambilan.'], 400));
                }
            } catch (\Exception $e) {
                // Jika format tanggal tidak valid, lanjutkan saja
            }

            // Update food
            $newClaimedPortions = $food->claimed_portions + $portionsToClaim;
            $food->claimed_portions = $newClaimedPortions;

            if ($newClaimedPortions >= $food->portions) {
                $food->status = 'claimed';
                if (!$food->claimed_by) {
                    $food->claimed_by = $user->id;
                }
                if (!$food->claimed_at) {
                    $food->claimed_at = now();
                }
            }
            $food->save();

            // Generate verification code
            $verificationCode = strval(rand(100000, 999999));

            return Claim::create([
                'food_id' => $food->id,
                'receiver_id' => $user->id,
                'portions' => $portionsToClaim,
                'status' => 'active',
                'pickup_time' => $validated['pickup_time'],
                'code' => $verificationCode,
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
            'food_id' => 'required|exists:foods,id',
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

