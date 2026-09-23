@extends('emails.layout')

@section('content')
    <!-- Eyebrow Badge -->
    <div style="font-family: monospace; font-size: 11px; color: #56d4c2; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: bold;">
        [SUPPLY DROP DISPATCHED // TRANSACTION SETTLED]
    </div>

    <!-- Main Title -->
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 0 0 16px 0; text-transform: uppercase;">
        Supply Drop Confirmed, <span style="color: #e9b85f;">{{ $user->name }}</span>
    </h1>

    <p style="color: #cad8d4; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Orbital dropship beacon locked. Your purchased tactical defense package has been successfully delivered and credited to your terminal account.
    </p>

    <!-- Receipt Details Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #101618; border: 1px solid #233134; margin-bottom: 24px; border-radius: 2px;">
        <tr>
            <td colspan="2" style="padding: 14px 20px; border-bottom: 1px solid #1a2528; background-color: #131b1d;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="font-family: monospace; font-size: 11px; color: #e9b85f; font-weight: bold; letter-spacing: 1px;">
                            TRANSACTION VOUCHER: {{ $payment->payment_id }}
                        </td>
                        <td align="right" style="font-family: monospace; font-size: 10px; color: #56d4c2; font-weight: bold;">
                            PAID // CONFIRMED
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 16px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: monospace; font-size: 13px; color: #d7e0dd;">
                    @if($payment->gems_granted > 0)
                        <tr>
                            <td style="padding: 6px 0; color: #9bb1aa;">CRYSTALS CREDITED:</td>
                            <td align="right" style="padding: 6px 0; font-weight: bold; color: #56d4c2;">+{{ number_format($payment->gems_granted) }} Crystals</td>
                        </tr>
                    @endif
                    @if($payment->gold_granted > 0)
                        <tr>
                            <td style="padding: 6px 0; color: #9bb1aa;">SURVIVOR GOLD CREDITED:</td>
                            <td align="right" style="padding: 6px 0; font-weight: bold; color: #e9b85f;">+{{ number_format($payment->gold_granted) }} Gold</td>
                        </tr>
                    @endif
                    <tr>
                        <td style="padding: 6px 0; color: #9bb1aa;">TOTAL SETTLED:</td>
                        <td align="right" style="padding: 6px 0; font-weight: bold; color: #ffffff;">
                            {{ $payment->currency }} {{ number_format((float) $payment->amount, 2) }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #9bb1aa;">DATE OF SETTLEMENT:</td>
                        <td align="right" style="padding: 6px 0; color: #7f9994; font-size: 12px;">
                            {{ $payment->created_at ? $payment->created_at->format('Y-m-d H:i:s') : gmdate('Y-m-d H:i:s') }} UTC
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td colspan="2" style="padding: 12px 20px; border-top: 1px solid #1a2528; background-color: #0c1214;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: monospace; font-size: 12px;">
                    <tr>
                        <td style="color: #9bb1aa;">UPDATED VAULT BALANCE:</td>
                        <td align="right" style="font-weight: bold; color: #56d4c2;">
                            {{ number_format($user->fresh()->gems ?? $user->gems) }} Crystals &bull; {{ number_format($user->fresh()->gold ?? $user->gold) }} Gold
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Attachment Notification Callout -->
    <div style="background-color: rgba(86, 212, 194, 0.06); border: 1px solid rgba(86, 212, 194, 0.25); padding: 14px 18px; margin-bottom: 24px; border-radius: 2px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td width="24" style="vertical-align: top; color: #56d4c2; font-family: monospace; font-weight: bold;">[PDF]</td>
                <td style="padding-left: 10px;">
                    <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #56d4c2;">
                        INVOICE ATTACHED
                    </div>
                    <div style="font-size: 12px; color: #9bb1aa; margin-top: 3px;">
                        An official cryptographic defense invoice (<strong>invoice-{{ $payment->payment_id }}.pdf</strong>) is attached to this transmission for your accounting records.
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Call to Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 16px 0;">
        <tr>
            <td align="center">
                <a href="{{ route('game.wardrobe') }}" style="display: inline-block; background-color: #e9b85f; color: #101617; font-weight: 800; font-family: monospace; font-size: 13px; letter-spacing: 1.5px; padding: 14px 32px; text-decoration: none; border-radius: 2px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(233, 184, 95, 0.4);">
                    VISIT CYBER ARSENAL &rarr;
                </a>
            </td>
        </tr>
    </table>
@endsection
