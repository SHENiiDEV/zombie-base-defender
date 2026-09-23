<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\User;
use App\Services\PdfInvoiceGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TopUpSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public ?User $user = null;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Payment $payment,
        ?User $user = null
    ) {
        $this->user = $user ?? $payment->user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $shortId = strtoupper(substr($this->payment->payment_id, 0, 10));

        return new Envelope(
            subject: '[SECTOR 09] Supply Drop Confirmed: Invoice #'.$shortId,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.topup_success',
            with: [
                'payment' => $this->payment,
                'user' => $this->user,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $generator = app(PdfInvoiceGenerator::class);
        $pdfData = $generator->generate($this->payment, $this->user);

        return [
            Attachment::fromData(fn () => $pdfData, 'invoice-'.$this->payment->payment_id.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
