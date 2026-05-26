<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'nullable|string',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $user = $request->user();

        Feedback::create([
            'user_id' => $user->id,
            'message' => $validated['message'] ?? '',
            'rating' => $validated['rating'],
        ]);

        return response()->json(['success' => true], 201);
    }
}
