<?php

namespace App\Http\Controllers;

use App\Game\SkinCatalog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    /**
     * Weapon unlock costs.
     */
    public const WEAPON_UNLOCK_COSTS = [
        'pistol' => 0,
        'shotgun' => 600,
        'minigun' => 1500,
    ];

    /**
     * Render the Game Arena.
     */
    public function index(Request $request): Response
    {
        return $this->renderPlayerPage($request, 'Game/Index');
    }

    public function arsenal(Request $request): Response
    {
        return $this->renderPlayerPage($request, 'Game/Arsenal');
    }

    public function upgrades(Request $request): Response
    {
        return $this->renderPlayerPage($request, 'Game/Upgrades');
    }

    public function wardrobe(Request $request): Response
    {
        return $this->renderPlayerPage($request, 'Wardrobe');
    }

    protected function renderPlayerPage(Request $request, string $component): Response
    {
        $user = $this->resolveUser($request);

        // Ensure default pistol exists
        $user->weapons()->firstOrCreate(
            ['weapon_type' => 'pistol'],
            [
                'level_damage' => 1,
                'level_fire_rate' => 1,
                'level_magazine' => 1,
                'level_reload' => 1,
            ]
        );

        $weapons = $user->weapons()->get()->keyBy('weapon_type');
        $skins = $user->skins()->get();
        $catalog = SkinCatalog::all();

        return Inertia::render($component, [
            'player' => [
                'id' => $user->id,
                'name' => $user->name,
                'gold' => $user->gold,
                'gems' => $user->gems,
                'max_wave' => $user->max_wave,
                'wall_hp_level' => $user->wall_hp_level,
                'active_weapon_skin' => $user->active_weapon_skin,
                'active_wall_skin' => $user->active_wall_skin,
                'active_weapon_type' => $user->active_weapon_type ?: 'pistol',
            ],
            'weapons' => $weapons,
            'unlock_costs' => self::WEAPON_UNLOCK_COSTS,
            'unlocked_skins' => $skins->map(fn ($s) => [
                'skin_id' => $s->skin_id,
                'category' => $s->category,
            ]),
            'catalog' => $catalog,
        ]);
    }

    /**
     * Sync wave completion and gold rewards.
     */
    public function syncWaveRewards(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gold_earned' => 'required|integer|min:0',
            'wave_cleared' => 'required|boolean',
        ]);

        $user = $this->resolveUser($request);

        DB::transaction(function () use ($user, $validated) {
            $user->increment('gold', $validated['gold_earned']);

            if ($validated['wave_cleared']) {
                $user->increment('max_wave');
            }
        });

        return back();
    }

    /**
     * Unlock a new weapon archetype.
     */
    public function unlockWeapon(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'weapon_type' => 'required|in:shotgun,minigun',
        ]);

        $user = $this->resolveUser($request);
        $cost = self::WEAPON_UNLOCK_COSTS[$validated['weapon_type']];

        if ($user->weapons()->where('weapon_type', $validated['weapon_type'])->exists()) {
            $user->update(['active_weapon_type' => $validated['weapon_type']]);

            return back();
        }

        if ($user->gold < $cost) {
            return back()->withErrors(['gold' => 'Not enough gold to unlock this weapon']);
        }

        DB::transaction(function () use ($user, $validated, $cost) {
            $user->decrement('gold', $cost);
            $user->weapons()->create([
                'weapon_type' => $validated['weapon_type'],
                'level_damage' => 1,
                'level_fire_rate' => 1,
                'level_magazine' => 1,
                'level_reload' => 1,
            ]);
            $user->update(['active_weapon_type' => $validated['weapon_type']]);
        });

        return back();
    }

    /**
     * Switch active weapon.
     */
    public function switchWeapon(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'weapon_type' => 'required|in:pistol,shotgun,minigun',
        ]);

        $user = $this->resolveUser($request);

        $exists = $user->weapons()->where('weapon_type', $validated['weapon_type'])->exists();
        if (! $exists) {
            return back()->withErrors(['weapon' => 'You have not unlocked this weapon yet']);
        }

        $user->update(['active_weapon_type' => $validated['weapon_type']]);

        return back();
    }

    /**
     * Upgrade weapon stats using gold.
     */
    public function upgradeWeapon(Request $request): RedirectResponse
    {
        $request->validate([
            'stat' => 'required|in:damage,fire_rate,magazine,reload',
            'weapon_type' => 'nullable|in:pistol,shotgun,minigun',
        ]);

        $user = $this->resolveUser($request);
        $weaponType = $request->input('weapon_type') ?: ($user->active_weapon_type ?: 'pistol');

        $weapon = $user->weapons()->where('weapon_type', $weaponType)->first();

        if (! $weapon) {
            return back()->withErrors(['weapon' => 'Сначала откройте это оружие в арсенале.']);
        }
        $column = 'level_'.$request->stat;
        $currentLevel = (int) $weapon->{$column};

        $cost = $currentLevel * 150;

        if ($user->gold < $cost) {
            return back()->withErrors(['gold' => 'Not enough gold']);
        }

        DB::transaction(function () use ($user, $weapon, $column, $cost) {
            $user->decrement('gold', $cost);
            $weapon->increment($column);
        });

        return back();
    }

    /**
     * Upgrade barricade durability using gold.
     */
    public function upgradeWall(Request $request): RedirectResponse
    {
        $user = $this->resolveUser($request);
        $cost = $user->wall_hp_level * 150;

        if ($user->gold < $cost) {
            return back()->withErrors(['gold' => 'Not enough gold']);
        }

        DB::transaction(function () use ($user, $cost) {
            $user->decrement('gold', $cost);
            $user->increment('wall_hp_level');
        });

        return back();
    }

    /**
     * Purchase skin with gems.
     */
    public function buySkin(Request $request): RedirectResponse
    {
        return $this->saveSkin($request, true);
    }

    public function equipSkin(Request $request): RedirectResponse
    {
        return $this->saveSkin($request, false);
    }

    private function saveSkin(Request $request, bool $purchase): RedirectResponse
    {
        $validated = $request->validate([
            'skin_id' => 'required|string',
            'category' => 'required|in:weapon,wall',
            'weapon_type' => 'nullable|in:pistol,shotgun,minigun',
        ]);
        $skin = collect(SkinCatalog::all()[$validated['category']])->firstWhere('id', $validated['skin_id']);
        if (! $skin) {
            throw ValidationException::withMessages(['skin' => 'Этот скин недоступен для покупки.']);
        }

        $user = $this->resolveUser($request);
        DB::transaction(function () use ($user, $validated, $skin, $purchase) {
            $user = User::query()->lockForUpdate()->findOrFail($user->id);
            $weaponType = $validated['weapon_type'] ?? $skin['weapon_type'] ?? null;
            $weapon = null;
            if ($validated['category'] === 'weapon' && $weaponType) {
                if (isset($skin['weapon_type']) && $skin['weapon_type'] !== $weaponType) {
                    throw ValidationException::withMessages(['skin' => 'This skin belongs to a different weapon.']);
                }
                $weapon = $user->weapons()->where('weapon_type', $weaponType)->first();
                if (! $weapon) {
                    throw ValidationException::withMessages(['skin' => 'Unlock this weapon in the arsenal first.']);
                }
            }
            $owned = $skin['id'] === 'default' || $user->skins()
                ->where('skin_id', $skin['id'])->where('category', $skin['category'])->exists();
            if (! $owned) {
                if (! $purchase) {
                    throw ValidationException::withMessages(['skin' => 'You do not own this skin']);
                }
                if ($user->gems < $skin['cost_gems']) {
                    throw ValidationException::withMessages(['gems' => 'Недостаточно кристаллов.']);
                }
                $user->decrement('gems', $skin['cost_gems']);
                $user->skins()->create(['skin_id' => $skin['id'], 'category' => $skin['category']]);
            }
            if ($weapon) {
                $weapon->update(['active_skin' => $skin['id']]);
            } else {
                $user->update(['active_'.$skin['category'].'_skin' => $skin['id']]);
            }
        }, 3);

        return back();
    }

    /**
     * Resolve authenticated user or fallback to seeded survivor.
     */
    protected function resolveUser(Request $request): User
    {
        if ($user = $request->user()) {
            return $user;
        }

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
                'active_weapon_type' => 'pistol',
            ]
        );

        Auth::login($user);

        return $user;
    }
}
