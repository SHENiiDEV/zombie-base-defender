<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'weapon_type',
    'active_skin',
    'level_damage',
    'level_fire_rate',
    'level_magazine',
    'level_reload',
])]
class UserWeapon extends Model
{
    /**
     * Get the user that owns the weapon.
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
            'level_damage' => 'integer',
            'level_fire_rate' => 'integer',
            'level_magazine' => 'integer',
            'level_reload' => 'integer',
        ];
    }
}
