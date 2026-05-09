<?php

namespace Database\Seeders;

use App\Models\Food;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        $admin = User::create([
            'name' => 'Admin WiBite',
            'email' => 'admin@wibite.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Donor user
        $donor = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => Hash::make('password'),
            'role' => 'donor',
            'phone' => '081234567890',
            'address' => 'Jl. Sudirman No. 1, Jakarta Selatan',
        ]);

        // Receiver user
        User::create([
            'name' => 'Siti Rahayu',
            'email' => 'siti@example.com',
            'password' => Hash::make('password'),
            'role' => 'receiver',
            'phone' => '081298765432',
            'address' => 'Jl. Melawai Raya No. 5, Kebayoran Baru',
        ]);

        // Sample foods
        Food::create([
            'name' => 'Nasi Kotak Ayam Bakar',
            'portions' => 3,
            'weight_kg' => 2.5,
            'pickup_address' => 'Gedung Sudirman Center, Lobby Utama, Jl. Jend. Sudirman, Jakarta Selatan',
            'expired_date' => 'Hari ini',
            'description' => 'Sisa konsumsi rapat kantor pagi ini. Makanan masih utuh di dalam box dan belum tersentuh sama sekali.',
            'category' => 'Makanan Matang',
            'status' => 'available',
            'donor_id' => $donor->id,
            'donor_name' => $donor->name,
            'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        ]);

        Food::create([
            'name' => 'Roti Manis & Kue Basah',
            'portions' => 10,
            'weight_kg' => 3.0,
            'pickup_address' => 'Jl. Melawai Raya No. 12, Kebayoran Baru',
            'expired_date' => 'Ambil s/d 19:00',
            'description' => 'Koleksi roti hari ini yang sudah mendekati jam tutup toko. Masih sangat layak dan empuk.',
            'category' => 'Roti & Kue',
            'status' => 'available',
            'donor_id' => $donor->id,
            'donor_name' => $donor->name,
            'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80',
        ]);
    }
}
