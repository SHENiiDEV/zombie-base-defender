<?php

namespace App\Http\Controllers;

use App\Game\SkinCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Render the Landing page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAuthenticated = (bool) $user;

        if ($user) {
            $weapon = $user->weapons()->firstOrCreate(
                ['weapon_type' => 'pistol'],
                [
                    'level_damage' => 1,
                    'level_fire_rate' => 1,
                    'level_magazine' => 1,
                    'level_reload' => 1,
                ]
            );

            $player = [
                'id' => $user->id,
                'name' => $user->name,
                'gold' => $user->gold,
                'gems' => $user->gems,
                'max_wave' => $user->max_wave,
                'wall_hp_level' => $user->wall_hp_level,
                'active_weapon_skin' => $user->active_weapon_skin,
                'active_wall_skin' => $user->active_wall_skin,
            ];
        } else {
            $player = [
                'id' => null,
                'name' => 'Survivor',
                'gold' => 0,
                'gems' => 0,
                'max_wave' => 1,
                'wall_hp_level' => 1,
                'active_weapon_skin' => 'default',
                'active_wall_skin' => 'default',
            ];

            $weapon = [
                'level_damage' => 1,
                'level_fire_rate' => 1,
                'level_magazine' => 1,
                'level_reload' => 1,
            ];
        }

        $catalog = SkinCatalog::all();

        return Inertia::render('Landing', [
            'is_authenticated' => $isAuthenticated,
            'player' => $player,
            'weapon' => $weapon,
            'featured_skins' => [
                $catalog['weapon'][1], // m4_neon
                $catalog['wall'][1],   // wall_cyber
                $catalog['weapon'][2], // plasma_fury
            ],
        ]);
    }
}
