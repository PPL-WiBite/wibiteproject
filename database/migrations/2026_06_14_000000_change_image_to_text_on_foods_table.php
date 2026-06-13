<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ubah kolom image dari string(255) ke text agar bisa menyimpan base64
        if (config('database.default') === 'pgsql') {
            DB::statement('ALTER TABLE foods ALTER COLUMN image TYPE TEXT');
        } else {
            Schema::table('foods', function (Blueprint $table) {
                $table->text('image')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (config('database.default') === 'pgsql') {
            DB::statement('ALTER TABLE foods ALTER COLUMN image TYPE VARCHAR(255)');
        } else {
            Schema::table('foods', function (Blueprint $table) {
                $table->string('image')->nullable()->change();
            });
        }
    }
};
