import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Crosshair, Gem, Coins, ArrowUpRight, Shield, Wrench, Swords, Sparkles, ArrowLeft, Radio, LogOut, UserPlus } from 'lucide-react';
import TopUpModal from './TopUpModal';
import AuthModal from './AuthModal';

export default function PlayerShell({ player, active, children, onShopChange, onNavigate }) {
    const { navigation = {}, auth = {}, company = {} } = usePage().props || {};
    const [shopOpen, setShopOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('register');
    const toggleShop = (open) => {
        setShopOpen(open);
        onShopChange?.(open);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const safePlayer = player || { name: 'Survivor', gold: 0, gems: 0 };

    const sections = [
        { key: 'game', label: 'Defense', icon: Shield, href: navigation.game || '/game' },
        { key: 'arsenal', label: 'Arsenal', icon: Swords, href: navigation.arsenal || '/arsenal' },
        { key: 'upgrades', label: 'Workshop', icon: Wrench, href: navigation.upgrades || '/upgrades' },
        { key: 'wardrobe', label: 'Wardrobe', icon: Sparkles, href: navigation.wardrobe || '/wardrobe' },
        { key: 'shop', label: 'Shop', icon: Gem, href: navigation.shop || '/shop' },
    ];

    return (
        <div className="defender-landing player-app">
            <a href="#player-content" className="landing-skip">Skip to content</a>
            <header className="landing-header player-header">
                <Link href={navigation.home || '/'} className="landing-brand" onClick={onNavigate}>
                    <span className="brand-mark"><Crosshair size={26} /></span>
                    <span>ZOMBIE BASE<small>DEFENDER</small></span>
                </Link>
                <nav className="player-navigation" aria-label="Player navigation">
                    {sections.map(({ key, label, icon: Icon, href }) => (
                        <Link
                            key={key}
                            href={href}
                            className={active === key ? 'active' : ''}
                            aria-current={active === key ? 'page' : undefined}
                            onClick={onNavigate}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="header-account">
                    <span className="balance gold" aria-label={`${safePlayer.gold} gold`}>
                        <Coins size={16} />
                        {Number(safePlayer.gold || 0).toLocaleString('en-US')}
                    </span>
                    <Link
                        href={navigation.shop || '/shop'}
                        className="balance gems"
                        aria-label="Open crystal shop"
                    >
                        <Gem size={16} />
                        {Number(safePlayer.gems || 0).toLocaleString('en-US')}
                        <span className="balance-plus">+</span>
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="header-logout-btn"
                        title="Sign out of current terminal"
                        aria-label="Log Out"
                    >
                        <LogOut size={14} />
                        <span>LOG OUT</span>
                    </button>
                </div>
            </header>

            <div className="player-context">
                <Link href={navigation.home || '/'} onClick={onNavigate}>
                    <ArrowLeft size={13} /> Return Home
                </Link>
                <span>
                    <Radio size={13} /> SECTOR 09 / {safePlayer.name || 'Survivor'}
                </span>
                <span className="context-online">
                    <i /> LINK ESTABLISHED
                </span>
                <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthOpen(true); }}
                    className="player-context-logout"
                    style={{ borderColor: 'rgba(86, 212, 194, 0.4)', color: '#56d4c2' }}
                    title="Enlist new commander or log in"
                >
                    <UserPlus size={12} />
                    <span>ENLIST / SWITCH</span>
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="player-context-logout"
                    title="Sign out"
                >
                    <LogOut size={12} />
                    <span>TERMINAL LOGOUT</span>
                </button>
            </div>

            <main id="player-content" className="player-content">{children}</main>

            <footer className="player-footer">
                <span><Crosshair size={14} /> THE FINAL DEFENSE LINE IS YOU.</span>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link href={navigation.terms || '/terms'}>Terms of Service</Link>
                    <Link href={navigation.privacy || '/privacy'}>Privacy Policy</Link>
                    <Link href={navigation.cookies || '/cookies'}>Cookie Policy</Link>
                    <Link href={navigation.shop || '/shop'}>Crystal Shop <ArrowUpRight size={14} /></Link>
                </div>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#7a8e89' }}>ACCEPTED METHODS:</span>
                        <div style={{ background: '#fff', borderRadius: '3px', padding: '3px 8px', height: '26px', display: 'inline-flex', alignItems: 'center' }}>
                            <img src="/images/payments/visa.png" alt="Visa" style={{ height: '14px', width: 'auto' }} />
                        </div>
                        <div style={{ background: '#fff', borderRadius: '3px', padding: '3px 8px', height: '26px', display: 'inline-flex', alignItems: 'center' }}>
                            <img src="/images/payments/mastercard.png" alt="Mastercard" style={{ height: '18px', width: 'auto' }} />
                        </div>
                        <div style={{ background: '#fff', borderRadius: '3px', padding: '3px 8px', height: '26px', display: 'inline-flex', alignItems: 'center' }}>
                            <img src="/images/payments/pci-dss.png" alt="PCI DSS" style={{ height: '18px', width: 'auto' }} />
                        </div>
                    </div>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#56d4c2' }}>256-BIT ENCRYPTED</span>
                </div>
                <div style={{ width: '100%', fontSize: '11px', color: '#7a8e89', fontFamily: 'monospace', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span>© {new Date().getFullYear()} {company?.name || 'Zombie Base Defender Ltd.'}</span>
                    <span>&bull; [REG: {company?.number || 'OUTPOST-SEC-09-881'}]</span>
                    <span>&bull; {company?.address || 'Sector 09 Fortification Line, Perimeter Outpost'}</span>
                    <span>&bull; <a href={`mailto:${company?.email || 'info@zombiebasedefender.com'}`} style={{ color: '#56d4c2', textDecoration: 'none' }}>{company?.email || 'info@zombiebasedefender.com'}</a></span>
                </div>
            </footer>

            <TopUpModal isOpen={shopOpen} onClose={() => toggleShop(false)} currentGems={safePlayer.gems || 0} />
            <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
        </div>
    );
}
