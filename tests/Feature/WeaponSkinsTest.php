<?php

namespace Tests\Feature;

use App\Game\SkinCatalog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class WeaponSkinsTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{string}> */
    public static function weaponTypes(): array
    {
        return ['pistol' => ['pistol'], 'shotgun' => ['shotgun'], 'minigun' => ['minigun']];
    }

    #[DataProvider('weaponTypes')]
    public function test_all_ten_finishes_can_be_purchased_and_re_equipped_for_each_weapon(string $type): void
    {
        $user = User::factory()->create(['gems' => 5000]);
        $weapon = $user->weapons()->create(['weapon_type' => $type, 'level_damage' => 4, 'level_fire_rate' => 3]);
        $finishes = collect(SkinCatalog::all()['weapon'])->where('weapon_type', $type)->values();
        $this->assertCount(10, $finishes);
        $balance = 5000;
        foreach ($finishes as $skin) {
            $this->actingAs($user)->post('/game/buy-skin', [
                'skin_id' => $skin['id'], 'category' => 'weapon', 'weapon_type' => $type, 'cost_gems' => 1,
            ])->assertSessionHasNoErrors();
            $balance -= $skin['cost_gems'];
            $this->assertSame($balance, $user->fresh()->gems);
            $this->assertSame($skin['id'], $weapon->fresh()->active_skin);
        }
        $this->post('/game/buy-skin', ['skin_id' => $finishes[0]['id'], 'category' => 'weapon'])->assertSessionHasNoErrors();
        $this->assertSame($balance, $user->fresh()->gems);
        $this->assertSame($finishes[0]['id'], $weapon->fresh()->active_skin);
        $this->assertSame(10, $user->skins()->count());
        $this->assertSame(4, $weapon->fresh()->level_damage);
        $this->assertSame(3, $weapon->fresh()->level_fire_rate);
    }

    public function test_weapon_choices_survive_switching_and_default_reset_is_independent(): void
    {
        $user = User::factory()->create(['gems' => 500, 'active_weapon_skin' => 'm4_neon']);
        $user->weapons()->create(['weapon_type' => 'pistol']);
        $user->weapons()->create(['weapon_type' => 'shotgun']);
        foreach (['pistol', 'shotgun'] as $type) {
            $this->actingAs($user)->post('/game/buy-skin', ['skin_id' => $type.'_arctic', 'category' => 'weapon'])->assertSessionHasNoErrors();
        }
        $this->post('/game/switch-weapon', ['weapon_type' => 'shotgun'])->assertSessionHasNoErrors();
        $this->post('/game/equip-skin', ['skin_id' => 'default', 'category' => 'weapon', 'weapon_type' => 'pistol'])->assertSessionHasNoErrors();
        $this->get('/game')->assertInertia(fn (Assert $page) => $page
            ->where('weapons.pistol.active_skin', 'default')
            ->where('weapons.shotgun.active_skin', 'shotgun_arctic')
            ->where('player.active_weapon_type', 'shotgun')
            ->where('player.active_weapon_skin', 'm4_neon')
        );
    }

    public function test_invalid_or_unowned_skins_and_locked_weapons_cannot_be_equipped_or_charged(): void
    {
        $user = User::factory()->create(['gems' => 500]);
        $user->weapons()->create(['weapon_type' => 'pistol']);
        $this->actingAs($user)->post('/game/buy-skin', ['skin_id' => 'shotgun_ember', 'category' => 'weapon'])->assertSessionHasErrors('skin');
        $this->post('/game/buy-skin', ['skin_id' => 'shotgun_ember', 'category' => 'weapon', 'weapon_type' => 'pistol'])->assertSessionHasErrors('skin');
        $this->post('/game/equip-skin', ['skin_id' => 'pistol_ember', 'category' => 'weapon'])->assertSessionHasErrors('skin');
        $this->post('/game/buy-skin', ['skin_id' => 'pistol_ember', 'category' => 'wall'])->assertSessionHasErrors('skin');
        $this->assertSame(500, $user->fresh()->gems);
        $this->assertSame(0, $user->skins()->count());
    }

    public function test_insufficient_balance_does_not_change_inventory_or_selection(): void
    {
        $user = User::factory()->create(['gems' => 49]);
        $weapon = $user->weapons()->create(['weapon_type' => 'pistol']);
        $this->actingAs($user)->post('/game/buy-skin', ['skin_id' => 'pistol_ember', 'category' => 'weapon'])->assertSessionHasErrors('gems');
        $this->assertSame(49, $user->fresh()->gems);
        $this->assertNull($weapon->fresh()->active_skin);
        $this->assertSame(0, $user->skins()->count());
    }

    public function test_another_players_skin_does_not_grant_ownership(): void
    {
        $owner = User::factory()->create();
        $owner->skins()->create(['skin_id' => 'pistol_ember', 'category' => 'weapon']);
        $user = User::factory()->create();
        $weapon = $user->weapons()->create(['weapon_type' => 'pistol']);
        $this->actingAs($user)->post('/game/equip-skin', ['skin_id' => 'pistol_ember', 'category' => 'weapon'])->assertSessionHasErrors('skin');
        $this->assertNull($weapon->fresh()->active_skin);
    }
}
