<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'payment_id',
    'amount',
    'currency',
    'gems_granted',
    'gold_granted',
    'status',
])]
class Payment extends Model
{
    /**
     * Get the user that made the payment.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'gems_granted' => 'integer',
            'gold_granted' => 'integer',
        ];
    }
}
