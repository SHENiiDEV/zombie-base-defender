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

    public function test_login_page_can_be_rendered(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_register_page_can_be_rendered(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_user_can_register_with_full_kyc_details_and_receives_welcome_email(): void
    {
        Mail::fake();

        $response = $this->post('/register', [
            'name' => 'Alexander',
            'surname' => 'Vance',
            'email' => 'vance@sector09.com',
            'password' => 'supersecret123',
            'phone' => '+15550192834',
            'date_of_birth' => '1995-06-15',
            'address_line1' => '742 Evergreen Terrace, Apt 4B',
            'city' => 'Springfield',
            'country' => 'United States',
            'postal_code' => '97477',
            'terms' => true,
        ]);

        $response->assertRedirect(route('game.index'));
        $this->assertAuthenticated();

        $user = User::where('email', 'vance@sector09.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Alexander', $user->name);
        $this->assertEquals('Vance', $user->surname);
        $this->assertEquals('+15550192834', $user->phone);
        $this->assertEquals('1995-06-15', $user->date_of_birth->format('Y-m-d'));
        $this->assertEquals('742 Evergreen Terrace, Apt 4B', $user->address_line1);
        $this->assertEquals('Springfield', $user->city);
        $this->assertEquals('United States', $user->country);
        $this->assertEquals('97477', $user->postal_code);
        $this->assertNotNull($user->terms_accepted_at);
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

    public function test_registration_fails_if_restricted_country_is_selected(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test',
            'surname' => 'User',
            'email' => 'test@restricted.com',
            'password' => 'secret123',
            'phone' => '+1234567890',
            'date_of_birth' => '1990-01-01',
            'address_line1' => 'Street 1',
            'city' => 'City',
            'country' => 'Russia', // Restricted country
            'postal_code' => '100000',
            'terms' => true,
        ]);

        $response->assertSessionHasErrors(['country']);
        $this->assertGuest();
    }

    public function test_registration_fails_if_terms_are_not_accepted(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test',
            'surname' => 'User',
            'email' => 'test@terms.com',
            'password' => 'secret123',
            'phone' => '+1234567890',
            'date_of_birth' => '1990-01-01',
            'address_line1' => 'Street 1',
            'city' => 'City',
            'country' => 'United States',
            'postal_code' => '100000',
            'terms' => false,
        ]);

        $response->assertSessionHasErrors(['terms']);
        $this->assertGuest();
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
