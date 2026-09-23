<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PlayerEquipmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{string, string}>
     */
    public static function equipmentPages(): array
    {
        return [
            'arsenal' => ['/arsenal', 'Game/Arsenal'],
            'workshop' => ['/upgrades', 'Game/Upgrades'],
        ];
    }

    #[DataProvider('equipmentPages')]
    public function test_equipment_page_displays_only_current_players_inventory(string $url, string $component): void
    {
        $user = User::factory()->create(['gold' => 700, 'gems' => 200]);
        $user->weapons()->create(['weapon_type' => 'pistol', 'level_damage' => 3]);
        $user->skins()->create(['skin_id' => 'm4_neon', 'category' => 'weapon']);
        $otherUser = User::factory()->create();
        $otherUser->weapons()->create(['weapon_type' => 'minigun']);
        $otherUser->skins()->create(['skin_id' => 'plasma_fury', 'category' => 'weapon']);

        $this->actingAs($user)->get($url)->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('player.id', $user->id)
            ->where('player.gold', 700)
            ->where('weapons.pistol.level_damage', 3)
            ->missing('weapons.minigun')
            ->has('unlocked_skins', 1)
            ->where('unlocked_skins.0.skin_id', 'm4_neon')
            ->where('navigation.arsenal', '/arsenal')
            ->where('navigation.upgrades', '/upgrades')
            ->where('gem_packs.pack_medium.gems', 550)
        );
    }

    #[DataProvider('equipmentPages')]
    public function test_guest_can_open_equipment_page_with_starter_weapon(string $url, string $component): void
    {
        $this->get($url)->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('weapons.pistol.level_damage', 1)
            ->where('player.gold', 500)
        );
    }

    public function test_workshop_upgrade_returns_to_workshop_with_updated_inventory(): void
    {
        $user = User::factory()->create(['gold' => 500]);
        $user->weapons()->create(['weapon_type' => 'pistol', 'level_damage' => 1]);

        $this->actingAs($user)->from('/upgrades')->post('/game/upgrade-weapon', [
            'weapon_type' => 'pistol',
            'stat' => 'damage',
        ])->assertRedirect('/upgrades')->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'gold' => 350]);
        $this->assertDatabaseHas('user_weapons', ['user_id' => $user->id, 'weapon_type' => 'pistol', 'level_damage' => 2]);
    }

    public function test_locked_weapon_cannot_be_obtained_through_upgrade(): void
    {
        $user = User::factory()->create(['gold' => 1000]);

        $this->actingAs($user)->post('/game/upgrade-weapon', [
            'weapon_type' => 'minigun',
            'stat' => 'damage',
        ])->assertSessionHasErrors(['weapon' => 'Сначала откройте это оружие в арсенале.']);

        $this->assertDatabaseMissing('user_weapons', ['user_id' => $user->id, 'weapon_type' => 'minigun']);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'gold' => 1000]);
    }

    public function test_skin_purchase_uses_catalog_price_instead_of_submitted_price(): void
    {
        $user = User::factory()->create(['gems' => 200]);

        $this->actingAs($user)->from('/arsenal')->post('/game/buy-skin', [
            'skin_id' => 'm4_neon', 'category' => 'weapon', 'cost_gems' => 1,
        ])->assertRedirect('/arsenal')->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'gems' => 50, 'active_weapon_skin' => 'm4_neon']);
        $this->assertDatabaseHas('user_skins', ['user_id' => $user->id, 'skin_id' => 'm4_neon']);
    }

    public function test_skin_purchase_rejects_insufficient_funds_at_catalog_price(): void
    {
        $user = User::factory()->create(['gems' => 10]);

        $this->actingAs($user)->post('/game/buy-skin', [
            'skin_id' => 'm4_neon', 'category' => 'weapon', 'cost_gems' => 1,
        ])->assertSessionHasErrors(['gems' => 'Недостаточно кристаллов.']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'gems' => 10]);
        $this->assertDatabaseMissing('user_skins', ['user_id' => $user->id, 'skin_id' => 'm4_neon']);
    }

    public function test_unknown_skin_is_not_purchased(): void
    {
        $user = User::factory()->create(['gems' => 300]);

        $this->actingAs($user)->post('/game/buy-skin', [
            'skin_id' => 'missing_skin', 'category' => 'wall', 'cost_gems' => 100,
        ])->assertSessionHasErrors(['skin' => 'Этот скин недоступен для покупки.']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'gems' => 300]);
        $this->assertDatabaseMissing('user_skins', ['user_id' => $user->id, 'skin_id' => 'missing_skin']);
    }

    public function test_owned_skin_is_equipped_without_charging_again(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $user->skins()->create(['skin_id' => 'm4_neon', 'category' => 'weapon']);

        $this->actingAs($user)->post('/game/buy-skin', [
            'skin_id' => 'm4_neon', 'category' => 'weapon', 'cost_gems' => 150,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'gems' => 0, 'active_weapon_skin' => 'm4_neon']);
        $this->assertDatabaseCount('user_skins', 1);
    }
}
