<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentWebhookController extends Controller
{
    /**
     * Handle payment webhook callback.
     */
    public function handle(Request $request): JsonResponse
    {
        $request->validate([
            'payment_id' => 'required|string',
            'status' => 'required|string|in:success,failed,pending',
        ]);

        $paymentId = $request->input('payment_id');
        $status = $request->input('status');

        $payment = Payment::where('payment_id', $paymentId)->firstOrFail();

        if ($payment->status === 'completed') {
            return response()->json(['status' => 'already_processed']);
        }

        if ($status === 'success') {
            DB::transaction(function () use ($payment) {
                $payment->update(['status' => 'completed']);
                if ($payment->gems_granted > 0) {
                    $payment->user->increment('gems', $payment->gems_granted);
                }
                if ($payment->gold_granted > 0) {
                    $payment->user->increment('gold', $payment->gold_granted);
                }
            });
        } elseif ($status === 'failed') {
            $payment->update(['status' => 'failed']);
        }

        return response()->json(['status' => 'ok']);
    }
}
