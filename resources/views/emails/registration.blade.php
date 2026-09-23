@extends('emails.layout')

@section('content')
    <!-- Eyebrow Badge -->
    <div style="font-family: monospace; font-size: 11px; color: #56d4c2; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: bold;">
        [SECURITY CLEARANCE GRANTED // ENCRYPTION KEY VERIFIED]
    </div>

    <!-- Main Title -->
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 0 0 16px 0; text-transform: uppercase;">
        Welcome to the Line, <span style="color: #e9b85f;">{{ $user->name }}</span>.
    </h1>

    <!-- Intro Text -->
    <p style="color: #cad8d4; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Your biometric terminal link has been established with Sector 09 Defense Outpost. The perimeter barricade is holding, but the infected horde is converging on our coordinates.
    </p>

    <!-- Initial Loadout Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #101618; border: 1px solid #233134; margin-bottom: 24px; border-radius: 2px;">
        <tr>
            <td style="padding: 16px 20px; border-bottom: 1px solid #1a2528;">
                <div style="font-family: monospace; font-size: 11px; color: #e9b85f; font-weight: bold; letter-spacing: 1px;">
                    INITIAL RECON LOADOUT CREDITED:
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 16px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: monospace; font-size: 13px; color: #d7e0dd;">
                    <tr>
                        <td style="padding: 6px 0; color: #9bb1aa;">SURVIVOR GOLD:</td>
                        <td align="right" style="padding: 6px 0; font-weight: bold; color: #e9b85f;">+{{ number_format($user->gold ?? 500) }} g</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #9bb1aa;">WAR VAULT CRYSTALS:</td>
                        <td align="right" style="padding: 6px 0; font-weight: bold; color: #56d4c2;">+{{ number_format($user->gems ?? 250) }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #9bb1aa;">PRIMARY SIDEARM:</td>
                        <td align="right" style="padding: 6px 0; font-weight: bold; color: #ffffff;">Kinetic Pistol Lvl 1</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #9bb1aa;">BARRICADE INTEGRITY:</td>
                        <td align="right" style="padding: 6px 0; font-weight: bold; color: #ffffff;">100 HP [100% NOMINAL]</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Call to Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
        <tr>
            <td align="center">
                <a href="{{ route('game.index') }}" style="display: inline-block; background-color: #e9b85f; color: #101617; font-weight: 800; font-family: monospace; font-size: 13px; letter-spacing: 1.5px; padding: 14px 32px; text-decoration: none; border-radius: 2px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(233, 184, 95, 0.4);">
                    ENTER DEFENSE ARENA &rarr;
                </a>
            </td>
        </tr>
    </table>

    <!-- Tactical Tip -->
    <div style="background-color: rgba(233, 184, 95, 0.05); border-left: 3px solid #e9b85f; padding: 12px 16px; margin-top: 24px;">
        <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #e9b85f; margin-bottom: 4px;">
            TACTICAL OPERATIONAL DIRECTIVE:
        </div>
        <div style="font-size: 12px; color: #9bb1aa; line-height: 1.5;">
            Earn gold by eliminating mutants in each defense wave. Visit the Kinetic Workshop to increase firing caliber and reinforce barricade concrete between waves.
        </div>
    </div>
@endsection
