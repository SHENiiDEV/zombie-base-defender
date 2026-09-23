import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Lock, Mail, ShieldAlert, Sparkles, LoaderCircle, CheckCircle2, UserPlus, Radio } from 'lucide-react';
import PublicHeader from '../../Components/PublicHeader';
import PublicFooter from '../../Components/PublicFooter';

export default function Login({ status }) {
    const { navigation = {} } = usePage().props;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        router.post('/login', { email: email.trim(), password, remember }, {
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
            <Head title="Terminal Access / Commander Login — Zombie Base Defender" />
            <PublicHeader />

            <main id="main-content" style={{ flex: 1, padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: '#111719',
                    border: '1px solid #233235',
                    borderRadius: '2px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Golden laser top bar */}
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #e9b85f, #56d4c2)' }} />

                    <div style={{ padding: '36px 32px' }}>
                        {/* Eyebrow & Title */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#56d4c2', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 'bold' }}>
                                <Radio size={14} />
                                <span>[SECTOR 09 // TERMINAL AUTHENTICATION]</span>
                            </div>
                            <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Access Fortified Line
                            </h1>
                            <p style={{ color: '#8fa5a0', fontSize: '13px', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                                Enter your encrypted communicator email and access passcode to reconnect to your outpost command center.
                            </p>
                        </div>

                        {status && (
                            <div style={{ background: 'rgba(86, 212, 194, 0.12)', border: '1px solid #56d4c2', color: '#56d4c2', padding: '12px 14px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                                <CheckCircle2 size={16} />
                                <span>{status}</span>
                            </div>
                        )}

                        {errors.email && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 14px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                                <ShieldAlert size={16} />
                                <span>{errors.email}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div>
                                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '11px', color: '#8fa5a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    COMMUNICATOR EMAIL
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#56d4c2' }} />
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        placeholder="commander@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 42px',
                                            background: '#0a0f11',
                                            border: '1px solid #233235',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            borderRadius: '2px',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8fa5a0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        ACCESS PASSCODE
                                    </label>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#56d4c2' }} />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 42px',
                                            background: '#0a0f11',
                                            border: '1px solid #233235',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            borderRadius: '2px',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#8fa5a0', fontFamily: 'monospace' }}>
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        style={{ accentColor: '#e9b85f', width: '15px', height: '15px' }}
                                    />
                                    <span>REMEMBER SECURITY TOKEN</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: '10px',
                                    padding: '15px',
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
                                    boxShadow: '0 4px 20px rgba(233,184,95,0.35)',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle size={18} className="animate-spin" />
                                        <span>AUTHENTICATING ACCESS...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>AUTHENTICATE & ENTER OUTPOST</span>
                                        <ArrowUpRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{
                            marginTop: '28px',
                            paddingTop: '20px',
                            borderTop: '1px solid #1c2628',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}>
                            <span style={{ fontSize: '12px', color: '#7a8e89' }}>
                                First time reporting for defense duty?
                            </span>
                            <Link
                                href={navigation.register || '/register'}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#56d4c2',
                                    textDecoration: 'none',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    border: '1px solid rgba(86, 212, 194, 0.4)',
                                    padding: '8px 16px',
                                    borderRadius: '2px',
                                }}
                            >
                                <UserPlus size={14} />
                                <span>ENLIST NEW COMMANDER &rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
