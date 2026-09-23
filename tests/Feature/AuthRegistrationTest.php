<?php

namespace Tests\Feature;

use App\Mail\WelcomeRegistrationMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_welcome_email(): void
    {
        Mail::fake();

        $response = $this->post('/register', [
            'name' => 'Commander Ghost',
            'email' => 'ghost@sector09.com',
            'password' => 'supersecret123',
        ]);

        $response->assertRedirect(route('game.index'));
        $this->assertAuthenticated();

        $user = User::where('email', 'ghost@sector09.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Commander Ghost', $user->name);
        $this->assertEquals(500, $user->gold);
        $this->assertEquals(250, $user->gems);

        // Verify weapon and default skins were created
        $this->assertDatabaseHas('user_weapons', [
            'user_id' => $user->id,
            'weapon_type' => 'pistol',
        ]);
        $this->assertDatabaseHas('user_skins', [
            'user_id' => $user->id,
            'skin_id' => 'default',
            'category' => 'weapon',
        ]);

        // Verify Welcome Email was sent
        Mail::assertSent(WelcomeRegistrationMail::class, function ($mail) use ($user) {
            return $mail->user->id === $user->id;
        });
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'veteran@sector09.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'veteran@sector09.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('game.index'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect(route('landing'));
        $this->assertGuest();
    }
}
