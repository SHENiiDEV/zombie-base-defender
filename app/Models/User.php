<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'surname',
    'email',
    'phone',
    'date_of_birth',
    'address_line1',
    'city',
    'country',
    'postal_code',
    'terms_accepted_at',
    'password',
    'gold',
    'gems',
    'max_wave',
    'wall_hp_level',
    'active_weapon_skin',
    'active_wall_skin',
    'active_weapon_type',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the weapons owned by the user.
     *
     * @return HasMany<UserWeapon, $this>
     */
    public function weapons(): HasMany
    {
        return $this->hasMany(UserWeapon::class);
    }

    /**
     * Get the skins unlocked by the user.
     *
     * @return HasMany<UserSkin, $this>
     */
    public function skins(): HasMany
    {
        return $this->hasMany(UserSkin::class);
    }

    /**
     * Get the payments made by the user.
     *
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'terms_accepted_at' => 'datetime',
            'gold' => 'integer',
            'gems' => 'integer',
            'max_wave' => 'integer',
            'wall_hp_level' => 'integer',
        ];
    }
}
