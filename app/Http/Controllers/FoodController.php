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
        ]);

        $user = $request->user();
        $food = Food::findOrFail($validated['food_id']);

        if ($food->status !== 'available') {
            return response()->json(['error' => 'Makanan tidak tersedia.'], 400);
        }

        $food->update([
            'status' => 'claimed',
            'claimed_by' => $user->id,
            'claimed_at' => now(),
        ]);

        Claim::create([
            'food_id' => $food->id,
            'receiver_id' => $user->id,
            'status' => 'active',
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
}
