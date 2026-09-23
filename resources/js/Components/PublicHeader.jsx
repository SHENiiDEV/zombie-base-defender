import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Menu, X } from 'lucide-react';

const sections = [
    { id: 'about', label: 'The Game' },
    { id: 'threats', label: 'The Infected' },
    { id: 'base', label: 'The Outpost' },
];

export default function PublicHeader({ authenticated = false }) {
    const { navigation = {} } = usePage().props;
    const { url } = usePage();
    const isHome = url.split('?')[0].split('#')[0] === '/';
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, []);

    return (
        <>
            <a href="#main-content" className="landing-skip">Skip to content</a>
            <header className="public-header">
                <Link href={navigation.home || '/'} className="landing-brand" aria-label="Zombie Base Defender home">
                    <span className="brand-mark"><Crosshair size={26} /></span>
                    <span>ZOMBIE BASE<small>DEFENDER</small></span>
                </Link>
                <nav id="public-navigation" className={`public-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
                    {sections.map(section => <a key={section.id} href={`${isHome ? '' : navigation.home || '/'}#${section.id}`} onClick={() => setMenuOpen(false)}>{section.label}</a>)}
                </nav>
                <Link href={navigation.game || '/game'} className="public-play">{authenticated ? 'Return to base' : 'Play now'}<ArrowUpRight size={17} /></Link>
                <button className="public-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
            </header>
        </>
    );
}
