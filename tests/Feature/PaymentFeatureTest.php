<?php

namespace Tests\Feature;

use App\Mail\TopUpSuccessMail;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PaymentFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_page_can_be_rendered(): void
    {
        $response = $this->get('/shop');
        $response->assertStatus(200);
    }

    public function test_user_can_create_topup_session_in_usd_eur_and_gbp(): void
    {
        $user = User::factory()->create([
            'gems' => 50,
        ]);

        // Purchase in GBP (£1.69 for pack_small)
        $response = $this->actingAs($user)->post('/payments/create-session', [
            'pack_id' => 'pack_small',
            'currency' => 'GBP',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(150, $user->gems);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 1.69,
            'currency' => 'GBP',
            'gems_granted' => 100,
            'status' => 'completed',
        ]);

        // Purchase in EUR (€4.99 for pack_medium)
        $this->actingAs($user)->post('/payments/create-session', [
            'pack_id' => 'pack_medium',
            'currency' => 'EUR',
        ]);

        $user->refresh();
        $this->assertEquals(700, $user->gems);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 4.99,
            'currency' => 'EUR',
            'gems_granted' => 550,
            'status' => 'completed',
        ]);
    }

    public function test_user_can_purchase_gold_pack(): void
    {
        $user = User::factory()->create([
            'gold' => 100,
        ]);

        $response = $this->actingAs($user)->post('/payments/create-session', [
            'pack_id' => 'gold_crate',
            'currency' => 'USD',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(5100, $user->gold);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 4.49,
            'currency' => 'USD',
            'gems_granted' => 0,
            'gold_granted' => 5000,
            'status' => 'completed',
        ]);
    }

    public function test_user_can_purchase_combo_bundle_granting_both_gems_and_gold(): void
    {
        $user = User::factory()->create([
            'gems' => 50,
            'gold' => 200,
        ]);

        $response = $this->actingAs($user)->post('/payments/create-session', [
            'pack_id' => 'bundle_survivor',
            'currency' => 'GBP',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(350, $user->gems);
        $this->assertEquals(2700, $user->gold);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 3.39,
            'currency' => 'GBP',
            'gems_granted' => 300,
            'gold_granted' => 2500,
            'status' => 'completed',
        ]);
    }

    public function test_user_can_purchase_custom_gem_amount(): void
    {
        $user = User::factory()->create([
            'gems' => 100,
        ]);

        $response = $this->actingAs($user)->post('/payments/create-session', [
            'pack_id' => 'custom_gems',
            'custom_gems' => 750,
            'currency' => 'USD',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(850, $user->gems);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 13.50, // 750 * 0.018 = 13.50
            'currency' => 'USD',
            'gems_granted' => 750,
            'gold_granted' => 0,
            'status' => 'completed',
        ]);
    }

    public function test_user_can_purchase_unlimited_custom_crystals_and_gold_with_combo_discount(): void
    {
        $user = User::factory()->create([
            'gems' => 1000,
            'gold' => 5000,
        ]);

        // Request 100,000 gems (rate 0.008 => $800) and 1,000,000 gold (rate 0.00035 => $350)
        // Subtotal = $1150. Combo synergy discount (10% off) => $1150 * 0.90 = $1035.00
        $response = $this->actingAs($user)->post('/payments/create-session', [
            'pack_id' => 'custom',
            'custom_gems' => 100000,
            'custom_gold' => 1000000,
            'currency' => 'USD',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals(101000, $user->gems);
        $this->assertEquals(1005000, $user->gold);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'amount' => 1035.00,
            'currency' => 'USD',
            'gems_granted' => 100000,
            'gold_granted' => 1000000,
            'status' => 'completed',
        ]);
    }

    public function test_webhook_credits_gems_and_is_idempotent(): void
    {
        $user = User::factory()->create([
            'gems' => 100,
        ]);

        $payment = Payment::create([
            'user_id' => $user->id,
            'payment_id' => 'pay_test_12345',
            'amount' => 4.99,
            'currency' => 'EUR',
            'gems_granted' => 550,
            'status' => 'pending',
        ]);

        // First webhook call
        $response = $this->postJson('/payments/webhook', [
            'payment_id' => 'pay_test_12345',
            'status' => 'success',
        ]);

        $response->assertOk();
        $response->assertJson(['status' => 'ok']);
        $user->refresh();
        $payment->refresh();

        $this->assertEquals(650, $user->gems);
        $this->assertEquals('completed', $payment->status);

        // Second duplicate webhook call
        $secondResponse = $this->postJson('/payments/webhook', [
            'payment_id' => 'pay_test_12345',
            'status' => 'success',
        ]);

        $secondResponse->assertOk();
        $secondResponse->assertJson(['status' => 'already_processed']);
        $user->refresh();

        // Should still be 650, not 1200
        $this->assertEquals(650, $user->gems);
    }

    public function test_topup_dispatches_topup_success_mail_with_pdf_invoice(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'commander.test@domain.com',
            'gems' => 50,
        ]);

        $this->actingAs($user)->post('/payments/create-session', [
            'pack_id' => 'pack_small',
            'currency' => 'USD',
        ]);

        Mail::assertSent(TopUpSuccessMail::class, function ($mail) use ($user) {
            $this->assertEquals($user->email, $mail->user->email);
            $attachments = $mail->attachments();
            $this->assertNotEmpty($attachments);

            return true;
        });
    }

    public function test_user_can_download_pdf_invoice(): void
    {
        $user = User::factory()->create();
        $payment = Payment::create([
            'user_id' => $user->id,
            'payment_id' => 'pay_test_invoice_999',
            'amount' => 9.99,
            'currency' => 'USD',
            'gems_granted' => 1200,
            'gold_granted' => 0,
            'status' => 'completed',
        ]);

        $response = $this->get('/payments/'.$payment->payment_id.'/invoice');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-1.4', $response->getContent());
    }
}
