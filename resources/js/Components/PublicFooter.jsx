import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crosshair } from 'lucide-react';

export default function PublicFooter() {
    const { navigation = {} } = usePage().props;
    return (
        <footer className="public-footer">
            <div className="public-footer-top">
                <Link href={navigation.home || '/'} className="landing-brand"><Crosshair size={26} /><span>ZOMBIE BASE<small>DEFENDER</small></span></Link>
                <p>The world went quiet.<br />Your outpost didn’t.</p>
                <Link href={navigation.game || '/'} className="footer-game-link">Take your position <ArrowUpRight size={19} /></Link>
            </div>
            <div className="public-footer-bottom"><span>© {new Date().getFullYear()} Zombie Base Defender</span><nav aria-label="Legal information"><Link href={navigation.terms || '/terms'}>Terms of Service</Link><Link href={navigation.privacy || '/privacy'}>Privacy Policy</Link><Link href={navigation.cookies || '/cookies'}>Cookie Policy</Link></nav><span>BUILT TO HOLD.</span></div>
        </footer>
    );
}
