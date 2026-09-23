import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    Coins,
    Flame,
    Gem,
    LoaderCircle,
    RotateCcw,
    ShieldCheck,
    Sliders,
    Sparkles,
    X,
} from 'lucide-react';
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
            {Array.from({ length: Math.min(5, count) }, (_, i) => {
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

export default function TopUpModal({ isOpen, onClose, currentGems = 0 }) {
    const { gem_packs = {}, navigation = {} } = usePage().props || {};
    const dialogRef = useRef(null);
    const busyRef = useRef(false);

    const [activeTab, setActiveTab] = useState('bundle'); // 'bundle' | 'gems' | 'gold' | 'custom'
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [selected, setSelected] = useState('bundle_operative');
    const [customGems, setCustomGems] = useState(1000);
    const [customGold, setCustomGold] = useState(25000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [credited, setCredited] = useState(null);

    const packList = Object.values(gem_packs);
    const bundles = packList.filter((p) => p.category === 'bundle');
    const crystalPacks = packList.filter((p) => p.category === 'gems');
    const goldPacks = packList.filter((p) => p.category === 'gold');

    const currentPacks =
        activeTab === 'bundle' ? bundles : activeTab === 'gems' ? crystalPacks : goldPacks;

    const pack = gem_packs[selected] || currentPacks[0] || packList[0];

    useEffect(() => {
        if (!isOpen) return;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        setError('');
        setCredited(null);
        dialogRef.current?.showModal();
        return () => {
            dialogRef.current?.close();
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getPriceFormatted = (item, curr) => {
        const amount = item?.prices?.[curr] ?? item?.prices?.['USD'] ?? 1.99;
        return formatPrice(amount, curr);
    };

    const parsedCustomGems = Math.max(0, parseInt(customGems, 10) || 0);
    const parsedCustomGold = Math.max(0, parseInt(customGold, 10) || 0);

    const customGemSubtotal = calculateCustomGemPrice(parsedCustomGems, selectedCurrency);
    const customGoldSubtotal = calculateCustomGoldPrice(parsedCustomGold, selectedCurrency);
    const customOrderTotal = calculateCustomOrderPrice(parsedCustomGems, parsedCustomGold, selectedCurrency);
    const customFormattedPrice = formatPrice(customOrderTotal, selectedCurrency);
    const customGemBadge = getCustomGemDiscountBadge(parsedCustomGems);
    const customGoldBadge = getCustomGoldDiscountBadge(parsedCustomGold);
    const hasComboDiscount = parsedCustomGems > 0 && parsedCustomGold > 0;

    const handleBuy = () => {
        if (busyRef.current) return;
        busyRef.current = true;
        setLoading(true);
        setError('');

        const isCustom = activeTab === 'custom';

        if (isCustom && parsedCustomGems <= 0 && parsedCustomGold <= 0) {
            setError('Please enter at least 1 crystal or 1 gold coin.');
            busyRef.current = false;
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
            : { pack_id: selected, currency: selectedCurrency };

        router.post(navigation.topUp || '/payments/create-session', payload, {
            preserveScroll: true,
            onSuccess: () => {
                if (isCustom) {
                    const parts = [];
                    if (parsedCustomGems > 0) parts.push(`+${parsedCustomGems.toLocaleString()} crystals`);
                    if (parsedCustomGold > 0) parts.push(`+${parsedCustomGold.toLocaleString()} gold`);
                    setCredited(parts.join(' and '));
                } else {
                    const parts = [];
                    if (pack?.gems > 0) parts.push(`+${pack.gems.toLocaleString()} crystals`);
                    if (pack?.gold > 0) parts.push(`+${pack.gold.toLocaleString()} gold`);
                    setCredited(parts.join(' and '));
                }
            },
            onError: () => setError('Transaction failed. Please verify and retry.'),
            onFinish: () => {
                busyRef.current = false;
                setLoading(false);
            },
        });
    };

    const close = () => {
        if (!busyRef.current) onClose();
    };

    return createPortal(
        <dialog
            ref={dialogRef}
            className="defender-landing crystal-dialog"
            aria-labelledby="crystal-title"
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <div className="crystal-dialog-body" style={{ maxWidth: '880px' }}>
                <button
                    className="icon-button dialog-close"
                    onClick={close}
                    disabled={loading}
                    aria-label="Close crystal shop"
                >
                    <X size={20} />
                </button>

                <span className="section-kicker">SUPPLY DEPOT // SECTOR 09</span>
                <h2 id="crystal-title">Quartermaster Logistics.</h2>
                <p className="shop-intro">
                    Equip combat war chests, rare nano-crystals, or gold munitions with instant fulfillment.
                </p>

                {/* Balance & Currency Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div className="shop-balance" style={{ margin: 0, padding: '9px 15px' }}>
                        <span>
                            <Gem size={15} /> Balance:
                        </span>
                        <strong>
                            {currentGems.toLocaleString('en-US')} <small>crystals</small>
                        </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111a16', padding: '4px', border: '1px solid #36453b' }}>
                        <span style={{ fontSize: '9px', color: '#8aa195', fontFamily: 'monospace', paddingLeft: '4px' }}>CURRENCY:</span>
                        {['USD', 'EUR', 'GBP'].map((c) => (
                            <button
                                key={c}
                                type="button"
                                style={{
                                    border: 0,
                                    background: selectedCurrency === c ? 'var(--land-accent)' : 'transparent',
                                    color: selectedCurrency === c ? '#101617' : '#99aba1',
                                    fontWeight: selectedCurrency === c ? 'bold' : 'normal',
                                    fontSize: '10px',
                                    padding: '3px 7px',
                                    fontFamily: 'monospace',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setSelectedCurrency(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Switcher Tabs */}
                <div className="equipment-tabs" style={{ marginBottom: '18px', borderBottom: '1px solid var(--land-line)' }}>
                    <button
                        type="button"
                        className={activeTab === 'bundle' ? 'active' : ''}
                        onClick={() => {
                            setActiveTab('bundle');
                            if (bundles[0]) setSelected(bundles[0].id);
                        }}
                    >
                        <Flame size={14} /> Bundles
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'gems' ? 'active' : ''}
                        onClick={() => {
                            setActiveTab('gems');
                            if (crystalPacks[0]) setSelected(crystalPacks[0].id);
                        }}
                    >
                        <Gem size={14} /> Crystals
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'gold' ? 'active' : ''}
                        onClick={() => {
                            setActiveTab('gold');
                            if (goldPacks[0]) setSelected(goldPacks[0].id);
                        }}
                    >
                        <Coins size={14} /> Gold
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'custom' ? 'active' : ''}
                        onClick={() => setActiveTab('custom')}
                    >
                        <Sliders size={14} /> Custom
                    </button>
                </div>

                {credited !== null ? (
                    <div className="topup-success" role="status">
                        <span className="success-seal">
                            <Check size={35} />
                        </span>
                        <span className="section-kicker">SUPPLIES CREDITED</span>
                        <h3>{credited}</h3>
                        <p>Assets successfully granted to your account inventory.</p>
                        <button onClick={close} className="landing-button primary">
                            Back To Battle <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        {activeTab === 'custom' ? (
                            <div style={{ background: '#121c17', border: '1px solid #3b4e42', padding: '18px 16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* DUAL INPUTS */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                    {/* Crystals Input */}
                                    <div style={{ background: '#0e1713', border: '1px solid #29382e', padding: '14px 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ color: '#67e8f9', fontSize: '13px', fontFamily: '"Oswald", sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Gem size={14} /> CRYSTALS
                                            </span>
                                            {customGemBadge && (
                                                <span style={{ fontSize: '8px', color: '#86efac', border: '1px solid #22c55e', padding: '1px 5px', fontFamily: 'monospace' }}>
                                                    {customGemBadge}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
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
                                                    background: '#16231c',
                                                    border: '1px solid #4a5e52',
                                                    color: '#67e8f9',
                                                    font: '20px "Oswald", sans-serif',
                                                    padding: '5px 10px',
                                                    width: '100%',
                                                }}
                                                placeholder="0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCustomGems(0)}
                                                title="Clear crystals"
                                                style={{
                                                    background: '#1b2721',
                                                    border: '1px solid #3d4f44',
                                                    color: '#95aaa0',
                                                    padding: '9px 8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <RotateCcw size={12} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {[500, 2500, 10000, 100000].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setCustomGems((prev) => (Number(prev) || 0) + num)}
                                                    style={{
                                                        background: '#15201a',
                                                        border: '1px solid #3b4e42',
                                                        color: '#b6cac0',
                                                        fontSize: '9px',
                                                        padding: '3px 6px',
                                                        cursor: 'pointer',
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    +{num.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gold Input */}
                                    <div style={{ background: '#0e1713', border: '1px solid #29382e', padding: '14px 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ color: 'var(--land-accent)', fontSize: '13px', fontFamily: '"Oswald", sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Coins size={14} /> GOLD MUNITIONS
                                            </span>
                                            {customGoldBadge && (
                                                <span style={{ fontSize: '8px', color: '#fed7aa', border: '1px solid #d97706', padding: '1px 5px', fontFamily: 'monospace' }}>
                                                    {customGoldBadge}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
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
                                                    background: '#16231c',
                                                    border: '1px solid #4a5e52',
                                                    color: '#fed7aa',
                                                    font: '20px "Oswald", sans-serif',
                                                    padding: '5px 10px',
                                                    width: '100%',
                                                }}
                                                placeholder="0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCustomGold(0)}
                                                title="Clear gold"
                                                style={{
                                                    background: '#1b2721',
                                                    border: '1px solid #3d4f44',
                                                    color: '#95aaa0',
                                                    padding: '9px 8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <RotateCcw size={12} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {[10000, 50000, 250000, 1000000].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setCustomGold((prev) => (Number(prev) || 0) + num)}
                                                    style={{
                                                        background: '#15201a',
                                                        border: '1px solid #3b4e42',
                                                        color: '#b6cac0',
                                                        fontSize: '9px',
                                                        padding: '3px 6px',
                                                        cursor: 'pointer',
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    +{num.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* COMBO BONUS BANNER */}
                                {hasComboDiscount && (
                                    <div style={{ background: '#19261a', border: '1px solid #486e41', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac', fontSize: '10px', fontFamily: 'monospace' }}>
                                        <Sparkles size={14} />
                                        <span>★ 10% COMBO DISCOUNT APPLIED FOR REQUISITIONING BOTH ASSETS</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="gem-pack-grid" role="group" aria-label="Select supply pack" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', maxHeight: '340px', overflowY: 'auto' }}>
                                {currentPacks.map((item) => {
                                    const isSelected = selected === item.id;
                                    const price = getPriceFormatted(item, selectedCurrency);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className={`gem-pack ${isSelected ? 'selected' : ''}`}
                                            aria-pressed={isSelected}
                                            disabled={loading}
                                            onClick={() => setSelected(item.id)}
                                            style={{ padding: '12px 10px 0' }}
                                        >
                                            <span className="pack-topline" style={{ fontSize: '8px' }}>
                                                {item.badge || item.label}
                                                <span className="pack-check">{isSelected && <Check size={11} />}</span>
                                            </span>

                                            <CrystalCluster count={item.gems ? 2 : 1} />

                                            <strong style={{ fontSize: '24px' }}>
                                                {item.gems > 0 && `${item.gems.toLocaleString()}💎 `}
                                                {item.gold > 0 && `${item.gold.toLocaleString()}🪙`}
                                            </strong>
                                            <span className="pack-unit" style={{ fontSize: '7px' }}>
                                                {item.category === 'bundle' ? 'COMBO VALUE' : item.category === 'gold' ? 'GOLD MUNITIONS' : 'CRYSTALS'}
                                            </span>
                                            <span className="pack-price" style={{ fontSize: '13px', padding: '10px 0' }}>{price}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {error && <p role="alert" className="action-message error">{error}</p>}

                        <div className="shop-checkout">
                            <span>
                                Selected:
                                <strong>
                                    {activeTab === 'custom' ? (
                                        parsedCustomGems > 0 || parsedCustomGold > 0 ? (
                                            <>
                                                {parsedCustomGems > 0 && `${parsedCustomGems.toLocaleString()}💎 `}
                                                {parsedCustomGold > 0 && `${parsedCustomGold.toLocaleString()}🪙 `}
                                                · {customFormattedPrice}
                                            </>
                                        ) : (
                                            'Specify custom amounts above'
                                        )
                                    ) : (
                                        `${pack?.label || 'Pack'} · ${pack && getPriceFormatted(pack, selectedCurrency)}`
                                    )}
                                </strong>
                            </span>

                            <button
                                type="button"
                                className="landing-button primary"
                                disabled={
                                    loading ||
                                    (activeTab === 'custom'
                                        ? parsedCustomGems <= 0 && parsedCustomGold <= 0
                                        : !pack)
                                }
                                onClick={handleBuy}
                            >
                                {loading ? <LoaderCircle className="loading-spin" size={18} /> : <Gem size={18} />}
                                {loading ? 'Processing…' : 'Instant Top-Up'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </>
                )}

                <p className="shop-disclaimer">
                    <ShieldCheck size={16} />
                    <span>
                        Instant delivery in {selectedCurrency}. Crystals and Gold credited immediately.
                    </span>
                </p>
            </div>
        </dialog>,
        document.body
    );
}
