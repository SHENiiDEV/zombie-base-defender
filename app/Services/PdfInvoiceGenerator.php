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
        $userName = $user?->name ?? 'Survivor Commander';
        $userEmail = $user?->email ?? 'unknown@zombie.game';

        $company = config('company', []);
        $companyName = $company['name'] ?? 'ZOMBIE BASE DEFENDER OUTPOST PROTOCOL';
        $companyNumber = $company['number'] ?? 'OUTPOST-SEC-09-881';
        $companyAddress = $company['address'] ?? 'Sector 09 Quarantine Perimeter, Tactical Fortification Line';
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

        // Prepare PDF Stream
        $stream = [];

        // 1. Dark Background (Canvas 595.28 x 841.89 pt - A4)
        $stream[] = '0.07 0.09 0.10 rg'; // #121719
        $stream[] = '0 0 595.28 841.89 re f';

        // 2. Top Golden Laser Stripe
        $stream[] = '0.91 0.72 0.37 rg'; // #e9b85f
        $stream[] = '0 834 595.28 8 re f';

        // 3. Header Grid Accents / Border Frame
        $stream[] = '0.15 0.20 0.22 RG'; // #263338
        $stream[] = '1 w';
        $stream[] = '36 36 523.28 770 re s';

        // Inner header container
        $stream[] = '0.10 0.13 0.15 rg'; // #1a2126
        $stream[] = '44 720 507.28 78 re f';
        $stream[] = '0.91 0.72 0.37 RG';
        $stream[] = '0.75 w';
        $stream[] = '44 720 507.28 78 re s';

        // Header Text: Brand & Tagline
        $stream[] = 'BT';
        $stream[] = '/F2 16 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '58 768 Td';
        $stream[] = $this->pdfEscape('ZOMBIE BASE DEFENDER // SECTOR 09').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F1 9 Tf';
        $stream[] = '0.58 0.68 0.66 rg';
        $stream[] = '58 750 Td';
        $stream[] = $this->pdfEscape('OFFICIAL DEFENSE DEPOT SUPPLY VOUCHER & INVOICE').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.45 0.55 0.53 rg';
        $stream[] = '58 734 Td';
        $stream[] = $this->pdfEscape('CLEARANCE LEVEL 4 // QUARANTINE PERIMETER HARBOR').' Tj';
        $stream[] = 'ET';

        // Invoice Meta Right-Aligned in Header
        $stream[] = 'BT';
        $stream[] = '/F2 14 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '360 768 Td';
        $stream[] = $this->pdfEscape($invoiceNumber).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 9 Tf';
        $stream[] = '0.58 0.68 0.66 rg';
        $stream[] = '360 750 Td';
        $stream[] = $this->pdfEscape('DATE: '.$date).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 9 Tf';
        $stream[] = '0.33 0.83 0.60 rg'; // Emerald
        $stream[] = '360 734 Td';
        $stream[] = $this->pdfEscape('STATUS: CONFIRMED // FULFILLED').' Tj';
        $stream[] = 'ET';

        // Two Information Panels: Billed To (Left) & Supplier (Right)
        // Left Box: OPERATOR (Customer)
        $stream[] = '0.09 0.12 0.13 rg';
        $stream[] = '44 610 245 92 re f';
        $stream[] = '0.18 0.24 0.26 RG';
        $stream[] = '44 610 245 92 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 9 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '56 684 Td';
        $stream[] = $this->pdfEscape('// BILLED OPERATOR').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F2 11 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '56 666 Td';
        $stream[] = $this->pdfEscape($userName).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8.5 Tf';
        $stream[] = '0.65 0.75 0.73 rg';
        $stream[] = '56 648 Td';
        $stream[] = $this->pdfEscape('EMAIL: '.$userEmail).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.45 0.55 0.53 rg';
        $stream[] = '56 630 Td';
        $stream[] = $this->pdfEscape('SECTOR: 09 / LAT 52.5200 N / LON 13.4050 E').' Tj';
        $stream[] = 'ET';

        // Right Box: SUPPLIER (Company)
        $stream[] = '0.09 0.12 0.13 rg';
        $stream[] = '306 610 245 92 re f';
        $stream[] = '0.18 0.24 0.26 RG';
        $stream[] = '306 610 245 92 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 9 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '318 684 Td';
        $stream[] = $this->pdfEscape('// SUPPLYING OUTPOST').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F2 9.5 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '318 666 Td';
        $stream[] = $this->pdfEscape($companyName).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.65 0.75 0.73 rg';
        $stream[] = '318 648 Td';
        $stream[] = $this->pdfEscape('REG: '.$companyNumber.' // '.$companyEmail).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 7.5 Tf';
        $stream[] = '0.45 0.55 0.53 rg';
        $stream[] = '318 630 Td';
        $stream[] = $this->pdfEscape(substr($companyAddress, 0, 48)).' Tj';
        $stream[] = 'ET';

        // 4. Line Items Table
        // Table Header
        $stream[] = '0.12 0.16 0.18 rg';
        $stream[] = '44 560 507.28 26 re f';
        $stream[] = '0.91 0.72 0.37 RG';
        $stream[] = '44 560 507.28 26 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 9 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '56 569 Td';
        $stream[] = $this->pdfEscape('RESOURCE SPECIFICATION').' Tj';
        $stream[] = '260 0 Td';
        $stream[] = $this->pdfEscape('CLASS').' Tj';
        $stream[] = '75 0 Td';
        $stream[] = $this->pdfEscape('QTY').' Tj';
        $stream[] = '70 0 Td';
        $stream[] = $this->pdfEscape('TOTAL').' Tj';
        $stream[] = 'ET';

        // Table Row
        $stream[] = '0.08 0.11 0.12 rg';
        $stream[] = '44 515 507.28 45 re f';
        $stream[] = '0.16 0.22 0.24 RG';
        $stream[] = '44 515 507.28 45 re s';

        $stream[] = 'BT';
        $stream[] = '/F2 10.5 Tf';
        $stream[] = '1 1 1 rg';
        $stream[] = '56 541 Td';
        $stream[] = $this->pdfEscape($description).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.55 0.65 0.63 rg';
        $stream[] = '56 526 Td';
        $stream[] = $this->pdfEscape('Ref: '.$payment->payment_id.' // Immediate Armory Delivery').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 9 Tf';
        $stream[] = '0.65 0.75 0.73 rg';
        $stream[] = '316 534 Td';
        $stream[] = $this->pdfEscape('SUPPLY').' Tj';
        $stream[] = '80 0 Td';
        $stream[] = $this->pdfEscape('1').' Tj';
        $stream[] = '65 0 Td';
        $stream[] = '/F4 10 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = $this->pdfEscape($amountFormatted).' Tj';
        $stream[] = 'ET';

        // 5. Total Settlement Summary Box
        $stream[] = '0.10 0.13 0.15 rg';
        $stream[] = '316 415 235.28 85 re f';
        $stream[] = '0.91 0.72 0.37 RG';
        $stream[] = '316 415 235.28 85 re s';

        $stream[] = 'BT';
        $stream[] = '/F3 9 Tf';
        $stream[] = '0.65 0.75 0.73 rg';
        $stream[] = '332 478 Td';
        $stream[] = $this->pdfEscape('NET AMOUNT:').' Tj';
        $stream[] = '100 0 Td';
        $stream[] = $this->pdfEscape($amountFormatted).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 9 Tf';
        $stream[] = '0.65 0.75 0.73 rg';
        $stream[] = '332 458 Td';
        $stream[] = $this->pdfEscape('TAX / VAT (0%):').' Tj';
        $stream[] = '100 0 Td';
        $stream[] = $this->pdfEscape($currencySymbol.'0.00').' Tj';
        $stream[] = 'ET';

        $stream[] = '0.25 0.30 0.32 RG';
        $stream[] = '330 445 205 0.5 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 12 Tf';
        $stream[] = '0.91 0.72 0.37 rg';
        $stream[] = '332 426 Td';
        $stream[] = $this->pdfEscape('TOTAL PAID:').' Tj';
        $stream[] = '90 0 Td';
        $stream[] = '1 1 1 rg';
        $stream[] = $this->pdfEscape($amountFormatted).' Tj';
        $stream[] = 'ET';

        // Verification Stamp / Seal on Bottom Left
        $stream[] = '0.08 0.11 0.12 rg';
        $stream[] = '44 415 245 85 re f';
        $stream[] = '0.33 0.83 0.60 RG';
        $stream[] = '44 415 245 85 re s';

        $stream[] = 'BT';
        $stream[] = '/F4 9 Tf';
        $stream[] = '0.33 0.83 0.60 rg';
        $stream[] = '56 478 Td';
        $stream[] = $this->pdfEscape('/// CRYPTOGRAPHIC CLEARANCE SEAL').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.65 0.75 0.73 rg';
        $stream[] = '56 460 Td';
        $stream[] = $this->pdfEscape('HASH: '.strtoupper(hash('sha256', $payment->payment_id.$amountFormatted))).' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.45 0.55 0.53 rg';
        $stream[] = '56 444 Td';
        $stream[] = $this->pdfEscape('TERMINAL: NODE-SECTOR09-PROD-A').' Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.33 0.83 0.60 rg';
        $stream[] = '56 426 Td';
        $stream[] = $this->pdfEscape('ALL RIGHTS SECURED. THE FINAL LINE IS YOU.').' Tj';
        $stream[] = 'ET';

        // 6. Footer Terms & Legal Information
        $stream[] = 'BT';
        $stream[] = '/F3 8 Tf';
        $stream[] = '0.45 0.55 0.53 rg';
        $stream[] = '44 80 Td';
        $stream[] = $this->pdfEscape('This electronic document serves as an official invoice and proof of purchase for digital defense resources.').' Tj';
        $stream[] = '0 -13 Td';
        $stream[] = $this->pdfEscape('For support inquiries or dispute resolution, contact: '.$companyEmail).' Tj';
        $stream[] = '0 -13 Td';
        $stream[] = $this->pdfEscape('Outpost 09 Cyber Fortifications - Zombie Base Defender. All rights reserved.').' Tj';
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
