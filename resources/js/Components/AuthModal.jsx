import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import { Crosshair, Lock, Mail, User as UserIcon, X, ShieldAlert, Sparkles, LoaderCircle, CheckCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'register' }) {
    const dialogRef = useRef(null);
    const [mode, setMode] = useState(initialMode); // 'register' | 'login'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        setError('');
        setSuccessMessage('');
        dialogRef.current?.showModal();

        return () => {
            dialogRef.current?.close();
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        const endpoint = mode === 'register' ? '/register' : '/login';
        const payload = mode === 'register' 
            ? { name: name.trim(), email: email.trim(), password }
            : { email: email.trim(), password };

        router.post(endpoint, payload, {
            preserveState: false,
            onSuccess: () => {
                setLoading(false);
                setSuccessMessage(mode === 'register' ? 'Clearance granted! Welcome to Sector 09.' : 'Access granted! Authenticating terminal...');
                setTimeout(() => {
                    onClose();
                }, 800);
            },
            onError: (errs) => {
                setLoading(false);
                const firstErr = Object.values(errs)[0];
                setError(typeof firstErr === 'string' ? firstErr : 'Authorization failed. Check parameters and retry.');
            },
        });
    };

    return createPortal(
        <dialog
            ref={dialogRef}
            className="topup-dialog"
            aria-labelledby="auth-modal-title"
            onCancel={onClose}
            onClick={(e) => {
                if (e.target === dialogRef.current) onClose();
            }}
            style={{ maxWidth: '460px' }}
        >
            <div className="topup-modal-card" style={{ padding: '28px 24px' }}>
                <div className="topup-modal-header" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(233,184,95,0.15)', border: '1px solid #e9b85f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9b85f' }}>
                            <Crosshair size={18} />
                        </div>
                        <div>
                            <span className="section-kicker" style={{ fontSize: '9px', letterSpacing: '1.5px', color: '#56d4c2' }}>
                                [SECTOR 09 IDENTIFICATION TERMINAL]
                            </span>
                            <h2 id="auth-modal-title" style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase', color: '#fff' }}>
                                {mode === 'register' ? 'Enlist New Commander' : 'Access Defense Link'}
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="topup-close"
                        aria-label="Close terminal authentication modal"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Mode Selector Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); }}
                        style={{
                            padding: '8px 12px',
                            background: mode === 'register' ? '#e9b85f' : '#141c1e',
                            color: mode === 'register' ? '#101617' : '#94a7a3',
                            border: '1px solid ' + (mode === 'register' ? '#e9b85f' : '#233235'),
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}
                    >
                        Enlist / Register
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); }}
                        style={{
                            padding: '8px 12px',
                            background: mode === 'login' ? '#e9b85f' : '#141c1e',
                            color: mode === 'login' ? '#101617' : '#94a7a3',
                            border: '1px solid ' + (mode === 'login' ? '#e9b85f' : '#233235'),
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}
                    >
                        Terminal Log In
                    </button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                        <ShieldAlert size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div style={{ background: 'rgba(86, 212, 194, 0.12)', border: '1px solid #56d4c2', color: '#56d4c2', padding: '10px 14px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                        <CheckCircle size={16} />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mode === 'register' && (
                        <div>
                            <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#899e98', marginBottom: '5px', textTransform: 'uppercase' }}>
                                Commander Callsign / Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#56d4c2' }} />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Major Vance"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px 10px 34px',
                                        background: '#0e1416',
                                        border: '1px solid #233235',
                                        color: '#ffffff',
                                        fontSize: '13px',
                                        fontFamily: 'inherit',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#899e98', marginBottom: '5px', textTransform: 'uppercase' }}>
                            Encrypted Communicator Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#56d4c2' }} />
                            <input
                                type="email"
                                required
                                placeholder="commander@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 34px',
                                    background: '#0e1416',
                                    border: '1px solid #233235',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '10px', color: '#899e98', marginBottom: '5px', textTransform: 'uppercase' }}>
                            Access Passcode
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#56d4c2' }} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 34px',
                                    background: '#0e1416',
                                    border: '1px solid #233235',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                    </div>

                    {mode === 'register' && (
                        <div style={{ background: '#0a0f11', border: '1px dashed #203134', padding: '10px 12px', fontSize: '11px', color: '#899e98', marginTop: '2px' }}>
                            <div style={{ color: '#e9b85f', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Sparkles size={12} /> INITIAL SUPPLY DROP INCLUDED:
                            </div>
                            <div>&bull; +500 Starting Gold &bull; +250 Crystals &bull; Kinetic Pistol</div>
                            <div style={{ marginTop: '5px', fontSize: '10px', color: '#56d4c2', fontFamily: 'monospace' }}>
                                [Notification transmission will dispatch from info@zombiebasedefender.com]
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '8px',
                            padding: '12px',
                            background: '#e9b85f',
                            color: '#101617',
                            border: 'none',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            letterSpacing: '1px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(233,184,95,0.3)',
                        }}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle size={16} className="animate-spin" />
                                <span>TRANSMITTING CLEARANCE...</span>
                            </>
                        ) : mode === 'register' ? (
                            'ENLIST & ENTER DEFENSE LINE \u2192'
                        ) : (
                            'AUTHENTICATE ACCESS \u2192'
                        )}
                    </button>
                </form>
            </div>
        </dialog>,
        document.body
    );
}
