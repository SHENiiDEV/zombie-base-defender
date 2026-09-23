import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Check, Coins, Crosshair, Gem, LockKeyhole, Shield, Swords } from 'lucide-react';
import PlayerShell from '../../Components/PlayerShell';
import SkinCollection from '../../Components/SkinCollection';
import EquipmentArt from '../../Components/EquipmentArt';
import { WEAPONS, weaponStats } from '../../Utils/equipment';
import useEquipmentAction from '../../Utils/useEquipmentAction';

export default function Arsenal({ player, weapons = {}, unlock_costs, unlocked_skins = [], catalog }) {
    const { navigation } = usePage().props;
    const { pending, message, perform } = useEquipmentAction();
    const owns = (skin) => skin.id === 'default' || unlocked_skins.some(item => item.skin_id === skin.id && item.category === skin.category);

    return (
        <PlayerShell player={player} active="arsenal">
            <Head title="Personal Arsenal" />
            <section className="player-page-heading"><div><span className="section-kicker">EQUIPMENT / PERSONAL ARSENAL</span><h1>Your Decisive Firepower.</h1><p>Choose your weapon. Build your collection. Step onto the perimeter prepared.</p></div><Link href={navigation.game} className="landing-button primary"><Crosshair size={18} /> TO BATTLE <ArrowUpRight size={20} /></Link></section>
            <div className="equipment-summary"><span><Swords size={17} /> Weapons <strong>{Object.keys(weapons).length} / 3</strong></span><span><Gem size={17} /> Skins in Collection <strong>{Object.values(catalog).flat().filter(owns).length}</strong></span><Link href={navigation.upgrades}>Upgrade Equipment <ArrowUpRight size={15} /></Link></div>
            {message && <p className={`action-message ${message.type}`} role="status">{message.type === 'success' && <Check size={17} />}{message.text}</p>}
            <section className="equipment-section"><div className="equipment-section-heading"><h2>Weapons</h2><span>THREE WAYS TO HOLD THE PERIMETER</span></div>
                <div className="weapon-cards">{Object.entries(WEAPONS).map(([type, info]) => {
                    const owned = Boolean(weapons[type]);
                    const equipped = player.active_weapon_type === type;
                    const values = weaponStats(type, weapons[type]);
                    const canAfford = player.gold >= unlock_costs[type];
                    return <article className={`weapon-card ${equipped ? 'equipped' : ''} ${!owned ? 'locked' : ''}`} key={type}>
                        <div className="weapon-card-label"><span>{info.code}</span><span>{equipped ? <><Check size={12} /> EQUIPPED</> : owned ? 'IN ARSENAL' : <><LockKeyhole size={12} /> LOCKED</>}</span></div>
                        <div className={`weapon-preview weapon-${type}`}><div className="blueprint-lines" /><EquipmentArt type={type} /><span>{info.role}</span></div>
                        <div className="weapon-card-content"><h3>{info.name}</h3><p>{info.description}</p><dl className="weapon-metrics"><div><dt>Damage{type === 'shotgun' ? ' × 5' : ''}</dt><dd>{values.damage}</dd></div><div><dt>RPM</dt><dd>{values.fire_rate}</dd></div><div><dt>Magazine</dt><dd>{values.magazine}</dd></div></dl>
                            <button className={`equipment-button ${equipped ? 'is-equipped' : owned ? '' : 'unlock-button'}`} disabled={Boolean(pending) || equipped || (!owned && !canAfford)} onClick={() => perform(type, owned ? '/game/switch-weapon' : '/game/unlock-weapon', { weapon_type: type }, `${info.name} ${owned ? 'equipped' : 'unlocked and equipped'}.`)}>
                                {pending === type ? 'Saving…' : equipped ? <><Check size={16} /> Equipped</> : owned ? <>Equip <ArrowUpRight size={16} /></> : <>{canAfford ? 'Unlock' : 'Not enough gold'}<span><Coins size={14} />{unlock_costs[type].toLocaleString('en-US')}</span></>}
                            </button>
                        </div>
                    </article>;
                })}</div>
            </section>
            <SkinCollection player={player} weapons={weapons} unlocked_skins={unlocked_skins} catalog={catalog} />
            <div className="equipment-bottom-note"><Shield size={18} /><p>Weapons grow stronger. The defender grows unique.<small>Upgrade combat specs for gold in the workshop. Unlock skins with crystals.</small></p><Link href={navigation.upgrades}>To Workshop <ArrowUpRight size={18} /></Link></div>
        </PlayerShell>
    );
}
