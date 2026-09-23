import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Mail, MapPin } from 'lucide-react';

export default function PublicFooter() {
    const { navigation = {}, company = {} } = usePage().props;
    const hasCompany = Boolean(company?.name);

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

            {hasCompany && (
                <div style={{
                    borderTop: '1px solid var(--land-line)',
                    padding: '16px 0',
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
                        <strong style={{ color: '#edf0e9' }}>{company.name}</strong>
                        {company.number && (
                            <span style={{ color: '#56d4c2' }}>[REG: {company.number}]</span>
                        )}
                        {company.address && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                &bull; <MapPin size={12} style={{ color: '#8ba29d' }} /> {company.address}
                            </span>
                        )}
                    </div>
                    {company.email && (
                        <div>
                            <a
                                href={`mailto:${company.email}`}
                                style={{
                                    color: '#56d4c2',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <Mail size={12} />
                                <span>{company.email}</span>
                            </a>
                        </div>
                    )}
                </div>
            )}

            <div className="public-footer-bottom">
                <span>© {new Date().getFullYear()} {company?.name || 'Zombie Base Defender'}</span>
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
