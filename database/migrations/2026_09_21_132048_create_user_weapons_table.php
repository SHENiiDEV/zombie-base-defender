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
        Schema::create('user_weapons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('weapon_type')->default('pistol'); // pistol, shotgun, minigun
            $table->unsignedInteger('level_damage')->default(1);
            $table->unsignedInteger('level_fire_rate')->default(1);
            $table->unsignedInteger('level_magazine')->default(1);
            $table->unsignedInteger('level_reload')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_weapons');
    }
};
