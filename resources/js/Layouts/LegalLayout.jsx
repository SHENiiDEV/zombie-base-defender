import React, { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, Check, Crosshair, FileText, Mail, Printer } from 'lucide-react';
import PublicHeader from '../Components/PublicHeader';
import PublicFooter from '../Components/PublicFooter';

const documents = [
    { key: 'terms', title: 'Terms of Service', subtitle: 'The rules of engagement', number: '01' },
    { key: 'privacy', title: 'Privacy Policy', subtitle: 'Your data, explained', number: '02' },
    { key: 'cookies', title: 'Cookie Policy', subtitle: 'What your browser remembers', number: '03' },
];

export default function LegalLayout({ type, title, introduction, summary, sections, company, authenticated }) {
    const { navigation } = usePage().props;
    const [activeSection, setActiveSection] = useState(sections[0]?.id);
    const hasCompanyDetails = company?.name && company?.number && company?.address && company?.email;

    useEffect(() => {
        const updateSection = () => {
            const current = [...sections, { id: 'contact' }].filter(section => {
                const element = document.getElementById(section.id);
                return element && element.getBoundingClientRect().top <= 180;
            }).at(-1);
            setActiveSection(current?.id || sections[0]?.id);
        };
        window.addEventListener('scroll', updateSection, { passive: true });
        updateSection();
        return () => window.removeEventListener('scroll', updateSection);
    }, [sections]);

    return (
        <div className="defender-landing legal-site">
            <Head title={`${title} — Zombie Base Defender`}><meta name="description" content={introduction} /></Head>
            <PublicHeader authenticated={authenticated} />
            <main id="main-content">
                <section className="legal-hero landing-container">
                    <div className="legal-breadcrumb"><Link href={navigation.home}>Home</Link><span>/</span><span>Legal & trust</span><span>/</span><span>{title}</span></div>
                    <div className="legal-hero-layout"><div><span className="section-kicker">CLEAR TERMS. NO HIDDEN ENEMIES.</span><h1>{title}<span>.</span></h1><p>{introduction}</p><div className="legal-document-meta"><span><FileText size={14} /> DOCUMENT {documents.find(item => item.key === type).number} / 03</span><span>UPDATED 22 SEPTEMBER 2026</span></div></div><div className="legal-seal" aria-hidden="true"><Crosshair size={66} strokeWidth={.7} /><span>SECTOR 09</span><small>LEGAL & TRUST</small></div></div>
                    <nav className="legal-document-tabs" aria-label="Legal documents">{documents.map(document => <Link key={document.key} href={navigation[document.key]} className={document.key === type ? 'active' : ''} aria-current={document.key === type ? 'page' : undefined}><span>{document.number}</span>{document.title}<ArrowUpRight size={15} /></Link>)}</nav>
                </section>
                <div className="legal-reading-layout landing-container">
                    <aside className="legal-sidebar"><span className="section-kicker">IN THIS DOCUMENT</span><nav aria-label="On this page">{[...sections, { id: 'contact', title: 'Contact & company details' }].map((section, index) => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined} className={activeSection === section.id ? 'active' : ''}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a>)}</nav><button onClick={() => window.print()} className="legal-print"><Printer size={16} /> Print / save as PDF</button></aside>
                    <article className="legal-document">
                        {!hasCompanyDetails && <div className="legal-draft-notice">DRAFT NOTICE · Company information is pending completion.</div>}
                        <div className="legal-summary"><span className="section-kicker">THE SHORT VERSION</span><h2>Before you read on.</h2><ul>{summary.map(item => <li key={item}><Check size={15} /><span>{item}</span></li>)}</ul><a href={`#${sections[0].id}`}>Read the full {type === 'terms' ? 'terms' : 'policy'} <ArrowDown size={14} /></a></div>
                        {sections.map((section, index) => <section className="legal-section" id={section.id} key={section.id}><span className="legal-section-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2>{section.content}</div></section>)}
                        <section className="legal-company" id="contact"><span className="section-kicker">A REAL POINT OF CONTACT</span><h2>Let’s keep things clear.</h2><p>Questions about these terms, your information or the service? Contact the operator using the details below.</p><dl>{company?.name && <div><dt>Company</dt><dd>{company.name}</dd></div>}{company?.number && <div><dt>Registration number</dt><dd>{company.number}</dd></div>}{company?.address && <div><dt>Registered address</dt><dd className="company-address">{company.address}</dd></div>}{company?.email && <div><dt>Email</dt><dd><a href={`mailto:${company.email}`}><Mail size={15} />{company.email}<ArrowUpRight size={14} /></a></dd></div>}</dl>{!hasCompanyDetails && <p className="company-pending">Complete operator details will appear here once available.</p>}</section>
                    </article>
                </div>
                <section className="legal-related landing-container"><div><span className="section-kicker">THE REST OF THE PICTURE</span><h2>Good to know.</h2></div><div>{documents.filter(document => document.key !== type).map(document => <Link key={document.key} href={navigation[document.key]}><span>{document.subtitle}</span><h3>{document.title}</h3><ArrowUpRight size={23} /></Link>)}</div></section>
            </main>
            <PublicFooter />
        </div>
    );
}
