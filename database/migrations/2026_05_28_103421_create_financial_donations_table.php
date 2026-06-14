<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_donations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Opsional: jika ingin mencatat ID user yang login
            $table->decimal('amount', 12, 2); // Menampung nominal donasi uang
            $table->string('donor_name')->default('Anonim'); // Menyimpan nama donatur atau 'Anonim'
            $table->string('payment_method'); // Menampung QRIS, GoPay, OVO, dll.
            $table->text('message')->nullable(); // Menampung pesan & dukungan (opsional)
            $table->boolean('is_anonymous')->default(false); // Status anonimitas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_donations');
    }
};
