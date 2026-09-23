import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Gem } from 'lucide-react';
import PlayerShell from '../Components/PlayerShell';
import SkinCollection from '../Components/SkinCollection';

export default function Wardrobe({ player, weapons = {}, unlocked_skins = [], catalog = { weapon: [], wall: [] } }) {
    const { navigation } = usePage().props;
    return <PlayerShell player={player} active="wardrobe">
        <Head title="Wardrobe — Make every shot yours" />
        <section className="player-page-heading"><div><span className="section-kicker">YOUR WEAPON. YOUR COLOR.</span><h1>Make your mark.</h1><p>Ten shot colors for every weapon. Buy once, equip anytime. Purely cosmetic.</p></div><Link href={navigation.shop} className="landing-button primary"><Gem size={18} /> GET CRYSTALS <ArrowUpRight size={20} /></Link></section>
        <SkinCollection player={player} weapons={weapons} unlocked_skins={unlocked_skins} catalog={catalog} />
    </PlayerShell>;
}
