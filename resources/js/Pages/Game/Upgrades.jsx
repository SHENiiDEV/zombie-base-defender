import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Check, Coins, Crosshair, Layers, LockKeyhole, RotateCw, Shield, Wrench, Zap } from 'lucide-react';
import PlayerShell from '../../Components/PlayerShell';
import EquipmentArt from '../../Components/EquipmentArt';
import { WEAPONS, weaponStats } from '../../Utils/equipment';
import useEquipmentAction from '../../Utils/useEquipmentAction';

const UPGRADES = [
    { key: 'damage', name: 'Damage', description: 'Every shot hits harder.', unit: 'pts', icon: Crosshair },
    { key: 'fire_rate', name: 'Fire Rate', description: 'Shorter interval between shots.', unit: 'rpm', icon: Zap },
    { key: 'magazine', name: 'Magazine', description: 'More rounds before reloading.', unit: 'rounds', icon: Layers },
    { key: 'reload', name: 'Reload Speed', description: 'Return to combat faster.', unit: 'sec', icon: RotateCw },
];

export default function Upgrades({ player, weapons }) {
    const { navigation } = usePage().props;
    const [selected, setSelected] = useState(player.active_weapon_type || 'pistol');
    const { pending, message, perform } = useEquipmentAction();
    const weapon = weapons[selected];
    const current = weaponStats(selected, weapon);
    const wallLevel = player.wall_hp_level || 1;

    return (
        <PlayerShell player={player} active="upgrades">
            <Head title="Workshop — Weapon Upgrades" />
            <section className="player-page-heading"><div><span className="section-kicker">ENGINEERING BLOCK / WORKSHOP</span><h1>Another Chance to Hold the Line.</h1><p>Turn battlefield bounties into raw firepower. The next wave won't get any easier.</p></div><div className="workshop-wallet"><Coins size={22} /><span>Available for upgrades<strong>{player.gold.toLocaleString('en-US')} <small>gold</small></strong></span></div></section>
            {message && <p className={`action-message ${message.type}`} role="status">{message.type === 'success' && <Check size={17} />}{message.text}</p>}
            <div className="workshop-layout">
                <aside className="workshop-selector"><span className="section-kicker">CHOOSE WEAPON</span>{Object.entries(WEAPONS).map(([type, info]) => <button key={type} aria-pressed={selected === type} className={selected === type ? 'active' : ''} onClick={() => setSelected(type)}><Crosshair size={19} /><span>{info.name}<small>{weapons[type] ? type === player.active_weapon_type ? 'Equipped' : 'In Arsenal' : 'Locked'}</small></span>{!weapons[type] ? <LockKeyhole size={14} /> : <ArrowRight size={14} />}</button>)}<div className="workshop-tip"><Wrench size={23} /><p>Upgrades are permanent.</p><small>Next level cost scales with weapon stats.</small></div></aside>
                <section className="weapon-workbench"><div className="workbench-preview"><div><span className="section-kicker">{WEAPONS[selected].code} / MODIFICATION</span><h2>{WEAPONS[selected].name}</h2><p>{WEAPONS[selected].description}</p></div><div className={`workbench-art weapon-${selected}`}><EquipmentArt type={selected} /></div></div>
                    {!weapon ? <div className="locked-upgrades"><LockKeyhole size={30} /><h3>Visit Arsenal First.</h3><p>Unlock {WEAPONS[selected].name.toLowerCase()} to upgrade its combat stats.</p><Link href={navigation.arsenal} className="equipment-button">Open Arsenal <ArrowUpRight size={17} /></Link></div> : <div className="upgrade-list">{UPGRADES.map(({ key, name, description, unit, icon: Icon }) => {
                        const level = weapon[`level_${key}`];
                        const cost = level * 150;
                        const next = weaponStats(selected, { ...weapon, [`level_${key}`]: level + 1 })[key];
                        const atLimit = next === current[key];
                        return <article className="upgrade-row" key={key}><span className="upgrade-icon"><Icon size={21} /></span><div className="upgrade-description"><h3>{name}<small>LVL {level}</small></h3><p>{description}</p><div className="upgrade-values"><span>{current[key]}</span><ArrowRight size={13} /><strong>{next}</strong><small>{unit}</small></div></div><button className="upgrade-buy" disabled={Boolean(pending) || player.gold < cost || atLimit} onClick={() => perform(`${selected}-${key}`, '/game/upgrade-weapon', { weapon_type: selected, stat: key }, `${name}: upgraded to level ${level + 1}.`)}><span>{pending === `${selected}-${key}` ? 'Upgrading…' : atLimit ? 'Max' : player.gold < cost ? 'Not enough gold' : 'Upgrade'}</span><strong><Coins size={14} />{cost.toLocaleString('en-US')}</strong></button></article>;
                    })}</div>}
                </section>
            </div>
            <section className="wall-workshop"><div className="wall-art"><EquipmentArt barrier /></div><div className="wall-upgrade-content"><span className="section-kicker">YOUR LAST DEFENSE LINE</span><h2>Reinforce Barricade.</h2><p>An extra 25 hit points can turn the tide of an overrun perimeter.</p><div className="wall-upgrade-values"><Shield size={20} /><span>{100 + wallLevel * 25} HP</span><ArrowRight size={17} /><strong>{100 + (wallLevel + 1) * 25} HP</strong><small>Level {wallLevel} → {wallLevel + 1}</small></div></div><button className="upgrade-buy" disabled={Boolean(pending) || player.gold < wallLevel * 150} onClick={() => perform('wall', '/game/upgrade-wall', {}, `Barricade reinforced to level ${wallLevel + 1}.`)}><span>{pending === 'wall' ? 'Upgrading…' : player.gold < wallLevel * 150 ? 'Not enough gold' : 'Reinforce Wall'}</span><strong><Coins size={14} />{(wallLevel * 150).toLocaleString('en-US')}</strong></button></section>
            <div className="equipment-bottom-note"><Coins size={19} /><p>Gold is scavenged on the battlefield.<small>Repel incoming hordes and return for the next upgrade.</small></p><Link href={navigation.game}>To Defense Line <ArrowUpRight size={18} /></Link></div>
        </PlayerShell>
    );
}
