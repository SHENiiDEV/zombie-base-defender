import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    Crosshair,
    Globe,
    Home,
    LoaderCircle,
    Lock,
    Mail,
    MapPin,
    Phone,
    Radio,
    ShieldAlert,
    Sparkles,
    User,
    UserCheck,
} from 'lucide-react';
import PublicHeader from '../../Components/PublicHeader';
import PublicFooter from '../../Components/PublicFooter';
import { COUNTRIES } from '../../Utils/countries';

export default function Register({ countries = COUNTRIES }) {
    const { navigation = {} } = usePage().props;

    const [form, setForm] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        date_of_birth: '',
        address_line1: '',
        city: '',
        country: 'United States',
        postal_code: '',
        terms: false,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        if (!form.terms) {
            setErrors({ terms: 'You must agree to the Terms & Conditions and Privacy Policy to enlist.' });
            return;
        }

        setLoading(true);

        router.post('/register', form, {
            onError: (errs) => {
                setLoading(false);
                setErrors(errs);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    return (
        <div className="defender-landing legal-site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head title="Enlist New Commander / Registration — Zombie Base Defender" />
            <PublicHeader />

            <main id="main-content" style={{ flex: 1, padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '720px',
                    background: '#111719',
                    border: '1px solid #233235',
                    borderRadius: '2px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Golden laser top bar */}
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #e9b85f, #56d4c2)' }} />

                    <div style={{ padding: '36px 36px 40px' }}>
                        {/* Header */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#56d4c2', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 'bold' }}>
                                <Radio size={14} />
                                <span>[SECTOR 09 // RECON PERSONNEL ENROLLMENT]</span>
                            </div>
                            <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Enlist New Commander
                            </h1>
                            <p style={{ color: '#8fa5a0', fontSize: '13px', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                                Create your verified defensive clearance. Provide your verified identification and operational territory address to initiate resource drops and combat access.
                            </p>
                        </div>

                        {/* Top Global Error Alert if any */}
                        {Object.keys(errors).length > 0 && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#fca5a5', padding: '14px', fontSize: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                    <ShieldAlert size={16} />
                                    <span>ENLISTMENT VERIFICATION REJECTED:</span>
                                </div>
                                <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                                    {Object.values(errors).map((err, i) => (
                                        <li key={i}>{typeof err === 'string' ? err : Object.values(err)[0]}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* SECTION 1: PERSONAL IDENTITY */}
                            <div>
                                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#e9b85f', fontWeight: 'bold', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} />
                                    <span>01 // COMMANDER IDENTIFICATION</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            FIRST NAME *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Alexander"
                                            value={form.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            SURNAME *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Vance"
                                            value={form.surname}
                                            onChange={(e) => handleChange('surname', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            DATE OF BIRTH *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            max={new Date().toISOString().split('T')[0]}
                                            value={form.date_of_birth}
                                            onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: COMMUNICATIONS & AUTHENTICATION */}
                            <div>
                                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#e9b85f', fontWeight: 'bold', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Lock size={14} />
                                    <span>02 // CREDENTIALS & SECURE DISPATCH</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            COMMUNICATOR EMAIL *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="commander@domain.com"
                                            value={form.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            style={inputStyle}
                                        />
                                        <span style={{ fontSize: '10px', color: '#56d4c2', fontFamily: 'monospace', display: 'block', marginTop: '4px' }}>
                                            [Invoices & clearance dispatch to this address]
                                        </span>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            PHONE NUMBER *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+1 (555) 019-2834"
                                            value={form.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            ACCESS PASSCODE (MIN 6 CHARS) *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: PHYSICAL ADDRESS */}
                            <div>
                                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#e9b85f', fontWeight: 'bold', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={14} />
                                    <span>03 // RESIDENTIAL & BILLING ADDRESS</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            1. STREET, HOUSE NUMBER, APARTMENT / SUITE *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                                            value={form.address_line1}
                                            onChange={(e) => handleChange('address_line1', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                2. CITY *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Springfield"
                                                value={form.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                3. COUNTRY *
                                            </label>
                                            <select
                                                required
                                                value={form.country}
                                                onChange={(e) => handleChange('country', e.target.value)}
                                                style={{
                                                    ...inputStyle,
                                                    cursor: 'pointer',
                                                    backgroundColor: '#0a0f11',
                                                }}
                                            >
                                                {countries.map((c) => (
                                                    <option key={c} value={c} style={{ background: '#111719', color: '#fff' }}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                4. POST CODE / ZIP *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. 97477"
                                                value={form.postal_code}
                                                onChange={(e) => handleChange('postal_code', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* INITIAL LOADOUT CALLOUT */}
                            <div style={{ background: '#0a0f11', border: '1px solid #1c2b2e', padding: '14px 18px', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ color: '#e9b85f', background: 'rgba(233,184,95,0.1)', padding: '10px', borderRadius: '2px' }}>
                                    <Sparkles size={20} />
                                </div>
                                <div style={{ fontSize: '12px', color: '#8fa5a0' }}>
                                    <div style={{ color: '#e9b85f', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>
                                        AUTOMATIC COMBAT ENROLLMENT PACK:
                                    </div>
                                    <div style={{ color: '#ffffff', marginTop: '2px' }}>
                                        +500 Survivor Gold &bull; +250 Vault Crystals &bull; Kinetic Pistol Mk I &bull; Nominal Barricade
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: TERMS & CONDITIONS CHECKBOX */}
                            <div style={{ padding: '12px 14px', background: '#0a0f11', border: '1px solid ' + (errors.terms ? '#ef4444' : '#233235'), borderRadius: '2px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '12px', color: '#cad8d4', lineHeight: '1.6' }}>
                                    <input
                                        type="checkbox"
                                        required
                                        checked={form.terms}
                                        onChange={(e) => handleChange('terms', e.target.checked)}
                                        style={{ accentColor: '#e9b85f', width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                                    />
                                    <span>
                                        I agree to the{' '}
                                        <Link
                                            href={navigation.terms || '/terms'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#e9b85f', textDecoration: 'underline', fontWeight: 'bold' }}
                                        >
                                            Terms & Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link
                                            href={navigation.privacy || '/privacy'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#e9b85f', textDecoration: 'underline', fontWeight: 'bold' }}
                                        >
                                            Privacy Policy
                                        </Link>.
                                    </span>
                                </label>
                                {errors.terms && (
                                    <div style={{ color: '#ef4444', fontSize: '11px', fontFamily: 'monospace', marginTop: '6px' }}>
                                        {errors.terms}
                                    </div>
                                )}
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '16px',
                                    background: '#e9b85f',
                                    color: '#101617',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    letterSpacing: '1.5px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    borderRadius: '2px',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 4px 25px rgba(233,184,95,0.4)',
                                    marginTop: '4px',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle size={18} className="animate-spin" />
                                        <span>ENROLLING COMMANDER CLEARANCE...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>CONFIRM ENLISTMENT & ENTER OUTPOST</span>
                                        <ArrowUpRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Switch to login */}
                        <div style={{
                            marginTop: '28px',
                            paddingTop: '20px',
                            borderTop: '1px solid #1c2628',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '12px',
                            color: '#7a8e89',
                        }}>
                            <span>Already enlisted in Sector 09?</span>
                            <Link
                                href={navigation.login || '/login'}
                                style={{
                                    color: '#56d4c2',
                                    textDecoration: 'none',
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Access Terminal &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: '#0a0f11',
    border: '1px solid #233235',
    color: '#ffffff',
    fontSize: '13px',
    fontFamily: 'inherit',
    borderRadius: '2px',
    boxSizing: 'border-box',
    outline: 'none',
};
