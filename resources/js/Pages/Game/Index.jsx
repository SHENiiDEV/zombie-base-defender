import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Coins,
    Crosshair,
    Gem,
    Pause,
    Play,
    Radio,
    RotateCcw,
    Shield,
    ShieldCheck,
    Skull,
    Swords,
    Volume2,
    VolumeX,
    Wrench,
    Zap,
} from 'lucide-react';
import PlayerShell from '../../Components/PlayerShell';
import GameCanvas from '../../Components/GameCanvas';
import EquipmentArt from '../../Components/EquipmentArt';
import { setSoundMuted, isSoundMuted } from '../../Utils/soundFx';
import { WEAPONS, weaponStats } from '../../Utils/equipment';

export default function GameIndex({
    player,
    weapons = {},
    catalog = { weapon: [] },
    unlock_costs = { pistol: 0, shotgun: 600, minigun: 1500 },
}) {
    const { navigation = {} } = usePage().props || {};
    const [currentWave, setCurrentWave] = useState(player?.max_wave || 1);
    const [goldEarnedThisWave, setGoldEarnedThisWave] = useState(0);
    const [wallHp, setWallHp] = useState(100 + (player?.wall_hp_level || 1) * 25);
    const [maxWallHp, setMaxWallHp] = useState(100 + (player?.wall_hp_level || 1) * 25);
    const [ammo, setAmmo] = useState({ current: 12, max: 12, isReloading: false, progress: 0 });
    const [bossHp, setBossHp] = useState({ current: 0, max: 0 });
    const [waveProgress, setWaveProgress] = useState({
        killed: 0,
        total: 14 + (player?.max_wave || 1) * 4 + ((player?.max_wave || 1) % 5 === 0 ? 1 : 0),
    });
    const [waveStatus, setWaveStatus] = useState('ready'); // 'ready' | 'playing' | 'victory' | 'defeat'
    const [isPaused, setIsPaused] = useState(false);
    const [muted, setMuted] = useState(isSoundMuted());
    const [gameKey, setGameKey] = useState(0);
    const canvasActionRef = useRef(null);

    const activeWeaponType = player?.active_weapon_type || 'pistol';

    const handleToggleMute = () => {
        const next = !muted;
        setMuted(next);
        setSoundMuted(next);
    };

    const handleZombieKilled = (reward) => {
        setGoldEarnedThisWave((prev) => prev + reward);
    };

    const handleWaveEnd = ({ victory }) => {
        setWaveStatus(victory ? 'victory' : 'defeat');

        router.post(
            '/game/sync-wave',
            {
                gold_earned: goldEarnedThisWave,
                wave_cleared: victory,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    if (victory) {
                        setCurrentWave((w) => w + 1);
                    }
                },
            }
        );
    };

    const handleStartWave = () => {
        setWaveStatus('playing');
        setIsPaused(false);
    };

    const handleContinueWave = () => {
        setGoldEarnedThisWave(0);
        setWaveStatus('ready');
        setIsPaused(false);
        setBossHp({ current: 0, max: 0 });
        setGameKey((k) => k + 1);
    };

    const handleSwitchWeapon = (type) => {
        if (!weapons[type]) {
            router.post('/game/unlock-weapon', { weapon_type: type }, { preserveScroll: true });
        } else {
            router.post('/game/switch-weapon', { weapon_type: type }, { preserveScroll: true });
        }
    };

    const wallHpPercent = Math.max(0, Math.min(100, (wallHp / maxWallHp) * 100));
    const isBossWave = currentWave % 5 === 0;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.closest('button, input, textarea, a')) return;

            if (e.key === '1') handleSwitchWeapon('pistol');
            if (e.key === '2' && weapons['shotgun']) handleSwitchWeapon('shotgun');
            if (e.key === '3' && weapons['minigun']) handleSwitchWeapon('minigun');
            if (e.key === 'p' || e.key === 'P') {
                if (waveStatus === 'playing') {
                    setIsPaused((p) => !p);
                }
            }
            if ((e.key === 'Enter' || e.key === ' ') && waveStatus === 'ready') {
                e.preventDefault();
                handleStartWave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [weapons, waveStatus]);

    const activeStats = weaponStats(activeWeaponType, weapons[activeWeaponType]);

    return (
        <PlayerShell player={player} active="game">
            <Head title={`Defense Sector 09 - Wave ${currentWave}`} />

            {/* Arena Top Heading & Controls */}
            <div className="player-page-heading arena-heading">
                <div>
                    <span className="section-kicker">THEATER OF OPERATIONS // SECTOR 09</span>
                    <h1>Perimeter Defense.</h1>
                    <p>Hold the fortified line against endless waves of mutated undead. Calibrate aim, maintain ammo reserves, and protect base generators.</p>
                </div>

                <div className="arena-controls">
                    <button
                        type="button"
                        className="icon-button"
                        onClick={handleToggleMute}
                        title={muted ? 'Unmute Audio' : 'Mute Audio'}
                        aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <button
                        type="button"
                        className="landing-button pause-button"
                        onClick={() => waveStatus === 'playing' && setIsPaused(!isPaused)}
                        disabled={waveStatus !== 'playing'}
                    >
                        {isPaused ? <Play size={16} /> : <Pause size={16} />}
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        <kbd>P</kbd>
                    </button>
                </div>
            </div>

            {/* Arena Layout: 2-Column Battle Command */}
            <div className="arena-layout">
                {/* Left: Main Battle Panel */}
                <div className="battle-panel">
                    {/* Header Bar */}
                    <div className="battle-panel-header">
                        <span>
                            <i className="live-dot" />
                            SECTOR 09 // WAVE {currentWave} {isBossWave ? '⚡ APEX MUTANT INCOMING' : 'ACTIVE ASSAULT'}
                        </span>
                        <span className="wave-hostiles-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#e9b85f', background: 'rgba(233, 184, 95, 0.1)', padding: '2px 8px', borderRadius: '2px', border: '1px solid rgba(233, 184, 95, 0.25)' }}>
                            <Crosshair size={12} />
                            HOSTILES: <b>{Math.max(0, waveProgress.total - waveProgress.killed)}</b> / {waveProgress.total}
                        </span>
                    </div>

                    {/* Barricade Health Gauge */}
                    <div className="arena-health">
                        <div>
                            <span>
                                <Shield size={14} /> BARRICADE INTEGRITY
                            </span>
                            <strong>
                                {Math.round(wallHp)} <small>/ {maxWallHp} HP ({Math.round(wallHpPercent)}%)</small>
                            </strong>
                        </div>
                        <div className={`health-track ${wallHpPercent < 30 ? 'critical' : ''}`}>
                            <span style={{ width: `${wallHpPercent}%` }} />
                        </div>
                    </div>

                    {/* Boss Health Bar if Active */}
                    {bossHp.max > 0 && bossHp.current > 0 && (
                        <div className="boss-health">
                            <span>
                                <Skull size={14} /> APEX MUTANT TITAN
                                <strong>{bossHp.current} / {bossHp.max} HP</strong>
                            </span>
                            <div className="health-track critical">
                                <span style={{ width: `${Math.max(0, (bossHp.current / bossHp.max) * 100)}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Canvas Stage Frame */}
                    <div className="arena-canvas-stage">
                        <GameCanvas
                            key={gameKey}
                            ref={canvasActionRef}
                            stats={{
                                currentWave,
                                wallHpLevel: player?.wall_hp_level || 1,
                                activeWeaponType,
                                weaponSkinColors: catalog.weapon.find(skin => skin.id === (weapons[activeWeaponType]?.active_skin ?? player?.active_weapon_skin ?? 'default')),
                                activeWallSkin: player?.active_wall_skin || 'default',
                                damageLevel: weapons[activeWeaponType]?.level_damage || 1,
                                fireRateLevel: weapons[activeWeaponType]?.level_fire_rate || 1,
                                magazineLevel: weapons[activeWeaponType]?.level_magazine || 1,
                                reloadLevel: weapons[activeWeaponType]?.level_reload || 1,
                            }}
                            onWaveEnd={handleWaveEnd}
                            onZombieKilled={handleZombieKilled}
                            onWaveProgress={(killed, total) => {
                                setWaveProgress({ killed, total });
                            }}
                            onWallHpChange={(hp, max) => {
                                setWallHp(hp);
                                setMaxWallHp(max);
                            }}
                            onAmmoChange={(cur, max, reloading, prog) => {
                                setAmmo({ current: cur, max, isReloading: reloading, progress: prog });
                            }}
                            onBossChange={(cur, max) => {
                                setBossHp({ current: cur, max });
                            }}
                            isPaused={isPaused || waveStatus !== 'playing'}
                        />

                        {/* START WAVE / MISSION BRIEFING OVERLAY */}
                        {waveStatus === 'ready' && (
                            <div className="arena-overlay arena-ready">
                                <div className="ready-insignia">
                                    <Crosshair size={34} />
                                </div>
                                <span className="section-kicker">SECTOR 09 OUTPOST // READY PROTOCOL</span>
                                <h2>COMMENCE WAVE {currentWave}</h2>
                                <p>
                                    Hostile mutant horde approaching the fortified perimeter.
                                    {isBossWave ? ' WARNING: Apex behemoth detected in swarm signatures!' : ' Repel invaders before barricade collapses.'}
                                </p>
                                <button
                                    type="button"
                                    className="landing-button primary"
                                    onClick={handleStartWave}
                                >
                                    <Crosshair size={18} /> COMMENCE DEFENSE <ArrowUpRight size={18} />
                                </button>
                                <small>Press [ENTER] or [SPACE] to engage hostile targets</small>
                            </div>
                        )}

                        {/* PAUSE SCREEN OVERLAY */}
                        {isPaused && waveStatus === 'playing' && (
                            <div className="arena-overlay arena-paused">
                                <Radio size={36} style={{ color: 'var(--land-accent)', marginBottom: '18px' }} />
                                <span className="section-kicker">TACTICAL SATELLITE OVERWATCH</span>
                                <h2>DEFENSE PAUSED</h2>
                                <p>
                                    Simulation telemetry suspended. Targets holding positions.<br />
                                    Use weapon hotkeys [1-3] or calibrate aiming reticle.
                                </p>
                                <div className="result-actions">
                                    <button
                                        type="button"
                                        className="landing-button primary"
                                        onClick={() => setIsPaused(false)}
                                    >
                                        <Play size={18} /> RESUME SIMULATION <ArrowUpRight size={18} />
                                    </button>
                                    <Link href={navigation.upgrades || '/upgrades'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Wrench size={14} /> Visit Workshop
                                    </Link>
                                </div>
                                <small>Press [P] to quickly unpause</small>
                            </div>
                        )}

                        {/* VICTORY OVERLAY */}
                        {waveStatus === 'victory' && (
                            <div className="arena-overlay arena-victory">
                                <ShieldCheck size={40} style={{ color: 'var(--land-accent)', marginBottom: '18px' }} />
                                <span className="section-kicker">PERIMETER HELD // WAVE SECURED</span>
                                <h2>VICTORY ACHIEVED!</h2>
                                <p>All mutant biomass eliminated in Sector 09. Outpost fortified and ready for next offensive.</p>

                                <div className="wave-reward">
                                    <Coins size={22} /> +{goldEarnedThisWave} GOLD COLLECTED
                                </div>

                                <div className="result-actions">
                                    <button
                                        type="button"
                                        className="landing-button primary"
                                        onClick={handleContinueWave}
                                    >
                                        <ArrowRight size={18} /> NEXT WAVE →
                                    </button>
                                    <Link href={navigation.upgrades || '/upgrades'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Wrench size={15} /> Upgrade Arsenal
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* DEFEAT OVERLAY */}
                        {waveStatus === 'defeat' && (
                            <div className="arena-overlay arena-defeat">
                                <Skull size={40} style={{ color: '#ef4444', marginBottom: '18px' }} />
                                <span className="section-kicker" style={{ color: '#ef4444' }}>
                                    PERIMETER BREACHED // DEFENSES COLLAPSED
                                </span>
                                <h2>DEFENSE FAILED</h2>
                                <p>The mutant horde broke through the barricade. Reinforce defense caliber and try again.</p>

                                <div className="result-actions">
                                    <button
                                        type="button"
                                        className="landing-button primary"
                                        onClick={handleContinueWave}
                                    >
                                        <RotateCcw size={18} /> RETRY WAVE {currentWave}
                                    </button>
                                    <Link href={navigation.upgrades || '/upgrades'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Wrench size={15} /> Reinforce In Workshop
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Arena Ammo & Reload Gauge */}
                    <div className="arena-ammo">
                        <button
                            type="button"
                            onClick={() => canvasActionRef.current?.reload()}
                            disabled={ammo.isReloading || ammo.current === ammo.max}
                            title="Press [R] or [Space] to reload"
                        >
                            <span>MAGAZINE</span>
                            <strong>
                                {ammo.isReloading ? (
                                    <>RELOADING… <small>{Math.round(ammo.progress * 100)}%</small></>
                                ) : (
                                    <>{ammo.current} <small>/ {ammo.max}</small></>
                                )}
                            </strong>
                            <kbd>R</kbd>
                        </button>

                        <div className="ammo-rounds" aria-hidden="true">
                            {Array.from({ length: Math.min(30, ammo.max) }).map((_, i) => (
                                <i
                                    key={i}
                                    className={i < (ammo.current / ammo.max) * Math.min(30, ammo.max) ? 'filled' : ''}
                                />
                            ))}
                        </div>

                        <div className="wave-loot">
                            <Coins size={18} /> +{goldEarnedThisWave} <small>wave gold</small>
                        </div>
                    </div>

                    {/* Weapon Dock Bar */}
                    <div className="weapon-dock">
                        {Object.entries(WEAPONS).map(([type, info], index) => {
                            const isOwned = Boolean(weapons[type]);
                            const isEquipped = activeWeaponType === type;
                            const stats = weaponStats(type, weapons[type]);

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    className={isEquipped ? 'active' : ''}
                                    onClick={() => handleSwitchWeapon(type)}
                                >
                                    <kbd>{index + 1}</kbd>
                                    <span>
                                        <strong>{info.name}</strong>
                                        <small>
                                            {isEquipped
                                                ? `EQUIPPED · ${stats.damage} DMG`
                                                : isOwned
                                                ? `READY · ${stats.damage} DMG`
                                                : `UNLOCK · ${unlock_costs[type]}g`}
                                        </small>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Tactical Sidebar */}
                <div className="arena-sidebar">
                    {/* Mission Intel Card */}
                    <div className="mission-card">
                        <span className="section-kicker">MISSION PROTOCOL</span>
                        <h2>Sector 09</h2>
                        <p>Neutralize the encroaching bio-swarm and safeguard the barricade barrier at all costs.</p>

                        <div className="mission-detail">
                            <Zap size={16} />
                            <div>
                                <span>KINETIC IMPACT</span>
                                <strong>{activeStats.damage} Damage / Shot</strong>
                            </div>
                        </div>

                        <div className="mission-detail">
                            <Shield size={16} />
                            <div>
                                <span>BARRIER REINFORCEMENT</span>
                                <strong>{maxWallHp} Total Structure HP</strong>
                            </div>
                        </div>

                        <div className="mission-warning">
                            <Skull size={16} />
                            <span>Boss mutations spawn on waves divisible by 5.</span>
                        </div>
                    </div>

                    {/* Active Loadout Preview */}
                    <div className="active-loadout">
                        <span className="section-kicker">DEPLOYED ARSENAL</span>
                        <div className="loadout-art">
                            <EquipmentArt type={activeWeaponType} />
                        </div>
                        <h3>{WEAPONS[activeWeaponType]?.name || 'Pistol'}</h3>

                        <div>
                            <div>
                                <span>CADENCE</span>
                                <strong>{activeStats.fire_rate} RPM</strong>
                            </div>
                            <div>
                                <span>MAG CAPACITY</span>
                                <strong>{ammo.max} Rounds</strong>
                            </div>
                        </div>

                        <Link href={navigation.arsenal || '/arsenal'}>
                            Customize Loadout <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {/* Tactical Controls Cheatsheet */}
                    <div className="arena-instructions">
                        <span><kbd>Left Click / Hold</kbd> Fire</span>
                        <span><kbd>R</kbd> / <kbd>Space</kbd> Reload</span>
                        <span><kbd>1 - 3</kbd> Switch Weapon</span>
                        <span><kbd>P</kbd> Pause</span>
                    </div>
                </div>
            </div>
        </PlayerShell>
    );
}
