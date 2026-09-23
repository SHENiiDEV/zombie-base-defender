<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_can_be_rendered(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Landing')->where('is_authenticated', false));

        $user = User::factory()->create();
        $authResponse = $this->actingAs($user)->get('/');
        $authResponse->assertStatus(200);
        $authResponse->assertInertia(fn ($page) => $page->component('Landing')->where('is_authenticated', true));
    }

    public function test_user_can_log_out(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_game_arena_page_can_be_rendered(): void
    {
        $user = User::factory()->create([
            'gold' => 1000,
            'gems' => 500,
        ]);

        $response = $this->actingAs($user)->get('/game');
        $response->assertStatus(200);
    }

    public function test_arsenal_and_wardrobe_pages_can_be_rendered(): void
    {
        $user = User::factory()->create([
            'gold' => 1000,
            'gems' => 500,
        ]);

        $this->actingAs($user)->get('/arsenal')->assertStatus(200);
        $this->actingAs($user)->get('/wardrobe')->assertStatus(200);
    }

    public function test_legal_pages_can_be_rendered(): void
    {
        $this->get('/terms')->assertStatus(200);
        $this->get('/privacy')->assertStatus(200);
    }

    public function test_all_dedicated_pages_render_correct_inertia_components(): void
    {
        $user = User::factory()->create([
            'gold' => 1000,
            'gems' => 500,
        ]);

        $routes = [
            '/' => 'Landing',
            '/game' => 'Game/Index',
            '/arsenal' => 'Game/Arsenal',
            '/upgrades' => 'Game/Upgrades',
            '/wardrobe' => 'Wardrobe',
            '/shop' => 'Shop',
            '/terms' => 'Legal/Terms',
            '/privacy' => 'Legal/Privacy',
        ];

        foreach ($routes as $url => $component) {
            $this->actingAs($user)->get($url)
                ->assertStatus(200)
                ->assertInertia(fn ($page) => $page->component($component));
        }
    }

    public function test_user_can_sync_wave_rewards(): void
    {
        $user = User::factory()->create([
            'gold' => 100,
            'max_wave' => 1,
        ]);

        $response = $this->actingAs($user)->post('/game/sync-wave', [
            'gold_earned' => 250,
            'wave_cleared' => true,
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(350, $user->gold);
        $this->assertEquals(2, $user->max_wave);
    }

    public function test_user_can_upgrade_weapon_damage_with_gold(): void
    {
        $user = User::factory()->create([
            'gold' => 500,
        ]);

        $weapon = $user->weapons()->create([
            'weapon_type' => 'pistol',
            'level_damage' => 1,
        ]);

        // Cost is level 1 * 150 = 150
        $response = $this->actingAs($user)->post('/game/upgrade-weapon', [
            'stat' => 'damage',
        ]);

        $response->assertRedirect();
        $user->refresh();
        $weapon->refresh();

        $this->assertEquals(350, $user->gold);
        $this->assertEquals(2, $weapon->level_damage);
    }

    public function test_upgrade_fails_if_insufficient_gold(): void
    {
        $user = User::factory()->create([
            'gold' => 50, // Cost is 150
        ]);

        $user->weapons()->create([
            'weapon_type' => 'pistol',
            'level_damage' => 1,
        ]);

        $response = $this->actingAs($user)->post('/game/upgrade-weapon', [
            'stat' => 'damage',
        ]);

        $response->assertSessionHasErrors('gold');
        $user->refresh();
        $this->assertEquals(50, $user->gold);
    }

    public function test_user_can_upgrade_wall_durability(): void
    {
        $user = User::factory()->create([
            'gold' => 300,
            'wall_hp_level' => 1,
        ]);

        $response = $this->actingAs($user)->post('/game/upgrade-wall');

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(150, $user->gold);
        $this->assertEquals(2, $user->wall_hp_level);
    }

    public function test_user_can_buy_skin_with_gems(): void
    {
        $user = User::factory()->create([
            'gems' => 300,
            'active_weapon_skin' => 'default',
        ]);

        $response = $this->actingAs($user)->post('/game/buy-skin', [
            'skin_id' => 'm4_neon',
            'cost_gems' => 150,
            'category' => 'weapon',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(150, $user->gems);
        $this->assertEquals('m4_neon', $user->active_weapon_skin);
        $this->assertDatabaseHas('user_skins', [
            'user_id' => $user->id,
            'skin_id' => 'm4_neon',
            'category' => 'weapon',
        ]);
    }

    public function test_user_can_equip_owned_skin(): void
    {
        $user = User::factory()->create([
            'active_wall_skin' => 'default',
        ]);

        $user->skins()->create([
            'skin_id' => 'wall_cyber',
            'category' => 'wall',
        ]);

        $response = $this->actingAs($user)->post('/game/equip-skin', [
            'skin_id' => 'wall_cyber',
            'category' => 'wall',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals('wall_cyber', $user->active_wall_skin);
    }

    public function test_user_can_unlock_and_switch_weapon(): void
    {
        $user = User::factory()->create([
            'gold' => 1000,
            'active_weapon_type' => 'pistol',
        ]);

        // Unlock shotgun (cost 600)
        $response = $this->actingAs($user)->post('/game/unlock-weapon', [
            'weapon_type' => 'shotgun',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(400, $user->gold);
        $this->assertEquals('shotgun', $user->active_weapon_type);
        $this->assertDatabaseHas('user_weapons', [
            'user_id' => $user->id,
            'weapon_type' => 'shotgun',
        ]);

        // Switch back to pistol
        $user->weapons()->create(['weapon_type' => 'pistol']);
        $switchResponse = $this->actingAs($user)->post('/game/switch-weapon', [
            'weapon_type' => 'pistol',
        ]);

        $switchResponse->assertRedirect();
        $user->refresh();
        $this->assertEquals('pistol', $user->active_weapon_type);
    }

    public function test_user_can_upgrade_magazine_and_reload_stats(): void
    {
        $user = User::factory()->create(['gold' => 600]);
        $weapon = $user->weapons()->create([
            'weapon_type' => 'pistol',
            'level_magazine' => 1,
            'level_reload' => 1,
        ]);

        // Upgrade magazine (150 gold)
        $this->actingAs($user)->post('/game/upgrade-weapon', [
            'stat' => 'magazine',
            'weapon_type' => 'pistol',
        ]);

        // Upgrade reload (150 gold)
        $this->actingAs($user)->post('/game/upgrade-weapon', [
            'stat' => 'reload',
            'weapon_type' => 'pistol',
        ]);

        $user->refresh();
        $weapon->refresh();

        $this->assertEquals(300, $user->gold);
        $this->assertEquals(2, $weapon->level_magazine);
        $this->assertEquals(2, $weapon->level_reload);
    }
}
