export function calculateCustomGemPrice(gems, currency = 'USD') {
    const qty = Math.max(0, Number(gems) || 0);
    if (qty <= 0) return 0;

    let rate = 0.020;
    if (qty >= 100000) rate = 0.008;
    else if (qty >= 25000) rate = 0.010;
    else if (qty >= 5000) rate = 0.012;
    else if (qty >= 2500) rate = 0.014;
    else if (qty >= 1000) rate = 0.016;
    else if (qty >= 500) rate = 0.018;

    const usd = Math.round(qty * rate * 100) / 100;
    const mult = currency === 'GBP' ? 0.85 : 1.00;
    return Math.round(usd * mult * 100) / 100;
}

export function calculateCustomGoldPrice(gold, currency = 'USD') {
    const qty = Math.max(0, Number(gold) || 0);
    if (qty <= 0) return 0;

    let rate = 0.00125;
    if (qty >= 1000000) rate = 0.00035;
    else if (qty >= 100000) rate = 0.00050;
    else if (qty >= 25000) rate = 0.00070;
    else if (qty >= 5000) rate = 0.00090;
    else if (qty >= 1000) rate = 0.00110;

    const usd = Math.round(qty * rate * 100) / 100;
    const mult = currency === 'GBP' ? 0.85 : 1.00;
    return Math.round(usd * mult * 100) / 100;
}

export function calculateCustomOrderPrice(gems, gold, currency = 'USD') {
    const gemPrice = calculateCustomGemPrice(gems, currency);
    const goldPrice = calculateCustomGoldPrice(gold, currency);
    let total = gemPrice + goldPrice;

    if (gems > 0 && gold > 0) {
        total = total * 0.90; // 10% Combo Synergy Discount
    }

    if (total <= 0) return 0;
    return Math.max(0.99, Math.round(total * 100) / 100);
}

export function getCustomGemDiscountBadge(gems) {
    const qty = Number(gems) || 0;
    if (qty >= 100000) return '60% WHOLESALE TIER';
    if (qty >= 25000) return '50% MEGAVOLUME TIER';
    if (qty >= 5000) return '40% VOLUME BONUS';
    if (qty >= 2500) return '30% VOLUME BONUS';
    if (qty >= 1000) return '20% VOLUME BONUS';
    if (qty >= 500) return '10% VOLUME BONUS';
    return null;
}

export function getCustomGoldDiscountBadge(gold) {
    const qty = Number(gold) || 0;
    if (qty >= 1000000) return '72% STRATEGIC RESERVE';
    if (qty >= 100000) return '60% HEAVY CARGO TIER';
    if (qty >= 25000) return '44% DEPOT BONUS';
    if (qty >= 5000) return '28% MUNITIONS BONUS';
    if (qty >= 1000) return '12% STARTER BONUS';
    return null;
}

// Backward compatibility alias
export const calculateCustomPrice = calculateCustomGemPrice;
export const getCustomDiscountBadge = getCustomGemDiscountBadge;

export function formatPrice(amount, currency = 'USD', symbols = { USD: '$', EUR: '€', GBP: '£' }) {
    const sym = symbols[currency] || '$';
    return `${sym}${Number(amount).toFixed(2)}`;
}
