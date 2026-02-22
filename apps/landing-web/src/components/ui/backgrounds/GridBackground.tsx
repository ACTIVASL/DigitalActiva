import { useEffect, useRef } from 'react';

const GRID = 60;

class Particle {
    x: number; y: number; tx: number; ty: number;
    color: string; size: number; wait: number;
    width: number; height: number;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.x = Math.round(Math.random() * w / GRID) * GRID;
        this.y = Math.round(Math.random() * h / GRID) * GRID;
        this.tx = this.x; this.ty = this.y;
        this.color = Math.random() > 0.8 ? '#00f3ff' : '#374151';
        this.size = Math.random() > 0.9 ? 2 : 1.5;
        this.wait = Math.random() * 100;
    }

    update(w: number, h: number) {
        this.width = w; this.height = h;
        if (this.wait > 0) { this.wait--; return; }

        const dx = this.tx - this.x;
        const dy = this.ty - this.y;

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            this.x = this.tx; this.y = this.ty;
            const dir = Math.floor(Math.random() * 4);
            const dist = Math.floor(Math.random() * 3 + 1) * GRID;
            if (dir === 0) this.ty -= dist;
            if (dir === 1) this.tx += dist;
            if (dir === 2) this.ty += dist;
            if (dir === 3) this.tx -= dist;

            // Bounds
            if (this.tx < 0) this.tx = 0;
            if (this.tx > w) this.tx = w;
            if (this.ty < 0) this.ty = 0;
            if (this.ty > h) this.ty = h;
        } else {
            this.x += dx * 0.1;
            this.y += dy * 0.1;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        if (this.color === '#00f3ff') {
            ctx.shadowBlur = 10; ctx.shadowColor = '#00f3ff';
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Trail
        if (Math.abs(this.x - this.tx) > 1 || Math.abs(this.y - this.ty) > 1) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.tx, this.ty);
            ctx.strokeStyle = this.color === '#00f3ff' ? 'rgba(0, 243, 255, 0.2)' : 'rgba(55, 65, 81, 0.1)';
            ctx.stroke();
        }
    }
}

/**
 * PROPOSAL 1: ENTERPRISE GRID (CURRENT)
 * Concept: Structured, Orthogonal, Engineering Precision.
 * Best for: Emphasizing "Architecture", "Software", "Stability".
 */
export const GridBackground = () => {
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

        const COUNT = Math.floor((width * height) / 15000);

        const particles = Array.from({ length: COUNT }, () => new Particle(width, height));

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.3)'; // Trails
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => { p.update(width, height); p.draw(ctx); });
            frameId = requestAnimationFrame(animate);
        };
        let frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', setSize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen', opacity: 0.8 }} />;
};
