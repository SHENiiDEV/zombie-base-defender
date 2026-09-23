<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeRegistrationMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user registration.
     */
    public function register(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'gold' => 500,
            'gems' => 250,
            'max_wave' => 1,
            'wall_hp_level' => 1,
            'active_weapon_skin' => 'default',
            'active_wall_skin' => 'default',
            'active_weapon_type' => 'pistol',
        ]);

        $user->weapons()->create([
            'weapon_type' => 'pistol',
            'level_damage' => 1,
            'level_fire_rate' => 1,
            'level_magazine' => 1,
            'level_reload' => 1,
        ]);

        $user->skins()->create(['skin_id' => 'default', 'category' => 'weapon']);
        $user->skins()->create(['skin_id' => 'default', 'category' => 'wall']);

        Auth::login($user);
        $request->session()->regenerate();

        try {
            Mail::to($user->email)->send(new WelcomeRegistrationMail($user));
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch WelcomeRegistrationMail: '.$e->getMessage());
        }

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'gold' => $user->gold,
                    'gems' => $user->gems,
                ],
                'redirect' => route('game.index'),
            ]);
        }

        return redirect()->route('game.index')->with('success', 'Clearance granted! Welcome Commander '.$user->name);
    }

    /**
     * Handle user authentication.
     */
    public function login(Request $request): RedirectResponse|JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'user' => Auth::user(),
                    'redirect' => route('game.index'),
                ]);
            }

            return redirect()->intended(route('game.index'));
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'The provided security credentials do not match our defense records.',
                'errors' => ['email' => ['The provided security credentials do not match our defense records.']],
            ], 422);
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('landing');
    }
}
