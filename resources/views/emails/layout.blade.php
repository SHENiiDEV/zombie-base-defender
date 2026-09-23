<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Zombie Base Defender // Outpost 09' }}</title>
    <style>
        /* Email client reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #0c1011; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0c1011; color: #d7e0dd;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c1011; table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 30px 15px;">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #141c1e; border: 1px solid #233134; box-shadow: 0 10px 30px rgba(0,0,0,0.7);">
                    <!-- Top Golden Laser Stripe -->
                    <tr>
                        <td height="4" style="background-color: #e9b85f; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding: 26px 30px; background-color: #111718; border-bottom: 1px solid #212c2e;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <div style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: #e9b85f; font-weight: bold; margin-bottom: 4px;">
                                            /// SECTOR 09 OUTPOST TRANSMISSION
                                        </div>
                                        <div style="font-size: 20px; font-weight: 800; letter-spacing: 1.5px; color: #ffffff;">
                                            ZOMBIE BASE <span style="color: #e9b85f;">DEFENDER</span>
                                        </div>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="display: inline-block; font-family: monospace; font-size: 10px; color: #56d4c2; background-color: rgba(86, 212, 194, 0.1); border: 1px solid rgba(86, 212, 194, 0.3); padding: 4px 8px; border-radius: 2px;">
                                            LINK ACTIVE
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Email Body Content -->
                    <tr>
                        <td style="padding: 32px 30px;">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 30px; background-color: #0e1415; border-top: 1px solid #1c2628; color: #6e8480; font-size: 11px; font-family: monospace; line-height: 1.6;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <div style="color: #9ab0ab; font-weight: bold; margin-bottom: 6px;">
                                            ZOMBIE BASE DEFENDER // FORTIFIED PERIMETER
                                        </div>
                                        <div>Official emergency sub-wave communication node.</div>
                                        <div>Support: <a href="mailto:{{ config('mail.from.address', 'info@zombiebasedefender.com') }}" style="color: #e9b85f; text-decoration: none;">{{ config('mail.from.address', 'info@zombiebasedefender.com') }}</a></div>
                                        <div style="margin-top: 10px; color: #546864; font-size: 10px;">
                                            &copy; {{ date('Y') }} Outpost Protocol. All defense systems online. The final line is you.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!-- End Main Container -->
            </td>
        </tr>
    </table>
</body>
</html>
