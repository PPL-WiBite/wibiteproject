<?php

namespace App\Http\Controllers;

use App\Models\FinancialDonation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DonationFinancialController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount'         => 'required|numeric|min:1000',
            'donor_name'     => 'nullable|string|max:255',
            'payment_method' => 'required|string',
            'message'        => 'nullable|string|max:500',
            'is_anonymous'   => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $isAnonymous = $request->boolean('is_anonymous', false);
        $donorName   = $isAnonymous ? 'Anonim' : ($request->donor_name ?: 'Anonim');

        $donation = FinancialDonation::create([
            'user_id'        => auth()->id() ?? null,
            'amount'         => $request->amount,
            'donor_name'     => $donorName,
            'payment_method' => $request->payment_method,
            'message'        => $request->message,
            'is_anonymous'   => $isAnonymous,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Donasi berhasil dicatat!',
            'data'    => $donation,
        ], 201);
    }
}
