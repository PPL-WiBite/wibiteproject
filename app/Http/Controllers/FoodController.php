<?php

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
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
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
            'lat' => $validated['lat'] ?? null,
            'lng' => $validated['lng'] ?? null,
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
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
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
            'pickup_time' => 'required|string',
            'portions' => 'nullable|integer|min:1',
        ]);

        $user = $request->user();
        $food = Food::findOrFail($validated['food_id']);

        if ($food->status !== 'available') {
            return response()->json(['error' => 'Makanan tidak tersedia.'], 400);
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

        return response()->json(['success' => true]);
    }

    public function completeClaim(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'food_id' => 'required|exists:foods,id',
        ]);

        $food = Food::findOrFail($validated['food_id']);
        $food->update(['status' => 'completed']);

        Claim::where('food_id', $food->id)
            ->where('status', 'active')
            ->update(['status' => 'completed']);

        return response()->json(['success' => true]);
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
