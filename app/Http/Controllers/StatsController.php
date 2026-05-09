<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Food;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $completedFoods = Food::where('status', 'completed')->get();

        return response()->json([
            'foodSaved' => $completedFoods->sum('weight_kg'),
            'peopleHelped' => $completedFoods->sum('portions'),
            'emissionsReduced' => round($completedFoods->sum('weight_kg') * 2.5, 0),
        ]);
    }
}
