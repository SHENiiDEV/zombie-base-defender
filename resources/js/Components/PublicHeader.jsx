import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Menu, User, X } from 'lucide-react';
import AuthModal from './AuthModal';

const sections = [
    { id: 'about', label: 'The Game' },
    { id: 'threats', label: 'The Infected' },
    { id: 'base', label: 'The Outpost' },
];

export default function PublicHeader({ authenticated = false }) {
    const { navigation = {}, auth = {} } = usePage().props;
    const { url } = usePage();
    const isHome = url.split('?')[0].split('#')[0] === '/';
    const [menuOpen, setMenuOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('register');

    const currentUser = auth?.user;

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!currentUser && (
                        <button
                            type="button"
                            onClick={() => { setAuthMode('register'); setAuthOpen(true); }}
                            className="public-auth-btn"
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(86, 212, 194, 0.4)',
                                color: '#56d4c2',
                                padding: '8px 14px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <User size={13} />
                            <span>Enlist</span>
                        </button>
                    )}
                    <Link href={navigation.game || '/game'} className="public-play">
                        {authenticated || currentUser ? 'Return to base' : 'Play now'}
                        <ArrowUpRight size={17} />
                    </Link>
                </div>
                <button className="public-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
            </header>
            <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
        </>
    );
}
