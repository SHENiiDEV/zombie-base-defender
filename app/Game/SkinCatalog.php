<?php

namespace App\Game;

class SkinCatalog
{
    /**
     * Get all available weapon and wall skins.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    public static function all(): array
    {
        return [
            'weapon' => [
                [
                    'id' => 'default',
                    'name' => 'Standard Blaster',
                    'category' => 'weapon',
                    'cost_gems' => 0,
                    'bullet_color' => '#facc15',
                    'muzzle_color' => '#fbbf24',
                    'rarity' => 'Common',
                    'description' => 'Reliable field-issue kinetic shooter.',
                ],
                [
                    'id' => 'm4_neon',
                    'name' => 'Cyber Neon Blaster',
                    'category' => 'weapon',
                    'cost_gems' => 150,
                    'bullet_color' => '#06b6d4',
                    'muzzle_color' => '#38bdf8',
                    'rarity' => 'Epic',
                    'description' => 'Supercharged cyan plasma coils with intense glow.',
                ],
                [
                    'id' => 'plasma_fury',
                    'name' => 'Plasma Fury',
                    'category' => 'weapon',
                    'cost_gems' => 300,
                    'bullet_color' => '#f43f5e',
                    'muzzle_color' => '#fb7185',
                    'rarity' => 'Legendary',
                    'description' => 'Overheated fusion blasts vaporizing undead hordes.',
                ],
                [
                    'id' => 'toxic_hazard',
                    'name' => 'Toxic Hazard',
                    'category' => 'weapon',
                    'cost_gems' => 200,
                    'bullet_color' => '#22c55e',
                    'muzzle_color' => '#4ade80',
                    'rarity' => 'Rare',
                    'description' => 'Corrosive bio-acid rounds that dissolve armor.',
                ],
                ...self::weaponFinishes(),
            ],
            'wall' => [
                [
                    'id' => 'default',
                    'name' => 'Reinforced Timber',
                    'category' => 'wall',
                    'cost_gems' => 0,
                    'wall_color' => '#78350f',
                    'rarity' => 'Common',
                    'description' => 'Scrap timber barricade holding back the initial horde.',
                ],
                [
                    'id' => 'wall_cyber',
                    'name' => 'Cyber Energy Field',
                    'category' => 'wall',
                    'cost_gems' => 180,
                    'wall_color' => '#06b6d4',
                    'rarity' => 'Epic',
                    'description' => 'High-voltage barrier with humming electrostatic fields.',
                ],
                [
                    'id' => 'wall_titanium',
                    'name' => 'Titanium Alloy Shield',
                    'category' => 'wall',
                    'cost_gems' => 280,
                    'wall_color' => '#64748b',
                    'rarity' => 'Legendary',
                    'description' => 'Heavy hardened blast-plates capable of repelling explosions.',
                ],
                [
                    'id' => 'wall_biohazard',
                    'name' => 'Bio-Containment Wall',
                    'category' => 'wall',
                    'cost_gems' => 220,
                    'wall_color' => '#84cc16',
                    'rarity' => 'Rare',
                    'description' => 'Chemically treated perimeter resistant to decay.',
                ],
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private static function weaponFinishes(): array
    {
        $colors = [
            ['ember', 'Ember', '#fb923c', '#fdba74', 50],
            ['arctic', 'Arctic', '#67e8f9', '#cffafe', 60],
            ['toxic', 'Toxic', '#a3e635', '#d9f99d', 70],
            ['crimson', 'Crimson', '#f43f5e', '#fda4af', 80],
            ['violet', 'Violet', '#a78bfa', '#ddd6fe', 90],
            ['cobalt', 'Cobalt', '#3b82f6', '#93c5fd', 100],
            ['rose', 'Rose', '#f472b6', '#fbcfe8', 110],
            ['jade', 'Jade', '#34d399', '#a7f3d0', 120],
            ['solar', 'Solar', '#facc15', '#fef08a', 130],
            ['ghost', 'Ghost', '#e2e8f0', '#ffffff', 150],
        ];
        $skins = [];
        foreach (['pistol' => 'Pistol', 'shotgun' => 'Shotgun', 'minigun' => 'Minigun'] as $type => $name) {
            foreach ($colors as [$key, $finish, $bullet, $muzzle, $cost]) {
                $skins[] = [
                    'id' => $type.'_'.$key,
                    'name' => $finish.' '.$name,
                    'category' => 'weapon',
                    'weapon_type' => $type,
                    'cost_gems' => $cost,
                    'bullet_color' => $bullet,
                    'muzzle_color' => $muzzle,
                    'rarity' => $cost >= 130 ? 'Epic' : ($cost >= 90 ? 'Rare' : 'Common'),
                    'description' => $finish.' rounds and muzzle flash. Cosmetic only.',
                ];
            }
        }

        return $skins;
    }
}
