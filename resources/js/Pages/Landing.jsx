import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowRight, ArrowUpRight, Crosshair, Gem, Radio, Shield, Wrench, Zap } from 'lucide-react';
import EquipmentArt from '../Components/EquipmentArt';
import PublicHeader from '../Components/PublicHeader';
import PublicFooter from '../Components/PublicFooter';
import HeroVideo from '../Components/HeroVideo';

export default function Landing({ is_authenticated = false, player, featured_skins = [] }) {
    const { navigation } = usePage().props;
    const playTarget = is_authenticated ? (navigation.game || '/game') : (navigation.login || '/login');

    return (
        <div className="defender-landing public-landing">
            <Head title="Zombie Base Defender — Hold the last outpost">
                <meta name="description" content="One outpost. Endless infected. Hold the barricade, upgrade your weapons and survive the next wave in Zombie Base Defender. Play in your browser." />
            </Head>
            <PublicHeader authenticated={is_authenticated} />
            <main id="main-content">
                <section className="landing-hero campaign-hero" aria-labelledby="campaign-title">
                    <HeroVideo />
                    <div className="hero-shade" />
                    <div className="landing-container campaign-hero-content">
                        <span className="section-kicker"><span className="campaign-status" /> SECTOR 09 · THE LAST OUTPOST</span>
                        <h1 id="campaign-title">THE WORLD FELL.<br />YOUR OUTPOST<br /><em>STILL STANDS.</em></h1>
                        <p>Beyond the wall, the infected are closing in.<br />Build your firepower. Hold your ground. Survive the next wave.</p>
                        <div className="hero-actions"><Link href={playTarget} className="landing-button primary"><Crosshair size={19} /> {is_authenticated ? 'RETURN TO POSITION' : 'TAKE YOUR POSITION'} <ArrowUpRight size={21} /></Link><a href="#about" className="hero-secondary">Explore the game <ArrowDown size={16} /></a></div>
                        <span className="campaign-hero-note">FREE TO START <i /> NO DOWNLOAD <i /> PLAY IN YOUR BROWSER</span>
                    </div>
                    <div className="campaign-hero-bottom landing-container"><span><Radio size={13} /> ONE SIGNAL STILL ALIVE</span><span>OUTPOST 09 / STAND YOUR GROUND</span></div>
                </section>
                <div className="campaign-signal"><span><i /> TRANSMISSION RECEIVED</span><p>“If you can hear this, there’s still something worth defending.”</p><span>SECTOR 09</span></div>

                <section className="landing-container campaign-about" id="about">
                    <div className="campaign-section-heading"><div><span className="section-kicker">A SIMPLE MISSION. AN IMPOSSIBLE NIGHT.</span><h2>Everything outside<br />wants <em>in.</em></h2></div><p>You’re the last line between your outpost and the horde.<br />Every wave earns another chance to build something stronger.</p></div>
                    <div className="campaign-mechanics">
                        {[{ icon: Crosshair, step: '01 / HOLD', title: 'Make every shot count.', text: 'Aim into the swarm. Keep an eye on your ammunition. Stop the infected before they reach your wall.' }, { icon: Wrench, step: '02 / ADAPT', title: 'Come back stronger.', text: 'Turn gold into better damage, faster reloads and a tougher barricade. Choose what the next wave demands.' }, { icon: Shield, step: '03 / SURVIVE', title: 'Earn another dawn.', text: 'Clear the perimeter, catch your breath and go again. Every fifth wave brings something much bigger.' }].map(({ icon: Icon, step, title, text }) => <article key={step}><div><Icon size={23} /><span>{step}</span></div><h3>{title}</h3><p>{text}</p></article>)}
                    </div>
                </section>

                <section className="campaign-threats" id="threats">
                    <div className="landing-container"><div className="campaign-section-heading"><div><span className="section-kicker">KNOW WHAT’S COMING</span><h2>They used to<br />be <em>human.</em></h2></div><p>Different instincts. The same hunger.<br />Learn their patterns before they reach the barricade.</p></div>
                        <div className="infected-layout">
                            <article className="infected-boss">
                                <img src="/infected-goliath.webp" loading="lazy" width="1536" height="1024" alt="An enormous armored mutant looms through the smoke of the quarantine zone" />
                                <div className="infected-boss-shade" />
                                <div className="infected-boss-top"><span>THREAT DOSSIER / T-99</span><span className="threat-alert">EXTREME THREAT</span></div>
                                <div className="infected-boss-copy"><span className="section-kicker">WHEN THE GROUND STARTS SHAKING</span><h3>THE<br />GOLIATH.</h3><p>Built like a siege engine.<br />And your wall is in its way.</p><div className="boss-traits"><span>HEAVY ARMOR</span><span>RELENTLESS ADVANCE</span></div><Link href={playTarget} className="infected-challenge">Think you can hold? <ArrowUpRight size={19} /></Link></div>
                                <span className="concept-caption">FIELD IMPRESSION / CONCEPT ART</span>
                            </article>
                            <div className="infected-support">
                                <article className="infected-profile walker-profile"><img src="/infected-walker.webp" loading="lazy" width="1024" height="1536" alt="A gaunt infected walker in a torn utility coat" /><div className="infected-profile-copy"><span>A-01 / THE SWARM</span><h3>Feral Walker</h3><p>One is a target.<br />A hundred is a problem.</p><small>STEADY · OVERWHELMING NUMBERS</small></div></article>
                                <article className="infected-profile runner-profile"><img src="/infected-runner.webp" loading="lazy" width="1024" height="1536" alt="An agile runner with faint teal veins crouches ready to attack" /><div className="infected-profile-copy"><span>B-07 / THE PURSUIT</span><h3>Neon Sprinter</h3><p>Blink, and it’s<br />already at your wall.</p><small>FAST · PRIORITY TARGET</small></div></article>
                            </div>
                        </div>
                        <div className="infected-footnote"><span>THE INFECTION DOESN’T REST.</span><p>Neither does the next wave.</p><Crosshair size={19} /></div>
                    </div>
                </section>

                <section className="campaign-outpost landing-container" id="base">
                    <div className="outpost-image"><img src="/defender-key-art.webp" loading="lazy" width="1536" height="1024" alt="The barricade overlooking the deserted streets of Sector 09" /><div className="outpost-image-label"><span><Radio size={15} /> SECTOR 09</span><strong>THE LAST LIGHT<br />IN THE CITY.</strong></div><span className="outpost-stamp">HOLD<br />FAST.</span></div>
                    <div className="outpost-story"><span className="section-kicker">MORE THAN A WALL</span><h2>Your outpost.<br />Your <em>last word.</em></h2><p>Scrap, concrete and the stubborn refusal to give up. This is where you make your stand.</p><div className="outpost-features"><div><Shield size={21} /><span><strong>Reinforce the perimeter</strong><small>Invest in more barricade health between waves.</small></span></div><div><Zap size={21} /><span><strong>Build your firepower</strong><small>Pistol, shotgun or minigun. Find your way to hold.</small></span></div><div><Wrench size={21} /><span><strong>Make it yours</strong><small>Weapon finishes and barrier skins give your outpost its identity.</small></span></div></div><Link href={playTarget} className="outpost-link">{is_authenticated ? `Return to your outpost${player?.name ? `, ${player.name}` : ''}` : 'Start defending'}<ArrowRight size={18} /></Link></div>
                </section>

                <section className="campaign-arsenal landing-container" id="arsenal"><div className="campaign-section-heading"><div><span className="section-kicker">SURVIVE WITH CHARACTER</span><h2>Leave your <em>mark.</em></h2></div><Link href={navigation.wardrobe} className="section-link">Explore the collection <ArrowUpRight size={17} /></Link></div><div className="skins-grid">{featured_skins.map(skin => <Link href={navigation.wardrobe} className="skin-card" key={skin.id} style={{ '--skin-color': skin.bullet_color || skin.wall_color }}><div className="skin-card-top"><span className={`rarity ${skin.rarity === 'Legendary' ? 'legendary' : ''}`}>{skin.rarity}</span><ArrowUpRight size={17} /></div><div className="skin-visual"><div className="skin-orbit" /><EquipmentArt barrier={skin.category === 'wall'} /></div><div className="skin-info"><h3>{skin.name}</h3><p>{skin.category === 'wall' ? 'A new look for your last line of defense.' : 'A signature finish for your firepower.'}</p><div><span>{skin.category === 'wall' ? 'BARRIER FINISH' : 'WEAPON FINISH'}</span><strong><Gem size={14} />{skin.cost_gems}</strong></div></div></Link>)}</div></section>

                <section className="campaign-last-call"><div className="landing-container"><span className="section-kicker">NO ONE ELSE IS COMING.</span><h2>GIVE THEM<br /><em>HELL.</em></h2><p>One outpost. One defender. One more wave.</p><Link href={playTarget} className="landing-button primary"><Crosshair size={20} /> PLAY ZOMBIE BASE DEFENDER <ArrowUpRight size={21} /></Link><span className="last-call-coordinate" aria-hidden="true">09</span></div></section>
            </main>
            <PublicFooter />
        </div>
    );
}
