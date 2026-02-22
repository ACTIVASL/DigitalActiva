import { useState, useEffect, useRef } from 'react';
import logoPremium from '../../assets/images/logo-premium.png';

interface PreloaderProps {
  onComplete: () => void;
}

// 3D Projection Constants
const focalLength = 300;
const colors = ['#EC008C', '#3B82F6', '#FFFFFF'];

class NeuralParticle {
  x: number;
  y: number;
  z: number;
  color: string;
  radius: number;

  constructor(w: number, h: number) {
    this.x = (Math.random() - 0.5) * w * 2;
    this.y = (Math.random() - 0.5) * h * 2;
    this.z = Math.random() * focalLength * 4;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.radius = Math.random() * 2 + 0.5;
  }

  update(w: number, h: number, speed: number) {
    // Move towards camera
    this.z -= speed;

    if (this.z <= 10) {
      this.z = focalLength * 4;
      this.x = (Math.random() - 0.5) * w * 2;
      this.y = (Math.random() - 0.5) * h * 2;
    }
  }

  project(w: number, h: number) {
    const perspective = focalLength / (focalLength + this.z);
    const screenX = w / 2 + this.x * perspective;
    const screenY = h / 2 + this.y * perspective;
    const screenRadius = this.radius * perspective;

    return { x: screenX, y: screenY, p: perspective, c: this.color, r: screenRadius };
  }
}

export const Preloader = ({ onComplete }: PreloaderProps) => {
  const [exit, setExit] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      speedRef.current = 60; // WARP SPEED ENGAGE
      setTimeout(onComplete, 800);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: NeuralParticle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize Particles
    for (let i = 0; i < 300; i++) {
      particles.push(new NeuralParticle(canvas.width, canvas.height));
    }

    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear with slight trail
      ctx.fillStyle = 'rgba(10, 15, 29, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const projectedPoints: { x: number; y: number; p: number; c: string; r: number }[] = [];

      // Update & Calculate Projections
      particles.forEach((p) => {
        p.update(canvas.width, canvas.height, speedRef.current);
        const proj = p.project(canvas.width, canvas.height);

        // Draw Particle
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, proj.p);
        ctx.fill();
        ctx.globalAlpha = 1;

        projectedPoints.push(proj);
      });

      // Draw Neural Connections (Synapses)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projectedPoints.length; i++) {
        // Limit connections per particle to avoid heavy load
        const p1 = projectedPoints[i];
        let connections = 0;
        for (let j = i + 1; j < projectedPoints.length; j++) {
          if (connections > 3) break;

          const p2 = projectedPoints[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          if (Math.abs(dx) > 100 || Math.abs(dy) > 100) continue;

          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.c);
            grad.addColorStop(1, p2.c);
            ctx.strokeStyle = grad;
            ctx.globalAlpha = (1 - dist / 100) * 0.4 * p1.p;
            ctx.stroke();
            ctx.globalAlpha = 1;
            connections++;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-brand-surface flex items-center justify-center transition-opacity duration-[1.0s] ease-[cubic-bezier(0.22,1,0.36,1)] ${exit ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* BRAND ANCHOR: Circular Premium Logo */}
      <div
        className={`relative z-10 flex flex-col items-center transition-transform duration-[1.0s] ease-[cubic-bezier(0.22,1,0.36,1)] ${exit ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_0_80px_-10px_#EC008C] animate-pulse ring-4 ring-[#EC008C]/30 relative overflow-hidden">
          <img
            src={logoPremium}
            alt="Activa Logo"
            className="w-[105%] h-auto object-contain drop-shadow-[0_4px_6px_rgba(236,0,140,0.4)]"
          />
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shine"></div>
        </div>

        <div className="mt-8 overflow-hidden backdrop-blur-sm bg-[#0A0F1D]/30 px-8 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(236,0,140,0.2)]">
          <h2 className="text-white font-['Outfit'] font-bold text-4xl tracking-[0.2em] uppercase animate-slide-up drop-shadow-md">
            Activa
          </h2>
        </div>
      </div>

      <style>{`
              @keyframes slide-up {
                0% { transform: translateY(100%); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
              .animate-slide-up { animation: slide-up 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
              
              @keyframes shine {
               100% { transform: translateX(100%); }
             }
             .animate-shine {
                animation: shine 2.5s infinite;
             }
            `}</style>
    </div>
  );
};
