<?php

namespace App\Http\Middleware;

use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'navigation' => [
                'home' => route('landing', [], false),
                'game' => route('game.index', [], false),
                'arsenal' => route('game.arsenal', [], false),
                'upgrades' => route('game.upgrades', [], false),
                'wardrobe' => route('game.wardrobe', [], false),
                'shop' => route('shop.index', [], false),
                'terms' => route('legal.terms', [], false),
                'privacy' => route('legal.privacy', [], false),
                'cookies' => route('legal.cookies', [], false),
                'topUp' => route('payments.create-session', [], false),
            ],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'gold' => $request->user()->gold,
                    'gems' => $request->user()->gems,
                ] : null,
            ],
            'company' => [
                'name' => config('company.name'),
                'number' => config('company.number'),
                'address' => config('company.address'),
                'email' => config('company.email'),
            ],
            'gem_packs' => PaymentController::PACKS,
        ];
    }
}
