import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function HeroVideo() {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const applyPreference = () => {
            if (preference.matches) {
                video.pause();
            } else {
                video.play().catch(() => {});
            }
        };
        applyPreference();
        preference.addEventListener('change', applyPreference);
        return () => preference.removeEventListener('change', applyPreference);
    }, []);

    const togglePlayback = () => {
        const video = videoRef.current;
        if (video.paused) {
            video.play().catch(() => setFailed(true));
        } else {
            video.pause();
        }
    };

    return <>
        <img src="/defender-key-art.webp" alt="" className="hero-art" fetchPriority="high" width="1536" height="1024" />
        <video ref={videoRef} className={`hero-video ${ready && !failed ? 'is-ready' : ''}`} muted loop playsInline preload="metadata" poster="/defender-key-art.webp" aria-hidden="true" tabIndex={-1} onPlaying={() => { setReady(true); setPlaying(true); }} onPause={() => setPlaying(false)} onError={() => setFailed(true)}>
            <source src="/hero-outpost.mp4" type="video/mp4" />
        </video>
        {!failed && <button type="button" className="hero-video-control" onClick={togglePlayback} aria-label={playing ? 'Pause background video' : 'Play background video'}>{playing ? <Pause size={14} /> : <Play size={14} />}<span>{playing ? 'PAUSE SCENE' : 'PLAY SCENE'}</span></button>}
    </>;
}
