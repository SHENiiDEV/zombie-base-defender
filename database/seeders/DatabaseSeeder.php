<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'survivor@zombie.game'],
            [
                'name' => 'Commander Neo',
                'password' => bcrypt('password'),
                'gold' => 500,
                'gems' => 250,
                'max_wave' => 1,
                'wall_hp_level' => 1,
                'active_weapon_skin' => 'default',
                'active_wall_skin' => 'default',
            ]
        );

        $user->weapons()->firstOrCreate(
            ['weapon_type' => 'pistol'],
            [
                'level_damage' => 1,
                'level_fire_rate' => 1,
                'level_magazine' => 1,
                'level_reload' => 1,
            ]
        );

        $user->skins()->firstOrCreate(
            ['skin_id' => 'default', 'category' => 'weapon']
        );
        $user->skins()->firstOrCreate(
            ['skin_id' => 'default', 'category' => 'wall']
        );
    }
}
