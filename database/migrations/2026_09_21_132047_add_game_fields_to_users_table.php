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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('gold')->default(0);
            $table->unsignedInteger('gems')->default(0);
            $table->unsignedInteger('max_wave')->default(1);
            $table->unsignedInteger('wall_hp_level')->default(1);
            $table->string('active_weapon_skin')->default('default');
            $table->string('active_wall_skin')->default('default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gold',
                'gems',
                'max_wave',
                'wall_hp_level',
                'active_weapon_skin',
                'active_wall_skin',
            ]);
        });
    }
};
