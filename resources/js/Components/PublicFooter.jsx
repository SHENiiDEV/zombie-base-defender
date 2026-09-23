import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Mail, MapPin } from 'lucide-react';

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
