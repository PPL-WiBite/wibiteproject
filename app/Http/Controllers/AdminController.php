<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\FinancialDonation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(): JsonResponse
    {
        $users = User::all();
        return response()->json($users);
    }

    public function feedback(): JsonResponse
    {
        $feedbacks = Feedback::with('user')->orderByDesc('created_at')->get();
        return response()->json($feedbacks);
    }

    public function deleteUser(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['success' => true]);
    }

    public function financialDonations(): JsonResponse
    {
        $donations = FinancialDonation::orderByDesc('created_at')->get();
        return response()->json($donations);
    }
}
