<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DonationFinancialController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi input dari frontend (.tsx)
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:10000',
            'donorName' => 'required|string|max:255',
            'paymentMethod' => 'required|string',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. [LOGIKA SIMPAN KE DATABASE]
        // Di sini kamu bisa simpan ke tabel donations jika sudah buat migrasinya.
        // Contoh data yang siap disimpan:
        $donationData = [
            'amount' => $request->amount,
            'donor_name' => $request->donorName,
            'payment_method' => $request->paymentMethod,
            'message' => $request->message,
            'status' => 'pending' // Default pending sebelum dibayar
        ];

        // 3. [OPSIONAL: INTEGRASI PAYMENT GATEWAY]
        // Jika tugasnya sekadar simulasi, kamu bisa langsung kembalikan respons sukses.
        // Tapi kalau mau simulasi link pembayaran, kita buat mock URL.
        $mockPaymentUrl = "https://checkout.stripe.com/mock-pay/" . uniqid();

        return response()->json([
            'success' => true,
            'message' => 'Data donasi berhasil dicatat!',
            'data' => $donationData,
            'paymentUrl' => $mockPaymentUrl // Link ini yang akan dibuka oleh frontend
        ], 201);
    }
}