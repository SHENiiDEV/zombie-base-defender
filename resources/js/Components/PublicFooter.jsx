import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function PublicFooter() {
    const { navigation = {}, company = {} } = usePage().props;

    const companyName = company?.name || 'Zombie Base Defender Ltd.';
    const companyNumber = company?.number || 'OUTPOST-SEC-09-881';
    const companyAddress = company?.address || 'Sector 09 Fortification Line, Perimeter Outpost';
    const companyEmail = company?.email || 'info@zombiebasedefender.com';

    return (
        <footer className="public-footer">
            <div className="public-footer-top">
                <Link href={navigation.home || '/'} className="landing-brand">
                    <Crosshair size={26} />
                    <span>ZOMBIE BASE<small>DEFENDER</small></span>
                </Link>
                <p>The world went quiet.<br />Your outpost didn’t.</p>
                <Link href={navigation.game || '/'} className="footer-game-link">
                    Take your position <ArrowUpRight size={19} />
                </Link>
            </div>

            {/* Operator Company Details */}
            <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '18px 0',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#8ba29d'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#e9b85f', fontWeight: 'bold' }}>OPERATOR:</span>
                    <strong style={{ color: '#edf0e9' }}>{companyName}</strong>
                    {companyNumber && (
                        <span style={{ color: '#56d4c2' }}>[REG: {companyNumber}]</span>
                    )}
                    {companyAddress && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            &bull; <MapPin size={12} style={{ color: '#8ba29d' }} /> {companyAddress}
                        </span>
                    )}
                </div>
                {companyEmail && (
                    <div>
                        <a
                            href={`mailto:${companyEmail}`}
                            style={{
                                color: '#56d4c2',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <Mail size={12} />
                            <span>{companyEmail}</span>
                        </a>
                    </div>
                )}
            </div>

            {/* Payment Systems & Security Compliance Logos */}
            <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px 0',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '14px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#7a8e89', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} style={{ color: '#56d4c2' }} /> SECURE PAYMENTS //
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
                        }}>
                            <img src="/images/payments/visa.png" alt="Visa" style={{ height: '18px', width: 'auto', display: 'block' }} />
                        </div>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
                        }}>
                            <img src="/images/payments/mastercard.png" alt="Mastercard" style={{ height: '22px', width: 'auto', display: 'block' }} />
                        </div>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
                        }}>
                            <img src="/images/payments/pci-dss.png" alt="PCI DSS Compliant" style={{ height: '22px', width: 'auto', display: 'block' }} />
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#56d4c2', letterSpacing: '1px' }}>
                    [ENCRYPTED 256-BIT SSL GATEWAY]
                </div>
            </div>

            <div className="public-footer-bottom">
                <span>© {new Date().getFullYear()} {companyName}</span>
                <nav aria-label="Legal information">
                    <Link href={navigation.terms || '/terms'}>Terms of Service</Link>
                    <Link href={navigation.privacy || '/privacy'}>Privacy Policy</Link>
                    <Link href={navigation.cookies || '/cookies'}>Cookie Policy</Link>
                </nav>
                <span>BUILT TO HOLD.</span>
            </div>
        </footer>
    );
}
