import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Check,
    Coins,
    Flame,
    Gem,
    LoaderCircle,
    RotateCcw,
    ShieldCheck,
    Sliders,
    Sparkles,
    Zap,
} from 'lucide-react';
import PlayerShell from '../Components/PlayerShell';
import {
    calculateCustomGemPrice,
    calculateCustomGoldPrice,
    calculateCustomOrderPrice,
    formatPrice,
    getCustomGemDiscountBadge,
    getCustomGoldDiscountBadge,
} from '../Utils/shopPricing';

function CrystalCluster({ count = 2 }) {
    return (
        <svg className="crystal-cluster" viewBox="0 0 180 140" fill="none" aria-hidden="true">
            <ellipse cx="90" cy="118" rx="55" ry="9" fill="currentColor" opacity=".08" />
            {Array.from({ length: count }, (_, i) => {
                const x = [90, 58, 119, 34, 145][i] || 90;
                const scale = [1, 0.72, 0.8, 0.5, 0.48][i] || 0.7;
                return (
                    <g key={i} transform={`translate(${x} ${i === 0 ? 12 : 48}) scale(${scale})`}>
                        <path d="m0 0 25 28-4 53L0 106-21 81-25 28z" fill="#294348" stroke="currentColor" />
                        <path d="M0 0v106l21-25 4-53z" fill="currentColor" opacity=".22" />
                        <path d="m-25 28 25 8 25-8M0 36v70M0 0l-9 37 9 69" stroke="currentColor" opacity=".8" />
                        <path d="M0 0 25 28 0 36-25 28z" fill="currentColor" opacity=".35" />
                    </g>
                );
            })}
        </svg>
    );
}

function GoldMunitionsCrate({ count = 2 }) {
    return (
        <svg className="crystal-cluster" viewBox="0 0 180 140" fill="none" aria-hidden="true" style={{ color: '#e9b85f' }}>
            <ellipse cx="90" cy="118" rx="60" ry="10" fill="currentColor" opacity=".12" />
            {/* Munitions Military Crate */}
            <g transform="translate(45, 42)">
                <rect x="0" y="10" width="90" height="60" rx="3" fill="#1b241e" stroke="#8c7743" strokeWidth="2" />
                <rect x="6" y="16" width="78" height="48" fill="#141c17" stroke="#4a422a" strokeWidth="1" />
                <line x1="0" y1="40" x2="90" y2="40" stroke="#8c7743" strokeWidth="2" />
                <line x1="30" y1="10" x2="30" y2="70" stroke="#8c7743" strokeWidth="1.5" />
                <line x1="60" y1="10" x2="60" y2="70" stroke="#8c7743" strokeWidth="1.5" />

                {/* Stenciled Hazard Warning */}
                <polygon points="45,22 52,34 38,34" fill="#e9b85f" opacity="0.8" />
                <circle cx="45" cy="30" r="1.5" fill="#141c17" />

                {/* Gold Coins Heap */}
                {Array.from({ length: Math.min(6, count * 2) }, (_, i) => {
                    const cx = [18, 32, 48, 65, 75, 40][i];
                    const cy = [8, 5, 4, 7, 10, 1][i];
                    return (
                        <ellipse
                            key={i}
                            cx={cx}
                            cy={cy}
                            rx="10"
                            ry="4"
                            fill="#e9b85f"
                            stroke="#b38a3b"
                            strokeWidth="1"
                        />
                    );
                })}
            </g>
        </svg>
    );
}

function ComboWarChest() {
    return (
        <svg className="crystal-cluster" viewBox="0 0 180 140" fill="none" aria-hidden="true">
            <ellipse cx="90" cy="120" rx="65" ry="11" fill="#e9b85f" opacity=".1" />
            <g transform="translate(38, 36)">
                {/* Heavy Reinforced Armored Vault Box */}
                <rect x="0" y="12" width="104" height="65" rx="4" fill="#17221e" stroke="#b0934e" strokeWidth="2" />
                <rect x="8" y="20" width="88" height="49" fill="#101815" stroke="#37473d" strokeWidth="1.5" />

                {/* Left side: Cyan Plasma Crystal Emitters */}
                <path d="M22 6 L35 24 L22 38 L9 24 Z" fill="#06b6d4" opacity="0.75" />
                <path d="M22 6 L22 38" stroke="#ffffff" strokeWidth="1" />

                {/* Right side: Amber Gold Ingots */}
                <ellipse cx="78" cy="18" rx="14" ry="6" fill="#e9b85f" stroke="#caa04a" strokeWidth="1" />
                <ellipse cx="78" cy="12" rx="14" ry="6" fill="#ffd175" stroke="#caa04a" strokeWidth="1" />

                {/* Center Seal */}
                <circle cx="52" cy="45" r="10" fill="#202c25" stroke="#e9b85f" strokeWidth="2" />
                <path d="M48 45 L52 49 L58 41" stroke="#e9b85f" strokeWidth="2" strokeLinecap="round" />
            </g>
        </svg>
    );
}

export default function Shop({
    player,
    packs = [],
    currencies = ['USD', 'EUR', 'GBP'],
    currency_symbols = { USD: '$', EUR: '€', GBP: '£' },
    recent_payments = [],
}) {
    const { navigation = {} } = usePage().props || {};
    const [activeTab, setActiveTab] = useState('bundle'); // 'bundle' | 'gems' | 'gold' | 'custom'
    const [selectedPackId, setSelectedPackId] = useState('bundle_operative');
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [customGems, setCustomGems] = useState(1000);
    const [customGold, setCustomGold] = useState(25000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const bundles = packs.filter((p) => p.category === 'bundle');
    const gemPacks = packs.filter((p) => p.category === 'gems');
    const goldPacks = packs.filter((p) => p.category === 'gold');

    const selectedPack = packs.find((p) => p.id === selectedPackId) || bundles[0] || packs[0];

    const getPriceFormatted = (pack, curr) => {
        const amount = pack?.prices?.[curr] ?? pack?.prices?.['USD'] ?? 1.99;
        return formatPrice(amount, curr, currency_symbols);
    };

    const parsedCustomGems = Math.max(0, parseInt(customGems, 10) || 0);
    const parsedCustomGold = Math.max(0, parseInt(customGold, 10) || 0);

    const customGemSubtotal = calculateCustomGemPrice(parsedCustomGems, selectedCurrency);
    const customGoldSubtotal = calculateCustomGoldPrice(parsedCustomGold, selectedCurrency);
    const customOrderTotal = calculateCustomOrderPrice(parsedCustomGems, parsedCustomGold, selectedCurrency);
    const customFormattedTotal = formatPrice(customOrderTotal, selectedCurrency, currency_symbols);
    const customGemBadge = getCustomGemDiscountBadge(parsedCustomGems);
    const customGoldBadge = getCustomGoldDiscountBadge(parsedCustomGold);
    const hasComboDiscount = parsedCustomGems > 0 && parsedCustomGold > 0;

    const handleBuy = () => {
        if (loading) return;
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const isCustom = activeTab === 'custom';

        if (isCustom && parsedCustomGems <= 0 && parsedCustomGold <= 0) {
            setError('Please specify at least 1 crystal or 1 gold coin to authorize requisition.');
            setLoading(false);
            return;
        }

        const payload = isCustom
            ? {
                  pack_id: 'custom',
                  custom_gems: parsedCustomGems,
                  custom_gold: parsedCustomGold,
                  currency: selectedCurrency,
              }
            : {
                  pack_id: selectedPack.id,
                  currency: selectedCurrency,
              };

        router.post(navigation.topUp || '/payments/create-session', payload, {
            preserveScroll: true,
            onSuccess: () => {
                if (isCustom) {
                    const parts = [];
                    if (parsedCustomGems > 0) parts.push(`${parsedCustomGems.toLocaleString()} crystals`);
                    if (parsedCustomGold > 0) parts.push(`${parsedCustomGold.toLocaleString()} gold`);
                    setSuccessMessage(`Top-up successful! Added ${parts.join(' and ')}.`);
                } else {
                    const parts = [];
                    if (selectedPack.gems > 0) parts.push(`${selectedPack.gems.toLocaleString()} crystals`);
                    if (selectedPack.gold > 0) parts.push(`${selectedPack.gold.toLocaleString()} gold`);
                    setSuccessMessage(`Top-up complete! Added ${parts.join(' and ')}.`);
                }
            },
            onError: () => {
                setError('Payment failed. Please verify selected parameters and retry.');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    return (
        <PlayerShell player={player} active="shop">
            <Head title="Strategic Supply Depot - Top-Up" />

            <section className="player-page-heading">
                <div>
                    <span className="section-kicker">QUARTERMASTER LOGISTICS // SECTOR 09</span>
                    <h1>Strategic Supply Depot.</h1>
                    <p>
                        Replenish tactical assets. Secure value combo war chests, rare nano-crystals for weapon finishes, or gold munitions for workshop fortifications.
                    </p>
                </div>
                <Link href={navigation.game || '/game'} className="landing-button primary">
                    <ArrowRight size={18} /> TO BATTLE <ArrowUpRight size={20} />
                </Link>
            </section>

            {/* Current Player Reserves Display */}
            <div className="equipment-summary" style={{ marginBottom: '24px' }}>
                <span>
                    <Gem size={17} /> Crystals: <strong>{Number(player?.gems || 0).toLocaleString('en-US')}</strong>
                </span>
                <span>
                    <Coins size={17} /> Gold: <strong>{Number(player?.gold || 0).toLocaleString('en-US')}</strong>
                </span>
                <span style={{ color: '#889e92', fontSize: '10px' }}>
                    <ShieldCheck size={15} /> INSTANT PCI-DSS VERIFIED DISPATCH
                </span>
            </div>

            {/* Navigation & Currency Bar */}
            <div className="collection-toolbar" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div className="equipment-tabs" role="group" aria-label="Catalog category">
                    <button
                        type="button"
                        className={activeTab === 'bundle' ? 'active' : ''}
                        onClick={() => {
                            setActiveTab('bundle');
                            if (bundles[0]) setSelectedPackId(bundles[0].id);
                        }}
                    >
                        <Flame size={16} /> Combo Bundles (Best Value)
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'gems' ? 'active' : ''}
                        onClick={() => {
                            setActiveTab('gems');
                            if (gemPacks[0]) setSelectedPackId(gemPacks[0].id);
                        }}
                    >
                        <Gem size={16} /> Crystals (Cosmetics)
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'gold' ? 'active' : ''}
                        onClick={() => {
                            setActiveTab('gold');
                            if (goldPacks[0]) setSelectedPackId(goldPacks[0].id);
                        }}
                    >
                        <Coins size={16} /> Gold Munitions (Upgrades)
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'custom' ? 'active' : ''}
                        onClick={() => setActiveTab('custom')}
                    >
                        <Sliders size={16} /> Custom Calculator
                    </button>
                </div>

                {/* Multi-Currency Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '10px', color: 'var(--land-muted)', fontFamily: 'monospace' }}>CURRENCY:</span>
                    <div style={{ display: 'flex', gap: '4px', background: '#121c18', padding: '3px', border: '1px solid var(--land-line)' }}>
                        {currencies.map((curr) => (
                            <button
                                key={curr}
                                type="button"
                                style={{
                                    border: 0,
                                    background: selectedCurrency === curr ? 'var(--land-accent)' : 'transparent',
                                    color: selectedCurrency === curr ? '#101617' : '#99aba1',
                                    fontWeight: selectedCurrency === curr ? 'bold' : 'normal',
                                    fontSize: '11px',
                                    padding: '4px 9px',
                                    fontFamily: 'monospace',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setSelectedCurrency(curr)}
                            >
                                {currency_symbols[curr] || '$'} {curr}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {successMessage && (
                <p className="action-message success" role="status">
                    <Check size={17} />
                    {successMessage}
                </p>
            )}

            {error && (
                <p className="action-message error" role="alert">
                    {error}
                </p>
            )}

            {/* TAB 1: COMBO VALUE BUNDLES */}
            {activeTab === 'bundle' && (
                <section className="equipment-section">
                    <div className="equipment-section-heading">
                        <div>
                            <span className="section-kicker">HEAVY REINFORCEMENTS</span>
                            <h2>Strategic Combo War Chests</h2>
                        </div>
                        <span>BOTH CRYSTALS AND GOLD WITH MAXIMUM SAVINGS</span>
                    </div>

                    <div className="gem-pack-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                        {bundles.map((bundle) => {
                            const isSelected = selectedPackId === bundle.id;
                            const price = getPriceFormatted(bundle, selectedCurrency);

                            return (
                                <button
                                    key={bundle.id}
                                    type="button"
                                    className={`gem-pack ${isSelected ? 'selected' : ''}`}
                                    aria-pressed={isSelected}
                                    disabled={loading}
                                    onClick={() => setSelectedPackId(bundle.id)}
                                >
                                    <span className="pack-topline">
                                        <span style={{ color: '#ffd175', fontWeight: 'bold' }}>{bundle.badge}</span>
                                        <span className="pack-check">{isSelected && <Check size={12} />}</span>
                                    </span>

                                    <ComboWarChest />

                                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', margin: '4px 0 6px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#67e8f9', font: '22px "Oswald", sans-serif' }}>
                                            <Gem size={17} /> {bundle.gems.toLocaleString()}
                                        </span>
                                        <span style={{ color: '#748b81', fontSize: '16px' }}>+</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--land-accent)', font: '22px "Oswald", sans-serif' }}>
                                            <Coins size={17} /> {bundle.gold.toLocaleString()}
                                        </span>
                                    </div>

                                    <strong style={{ fontSize: '20px', margin: '0' }}>{bundle.label}</strong>
                                    <span className="pack-subtitle" style={{ minHeight: '32px' }}>{bundle.desc}</span>
                                    <span className="pack-price">{price}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* TAB 2: CRYSTAL PACKS */}
            {activeTab === 'gems' && (
                <section className="equipment-section">
                    <div className="equipment-section-heading">
                        <div>
                            <span className="section-kicker">AESTHETIC FINISHES</span>
                            <h2>Rare Nano-Crystal Bundles</h2>
                        </div>
                        <span>UNLOCK EXCLUSIVE WEAPON & BARRICADE PLASMA SKINS</span>
                    </div>

                    <div className="gem-pack-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                        {gemPacks.map((pack, idx) => {
                            const isSelected = selectedPackId === pack.id;
                            const price = getPriceFormatted(pack, selectedCurrency);

                            return (
                                <button
                                    key={pack.id}
                                    type="button"
                                    className={`gem-pack ${isSelected ? 'selected' : ''}`}
                                    aria-pressed={isSelected}
                                    disabled={loading}
                                    onClick={() => setSelectedPackId(pack.id)}
                                >
                                    <span className="pack-topline">
                                        {pack.badge || pack.label}
                                        <span className="pack-check">{isSelected && <Check size={12} />}</span>
                                    </span>

                                    <CrystalCluster count={idx + 1} />

                                    <strong>{pack.gems.toLocaleString('en-US')}</strong>
                                    <span className="pack-unit">CRYSTALS</span>
                                    <span className="pack-subtitle">{pack.desc}</span>
                                    <span className="pack-price">{price}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* TAB 3: GOLD PACKS */}
            {activeTab === 'gold' && (
                <section className="equipment-section">
                    <div className="equipment-section-heading">
                        <div>
                            <span className="section-kicker">KINETIC CALIBRATION</span>
                            <h2>Quartermaster Munitions Gold</h2>
                        </div>
                        <span>INSTANT WORKSHOP UPGRADES FOR DAMAGE, ROF, & WALL INTEGRITY</span>
                    </div>

                    <div className="gem-pack-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
                        {goldPacks.map((pack, idx) => {
                            const isSelected = selectedPackId === pack.id;
                            const price = getPriceFormatted(pack, selectedCurrency);

                            return (
                                <button
                                    key={pack.id}
                                    type="button"
                                    className={`gem-pack ${isSelected ? 'selected' : ''}`}
                                    aria-pressed={isSelected}
                                    disabled={loading}
                                    onClick={() => setSelectedPackId(pack.id)}
                                >
                                    <span className="pack-topline">
                                        <span style={{ color: '#ffd175' }}>{pack.badge || 'SUPPLY CRATE'}</span>
                                        <span className="pack-check">{isSelected && <Check size={12} />}</span>
                                    </span>

                                    <GoldMunitionsCrate count={idx + 1} />

                                    <strong style={{ color: '#fed7aa' }}>{pack.gold.toLocaleString('en-US')}</strong>
                                    <span className="pack-unit" style={{ color: '#e9b85f' }}>GOLD COINS</span>
                                    <span className="pack-subtitle">{pack.desc}</span>
                                    <span className="pack-price">{price}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* TAB 4: UNLIMITED CUSTOM REQUISITION CALCULATOR */}
            {activeTab === 'custom' && (
                <section className="equipment-section">
                    <div className="equipment-section-heading">
                        <div>
                            <span className="section-kicker">UNLIMITED REQUISITION CALCULATOR</span>
                            <h2>Custom Direct Procurement</h2>
                        </div>
                        <span>PURCHASE ANY UNCONSTRAINED AMOUNT OF CRYSTALS AND GOLD WITH AUTOMATIC VOLUME DISCOUNTS</span>
                    </div>

                    <div
                        style={{
                            background: '#19221f',
                            border: '1px solid var(--land-line)',
                            padding: '30px 26px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '26px',
                        }}
                    >
                        {/* Dual Requisition Bays */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                            {/* BAY 01: CRYSTALS */}
                            <div
                                style={{
                                    background: '#131c18',
                                    border: '1px solid #2e4036',
                                    padding: '24px 20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#67e8f9', font: '18px "Oswald", sans-serif', letterSpacing: '0.5px' }}>
                                        <Gem size={18} /> NANO-CRYSTALS
                                    </span>
                                    {customGemBadge ? (
                                        <span style={{ fontSize: '10px', color: '#86efac', background: '#16653433', border: '1px solid #22c55e66', padding: '3px 7px', fontFamily: 'monospace' }}>
                                            ★ {customGemBadge}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '9px', color: '#748b80', fontFamily: 'monospace' }}>
                                            STANDARD RATE
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="number"
                                        min={0}
                                        step={100}
                                        value={customGems}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/^0+/, '') || '0';
                                            setCustomGems(Math.max(0, parseInt(val, 10) || 0));
                                        }}
                                        style={{
                                            background: '#0d1512',
                                            border: '1px solid #4a5e52',
                                            color: '#67e8f9',
                                            font: '26px "Oswald", sans-serif',
                                            padding: '8px 14px',
                                            width: '100%',
                                        }}
                                        placeholder="0"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCustomGems(0)}
                                        title="Clear crystals"
                                        style={{
                                            background: '#1b2621',
                                            border: '1px solid #3c4f44',
                                            color: '#95aaa0',
                                            padding: '12px 10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {[500, 2500, 10000, 50000, 250000, 1000000].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setCustomGems((prev) => (Number(prev) || 0) + num)}
                                            style={{
                                                background: '#18241f',
                                                border: '1px solid #3b4e42',
                                                color: '#b6cac0',
                                                fontSize: '11px',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            +{num.toLocaleString()}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #23322a' }}>
                                    <span style={{ fontSize: '11px', color: '#889e92', fontFamily: 'monospace' }}>Crystal Subtotal:</span>
                                    <strong style={{ fontSize: '18px', color: '#67e8f9', fontFamily: '"Oswald", sans-serif' }}>
                                        {formatPrice(customGemSubtotal, selectedCurrency, currency_symbols)}
                                    </strong>
                                </div>
                                <span style={{ fontSize: '9px', color: '#6f8377', fontFamily: 'monospace' }}>
                                    Tiers: 500+ (10%) · 1K+ (20%) · 2.5K+ (30%) · 5K+ (40%) · 25K+ (50%) · 100K+ (60%)
                                </span>
                            </div>

                            {/* BAY 02: GOLD */}
                            <div
                                style={{
                                    background: '#131c18',
                                    border: '1px solid #2e4036',
                                    padding: '24px 20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--land-accent)', font: '18px "Oswald", sans-serif', letterSpacing: '0.5px' }}>
                                        <Coins size={18} /> MUNITIONS GOLD
                                    </span>
                                    {customGoldBadge ? (
                                        <span style={{ fontSize: '10px', color: '#fed7aa', background: '#78350f33', border: '1px solid #d9770666', padding: '3px 7px', fontFamily: 'monospace' }}>
                                            ★ {customGoldBadge}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '9px', color: '#748b80', fontFamily: 'monospace' }}>
                                            STANDARD RATE
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={customGold}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/^0+/, '') || '0';
                                            setCustomGold(Math.max(0, parseInt(val, 10) || 0));
                                        }}
                                        style={{
                                            background: '#0d1512',
                                            border: '1px solid #4a5e52',
                                            color: '#fed7aa',
                                            font: '26px "Oswald", sans-serif',
                                            padding: '8px 14px',
                                            width: '100%',
                                        }}
                                        placeholder="0"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCustomGold(0)}
                                        title="Clear gold"
                                        style={{
                                            background: '#1b2621',
                                            border: '1px solid #3c4f44',
                                            color: '#95aaa0',
                                            padding: '12px 10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {[10000, 50000, 250000, 1000000, 10000000, 50000000].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setCustomGold((prev) => (Number(prev) || 0) + num)}
                                            style={{
                                                background: '#18241f',
                                                border: '1px solid #3b4e42',
                                                color: '#b6cac0',
                                                fontSize: '11px',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            +{num.toLocaleString()}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #23322a' }}>
                                    <span style={{ fontSize: '11px', color: '#889e92', fontFamily: 'monospace' }}>Gold Subtotal:</span>
                                    <strong style={{ fontSize: '18px', color: '#fed7aa', fontFamily: '"Oswald", sans-serif' }}>
                                        {formatPrice(customGoldSubtotal, selectedCurrency, currency_symbols)}
                                    </strong>
                                </div>
                                <span style={{ fontSize: '9px', color: '#6f8377', fontFamily: 'monospace' }}>
                                    Tiers: 1K+ (12%) · 5K+ (28%) · 25K+ (44%) · 100K+ (60%) · 1M+ (72%)
                                </span>
                            </div>
                        </div>

                        {/* COMBO SYNERGY NOTIFICATION */}
                        {hasComboDiscount && (
                            <div
                                style={{
                                    background: '#1c271b',
                                    border: '1px solid #5a8a4f',
                                    padding: '12px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#86efac',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                }}
                            >
                                <Sparkles size={18} />
                                <span>
                                    <strong>★ 10% COMBO SYNERGY DISCOUNT ACTIVE:</strong> Procuring both tactical crystals and munitions gold grants an automatic additional 10% price deduction.
                                </span>
                            </div>
                        )}

                        {/* REQUISITION TOTAL MANIFEST */}
                        <div
                            style={{
                                background: '#121a17',
                                border: '1px solid #38493f',
                                padding: '20px 24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '16px',
                            }}
                        >
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--land-muted)', fontFamily: 'monospace' }}>
                                    DISPATCH ALLOCATION ({selectedCurrency}):
                                </span>
                                <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginTop: '6px' }}>
                                    <span style={{ color: '#67e8f9', font: '22px "Oswald", sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Gem size={17} /> {parsedCustomGems.toLocaleString()}
                                    </span>
                                    <span style={{ color: '#738a7e', fontSize: '16px' }}>+</span>
                                    <span style={{ color: 'var(--land-accent)', font: '22px "Oswald", sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Coins size={17} /> {parsedCustomGold.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '10px', color: 'var(--land-muted)', fontFamily: 'monospace' }}>
                                    TOTAL AUTHORIZATION:
                                </span>
                                <div style={{ font: '38px "Oswald", sans-serif', color: 'var(--land-accent)', lineHeight: 1 }}>
                                    {customFormattedTotal}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Universal Checkout Action Bar */}
            <div className="shop-checkout" style={{ background: '#141e1b', padding: '24px 28px', border: '1px solid var(--land-line)', marginTop: '20px' }}>
                <div>
                    <span style={{ fontSize: '10px', color: 'var(--land-muted)', fontFamily: 'monospace' }}>
                        CONFIRMED SELECTION:
                    </span>
                    <strong style={{ fontSize: '15px', color: '#edf1de', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {activeTab === 'custom' ? (
                            parsedCustomGems > 0 || parsedCustomGold > 0 ? (
                                <>
                                    {parsedCustomGems > 0 && <span>💎 {parsedCustomGems.toLocaleString()} Crystals</span>}
                                    {parsedCustomGems > 0 && parsedCustomGold > 0 && <span>+</span>}
                                    {parsedCustomGold > 0 && <span>🪙 {parsedCustomGold.toLocaleString()} Gold</span>}
                                    <span style={{ color: 'var(--land-accent)' }}>· {customFormattedTotal}</span>
                                </>
                            ) : (
                                'Specify crystal or gold amounts above'
                            )
                        ) : selectedPack ? (
                            <>
                                {selectedPack.gems > 0 && <span>💎 {selectedPack.gems.toLocaleString()}</span>}
                                {selectedPack.gems > 0 && selectedPack.gold > 0 && <span>+</span>}
                                {selectedPack.gold > 0 && <span>🪙 {selectedPack.gold.toLocaleString()}</span>}
                                <span>({selectedPack.label})</span>
                                <span style={{ color: 'var(--land-accent)' }}>· {getPriceFormatted(selectedPack, selectedCurrency)}</span>
                            </>
                        ) : (
                            'Select a supply package above'
                        )}
                    </strong>
                </div>

                <button
                    type="button"
                    className="landing-button primary"
                    disabled={
                        loading ||
                        (activeTab === 'custom'
                            ? parsedCustomGems <= 0 && parsedCustomGold <= 0
                            : !selectedPack)
                    }
                    onClick={handleBuy}
                >
                    {loading ? <LoaderCircle className="loading-spin" size={18} /> : <Zap size={18} />}
                    {loading ? 'Processing Transaction…' : 'Authorize Instant Top-Up'}
                    <ArrowRight size={18} />
                </button>
            </div>

            <p className="shop-disclaimer" style={{ marginTop: '16px' }}>
                <ShieldCheck size={16} />
                <span>
                    Multi-currency PCI-DSS encrypted processing in {selectedCurrency}. Crystals and Gold are attributed to your survivor inventory instantly without server delays.
                </span>
            </p>

            {/* Recent Orders Receipt Log */}
            {recent_payments.length > 0 && (
                <section className="equipment-section" style={{ marginTop: '45px' }}>
                    <div className="equipment-section-heading">
                        <div>
                            <span className="section-kicker">DISPATCH ARCHIVE</span>
                            <h2>Supply Ledger</h2>
                        </div>
                        <span>RECENT COMPLETED TRANSACTIONS</span>
                    </div>

                    <div style={{ background: '#19221f', border: '1px solid var(--land-line)', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--land-line)', color: 'var(--land-muted)', fontFamily: 'monospace', fontSize: '9px' }}>
                                    <th style={{ padding: '12px 18px' }}>TRANSACTION ID</th>
                                    <th style={{ padding: '12px 18px' }}>ASSETS GRANTED</th>
                                    <th style={{ padding: '12px 18px' }}>PAID AMOUNT</th>
                                    <th style={{ padding: '12px 18px' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_payments.map((p) => {
                                    const items = [];
                                    if (p.gems_granted > 0) items.push(`💎 +${Number(p.gems_granted).toLocaleString()} crystals`);
                                    if (p.gold_granted > 0) items.push(`🪙 +${Number(p.gold_granted).toLocaleString()} gold`);

                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #232d29' }}>
                                            <td style={{ padding: '12px 18px', fontFamily: 'monospace', color: '#9fb3ab' }}>
                                                {p.payment_id}
                                            </td>
                                            <td style={{ padding: '12px 18px', color: '#e9b85f', fontWeight: 'bold' }}>
                                                {items.join('  ·  ') || 'Supplies'}
                                            </td>
                                            <td style={{ padding: '12px 18px', color: '#edf0e9' }}>
                                                {p.currency} {Number(p.amount).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px 18px', color: '#86efac', textTransform: 'uppercase' }}>
                                                {p.status}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </PlayerShell>
    );
}
