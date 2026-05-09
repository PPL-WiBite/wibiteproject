<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('portions')->default(1);
            $table->decimal('weight_kg', 8, 2)->default(1);
            $table->string('pickup_address')->nullable();
            $table->string('expired_date')->nullable();
            $table->text('description')->nullable();
            $table->string('category')->default('Makanan Matang');
            $table->enum('status', ['available', 'claimed', 'completed'])->default('available');
            $table->foreignId('donor_id')->constrained('users')->onDelete('cascade');
            $table->string('donor_name');
            $table->string('image')->nullable();
            $table->foreignId('claimed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};
