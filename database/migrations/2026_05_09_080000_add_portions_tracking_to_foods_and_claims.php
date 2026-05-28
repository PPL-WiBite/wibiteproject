<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Track berapa porsi yang sudah di-claim dari total portions
        Schema::table('foods', function (Blueprint $table) {
            $table->integer('claimed_portions')->default(0)->after('portions');
        });

        // Setiap claim bisa ambil beberapa porsi (bukan 1 item = semua)
        Schema::table('claims', function (Blueprint $table) {
            $table->integer('portions')->default(1)->after('receiver_id');
        });
    }

    public function down(): void
    {
        Schema::table('foods', function (Blueprint $table) {
            $table->dropColumn('claimed_portions');
        });

        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn('portions');
        });
    }
};
