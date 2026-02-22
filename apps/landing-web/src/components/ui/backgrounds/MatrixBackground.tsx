import { useEffect, useRef } from 'react';

/**
 * PROPOSAL 3: DIGITAL RAIN
 * Concept: Streams of data (Binary/Hex) falling. 
 * Best for: "Cybersecurity", "Big Data", "Code Ownership".
 */
export const MatrixBackground = () => {
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

        const COLUMNS = Math.floor(width / 20);
        const drops: number[] = new Array(COLUMNS).fill(0); // Y position of each drop

        // Characters: 0 1 A B C D E F (Hex)
        const CHARS = '01ABCDEF';

        const animate = () => {
            // Fade effect for trails
            ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.font = '14px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = CHARS[Math.floor(Math.random() * CHARS.length)];

                // Highlighting random chars (Corporate Blue & Gray)
                const isHighlight = Math.random() > 0.98;
                // Highlight: Corporate Blue | Standard: Slate Gray | Dim: Dark Slate
                ctx.fillStyle = isHighlight ? '#3b82f6' : (Math.random() > 0.8 ? '#94a3b8' : '#475569');

                const x = i * 20;
                const y = drops[i] * 20;

                ctx.fillText(text, x, y);

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            frameId = requestAnimationFrame(animate);
        };
        let frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', setSize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen', opacity: 0.5 }} />;
};
