import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function GameLayout({ children, player }) {
    const { url } = usePage();

    const navLinks = [
        { href: '/', label: 'Home', active: url === '/' },
        { href: '/game', label: 'Battle Arena', active: url.startsWith('/game') },
        { href: '/arsenal', label: 'Arsenal', active: url.startsWith('/arsenal') },
        { href: '/wardrobe', label: 'Wardrobe', active: url.startsWith('/wardrobe') },
        { href: '/shop', label: 'Crystal Shop', active: url.startsWith('/shop') },
    ];

    const gold = player?.gold ?? 0;
    const gems = player?.gems ?? 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white relative overflow-x-hidden">
            {/* Ambient Cybernetic Lighting */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Global Header */}
            <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg shadow-rose-500/20 font-black transition-transform group-hover:scale-105">
                            ☣
                        </div>
                        <div>
                            <span className="font-black tracking-widest text-lg text-white font-mono flex items-center gap-1.5">
                                ZOMBIE BASE <span className="text-cyan-400">DEFENDER</span>
                            </span>
                            <span className="text-[10px] text-slate-400 tracking-wider block font-mono">SECTOR // APOCALYPSE-9</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-1 sm:gap-2">
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                                    item.active
                                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Resource Counters & Fast Top-Up */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 shadow-inner font-mono">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400">
                                <span>🪙</span>
                                <span>{gold.toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-px bg-slate-700" />
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-400">
                                <span>💎</span>
                                <span>{gems.toLocaleString()}</span>
                            </div>
                        </div>

                        <Link
                            href="/shop"
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all"
                        >
                            + Gems
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 flex flex-col relative z-10">{children}</main>

            {/* Global Footer */}
            <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 lg:px-8 mt-auto relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
                    <div>
                        © 2026 ZOMBIE BASE DEFENDER // ALL RIGHTS RESERVED
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="hover:text-slate-300 transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>
                        <Link href="/shop" className="text-amber-400/80 hover:text-amber-300 transition-colors">
                            Crystal Shop
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
