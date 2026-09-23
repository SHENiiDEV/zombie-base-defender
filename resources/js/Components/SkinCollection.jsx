import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Check, Gem, Shield, SlidersHorizontal } from 'lucide-react';
import EquipmentArt from './EquipmentArt';
import { WEAPONS } from '../Utils/equipment';
import useEquipmentAction from '../Utils/useEquipmentAction';

export default function SkinCollection({ player, weapons = {}, unlocked_skins = [], catalog }) {
    const { navigation } = usePage().props;
    const [selection, setSelection] = useState(player.active_weapon_type || 'pistol');
    const [ownedOnly, setOwnedOnly] = useState(false);
    const { pending, message, perform } = useEquipmentAction();
    const category = selection === 'wall' ? 'wall' : 'weapon';
    const weapon = weapons[selection];
    const locked = category === 'weapon' && !weapon;
    const equippedId = category === 'wall' ? player.active_wall_skin : weapon?.active_skin ?? player.active_weapon_skin ?? 'default';
    const owns = skin => skin.id === 'default' || unlocked_skins.some(item => item.skin_id === skin.id && item.category === category);
    const available = (catalog[category] || []).filter(skin => category === 'wall' || skin.weapon_type === selection || (!skin.weapon_type && owns(skin)));
    const visible = available.filter(skin => !ownedOnly || owns(skin));

    return <section className="equipment-section">
        <div className="equipment-section-heading"><div><span className="section-kicker">MAKE EVERY SHOT YOURS</span><h2>Shot colors</h2></div><span>COLOR ONLY · SAME DAMAGE, SAME FIRE RATE</span></div>
        <div className="collection-toolbar">
            <div className="equipment-tabs skin-weapon-tabs" role="group" aria-label="Skin weapon">
                {Object.entries(WEAPONS).map(([type, info]) => <button key={type} type="button" aria-pressed={selection === type} className={selection === type ? 'active' : ''} onClick={() => setSelection(type)}>{info.name}</button>)}
                <button type="button" aria-pressed={selection === 'wall'} className={selection === 'wall' ? 'active' : ''} onClick={() => setSelection('wall')}><Shield size={14} /> Barricade</button>
            </div>
            <button type="button" className={`owned-toggle ${ownedOnly ? 'active' : ''}`} aria-pressed={ownedOnly} onClick={() => setOwnedOnly(!ownedOnly)}><SlidersHorizontal size={14} /> Owned only</button>
        </div>
        {locked && <p className="skin-unlock-note">Unlock {WEAPONS[selection].name} to buy and equip its shot colors. <Link href={navigation.arsenal}>Go to arsenal <ArrowUpRight size={14} /></Link></p>}
        {message && <p className={`action-message ${message.type}`} role="status">{message.type === 'success' && <Check size={16} />}{message.text}</p>}
        <div className="collection-grid">
            {visible.map(skin => {
                const owned = owns(skin);
                const equipped = !locked && equippedId === skin.id;
                const affordable = player.gems >= skin.cost_gems;
                return <article key={`${selection}-${skin.id}`} className={`collection-card ${equipped ? 'equipped' : ''}`} style={{ '--skin-color': skin.bullet_color || skin.wall_color }}>
                    <div className="skin-card-top"><span className="rarity">{skin.id === 'default' ? 'STANDARD ISSUE' : skin.weapon_type ? WEAPONS[selection].name : 'CLASSIC'}</span>{owned && <Check size={15} aria-label="Owned" />}</div>
                    <div className="skin-visual"><div className="skin-orbit" /><EquipmentArt type={selection} barrier={category === 'wall'} /></div>
                    {category === 'weapon' && <div className={`shot-color-preview shot-preview-${selection}`} aria-label={`Shot color ${skin.name}`}><span>SHOT PREVIEW</span><svg viewBox="0 0 160 42" aria-hidden="true">{(selection === 'shotgun' ? [-12, 0, 12] : selection === 'minigun' ? [-5, 5] : [0]).map((offset, index) => <g key={offset}><path d={`M${15 + index * 7} 21 L${125 - index * 10} ${21 + offset}`} stroke={skin.bullet_color} strokeWidth="3" strokeLinecap="round" /><circle cx={125 - index * 10} cy={21 + offset} r="3" fill={skin.muzzle_color} /></g>)}</svg></div>}
                    <div className="collection-info"><h3>{skin.name}</h3><p>{skin.description}</p>
                        <button type="button" className={`equipment-button ${equipped ? 'is-equipped' : ''}`} disabled={Boolean(pending) || locked || equipped || (!owned && !affordable)} onClick={() => perform(`${selection}-${skin.id}`, owned ? '/game/equip-skin' : '/game/buy-skin', { skin_id: skin.id, category, ...(category === 'weapon' ? { weapon_type: selection } : {}) }, owned ? 'Skin equipped.' : 'Skin purchased and equipped.')}>
                            {pending === `${selection}-${skin.id}` ? 'Saving…' : locked ? 'Unlock weapon first' : equipped ? <><Check size={14} /> Equipped</> : owned ? <>Equip <ArrowUpRight size={14} /></> : <>{affordable ? 'Buy & equip' : 'Not enough crystals'}<span><Gem size={13} />{skin.cost_gems}</span></>}
                        </button>
                    </div>
                </article>;
            })}
        </div>
        {!visible.length && <p className="skin-unlock-note">No skins in this collection yet.</p>}
    </section>;
}
