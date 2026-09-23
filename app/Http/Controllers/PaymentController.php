<?php

namespace App\Http\Controllers;

use App\Mail\TopUpSuccessMail;
use App\Models\Payment;
use App\Models\User;
use App\Services\PdfInvoiceGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Supported fiat currencies.
     */
    public const CURRENCIES = ['USD', 'EUR', 'GBP'];

    public const CURRENCY_SYMBOLS = [
        'USD' => '$',
        'EUR' => '€',
        'GBP' => '£',
    ];

    /**
     * Complete catalog of top-up items (Crystals, Gold, and Value Bundles) with multi-currency pricing.
     */
    public const PACKS = [
        // --- CRYSTAL PACKS ---
        'pack_small' => [
            'id' => 'pack_small',
            'category' => 'gems',
            'gems' => 100,
            'gold' => 0,
            'badge' => null,
            'prices' => [
                'USD' => 1.99,
                'EUR' => 1.99,
                'GBP' => 1.69,
            ],
            'label' => '100 Crystals',
            'desc' => 'Quick boost for weapon unlocks and skin cosmetics.',
        ],
        'pack_medium' => [
            'id' => 'pack_medium',
            'category' => 'gems',
            'gems' => 550,
            'gold' => 0,
            'badge' => '+10% BONUS',
            'prices' => [
                'USD' => 4.99,
                'EUR' => 4.99,
                'GBP' => 4.29,
            ],
            'label' => '550 Crystals',
            'desc' => 'Popular survival pack with extra bonus crystals included.',
        ],
        'pack_large' => [
            'id' => 'pack_large',
            'category' => 'gems',
            'gems' => 1200,
            'gold' => 0,
            'badge' => 'BEST VALUE',
            'prices' => [
                'USD' => 9.99,
                'EUR' => 9.99,
                'GBP' => 8.49,
            ],
            'label' => '1200 Crystals',
            'desc' => 'Maximum firepower. Instantly unlock legendary cyber arsenal.',
        ],
        'pack_veteran' => [
            'id' => 'pack_veteran',
            'category' => 'gems',
            'gems' => 2600,
            'gold' => 0,
            'badge' => '+30% BONUS',
            'prices' => [
                'USD' => 19.99,
                'EUR' => 19.99,
                'GBP' => 16.99,
            ],
            'label' => '2600 Crystals',
            'desc' => 'Commander vault for elite cosmetic weapon skins.',
        ],
        'pack_titan' => [
            'id' => 'pack_titan',
            'category' => 'gems',
            'gems' => 7000,
            'gold' => 0,
            'badge' => '+40% BONUS',
            'prices' => [
                'USD' => 49.99,
                'EUR' => 49.99,
                'GBP' => 41.99,
            ],
            'label' => '7000 Crystals',
            'desc' => 'Colossal crystal cache to conquer the entire cosmetic armory.',
        ],

        // --- VALUE COMBO BUNDLES (CRYSTALS + GOLD) ---
        'bundle_survivor' => [
            'id' => 'bundle_survivor',
            'category' => 'bundle',
            'gems' => 300,
            'gold' => 2500,
            'badge' => 'SAVE 35%',
            'prices' => [
                'USD' => 3.99,
                'EUR' => 3.99,
                'GBP' => 3.39,
            ],
            'label' => 'Survivor Combat Kit',
            'desc' => 'Balanced starter pack with both kinetic gold and rare nano-crystals.',
        ],
        'bundle_operative' => [
            'id' => 'bundle_operative',
            'category' => 'bundle',
            'gems' => 850,
            'gold' => 8000,
            'badge' => 'SAVE 38%',
            'prices' => [
                'USD' => 8.99,
                'EUR' => 8.99,
                'GBP' => 7.69,
            ],
            'label' => 'Operative Strike Pack',
            'desc' => 'Heavy firepower injection for weapon mastery and high-tech finishes.',
        ],
        'bundle_apocalypse' => [
            'id' => 'bundle_apocalypse',
            'category' => 'bundle',
            'gems' => 2200,
            'gold' => 25000,
            'badge' => 'BEST SELLER · -43%',
            'prices' => [
                'USD' => 19.99,
                'EUR' => 19.99,
                'GBP' => 16.99,
            ],
            'label' => 'Apocalypse War Chest',
            'desc' => 'Supreme survival payload. Maximizes workshop upgrades and skins.',
        ],
        'bundle_overlord' => [
            'id' => 'bundle_overlord',
            'category' => 'bundle',
            'gems' => 6500,
            'gold' => 80000,
            'badge' => 'ULTIMATE · -45%',
            'prices' => [
                'USD' => 49.99,
                'EUR' => 49.99,
                'GBP' => 41.99,
            ],
            'label' => 'Omega Fortress Depot',
            'desc' => 'The ultimate sector defense package. Limitless crystals and gold.',
        ],

        // --- GOLD PACKS (WORKSHOP UPGRADES) ---
        'gold_pouch' => [
            'id' => 'gold_pouch',
            'category' => 'gold',
            'gems' => 0,
            'gold' => 1200,
            'badge' => null,
            'prices' => [
                'USD' => 1.49,
                'EUR' => 1.49,
                'GBP' => 1.29,
            ],
            'label' => '1,200 Gold',
            'desc' => 'Quick gold infusion for immediate caliber calibrations.',
        ],
        'gold_crate' => [
            'id' => 'gold_crate',
            'category' => 'gold',
            'gems' => 0,
            'gold' => 5000,
            'badge' => '+15% BONUS',
            'prices' => [
                'USD' => 4.49,
                'EUR' => 4.49,
                'GBP' => 3.79,
            ],
            'label' => '5,000 Gold',
            'desc' => 'Solid military munitions payload to reinforce base barricades.',
        ],
        'gold_vault' => [
            'id' => 'gold_vault',
            'category' => 'gold',
            'gems' => 0,
            'gold' => 14000,
            'badge' => '+25% BONUS',
            'prices' => [
                'USD' => 9.99,
                'EUR' => 9.99,
                'GBP' => 8.49,
            ],
            'label' => '14,000 Gold',
            'desc' => 'Substantial gold vault for high-tier fire rate and damage.',
        ],
        'gold_convoy' => [
            'id' => 'gold_convoy',
            'category' => 'gold',
            'gems' => 0,
            'gold' => 40000,
            'badge' => '+50% BONUS',
            'prices' => [
                'USD' => 24.99,
                'EUR' => 24.99,
                'GBP' => 20.99,
            ],
            'label' => '40,000 Gold',
            'desc' => 'Massive gold convoy for maximum workshop fortifications.',
        ],
    ];

    /**
     * Calculate price for a custom crystal amount in specified currency.
     */
    public static function calculateCustomGemPrice(int $gems, string $currency = 'USD'): float
    {
        if ($gems <= 0) {
            return 0.0;
        }

        $ratePerGem = match (true) {
            $gems >= 100000 => 0.008,
            $gems >= 25000 => 0.010,
            $gems >= 5000 => 0.012,
            $gems >= 2500 => 0.014,
            $gems >= 1000 => 0.016,
            $gems >= 500 => 0.018,
            default => 0.020,
        };

        $usdPrice = round($gems * $ratePerGem, 2);

        $currencyMultiplier = match ($currency) {
            'EUR' => 1.00,
            'GBP' => 0.85,
            default => 1.00,
        };

        return round($usdPrice * $currencyMultiplier, 2);
    }

    /**
     * Calculate price for a custom gold amount in specified currency.
     */
    public static function calculateCustomGoldPrice(int $gold, string $currency = 'USD'): float
    {
        if ($gold <= 0) {
            return 0.0;
        }

        $ratePerGold = match (true) {
            $gold >= 1000000 => 0.00035,
            $gold >= 100000 => 0.00050,
            $gold >= 25000 => 0.00070,
            $gold >= 5000 => 0.00090,
            $gold >= 1000 => 0.00110,
            default => 0.00125,
        };

        $usdPrice = round($gold * $ratePerGold, 2);

        $currencyMultiplier = match ($currency) {
            'EUR' => 1.00,
            'GBP' => 0.85,
            default => 1.00,
        };

        return round($usdPrice * $currencyMultiplier, 2);
    }

    /**
     * Calculate price for combined custom crystal and gold procurement with combo discount.
     */
    public static function calculateCustomOrderPrice(int $gems, int $gold, string $currency = 'USD'): float
    {
        $gemPrice = self::calculateCustomGemPrice($gems, $currency);
        $goldPrice = self::calculateCustomGoldPrice($gold, $currency);
        $total = $gemPrice + $goldPrice;

        if ($gems > 0 && $gold > 0) {
            $total = round($total * 0.90, 2); // 10% Combo Synergy Bonus
        }

        if ($total <= 0) {
            return 0.0;
        }

        return max(0.99, round($total, 2));
    }

    /**
     * Render the dedicated Top-Up Shop page.
     */
    public function shop(Request $request): Response
    {
        $user = $this->resolveUser($request);

        return Inertia::render('Shop', [
            'player' => [
                'id' => $user->id,
                'name' => $user->name,
                'gold' => $user->gold,
                'gems' => $user->gems,
            ],
            'packs' => array_values(self::PACKS),
            'currencies' => self::CURRENCIES,
            'currency_symbols' => self::CURRENCY_SYMBOLS,
            'recent_payments' => $user->payments()->latest()->take(6)->get(),
        ]);
    }

    /**
     * Initiate a payment session.
     */
    public function createSession(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'pack_id' => 'required|string',
            'currency' => 'nullable|string|in:USD,EUR,GBP',
            'custom_gems' => 'nullable|integer|min:0|max:2000000000',
            'custom_gold' => 'nullable|integer|min:0|max:2000000000',
        ]);

        $user = $this->resolveUser($request);
        $currency = $validated['currency'] ?? 'USD';
        $packId = $validated['pack_id'];

        if (in_array($packId, ['custom', 'custom_gems', 'custom_gold'], true)) {
            $gems = (int) ($validated['custom_gems'] ?? 0);
            $gold = (int) ($validated['custom_gold'] ?? 0);

            if ($gems <= 0 && $gold <= 0) {
                return back()->withErrors(['custom_gems' => 'Please enter at least 1 crystal or 1 gold coin to proceed.']);
            }

            $amount = self::calculateCustomOrderPrice($gems, $gold, $currency);
        } elseif (isset(self::PACKS[$packId])) {
            $pack = self::PACKS[$packId];
            $gems = $pack['gems'] ?? 0;
            $gold = $pack['gold'] ?? 0;
            $amount = $pack['prices'][$currency] ?? $pack['prices']['USD'];
        } else {
            return back()->withErrors(['pack_id' => 'The selected supply package is invalid.']);
        }

        $paymentId = 'pay_'.Str::random(16);

        $payment = Payment::create([
            'user_id' => $user->id,
            'payment_id' => $paymentId,
            'amount' => $amount,
            'currency' => $currency,
            'gems_granted' => $gems,
            'gold_granted' => $gold,
            'status' => 'pending',
        ]);

        // Auto-fulfill immediately in development mode so top-up is instantaneous
        DB::transaction(function () use ($payment, $user, $gems, $gold) {
            $payment->update(['status' => 'completed']);
            if ($gems > 0) {
                $user->increment('gems', $gems);
            }
            if ($gold > 0) {
                $user->increment('gold', $gold);
            }
        });

        try {
            Mail::to($user->email)->send(new TopUpSuccessMail($payment, $user));
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch TopUpSuccessMail: '.$e->getMessage());
        }

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'payment_id' => $paymentId,
                'currency' => $currency,
                'amount' => $amount,
                'gems_added' => $gems,
                'gold_added' => $gold,
                'total_gems' => $user->fresh()->gems,
                'total_gold' => $user->fresh()->gold,
            ]);
        }

        $summary = [];
        if ($gems > 0) {
            $summary[] = number_format($gems).' crystals';
        }
        if ($gold > 0) {
            $summary[] = number_format($gold).' gold';
        }

        return back()->with('success', 'Top-up successful! Added '.implode(' and ', $summary).' to your account.');
    }

    /**
     * Download or view the PDF invoice for a completed payment.
     */
    public function downloadInvoice(string $paymentId, PdfInvoiceGenerator $generator): HttpResponse
    {
        $payment = Payment::where('payment_id', $paymentId)->firstOrFail();
        $pdfData = $generator->generate($payment, $payment->user);

        return response($pdfData, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="invoice-'.$payment->payment_id.'.pdf"',
            'Cache-Control' => 'private, max-age=3600',
        ]);
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
