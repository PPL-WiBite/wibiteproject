<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('foods', 'lat')) {
            Schema::table('foods', function (Blueprint $table) {
                $table->decimal('lat', 10, 7)->nullable()->after('pickup_address');
            });
        }

        if (!Schema::hasColumn('foods', 'lng')) {
            Schema::table('foods', function (Blueprint $table) {
                $table->decimal('lng', 10, 7)->nullable()->after('lat');
            });
        }
    }

    public function down(): void
    {
        Schema::table('foods', function (Blueprint $table) {
            if (Schema::hasColumn('foods', 'lat')) {
                $table->dropColumn('lat');
            }
            if (Schema::hasColumn('foods', 'lng')) {
                $table->dropColumn('lng');
            }
        });
    }
};
