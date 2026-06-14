<?php

namespace App\Http\Controllers;

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

    public function deleteUser(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['success' => true]);
    }
}
