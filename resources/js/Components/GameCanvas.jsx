import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { soundFx } from '../Utils/soundFx';

const weaponColors = (skin) => ({
    bullet: skin?.bullet_color || '#facc15',
    glow: skin?.muzzle_color || '#fbbf24',
    core: '#ffffff',
});

const WALL_SKIN_COLORS = {
    default: { main: '#78350f', border: '#b45309', glow: '#d97706', shield: 'rgba(217, 119, 6, 0.28)' },
    wall_cyber: { main: '#0891b2', border: '#06b6d4', glow: '#22d3ee', shield: 'rgba(34, 211, 238, 0.32)' },
    wall_titanium: { main: '#475569', border: '#94a3b8', glow: '#cbd5e1', shield: 'rgba(203, 213, 225, 0.25)' },
    wall_biohazard: { main: '#65a30d', border: '#84cc16', glow: '#bef264', shield: 'rgba(190, 242, 100, 0.32)' },
};

export default function GameCanvas({
    ref,
    stats,
    onWaveEnd,
    onZombieKilled,
    onWaveProgress,
    onWallHpChange,
    onAmmoChange,
    onBossChange,
    isPaused = false,
}) {
    const canvasRef = useRef(null);
    const reloadTriggerRef = useRef(null);
    useImperativeHandle(ref, () => ({ reload: () => reloadTriggerRef.current?.() }), []);

    const statsRef = useRef(stats);
    statsRef.current = stats;

    const callbacksRef = useRef({
        onWaveEnd,
        onZombieKilled,
        onWaveProgress,
        onWallHpChange,
        onAmmoChange,
        onBossChange,
    });
    callbacksRef.current = {
        onWaveEnd,
        onZombieKilled,
        onWaveProgress,
        onWallHpChange,
        onAmmoChange,
        onBossChange,
    };

    const isPausedRef = useRef(isPaused);
    isPausedRef.current = isPaused;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const initialStats = statsRef.current;
        const maxHp = 100 + (initialStats.wallHpLevel || 1) * 25;
        const wall = {
            x: 730,
            width: 32,
            hp: maxHp,
            maxHp: maxHp,
            hitTimer: 0,
        };

        if (callbacksRef.current.onWallHpChange) {
            callbacksRef.current.onWallHpChange(wall.hp, wall.maxHp);
        }

        // Weapon Archetype Calculations
        const getWeaponParams = () => {
            const currentStats = statsRef.current;
            const weaponType = currentStats.activeWeaponType || 'pistol';
            let baseMag = 12;
            let magStep = 3;
            let baseCooldown = 280;
            let cooldownStep = 25;
            let baseDamage = 10;
            let damageStep = 4;
            let reloadSeconds = Math.max(0.6, 2.0 - ((currentStats.reloadLevel || 1) - 1) * 0.2);

            if (weaponType === 'shotgun') {
                baseMag = 6;
                magStep = 2;
                baseCooldown = 620;
                cooldownStep = 40;
                baseDamage = 8;
                damageStep = 3;
                reloadSeconds = Math.max(0.8, 2.4 - ((currentStats.reloadLevel || 1) - 1) * 0.25);
            } else if (weaponType === 'minigun') {
                baseMag = 40;
                magStep = 10;
                baseCooldown = 110;
                cooldownStep = 8;
                baseDamage = 6;
                damageStep = 2;
                reloadSeconds = Math.max(1.0, 3.0 - ((currentStats.reloadLevel || 1) - 1) * 0.3);
            }

            const maxAmmo = baseMag + ((currentStats.magazineLevel || 1) - 1) * magStep;
            const cooldown = Math.max(65, baseCooldown - ((currentStats.fireRateLevel || 1) - 1) * cooldownStep);
            const damage = baseDamage + ((currentStats.damageLevel || 1) - 1) * damageStep;

            return { weaponType, maxAmmo, cooldown, damage, reloadSeconds };
        };

        let { maxAmmo } = getWeaponParams();
        let currentAmmo = maxAmmo;
        let currentWeaponType = initialStats.activeWeaponType || 'pistol';
        let isReloading = false;
        let reloadStartTime = 0;
        let lastShotTime = 0;

        if (callbacksRef.current.onAmmoChange) {
            callbacksRef.current.onAmmoChange(currentAmmo, maxAmmo, false, 0);
        }

        let bullets = [];
        let zombies = [];
        let particles = [];
        let floatingTexts = [];
        let splatters = []; // Persistent ground decals
        let casings = []; // Ejected bullet brass casings
        let ambientMotes = []; // Atmospheric floating particles
        let waveTimer = 0;
        let isGameOver = false;
        let isMouseDown = false;
        let mousePos = { x: 320, y: 250 };
        let isMouseOverCanvas = false;

        // Turret state
        let turretRecoil = 0;
        let barrelRotation = 0;
        let muzzleFlash = 0;
        let screenShake = 0;

        const currentWave = initialStats.currentWave || 1;
        const isBossWave = currentWave % 5 === 0;
        let bossSpawned = false;

        const totalRegularZombies = 14 + currentWave * 4;
        const totalZombiesInWave = totalRegularZombies + (isBossWave ? 1 : 0);
        let regularSpawnedCount = 0;
        let killedCount = 0;

        // Seed ambient particles
        for (let i = 0; i < 25; i++) {
            ambientMotes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: -0.2 - Math.random() * 0.4,
                vy: (Math.random() - 0.5) * 0.3,
                size: 1 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.4,
            });
        }

        const getCanvasCoords = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
            };
        };

        const triggerReload = () => {
            const { maxAmmo: liveMaxAmmo, reloadSeconds } = getWeaponParams();
            if (isPausedRef.current || isGameOver || isReloading || currentAmmo === liveMaxAmmo) return;
            isReloading = true;
            reloadStartTime = performance.now();
            soundFx.reload();
            if (callbacksRef.current.onAmmoChange) {
                callbacksRef.current.onAmmoChange(currentAmmo, liveMaxAmmo, true, 0);
            }
        };
        reloadTriggerRef.current = triggerReload;

        // Spawn zombies with richer visual properties
        const spawnZombie = (type = 'walker') => {
            if (type === 'boss') {
                bossSpawned = true;
            } else {
                regularSpawnedCount++;
            }
            const baseHp = 20 + currentWave * 6;
            let hp = baseHp;
            let speed = 1.1 + Math.random() * 0.7 + Math.min(1.2, currentWave * 0.08);
            let radius = 15;
            let color = '#3d6346';
            let eyeColor = '#ef4444';
            let attackPower = 0.12 + Math.min(0.25, currentWave * 0.02);
            let reward = 10 + Math.floor(currentWave * 2.5);

            if (type === 'runner') {
                hp = Math.round(baseHp * 0.65);
                speed = 2.2 + Math.random() * 0.8 + Math.min(1.5, currentWave * 0.1);
                radius = 12;
                color = '#c25e1a';
                eyeColor = '#facc15';
                attackPower = 0.09;
                reward = Math.round(reward * 1.2);
            } else if (type === 'tank') {
                hp = Math.round(baseHp * 2.8);
                speed = 0.65 + Math.random() * 0.3;
                radius = 22;
                color = '#582b75';
                eyeColor = '#e11d48';
                attackPower = 0.35 + Math.min(0.5, currentWave * 0.05);
                reward = Math.round(reward * 2.5);
            } else if (type === 'boss') {
                hp = Math.round(baseHp * 7.5 + currentWave * 30);
                speed = 0.55;
                radius = 32;
                color = '#991b1b';
                eyeColor = '#06b6d4';
                attackPower = 0.6;
                reward = Math.round(reward * 6);
                bossSpawned = true;
                if (callbacksRef.current.onBossChange) {
                    callbacksRef.current.onBossChange(hp, hp);
                }
            }

            zombies.push({
                type,
                x: -40,
                y: 60 + Math.random() * (canvas.height - 120),
                hp,
                maxHp: hp,
                radius,
                speed,
                attackPower,
                reward,
                color,
                eyeColor,
                walkCycle: Math.random() * 10,
                hitTimer: 0,
                slashTimer: 0,
            });
        };

        // Initial wave advance
        spawnZombie('walker');
        if (callbacksRef.current.onWaveProgress) {
            callbacksRef.current.onWaveProgress(0, totalZombiesInWave);
        }

        const addSplatter = (x, y, color = '#204028', count = 3) => {
            for (let i = 0; i < count; i++) {
                splatters.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    rx: 3 + Math.random() * 9,
                    ry: 2 + Math.random() * 6,
                    rotation: Math.random() * Math.PI,
                    color: color,
                    alpha: 0.45 + Math.random() * 0.35,
                });
            }
            if (splatters.length > 80) splatters.splice(0, splatters.length - 80);
        };

        const createHitParticles = (x, y, color, count = 7) => {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.5 + Math.random() * 4.2;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: color || '#22c55e',
                    size: 2 + Math.random() * 3,
                });
            }
        };

        const addBulletCasing = (x, y) => {
            casings.push({
                x: x,
                y: y,
                vx: 1.5 + Math.random() * 2.5,
                vy: -2.5 - Math.random() * 2,
                angle: Math.random() * Math.PI * 2,
                vAngle: 0.1 + Math.random() * 0.2,
                alpha: 1,
            });
            if (casings.length > 30) casings.shift();
        };

        // Shooting logic with enhanced punch & feedback
        const shoot = (targetX, targetY) => {
            if (isPausedRef.current || isGameOver || isReloading) return;

            const { weaponType, maxAmmo: liveMaxAmmo, cooldown, damage } = getWeaponParams();

            if (currentAmmo <= 0) {
                triggerReload();
                return;
            }

            const now = performance.now();
            if (now - lastShotTime < cooldown) return;
            lastShotTime = now;

            currentAmmo -= 1;
            if (callbacksRef.current.onAmmoChange) {
                callbacksRef.current.onAmmoChange(currentAmmo, liveMaxAmmo, false, 0);
            }

            const shotColors = weaponColors(statsRef.current.weaponSkinColors);

            const startX = wall.x - 16;
            const startY = canvas.height / 2;
            const baseAngle = Math.atan2(targetY - startY, targetX - startX);

            turretRecoil = weaponType === 'shotgun' ? 7 : weaponType === 'minigun' ? 3 : 5;
            muzzleFlash = 1.0;
            barrelRotation += 0.8;
            addBulletCasing(startX + 5, startY + 4);

            if (weaponType === 'shotgun') {
                soundFx.shootShotgun();
                screenShake = Math.max(screenShake, 4.5);
                const spreadAngles = [-0.18, -0.09, 0, 0.09, 0.18];
                spreadAngles.forEach((offset) => {
                    const angle = baseAngle + offset + (Math.random() - 0.5) * 0.04;
                    bullets.push({
                        x: startX,
                        y: startY,
                        vx: Math.cos(angle) * 16,
                        vy: Math.sin(angle) * 16,
                        damage: damage,
                        radius: 3.5,
                        color: shotColors.bullet,
                        glow: shotColors.glow,
                        core: shotColors.core,
                        trail: [],
                    });
                });
            } else if (weaponType === 'minigun') {
                soundFx.shootMinigun();
                screenShake = Math.max(screenShake, 1.8);
                const jitter = (Math.random() - 0.5) * 0.07;
                bullets.push({
                    x: startX,
                    y: startY,
                    vx: Math.cos(baseAngle + jitter) * 18,
                    vy: Math.sin(baseAngle + jitter) * 18,
                    damage: damage,
                    radius: 3.8,
                    color: shotColors.bullet,
                    glow: shotColors.glow,
                    core: shotColors.core,
                    trail: [],
                });
            } else {
                soundFx.shootPistol();
                screenShake = Math.max(screenShake, 2.2);
                bullets.push({
                    x: startX,
                    y: startY,
                    vx: Math.cos(baseAngle) * 17,
                    vy: Math.sin(baseAngle) * 17,
                    damage: damage,
                    radius: 4.2,
                    color: shotColors.bullet,
                    glow: shotColors.glow,
                    core: shotColors.core,
                    trail: [],
                });
            }

            if (currentAmmo <= 0) {
                triggerReload();
            }
        };

        const handleMouseDown = (e) => {
            if (isPausedRef.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
            canvas.setPointerCapture(e.pointerId);
            isMouseDown = true;
            isMouseOverCanvas = true;
            mousePos = getCanvasCoords(e.clientX, e.clientY);
            shoot(mousePos.x, mousePos.y);
        };

        const handleMouseUp = () => {
            isMouseDown = false;
        };

        const handleMouseMove = (e) => {
            mousePos = getCanvasCoords(e.clientX, e.clientY);
            isMouseOverCanvas = true;
        };

        const handleMouseEnter = () => {
            isMouseOverCanvas = true;
        };

        const handleMouseLeave = () => {
            isMouseOverCanvas = false;
            isMouseDown = false;
        };

        const handleKeyDown = (e) => {
            if (isPausedRef.current || e.repeat || e.target.closest('button, input, textarea, a, [contenteditable="true"]')) return;
            if (e.code === 'KeyR' || e.code === 'Space') {
                e.preventDefault();
                triggerReload();
            }
        };

        canvas.addEventListener('pointerdown', handleMouseDown);
        window.addEventListener('pointerup', handleMouseUp);
        canvas.addEventListener('pointercancel', handleMouseUp);
        canvas.addEventListener('pointermove', handleMouseMove);
        canvas.addEventListener('pointerenter', handleMouseEnter);
        canvas.addEventListener('pointerleave', handleMouseLeave);
        window.addEventListener('keydown', handleKeyDown);

        // Core Render Loop
        let previousFrameTime = performance.now();
        const render = () => {
            const frameTime = performance.now();
            const selectedWeapon = statsRef.current.activeWeaponType || 'pistol';
            if (currentWeaponType !== selectedWeapon) {
                currentWeaponType = selectedWeapon;
                const selectedMaxAmmo = getWeaponParams().maxAmmo;
                currentAmmo = Math.min(currentAmmo, selectedMaxAmmo);
                isReloading = false;
                callbacksRef.current.onAmmoChange?.(currentAmmo, selectedMaxAmmo, false, 0);
            }

            if (isPausedRef.current) {
                if (isReloading) reloadStartTime += frameTime - previousFrameTime;
                previousFrameTime = frameTime;
                isMouseDown = false;
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            previousFrameTime = frameTime;
            const now = frameTime;
            const { maxAmmo: liveMaxAmmo, reloadSeconds } = getWeaponParams();

            // Handle reload
            if (isReloading) {
                const elapsedSeconds = (now - reloadStartTime) / 1000;
                const reloadProgress = Math.min(1, elapsedSeconds / reloadSeconds);
                if (callbacksRef.current.onAmmoChange) {
                    callbacksRef.current.onAmmoChange(currentAmmo, liveMaxAmmo, true, reloadProgress);
                }
                if (elapsedSeconds >= reloadSeconds) {
                    isReloading = false;
                    currentAmmo = liveMaxAmmo;
                    if (callbacksRef.current.onAmmoChange) {
                        callbacksRef.current.onAmmoChange(currentAmmo, liveMaxAmmo, false, 1);
                    }
                }
            }

            // Auto-fire while mouse held down
            if (isMouseDown && !isReloading) {
                shoot(mousePos.x, mousePos.y);
            }

            // Smooth animations decay
            turretRecoil = Math.max(0, turretRecoil - 0.35);
            muzzleFlash = Math.max(0, muzzleFlash - 0.12);
            wall.hitTimer = Math.max(0, wall.hitTimer - 0.08);
            screenShake = Math.max(0, screenShake - 0.25);

            ctx.save();
            if (screenShake > 0) {
                ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
            }

            // ==========================================
            // 0. High-Atmosphere Apocalyptic Battlefield
            // ==========================================
            // Base asphalt tone
            const groundGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
            groundGrad.addColorStop(0, '#0f1715');
            groundGrad.addColorStop(0.65, '#131e1a');
            groundGrad.addColorStop(0.9, '#182420');
            groundGrad.addColorStop(1, '#0e1513');
            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Subtle tactical defense grid
            ctx.strokeStyle = 'rgba(145, 175, 155, 0.04)';
            ctx.lineWidth = 1;
            const gridSize = 35;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Hazard warning strip ahead of the barricade
            const hazardStartX = wall.x - 36;
            ctx.save();
            ctx.fillStyle = 'rgba(233, 184, 95, 0.12)';
            ctx.fillRect(hazardStartX, 0, 36, canvas.height);
            ctx.strokeStyle = 'rgba(233, 184, 95, 0.28)';
            ctx.lineWidth = 3;
            for (let y = -20; y < canvas.height + 40; y += 18) {
                ctx.beginPath();
                ctx.moveTo(hazardStartX, y);
                ctx.lineTo(wall.x, y + 20);
                ctx.stroke();
            }
            ctx.restore();

            // Render permanent blood splatters & scorched craters
            splatters.forEach((s) => {
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation);
                ctx.fillStyle = s.color;
                ctx.globalAlpha = s.alpha;
                ctx.beginPath();
                ctx.ellipse(0, 0, s.rx, s.ry, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Ambient floating motes/dust
            ambientMotes.forEach((m) => {
                m.x += m.vx;
                m.y += m.vy;
                if (m.x < 0) m.x = canvas.width;
                if (m.y < 0) m.y = canvas.height;
                if (m.y > canvas.height) m.y = 0;
                ctx.fillStyle = `rgba(233, 184, 95, ${m.alpha * 0.4})`;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Render ejected brass casings
            for (let i = casings.length - 1; i >= 0; i--) {
                const c = casings[i];
                c.x += c.vx;
                c.y += c.vy;
                c.vy += 0.3; // gravity
                c.angle += c.vAngle;
                if (c.y > canvas.height / 2 + 35) {
                    c.vx *= 0.5;
                    c.vy = 0;
                    c.alpha -= 0.01;
                }
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.angle);
                ctx.fillStyle = `rgba(233, 184, 95, ${c.alpha})`;
                ctx.fillRect(-1.5, -3, 3, 6);
                ctx.restore();
                if (c.alpha <= 0) casings.splice(i, 1);
            }

            const wallColors = WALL_SKIN_COLORS[statsRef.current.activeWallSkin] || WALL_SKIN_COLORS.default;

            // ==========================================
            // 1. Fortified Barricade Wall & Energy Shield
            // ==========================================
            // Heavy concrete & steel bulkhead
            ctx.save();
            ctx.fillStyle = '#1b2622';
            ctx.fillRect(wall.x, 0, wall.width, canvas.height);

            // Armor plates
            ctx.fillStyle = wallColors.main;
            for (let py = 6; py < canvas.height; py += 32) {
                ctx.fillRect(wall.x + 3, py, wall.width - 6, 26);
                // Bolt rivets
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(wall.x + 5, py + 3, 2, 2);
                ctx.fillRect(wall.x + wall.width - 7, py + 3, 2, 2);
                ctx.fillRect(wall.x + 5, py + 21, 2, 2);
                ctx.fillRect(wall.x + wall.width - 7, py + 21, 2, 2);
                ctx.fillStyle = wallColors.main;
            }

            // Energy Shield Field (translucent plasma shield)
            const pulse = 0.5 + Math.sin(now * 0.006) * 0.2;
            const shieldAlpha = wall.hitTimer > 0 ? 0.75 : pulse * 0.35;
            ctx.strokeStyle = wallColors.glow;
            ctx.shadowBlur = wall.hitTimer > 0 ? 22 : 12;
            ctx.shadowColor = wallColors.glow;
            ctx.lineWidth = wall.hitTimer > 0 ? 5 : 3;
            ctx.beginPath();
            ctx.moveTo(wall.x, 0);
            ctx.lineTo(wall.x, canvas.height);
            ctx.stroke();

            // Shield glow plane
            ctx.fillStyle = wallColors.shield;
            ctx.globalAlpha = shieldAlpha;
            ctx.fillRect(wall.x - 8, 0, 10, canvas.height);
            ctx.restore();

            // Emergency Warning Beacons (Top & Bottom of Wall)
            const beaconBlink = Math.sin(now * 0.008) > 0.3;
            [12, canvas.height - 12].forEach((by) => {
                ctx.save();
                ctx.fillStyle = beaconBlink ? '#ef4444' : '#7f1d1d';
                ctx.shadowBlur = beaconBlink ? 15 : 4;
                ctx.shadowColor = '#ef4444';
                ctx.beginPath();
                ctx.arc(wall.x + wall.width / 2, by, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // ==========================================
            // 2. Heavy Defense Turret Mount & Barrels
            // ==========================================
            const turretX = wall.x - 14 - turretRecoil;
            const turretY = canvas.height / 2;
            const aimAngle = Math.atan2(mousePos.y - turretY, mousePos.x - turretX);

            ctx.save();
            // Turret Base / Heavy Swivel Mount
            ctx.fillStyle = '#1c2824';
            ctx.strokeStyle = '#394d45';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wall.x - 8, turretY, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Hydraulic brackets
            ctx.fillStyle = '#111a17';
            ctx.fillRect(wall.x - 14, turretY - 14, 8, 28);

            // Rotating Gun Core
            ctx.save();
            ctx.translate(turretX, turretY);
            ctx.rotate(aimAngle);

            const wepColors = weaponColors(statsRef.current.weaponSkinColors);

            if (currentWeaponType === 'minigun') {
                // 6-barrel rotary minigun
                ctx.fillStyle = '#26342f';
                ctx.fillRect(-6, -8, 12, 16);
                ctx.fillStyle = '#0f1714';
                ctx.fillRect(6, -6, 26, 12);

                // Barrels
                ctx.fillStyle = wepColors.bullet;
                ctx.shadowBlur = 6;
                ctx.shadowColor = wepColors.glow;
                ctx.fillRect(8, -5 + Math.sin(barrelRotation) * 2, 24, 3);
                ctx.fillRect(8, 2 + Math.cos(barrelRotation) * 2, 24, 3);
            } else if (currentWeaponType === 'shotgun') {
                // Dual heavy kinetic breach barrels
                ctx.fillStyle = '#232e29';
                ctx.fillRect(-8, -10, 16, 20);
                ctx.fillStyle = '#121a17';
                ctx.fillRect(8, -7, 24, 6);
                ctx.fillRect(8, 1, 24, 6);
                // Heat shroud
                ctx.strokeStyle = wepColors.glow;
                ctx.lineWidth = 1;
                ctx.strokeRect(10, -8, 18, 16);
            } else {
                // High-precision plasma carbine
                ctx.fillStyle = '#22302a';
                ctx.fillRect(-6, -7, 14, 14);
                ctx.fillStyle = '#121c18';
                ctx.fillRect(8, -4, 28, 8);
                // Plasma rail glow line
                ctx.strokeStyle = wepColors.bullet;
                ctx.shadowBlur = 8;
                ctx.shadowColor = wepColors.glow;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(34, 0);
                ctx.stroke();
            }

            // Dynamic Muzzle Flash Starburst
            if (muzzleFlash > 0) {
                ctx.save();
                ctx.globalAlpha = muzzleFlash;
                ctx.fillStyle = wepColors.core;
                ctx.shadowBlur = 24;
                ctx.shadowColor = wepColors.glow;
                ctx.beginPath();
                ctx.arc(36, 0, 9 * muzzleFlash, 0, Math.PI * 2);
                ctx.fill();

                // Cross spikes
                ctx.strokeStyle = wepColors.bullet;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(25, 0);
                ctx.lineTo(55 * muzzleFlash, 0);
                ctx.moveTo(36, -14 * muzzleFlash);
                ctx.lineTo(36, 14 * muzzleFlash);
                ctx.stroke();
                ctx.restore();
            }

            ctx.restore(); // end rotating gun
            ctx.restore(); // end turret mount

            // ==========================================
            // 3. Tactical Laser Sight & Precision Reticle
            // ==========================================
            if (isMouseOverCanvas && !isReloading) {
                ctx.save();
                // Laser beam
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.28)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.moveTo(turretX, turretY);
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.stroke();

                // High-Tech Crosshair Reticle
                ctx.setLineDash([]);
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#06b6d4';
                ctx.lineWidth = 1.5;

                // Center dot
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.arc(mousePos.x, mousePos.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Outer targeting brackets
                const r = 12;
                ctx.beginPath();
                // Top-left
                ctx.moveTo(mousePos.x - r, mousePos.y - 4);
                ctx.lineTo(mousePos.x - r, mousePos.y - r);
                ctx.lineTo(mousePos.x - 4, mousePos.y - r);
                // Top-right
                ctx.moveTo(mousePos.x + 4, mousePos.y - r);
                ctx.lineTo(mousePos.x + r, mousePos.y - r);
                ctx.lineTo(mousePos.x + r, mousePos.y - 4);
                // Bottom-right
                ctx.moveTo(mousePos.x + r, mousePos.y + 4);
                ctx.lineTo(mousePos.x + r, mousePos.y + r);
                ctx.lineTo(mousePos.x + 4, mousePos.y + r);
                // Bottom-left
                ctx.moveTo(mousePos.x - 4, mousePos.y + r);
                ctx.lineTo(mousePos.x - r, mousePos.y + r);
                ctx.lineTo(mousePos.x - r, mousePos.y + 4);
                ctx.stroke();

                ctx.restore();
            }

            // ==========================================
            // 4. Bullets Update & High-Energy Rendering
            // ==========================================
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx;
                b.y += b.vy;

                // Bullet tracer core & outer plasma aura
                ctx.save();
                ctx.shadowBlur = 12;
                ctx.shadowColor = b.glow;
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fill();

                // High-intensity white core
                ctx.fillStyle = b.core;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
                ctx.fill();

                // Bullet tracer tail
                const tailLen = 14;
                const angle = Math.atan2(b.vy, b.vx);
                ctx.strokeStyle = b.glow;
                ctx.lineWidth = b.radius * 1.5;
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x - Math.cos(angle) * tailLen, b.y - Math.sin(angle) * tailLen);
                ctx.stroke();
                ctx.restore();

                let bulletHit = false;
                for (let j = zombies.length - 1; j >= 0; j--) {
                    const z = zombies[j];
                    if (Math.hypot(z.x - b.x, z.y - b.y) < z.radius + b.radius) {
                        z.hp -= b.damage;
                        z.hitTimer = 0.8;
                        bulletHit = true;
                        soundFx.hitZombie();
                        createHitParticles(b.x, b.y, b.glow, 6);

                        if (z.type === 'boss' && callbacksRef.current.onBossChange) {
                            callbacksRef.current.onBossChange(Math.max(0, z.hp), z.maxHp);
                        }

                        if (z.hp <= 0) {
                            killedCount++;
                            soundFx.zombieKilled();
                            createHitParticles(z.x, z.y, z.color, 16);
                            addSplatter(z.x, z.y, z.type === 'tank' ? '#3d164d' : '#1d3824', 4);
                            floatingTexts.push({
                                text: `+${z.reward}g`,
                                x: z.x,
                                y: z.y,
                                alpha: 1,
                            });
                            if (callbacksRef.current.onZombieKilled) {
                                callbacksRef.current.onZombieKilled(z.reward);
                            }
                            if (callbacksRef.current.onWaveProgress) {
                                callbacksRef.current.onWaveProgress(killedCount, totalZombiesInWave);
                            }
                            zombies.splice(j, 1);
                            if (z.type === 'boss' && callbacksRef.current.onBossChange) {
                                callbacksRef.current.onBossChange(0, z.maxHp);
                            }
                        }
                        break;
                    }
                }

                if (bulletHit || b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
                    bullets.splice(i, 1);
                }
            }

            // ==========================================
            // 5. Distinct Mutant Zombies (Animated & Shambling)
            // ==========================================
            for (let zIndex = zombies.length - 1; zIndex >= 0; zIndex--) {
                const z = zombies[zIndex];
                z.walkCycle += 0.14;
                if (z.hitTimer > 0) z.hitTimer -= 0.1;

                if (z.x < wall.x - z.radius - 2) {
                    z.x += z.speed;
                } else {
                    // Attacking the wall
                    wall.hp -= z.attackPower;
                    wall.hitTimer = 1.0;
                    z.slashTimer += 0.2;
                    if (callbacksRef.current.onWallHpChange) {
                        callbacksRef.current.onWallHpChange(Math.max(0, wall.hp), wall.maxHp);
                    }
                    if (Math.random() < 0.25) {
                        createHitParticles(wall.x, z.y, wallColors.glow, 4);
                    }
                }

                ctx.save();
                const bobY = Math.sin(z.walkCycle) * 2;
                ctx.translate(z.x, z.y + bobY);

                // Hit flash white effect
                const isHit = z.hitTimer > 0;

                if (z.type === 'tank') {
                    // ================= TANK BRUTE =================
                    ctx.shadowBlur = isHit ? 18 : 10;
                    ctx.shadowColor = isHit ? '#ffffff' : '#7e22ce';

                    // Muscular jagged silhouette
                    ctx.fillStyle = isHit ? '#ffffff' : '#3c184e';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, z.radius * 1.15, z.radius * 0.9, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Heavy armored shoulder plates
                    ctx.fillStyle = isHit ? '#ffffff' : '#581c87';
                    ctx.beginPath();
                    ctx.arc(-z.radius * 0.3, -z.radius * 0.7, 7, 0, Math.PI * 2);
                    ctx.arc(-z.radius * 0.3, z.radius * 0.7, 7, 0, Math.PI * 2);
                    ctx.fill();

                    // Reaching forward spiked arms
                    const armReach = Math.sin(z.walkCycle * 1.5) * 6;
                    ctx.fillStyle = isHit ? '#ffffff' : '#4c1d95';
                    ctx.fillRect(z.radius * 0.4, -z.radius * 0.6 + armReach, 14, 6);
                    ctx.fillRect(z.radius * 0.4, z.radius * 0.3 - armReach, 14, 6);

                    // Glowing Crimson Eyes
                    ctx.fillStyle = isHit ? '#ffffff' : z.eyeColor;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = z.eyeColor;
                    ctx.beginPath();
                    ctx.arc(z.radius * 0.6, -4, 3, 0, Math.PI * 2);
                    ctx.arc(z.radius * 0.6, 4, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (z.type === 'boss') {
                    // ================= BOSS MUTANT TITAN =================
                    ctx.shadowBlur = 24;
                    ctx.shadowColor = isHit ? '#ffffff' : '#dc2626';

                    // Colossal cybernetic chassis
                    ctx.fillStyle = isHit ? '#ffffff' : '#7f1d1d';
                    ctx.beginPath();
                    ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Outer energy pulse ring
                    const ringPulse = (now * 0.004) % 1;
                    ctx.strokeStyle = `rgba(220, 38, 38, ${1 - ringPulse})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, z.radius + ringPulse * 18, 0, Math.PI * 2);
                    ctx.stroke();

                    // Glowing optic array (cyber visor)
                    ctx.fillStyle = '#38bdf8';
                    ctx.shadowBlur = 14;
                    ctx.shadowColor = '#06b6d4';
                    ctx.fillRect(z.radius * 0.3, -6, 8, 12);

                    // Pounding robotic arm
                    ctx.fillStyle = '#334155';
                    ctx.fillRect(z.radius * 0.2, -z.radius * 0.7, 18, 9);
                    ctx.fillRect(z.radius * 0.2, z.radius * 0.2, 18, 9);
                } else if (z.type === 'runner') {
                    // ================= RUNNER GHOUL =================
                    ctx.shadowBlur = isHit ? 14 : 7;
                    ctx.shadowColor = isHit ? '#ffffff' : '#ea580c';

                    // Sleek, agile hunched silhouette
                    ctx.fillStyle = isHit ? '#ffffff' : '#9a3412';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, z.radius * 1.2, z.radius * 0.75, Math.PI * 0.1, 0, Math.PI * 2);
                    ctx.fill();

                    // Rapid claw strides
                    const legLunge = Math.sin(z.walkCycle * 2.2) * 8;
                    ctx.fillStyle = isHit ? '#ffffff' : '#c2410c';
                    ctx.fillRect(z.radius * 0.3, -z.radius * 0.5 + legLunge, 12, 4);
                    ctx.fillRect(z.radius * 0.3, z.radius * 0.2 - legLunge, 12, 4);

                    // Amber Glowing Eyes
                    ctx.fillStyle = z.eyeColor;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = '#facc15';
                    ctx.beginPath();
                    ctx.arc(z.radius * 0.7, -2, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // ================= WALKER (CLASSIC MUTANT) =================
                    ctx.shadowBlur = isHit ? 12 : 6;
                    ctx.shadowColor = isHit ? '#ffffff' : '#166534';

                    // Rotting flesh body
                    ctx.fillStyle = isHit ? '#ffffff' : '#274a33';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, z.radius, z.radius * 0.9, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Ragged necrotic shoulders & arms reaching forward
                    const armSway = Math.sin(z.walkCycle) * 5;
                    ctx.fillStyle = isHit ? '#ffffff' : '#1e3d29';
                    ctx.fillRect(z.radius * 0.2, -z.radius * 0.6 + armSway, 10, 4);
                    ctx.fillRect(z.radius * 0.2, z.radius * 0.3 - armSway, 10, 4);

                    // Demonic Red Glowing Eyes
                    ctx.fillStyle = isHit ? '#ffffff' : z.eyeColor;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = '#ef4444';
                    ctx.beginPath();
                    ctx.arc(z.radius * 0.5, -3, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore(); // end zombie local transform

                // Tactical Mutant Health Bar
                const hpPercent = Math.max(0, z.hp / z.maxHp);
                const barWidth = z.radius * 2.2 + 4;
                const barHeight = z.type === 'boss' ? 5 : 3.5;
                const barY = z.y - z.radius - 9;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                ctx.fillRect(z.x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
                ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
                ctx.fillRect(z.x - barWidth / 2, barY, barWidth * hpPercent, barHeight);
            }

            // ==========================================
            // 6. Visceral Hit Particles & Sparks
            // ==========================================
            for (let pIndex = particles.length - 1; pIndex >= 0; pIndex--) {
                const p = particles[pIndex];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.035;
                p.size *= 0.96;

                ctx.save();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                if (p.alpha <= 0) particles.splice(pIndex, 1);
            }

            // ==========================================
            // 7. Tactical Floating Gold Trophies
            // ==========================================
            for (let t = floatingTexts.length - 1; t >= 0; t--) {
                const ft = floatingTexts[t];
                ft.y -= 0.75;
                ft.alpha -= 0.02;

                ctx.save();
                ctx.fillStyle = `rgba(233, 184, 95, ${Math.max(0, ft.alpha)})`;
                ctx.font = 'bold 13px "Oswald", monospace';
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#e9b85f';
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();

                if (ft.alpha <= 0) floatingTexts.splice(t, 1);
            }

            ctx.restore(); // end screen shake

            // Wave progress and spawning
            waveTimer++;
            const spawnInterval = Math.max(26, 65 - currentWave * 3);

            if (waveTimer % spawnInterval === 0 && regularSpawnedCount < totalRegularZombies) {
                const rand = Math.random();
                if (rand < 0.25 && currentWave >= 2) {
                    spawnZombie('runner');
                } else if (rand < 0.45 && currentWave >= 3) {
                    spawnZombie('tank');
                } else {
                    spawnZombie('walker');
                }
            }

            if (isBossWave && !bossSpawned && waveTimer > 180) {
                spawnZombie('boss');
            }

            const allSpawned = regularSpawnedCount >= totalRegularZombies && (!isBossWave || bossSpawned);

            // Wave End Conditions
            if (wall.hp <= 0 && !isGameOver) {
                isGameOver = true;
                soundFx.defeat();
                if (callbacksRef.current.onWaveEnd) {
                    callbacksRef.current.onWaveEnd({ victory: false });
                }
            } else if (allSpawned && zombies.length === 0 && !isGameOver) {
                isGameOver = true;
                soundFx.victory();
                if (callbacksRef.current.onWaveProgress) {
                    callbacksRef.current.onWaveProgress(totalZombiesInWave, totalZombiesInWave);
                }
                if (callbacksRef.current.onWaveEnd) {
                    callbacksRef.current.onWaveEnd({ victory: true });
                }
            }

            if (!isGameOver) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('pointerdown', handleMouseDown);
            window.removeEventListener('pointerup', handleMouseUp);
            canvas.removeEventListener('pointercancel', handleMouseUp);
            canvas.removeEventListener('pointermove', handleMouseMove);
            canvas.removeEventListener('pointerenter', handleMouseEnter);
            canvas.removeEventListener('pointerleave', handleMouseLeave);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="game-canvas-frame">
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="game-canvas"
            />
        </div>
    );
}
