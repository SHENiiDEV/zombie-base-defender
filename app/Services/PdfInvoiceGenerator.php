<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;

class PdfInvoiceGenerator
{
    /**
     * Generate a cyberpunk-themed PDF invoice for a given payment.
     */
    public function generate(Payment $payment, ?User $user = null): string
    {
        $user = $user ?? $payment->user;
        $fullName = trim(($user?->name ?? '').' '.($user?->surname ?? ''));
        $userName = ! empty($fullName) ? $fullName : 'Survivor Commander';
        $userEmail = $user?->email ?? 'commander@zombiebasedefender.com';

        $company = config('company', []);
        $companyName = $company['name'] ?? 'Zombie Base Defender Ltd.';
        $companyNumber = $company['number'] ?? 'OUTPOST-SEC-09-881';
        $companyAddress = $company['address'] ?? 'Sector 09 Fortification Line, Perimeter Outpost';
        $companyEmail = config('mail.from.address', 'info@zombiebasedefender.com');

        $invoiceNumber = 'INV-'.strtoupper(substr($payment->payment_id, 4, 10));
        $date = $payment->created_at ? $payment->created_at->format('Y-m-d H:i:s').' UTC' : gmdate('Y-m-d H:i:s').' UTC';
        $currency = strtoupper($payment->currency ?? 'USD');
        $currencySymbol = match ($currency) {
            'EUR' => 'EUR ',
            'GBP' => 'GBP ',
            default => 'USD $',
        };
        $amountFormatted = $currencySymbol.number_format((float) $payment->amount, 2);

        // Build item description
        $itemDesc = [];
        if ($payment->gems_granted > 0) {
            $itemDesc[] = number_format($payment->gems_granted).' Crystals';
        }
        if ($payment->gold_granted > 0) {
            $itemDesc[] = number_format($payment->gold_granted).' Gold';
        }
        $description = ! empty($itemDesc) ? implode(' + ', $itemDesc).' Depot Supply Drop' : 'Depot Resource Top-Up';

        // User location / coordinates
        $locParts = array_filter([$user?->city, $user?->country]);
        $userLocation = ! empty($locParts) ? implode(', ', $locParts) : 'Sector 09 Fortification';

        // Cryptographic verification hash
        $hashRaw = strtoupper(hash('sha256', $payment->payment_id.$amountFormatted));

        // Prepare PDF Stream
        $stream = [];

        // 1. Dark Background (Canvas 595.28 x 841.89 pt - A4)
        $stream[] = '0.07 0.09 0.10 rg'; // #121719
        $stream[] = '0 0 595.28 841.89 re f';

        // 2. Top Golden Laser Stripe
        $stream[] = '0.91 0.72 0.37 rg'; // #e9b85f
        $stream[] = '0 834 595.28 8 re f';

        // 3. Outer Perimeter Grid Frame
        $stream[] = '0.15 0.20 0.22 RG'; // #263338
        $stream[] = '1 w';
        $stream[] = '36 36 523.28 770 re s';

        // ==========================================
        // HEADER CONTAINER (Y: 715 to 797, H: 82)
        // ==========================================
        $stream[] = '0.10 0.13 0.15 rg'; // #1a2126
        $stream[] = '44 715 507.28 82 re f';
        $stream[] = '0.91 0.72 0.37 RG'; // Gold border
        $stream[] = '0.75 w';
        $stream[] = '44 715 507.28 82 re s';

        // Left Header: Brand & Protocol
        $stream[] = 'BT';
        $stream[] = '/F2 14 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '58 767 Td';
        $stream[] = $this->pdfEscape('ZOMBIE BASE DEFENDER').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 8 Tf';
        $stream[] = '0.33 0.83 0.60 rg'; // Emerald
        $stream[] = '58 751 Td';
        $stream[] = $this->pdfEscape('OUTPOST SEC-09 // QUARANTINE PERIMETER').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.48 0.58 0.55 rg';
        $stream[] = '58 736 Td';
        $stream[] = $this->pdfEscape('OFFICIAL DEFENSE DEPOT SUPPLY VOUCHER').' Tj';
        $stream[] = 'ET';

        // Right Header: Invoice Meta (Positioned at X: 370, well clear of left column)
        $stream[] = 'BT';
        $stream[] = '/F2 13 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '370 767 Td';
        $stream[] = $this->pdfEscape($invoiceNumber).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.55 0.65 0.62 rg';
        $stream[] = '370 751 Td';
        $stream[] = $this->pdfEscape('DATE: '.$date).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 8 Tf';
        $stream[] = '0.33 0.83 0.60 rg';
        $stream[] = '370 736 Td';
        $stream[] = $this->pdfEscape('STATUS: CONFIRMED // FULFILLED').' Tj';
        $stream[] = 'ET';

        // ==========================================
        // OPERATOR & SUPPLIER PANELS (Y: 605, H: 95)
        // ==========================================
        // Left Box: OPERATOR (W: 246)
        $stream[] = '0.09 0.12 0.13 rg';
        $stream[] = '44 605 246 95 re f';
        $stream[] = '0.18 0.24 0.26 RG';
        $stream[] = '44 605 246 95 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 8.5 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '56 681 Td';
        $stream[] = $this->pdfEscape('// BILLED OPERATOR').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F2 10.5 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '56 664 Td';
        $stream[] = $this->pdfEscape(substr($userName, 0, 30)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.34 0.83 0.76 rg';
        $stream[] = '56 649 Td';
        $stream[] = $this->pdfEscape('EMAIL: '.substr($userEmail, 0, 30)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.55 0.65 0.62 rg';
        $stream[] = '56 635 Td';
        $stream[] = $this->pdfEscape('LOC: '.substr($userLocation, 0, 34)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7 Tf';
        $stream[] = '0.38 0.48 0.45 rg';
        $stream[] = '56 621 Td';
        $stream[] = $this->pdfEscape('SECTOR: 09 / FORTIFICATION LINE').' Tj';
        $stream[] = 'ET';

        // Right Box: SUPPLIER (W: 246, Starts at X: 305)
        $stream[] = '0.09 0.12 0.13 rg';
        $stream[] = '305 605 246 95 re f';
        $stream[] = '0.18 0.24 0.26 RG';
        $stream[] = '305 605 246 95 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 8.5 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '317 681 Td';
        $stream[] = $this->pdfEscape('// SUPPLYING OUTPOST').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F2 9.5 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '317 664 Td';
        $stream[] = $this->pdfEscape(substr($companyName, 0, 32)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.55 0.65 0.62 rg';
        $stream[] = '317 649 Td';
        $stream[] = $this->pdfEscape('REG: '.substr($companyNumber, 0, 32)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.34 0.83 0.76 rg';
        $stream[] = '317 635 Td';
        $stream[] = $this->pdfEscape('EMAIL: '.substr($companyEmail, 0, 32)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7 Tf';
        $stream[] = '0.38 0.48 0.45 rg';
        $stream[] = '317 621 Td';
        $stream[] = $this->pdfEscape('ADDR: '.substr($companyAddress, 0, 34)).' Tj';
        $stream[] = 'ET';

        // ==========================================
        // LINE ITEMS TABLE (Y: 518 to 589)
        // ==========================================
        // Table Header
        $stream[] = '0.12 0.16 0.18 rg';
        $stream[] = '44 565 507.28 24 re f';
        $stream[] = '0.91 0.72 0.37 RG';
        $stream[] = '44 565 507.28 24 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 8 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '56 573 Td';
        $stream[] = $this->pdfEscape('RESOURCE SPECIFICATION').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 8 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '330 573 Td';
        $stream[] = $this->pdfEscape('CLASS').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 8 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '405 573 Td';
        $stream[] = $this->pdfEscape('QTY').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 8 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '468 573 Td';
        $stream[] = $this->pdfEscape('TOTAL').' Tj';
        $stream[] = 'ET';

        // Table Row (Y: 518, H: 47)
        $stream[] = '0.08 0.11 0.12 rg';
        $stream[] = '44 518 507.28 47 re f';
        $stream[] = '0.16 0.22 0.24 RG';
        $stream[] = '44 518 507.28 47 re s';

        $stream[] = 'BT';
        $stream[] = '/F2 10 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '56 546 Td';
        $stream[] = $this->pdfEscape(substr($description, 0, 42)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.48 0.58 0.55 rg';
        $stream[] = '56 531 Td';
        $stream[] = $this->pdfEscape('Ref: '.substr($payment->payment_id, 0, 22).' // Armory Drop').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8.5 Tf';
        $stream[] = '0.55 0.65 0.62 rg';
        $stream[] = '330 538 Td';
        $stream[] = $this->pdfEscape('SUPPLY').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8.5 Tf';
        $stream[] = '0.55 0.65 0.62 rg';
        $stream[] = '412 538 Td';
        $stream[] = $this->pdfEscape('1').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 9.5 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '468 538 Td';
        $stream[] = $this->pdfEscape($amountFormatted).' Tj';
        $stream[] = 'ET';

        // ==========================================
        // BOTTOM PANELS: CLEARANCE & TOTALS (Y: 395, H: 105)
        // ==========================================
        // Left Box: CRYPTOGRAPHIC CLEARANCE SEAL (W: 246)
        $stream[] = '0.08 0.11 0.12 rg';
        $stream[] = '44 395 246 105 re f';
        $stream[] = '0.33 0.83 0.60 RG'; // Emerald border
        $stream[] = '44 395 246 105 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 8 Tf';
        $stream[] = '0.33 0.83 0.60 rg';
        $stream[] = '56 483 Td';
        $stream[] = $this->pdfEscape('/// CRYPTOGRAPHIC CLEARANCE SEAL').' Tj';
        $stream[] = 'ET';

        // Hash safely split into 3 segments so it never overflows!
        $stream[] = 'BT';
        $stream[] = '/F3 6.8 Tf';
        $stream[] = '0.48 0.58 0.55 rg';
        $stream[] = '56 468 Td';
        $stream[] = $this->pdfEscape('HASH: '.substr($hashRaw, 0, 24)).' Tj';
        $stream[] = '0 -10 Td';
        $stream[] = $this->pdfEscape('      '.substr($hashRaw, 24, 24)).' Tj';
        $stream[] = '0 -10 Td';
        $stream[] = $this->pdfEscape('      '.substr($hashRaw, 48)).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7 Tf';
        $stream[] = '0.34 0.83 0.76 rg';
        $stream[] = '56 428 Td';
        $stream[] = $this->pdfEscape('TERMINAL: NODE-SECTOR09-PROD-A').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 7.5 Tf';
        $stream[] = '0.33 0.83 0.60 rg';
        $stream[] = '56 411 Td';
        $stream[] = $this->pdfEscape('ALL RIGHTS SECURED. THE FINAL LINE IS YOU.').' Tj';
        $stream[] = 'ET';

        // Right Box: TOTAL SETTLEMENT SUMMARY (W: 246, Starts at X: 305)
        $stream[] = '0.10 0.13 0.15 rg';
        $stream[] = '305 395 246 105 re f';
        $stream[] = '0.91 0.72 0.37 RG'; // Gold border
        $stream[] = '305 395 246 105 re s';

        $stream[] = 'BT';
        $stream[] = '/F3 8.5 Tf';
        $stream[] = '0.55 0.65 0.62 rg';
        $stream[] = '320 480 Td';
        $stream[] = $this->pdfEscape('NET AMOUNT:').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8.5 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '445 480 Td';
        $stream[] = $this->pdfEscape($amountFormatted).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8.5 Tf';
        $stream[] = '0.55 0.65 0.62 rg';
        $stream[] = '320 462 Td';
        $stream[] = $this->pdfEscape('TAX / VAT (0%):').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8.5 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '445 462 Td';
        $stream[] = $this->pdfEscape($currencySymbol.'0.00').' Tj';
        $stream[] = 'ET';

        // Divider
        $stream[] = '0.22 0.28 0.30 RG';
        $stream[] = '318 450 220 0.5 re s';

        $stream[] = 'BT';
        $stream[] = '/F2 11 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '320 427 Td';
        $stream[] = $this->pdfEscape('TOTAL PAID:').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F2 13 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '430 427 Td';
        $stream[] = $this->pdfEscape($amountFormatted).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F4 7.5 Tf';
        $stream[] = '0.33 0.83 0.60 rg';
        $stream[] = '320 409 Td';
        $stream[] = $this->pdfEscape('FULFILLED VIA SECURE DEPOT').' Tj';
        $stream[] = 'ET';

        // ==========================================
        // FOOTER TERMS & COMPLIANCE NOTES (Y: 60 to 105)
        // ==========================================
        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.40 0.50 0.48 rg';
        $stream[] = '44 95 Td';
        $stream[] = $this->pdfEscape('This electronic document serves as an official invoice and proof of purchase for digital defense resources.').' Tj';
        $stream[] = '0 -13 Td';
        $stream[] = $this->pdfEscape('Support & dispute inquiries: '.$companyEmail.' // Ref: '.$payment->payment_id).' Tj';
        $stream[] = '0 -13 Td';
        $stream[] = $this->pdfEscape($companyName.' - All rights reserved. Outpost 09 Fortification Protocol.').' Tj';
        $stream[] = 'ET';

        // Bottom Accent Laser
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '0 0 595.28 4 re f';

        $content = implode("\n", $stream);

        return $this->buildPdfDocument($content);
    }

    /**
     * Escape special PDF string characters.
     */
    protected function pdfEscape(string $str): string
    {
        $escaped = str_replace(
            ['\\', '(', ')'],
            ['\\\\', '\\(', '\\)'],
            $str
        );

        return '('.$escaped.')';
    }

    /**
     * Assemble valid PDF 1.4 binary structure.
     */
    protected function buildPdfDocument(string $contentStream): string
    {
        $objects = [];

        // 1. Catalog
        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';

        // 2. Pages
        $objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';

        // 3. Page
        $objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R >> >> >>';

        // 4. Content stream
        $len = strlen($contentStream);
        $objects[4] = "<< /Length {$len} >>\nstream\n{$contentStream}\nendstream";

        // Fonts
        $objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
        $objects[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
        $objects[7] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';
        $objects[8] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>';

        $output = "%PDF-1.4\n";
        $xref = [];
        $xref[0] = "0000000000 65535 f \n";

        for ($i = 1; $i <= 8; $i++) {
            $xref[$i] = sprintf("%010d 00000 n \n", strlen($output));
            $output .= "{$i} 0 obj\n".$objects[$i]."\nendobj\n";
        }

        $xrefPos = strlen($output);
        $output .= "xref\n0 9\n";
        for ($i = 0; $i <= 8; $i++) {
            $output .= $xref[$i];
        }

        $output .= "trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n{$xrefPos}\n%%EOF\n";

        return $output;
    }
}
