<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('foods', function (Blueprint $table) {
            // Tanggal + jam kadaluarsa makanan; tetap simpan expired_date lama sebagai label.
            $table->timestamp('expired_at')->nullable()->after('expired_date');
        });
    }

    public function down(): void
    {
        Schema::table('foods', function (Blueprint $table) {
            $table->dropColumn('expired_at');
        });
    }
};
