import React, { useEffect, useRef } from 'react';

interface TalkingImageProps {
    volume: number; // 0 to 1
    active: boolean;
}

const TalkingImage: React.FC<TalkingImageProps> = ({ volume, active }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const targetTransform = useRef({ x: 0, y: 0, rotate: 0, scale: 1 });
    const currentTransform = useRef({ x: 0, y: 0, rotate: 0, scale: 1 });
    const lastUpdate = useRef(0);

    useEffect(() => {
        let animationId: number;

        const update = (time: number) => {
            // Update target occasionally or based on volume spikes to trigger "movement"
            // We want lively random movement when volume is high

            // Only update target if enough time passed to avoid jitter, 
            // OR if we want smooth continuous noise.

            // Logic:
            // 1. Base Float: Handled by CSS class 'animate-float' (up/down).
            // 2. Speaking:
            //    - Scale: Direct mapping to volume (with some smoothing).
            //    - Move/Rotate: Perlin-ish noise or random targets updated every ~100ms

            if (active) {
                // Smoothing factor (lerp alpha)
                const alpha = 0.1;

                // Calculate targets based on volume
                // Higher volume = wider range of movement
                const intensity = Math.max(0.1, volume * 1.5);

                // Random walk tendency:
                // We add a little random vector to the target every frame? No, too shaky.
                // Better: Update target position every X frames.

                if (time - lastUpdate.current > 100) { // Update targets every 100ms
                    targetTransform.current = {
                        // Lateral random movement (pan)
                        x: (Math.random() - 0.5) * 20 * intensity, // +/- 10px * intensity
                        y: (Math.random() - 0.5) * 20 * intensity, // +/- 10px * intensity
                        // Pivot/Tilt
                        rotate: (Math.random() - 0.5) * 10 * intensity, // +/- 5deg * intensity
                        // Scale
                        scale: 1 + volume * 0.15 // Base scale up
                    };
                    lastUpdate.current = time;
                }

                // Lerp current to target
                currentTransform.current.x += (targetTransform.current.x - currentTransform.current.x) * alpha;
                currentTransform.current.y += (targetTransform.current.y - currentTransform.current.y) * alpha;
                currentTransform.current.rotate += (targetTransform.current.rotate - currentTransform.current.rotate) * alpha;
                currentTransform.current.scale += (targetTransform.current.scale - currentTransform.current.scale) * alpha;

            } else {
                // Return to center
                currentTransform.current.x *= 0.9;
                currentTransform.current.y *= 0.9;
                currentTransform.current.rotate *= 0.9;
                currentTransform.current.scale += (1 - currentTransform.current.scale) * 0.1;
            }

            if (imgRef.current) {
                const { x, y, rotate, scale } = currentTransform.current;
                imgRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
            }

            animationId = requestAnimationFrame(update);
        };

        animationId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [active, volume]);

    return (
        <div className="w-full h-full flex items-center justify-center animate-float">
            <img
                ref={imgRef}
                src={active
                    ? "https://res.cloudinary.com/zeuadaprogramming/image/upload/v1768969671/Blog/ChatGPT_Image_Jan_21__2026__09_45_59_AM-removebg-preview_gvzkou.png"
                    : "https://res.cloudinary.com/zeuadaprogramming/image/upload/v1768973562/Blog/ChatGPT_Image_Jan_21__2026__11_01_51_AM-removebg-preview_wdv6ez.png"
                }
                alt={active ? "AI Agent Active" : "AI Agent Connecting"}
                className="w-full h-full object-contain drop-shadow-2xl transition-transform will-change-transform"
                style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
            />
        </div>
    );
};

export default TalkingImage;
