import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const VapiAgent = () => {
    const [status, setStatus] = useState<'idle' | 'popup' | 'connecting' | 'active'>('idle');
    const [volume, setVolume] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const vapiRef = useRef<any>(null);

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

                {(status === 'active' || status === 'connecting') && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in">
                        {/* Fluid Sphere Animation */}
                        <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
                            {/* Core Sphere */}
                            <div
                                className="absolute bg-skin-accent rounded-full opacity-60 blur-md transition-all duration-100 ease-out"
                                style={{
                                    width: `${40 + (volume * 60)}%`,
                                    height: `${40 + (volume * 60)}%`,
                                }}
                            />
                            <div
                                className="absolute bg-gradient-to-tr from-skin-accent to-purple-400 rounded-full transition-all duration-100 ease-out mix-blend-screen"
                                style={{
                                    width: `${30 + (volume * 40)}%`,
                                    height: `${30 + (volume * 40)}%`,
                                    transform: `rotate(${volume * 360}deg)`
                                }}
                            />
                            <div className="w-full h-full rounded-full border-2 border-skin-accent opacity-20 animate-spin-slow absolute"></div>

                            {status === 'connecting' && (
                                <span className="text-xs font-mono animate-pulse text-skin-base">Connecting...</span>
                            )}
                        </div>
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

            {/* End Call Button (Overlay for Active State) */}
            {status === 'active' && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10 w-full flex justify-center">
                    <button
                        onClick={endCall}
                        className="bg-red-500/90 hover:bg-red-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-md backdrop-blur-sm transition-colors"
                    >
                        End Call
                    </button>
                </div>
            )}
        </div>
    );
};

export default VapiAgent;
