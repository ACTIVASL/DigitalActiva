import { useEffect, useRef } from 'react';

const DIST = 200;

class Node {
    x: number; y: number; vx: number; vy: number;
    width: number; height: number;

    constructor(w: number, h: number) {
        this.width = w; this.height = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
    }
    update(w: number, h: number) {
        this.width = w; this.height = h;
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
    }
}

/**
 * PROPOSAL 2: NEURAL NEXUS
 * Concept: Constellation of connected nodes. Organic, Intelligent, Distributed.
 * Best for: "Consulting", "Strategy", "Complex Problem Solving".
 */
export const NeuralBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        const COUNT = 60;

        const nodes = Array.from({ length: COUNT }, () => new Node(width, height));

        let mouse = { x: -1000, y: -1000 };
        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        document.addEventListener('mousemove', onMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Mouse Interaction: Draw connect to mouse

            nodes.forEach((n, i) => {
                n.update(width, height);

                // Draw Node
                ctx.beginPath();
                ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#00f3ff';
                ctx.fill();

                // Draw connections
                nodes.slice(i + 1).forEach(n2 => {
                    const d = Math.hypot(n.x - n2.x, n.y - n2.y);
                    if (d < DIST) {
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = `rgba(124, 58, 237, ${1 - d / DIST})`; // Purple connections
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });

                // Mouse Connect
                const dMouse = Math.hypot(n.x - mouse.x, n.y - mouse.y);
                if (dMouse < DIST) {
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0, 243, 255, ${1 - dMouse / DIST})`; // Cyan Interaction
                    ctx.stroke();
                }
            });

            frameId = requestAnimationFrame(animate);
        };
        let frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', setSize);
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen', opacity: 0.6 }} />;
};
