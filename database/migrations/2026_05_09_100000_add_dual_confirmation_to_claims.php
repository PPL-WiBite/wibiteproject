<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->timestamp('donor_completed_at')->nullable()->after('status');
            $table->timestamp('receiver_completed_at')->nullable()->after('donor_completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn(['donor_completed_at', 'receiver_completed_at']);
        });
    }
};
