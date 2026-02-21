import { useEffect, useRef } from 'react';
import { Particle } from './lib/Particle';
import { useIsMobile } from './hooks/useIsMobile';

export const TitaniumBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { isMobile, isTablet } = useIsMobile();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const setSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        setSize();
        window.addEventListener('resize', setSize);

        // TITANIUM OPTIMIZATION: Graduated Density for Omnichannel Performance
        let particleDensity = 15000; // Desktop (Master Race)
        if (isTablet) particleDensity = 25000; // iPad Pro (High End)
        if (isMobile) particleDensity = 45000; // Mobile (Efficiency)

        const PARTICLE_COUNT = Math.floor((width * height) / particleDensity);

        const particles: Particle[] = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle(width, height));
        }

        // ANIMATION LOOP
        let animationFrameId: number;

        const animate = () => {
            // Slight trails for "Screen" feel
            ctx.fillStyle = 'rgba(10, 10, 10, 0.2)'; // Brand Dark with alpha
            ctx.fillRect(0, 0, width, height);

            // Draw Static Grid (Subtle)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update(width, height);

                // Draw "tail" or path if moving
                if (Math.abs(p.x - p.targetX) > 1 || Math.abs(p.y - p.targetY) > 1) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color === '#00f3ff' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(75, 85, 99, 0.1)';
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.targetX, p.targetY);
                    ctx.stroke();
                }

                p.draw(ctx);
            }

            // Draw connections between aligned nodes (The Circuit)
            // TITANIUM OPTIMIZATION: Disable complex connections on mobile
            // PERF: Early-exit on dx + max connections per particle
            if (!isMobile) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
                ctx.lineWidth = 1;
                const MAX_CONNECTIONS = 3;
                for (let i = 0; i < particles.length; i++) {
                    let connections = 0;
                    const p1 = particles[i];
                    for (let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j];
                        const dx = Math.abs(p1.x - p2.x);
                        if (dx > 300) continue; // Early exit: no point checking further
                        const dy = Math.abs(p1.y - p2.y);
                        if (dx > 1 && dy > 1) continue; // Not aligned
                        if (dx + dy < 300) {
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            connections++;
                            if (connections >= MAX_CONNECTIONS) break;
                        }
                    }
                }
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isMobile, isTablet]); // Re-run if mobile state changes (e.g. rotation)

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ mixBlendMode: 'screen', opacity: isMobile ? 0.6 : 0.8 }}
        />
    );
};
