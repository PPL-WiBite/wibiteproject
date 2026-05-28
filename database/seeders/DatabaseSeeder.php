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
        User::create([
            'name' => 'Admin WiBite',
            'email' => 'admin@wibite.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
}

