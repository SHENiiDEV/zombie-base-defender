<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/game', [GameController::class, 'index'])->name('game.index');
Route::get('/arsenal', [GameController::class, 'arsenal'])->name('game.arsenal');
Route::get('/upgrades', [GameController::class, 'upgrades'])->name('game.upgrades');
Route::get('/wardrobe', [GameController::class, 'wardrobe'])->name('game.wardrobe');
Route::get('/shop', [PaymentController::class, 'shop'])->name('shop.index');
Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/cookies', [LegalController::class, 'cookies'])->name('legal.cookies');

Route::post('/game/sync-wave', [GameController::class, 'syncWaveRewards'])->name('game.sync-wave');
Route::post('/game/upgrade-weapon', [GameController::class, 'upgradeWeapon'])->name('game.upgrade-weapon');
Route::post('/game/unlock-weapon', [GameController::class, 'unlockWeapon'])->name('game.unlock-weapon');
Route::post('/game/switch-weapon', [GameController::class, 'switchWeapon'])->name('game.switch-weapon');
Route::post('/game/upgrade-wall', [GameController::class, 'upgradeWall'])->name('game.upgrade-wall');
Route::post('/game/buy-skin', [GameController::class, 'buySkin'])->name('game.buy-skin');
Route::post('/game/equip-skin', [GameController::class, 'equipSkin'])->name('game.equip-skin');

Route::post('/payments/create-session', [PaymentController::class, 'createSession'])->name('payments.create-session');
Route::post('/payments/webhook', [PaymentWebhookController::class, 'handle'])->name('payments.webhook');
