export const WEAPONS = {
    pistol: { name: 'Pistol', code: 'PST / 01', description: 'Precision plasma blaster. Reliable starting firearm.', role: 'Precision', damage: 10, damageStep: 4, magazine: 12, magazineStep: 3, cooldown: 280, cooldownStep: 25, reload: 2, reloadStep: 0.2, minReload: 0.6 },
    shotgun: { name: 'Shotgun', code: 'SGN / 02', description: 'Five-pellet kinetic spread. Devastating close-range punch.', role: 'Crowd Control', damage: 8, damageStep: 3, magazine: 6, magazineStep: 2, cooldown: 620, cooldownStep: 40, reload: 2.4, reloadStep: 0.25, minReload: 0.8 },
    minigun: { name: 'Minigun', code: 'MGN / 03', description: 'Rapid rotary vulcan for continuous suppression fire.', role: 'Fire Cadence', damage: 6, damageStep: 2, magazine: 40, magazineStep: 10, cooldown: 110, cooldownStep: 8, reload: 3, reloadStep: 0.3, minReload: 1 },
};

export function weaponStats(type, weapon = {}) {
    const base = WEAPONS[type] || WEAPONS.pistol;
    return {
        damage: base.damage + ((weapon.level_damage || 1) - 1) * base.damageStep,
        fire_rate: Math.round(60000 / Math.max(65, base.cooldown - ((weapon.level_fire_rate || 1) - 1) * base.cooldownStep)),
        magazine: base.magazine + ((weapon.level_magazine || 1) - 1) * base.magazineStep,
        reload: Number(Math.max(base.minReload, base.reload - ((weapon.level_reload || 1) - 1) * base.reloadStep).toFixed(2)),
    };
}

export const SKIN_NAMES = {
    default: 'Standard Blaster',
    m4_neon: 'Cyber Neon Blaster', plasma_fury: 'Plasma Fury', toxic_hazard: 'Toxic Hazard',
    wall_cyber: 'Cyber Energy Field', wall_titanium: 'Titanium Alloy Shield', wall_biohazard: 'Bio-Containment Wall',
};

export const RARITIES = { Common: 'COMMON', Rare: 'RARE', Epic: 'EPIC', Legendary: 'LEGENDARY' };
