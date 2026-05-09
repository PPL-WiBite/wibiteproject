<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $user = $request->user();
        $user->update(array_filter($validated, fn($v) => $v !== null));

        return response()->json($user);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->only(['id', 'name', 'email', 'role', 'phone', 'address']));
    }

    public function updateRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:donor,receiver',
        ]);

        $user = $request->user();
        $user->update(['role' => $validated['role']]);

        return response()->json($user);
    }
}
