import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import TalkingImage from './TalkingImage';

const VapiAgent = () => {
    const [status, setStatus] = useState<'idle' | 'popup' | 'connecting' | 'active'>('idle');
    const [volume, setVolume] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const vapiRef = useRef<any>(null);
    const connectingSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Init audio
        connectingSound.current = new Audio("https://res.cloudinary.com/zeuadaprogramming/video/upload/v1768974101/Blog/mixkit-old-telephone-ring-1357_zjpzoc.wav");
        connectingSound.current.loop = true;
        connectingSound.current.volume = 0.5;

        return () => {
            if (connectingSound.current) {
                connectingSound.current.pause();
                connectingSound.current = null;
            }
        };
    }, []);

    // Handle sound playback based on status
    useEffect(() => {
        if (status === 'connecting') {
            connectingSound.current?.play().catch(e => console.error("Audio play failed", e));
        } else {
            if (connectingSound.current) {
                connectingSound.current.pause();
                connectingSound.current.currentTime = 0;
            }
        }
    }, [status]);

    // Vapi Event Listeners
    useEffect(() => {
        const vapi = new Vapi('a07b3c1c-bc1b-483e-bbcc-55b9040a4d21'); // Replace with your Public Key
        vapiRef.current = vapi;

        vapi.on('call-start', () => {
            console.log('Call has started');
            setStatus('active');
        });

        vapi.on('call-end', () => {
            console.log('Call has ended');
            setStatus('idle');
            setVolume(0);
        });

        vapi.on('volume-level', (level) => {
            // Amplify the level for better visual effect, clamp between 0 and 1
            setVolume(Math.min(level * 5, 1));
        });

        vapi.on('error', (e) => {
            console.error('Vapi error:', e);
            setStatus('idle');
        });

        // Cleanup
        return () => {
            vapi.stop();
            vapiRef.current = null;
        };
    }, []);

    // Close popup on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node) && status === 'popup') {
                setStatus('idle');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [status]);


    const handleImageClick = () => {
        if (status === 'idle') {
            setStatus('popup');
        }
    };

    const startCall = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling causing immediate close if we have listeners
        if (!vapiRef.current) return;
        setStatus('connecting');
        vapiRef.current.start('b2fd8873-b917-41eb-8ee0-900f5f9170d2'); // Replace with your Assistant ID
    };

    const endCall = () => {
        if (vapiRef.current) {
            vapiRef.current.stop();
        }
    };

    return (
        <div className="relative inline-block w-50 h-50" ref={containerRef}>
            {/* Main Visual: Image or Sphere */}
            <div
                className={`w-full h-full transition-all duration-300 ${status === 'idle' ? 'cursor-pointer hover:scale-105' : ''}`}
                onClick={handleImageClick}
            >
                {(status === 'idle' || status === 'popup') && (
                    <div className="relative w-full h-full">
                        <img
                            src="https://res.cloudinary.com/zeuadaprogramming/image/upload/v1768942548/Blog/ChatGPT_Image_Jan_21__2026__01_20_43_AM__1_-removebg-preview_paxy7j.png"
                            alt="AI Agent Trigger"
                            className={`w-full h-full object-contain transition-all duration-300 ${status === 'popup' ? 'blur-sm brightness-75 scale-95' : ''}`}
                            onMouseEnter={() => connectingSound.current?.load()}
                        />
                        {/* Pulse Badge for Attention (Only when totally idle) */}
                        {status === 'idle' && (
                            <span className="absolute top-0 right-0 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skin-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-skin-accent"></span>
                            </span>
                        )}
                    </div>
                )}

                {/* ACTIVE & CONNECTING STATE (Talking Image & Overlay Controls) */}
                {(status === 'active' || status === 'connecting') && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in group cursor-pointer">

                        {/* Animated Character */}
                        <div className={`relative w-48 h-48 flex items-center justify-center transition-all duration-300 ${status === 'active' ? 'group-hover:blur-sm group-hover:scale-95 group-hover:opacity-50' : ''}`}>
                            <TalkingImage volume={volume} active={status === 'active'} />
                            {status === 'connecting' && (
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-mono animate-pulse text-white bg-black/50 px-2 rounded backdrop-blur-sm pointer-events-none">Connecting...</span>
                            )}
                        </div>

                        {/* HOVER OVERLAY: End Call Button */}
                        {status === 'active' && (
                            <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                                onClick={endCall}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full shadow-[0_8px_30px_rgba(220,38,38,0.5)] border border-white/20 backdrop-blur-sm flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:shadow-[0_15px_40px_rgba(220,38,38,0.6)] hover:brightness-110 group-active:scale-95">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                                        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" transform="rotate(135 12 12)" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Overlays */}

            {/* Connect Overlay (Inside container) */}
            {status === 'popup' && (
                <div className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in">
                    <button
                        onClick={startCall}
                        className="bg-skin-accent text-white px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all text-sm whitespace-nowrap"
                    >
                        Start Call
                    </button>
                </div>
            )}


        </div>
    );
};

export default VapiAgent;
