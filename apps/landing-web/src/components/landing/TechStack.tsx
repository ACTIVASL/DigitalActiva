import { useEffect, useRef, useState } from 'react';
import {
    Sparkles,
    CheckCircle2, X
} from 'lucide-react';
import { cn } from "../../lib/utils";
import PremiumLogo from '../../assets/images/google-enterprise-circle-v2.png';

/* ─────────────── CUSTOM CSS ─────────────── */
const techStyles = `
  .tech-card { position: relative; overflow: hidden; }
  .tech-card::after {
    content: '';
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .tech-card:hover::after {
    opacity: 1;
    animation: scanline 2s linear infinite;
  }
  @keyframes scanline {
    0% { top: -10%; }
    100% { top: 110%; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
`;

/* ─────────────── SERVICE DATA ─────────────── */
interface ServiceData {
    id: string;
    name: string;
    type: 'vector' | 'image';
    icon?: React.ComponentType<{ className?: string }>;
    logo?: string;
    category: string;
    desc: string;
    text: string;
    features: string[];
    color: string;
    accentFrom: string;
}

import {
    FirebaseIcon, BigQueryIcon, CloudRunIcon,
    SecurityIcon, NetworkIcon, WorkspaceIcon,
    DriveIcon, AppSheetIcon
} from '../icons/OfficialGoogleLogos';

const services: ServiceData[] = [
    {
        id: "web-design",
        name: "Diseño Web & Apps",
        type: "vector",
        icon: FirebaseIcon,
        category: "EXPERIENCIA DIGITAL",
        desc: "Tu marca, a otro nivel.",
        text: "Diseño exclusivo sin plantillas. Webs corporativas y aplicaciones móviles construidas sobre la infraestructura de Google para una velocidad y conversión inigualables.",
        features: ["UX/UI Premium", "PWA & Nativas", "Velocidad Extrema"],
        color: "text-orange-400", // Text color remains for accents, but icon has its own colors
        accentFrom: "from-orange-500",
    },
    {
        id: "bigquery",
        name: "Inteligencia de Datos",
        type: "vector",
        icon: BigQueryIcon,
        category: "BIG DATA & IA",
        desc: "Tu empresa, guiada por datos.",
        text: "Unificamos todos los datos de tu negocio en un cerebro central. Predicción de ventas, análisis de clientes y automatización de reportes con IA.",
        features: ["Predicción IA", "Dashboards en Tiempo Real", "Data Warehouse"],
        color: "text-blue-400",
        accentFrom: "from-blue-500",
    },
    {
        id: "run",
        name: "Aplicaciones Cloud",
        type: "vector",
        icon: CloudRunIcon,
        category: "CLOUD NATIVE",
        desc: "Software que escala solo.",
        text: "Aplicaciones contenerizadas que escalan a cero cuando no se usan y a infinito cuando es necesario. Sin servidores físicos, sin mantenimiento.",
        features: ["Auto-Escalado", "Serverless", "Alta Disponibilidad"],
        color: "text-blue-400",
        accentFrom: "from-blue-500",
    },
    {
        id: "security",
        name: "Ciberseguridad",
        type: "vector",
        icon: SecurityIcon,
        category: "ZERO TRUST",
        desc: "Seguridad de grado militar.",
        text: "Protege tu empresa con la misma infraestructura que usa Google. Acceso biométrico, encriptación en tránsito y en reposo, y defensa contra ataques DDoS.",
        features: ["Anti-Ransomware", "Encriptación Total", "Acceso Seguro"],
        color: "text-blue-400",
        accentFrom: "from-blue-500",
    },
    {
        id: "network",
        name: "Conectividad Global",
        type: "vector",
        icon: NetworkIcon,
        category: "RED PRIVADA",
        desc: "La fibra más rápida del mundo.",
        text: "Tus datos viajan por la red privada de fibra óptica de Google, evitando el internet público. Latencia mínima para tus usuarios en cualquier parte del mundo.",
        features: ["Baja Latencia", "Red Privada Google", "CDN Global"],
        color: "text-blue-400",
        accentFrom: "from-blue-500",
    },
    {
        id: "workspace",
        name: "Oficina Inteligente",
        type: "vector",
        icon: WorkspaceIcon,
        category: "GEMINI ENTERPRISE", // Updated Category as requested
        desc: "Colaboración nativa con IA.",
        text: "Transforma tu forma de trabajar con Gemini integrado en Docs, Gmail y Meet. Colaboración en tiempo real desde cualquier dispositivo.",
        features: ["Gemini Enterprise", "Docs & Drive", "Seguridad DLP"],
        color: "text-yellow-400",
        accentFrom: "from-yellow-500",
    },
    {
        id: "storage",
        name: "Activos Digitales",
        type: "vector",
        icon: DriveIcon,
        category: "CLOUD STORAGE",
        desc: "Tu conocimiento, protegido.",
        text: "Digitaliza y protege todos los documentos de tu empresa. Búsqueda inteligente por IA, versionado automático y permisos granulares.",
        features: ["Búsqueda Semántica", "Backup Automático", "Acceso Seguro"],
        color: "text-green-400",
        accentFrom: "from-green-500",
    },
    {
        id: "appsheet",
        name: "Automatización",
        type: "vector",
        icon: AppSheetIcon,
        category: "NO-CODE",
        desc: "Piloto automático para tu empresa.",
        text: "Digitaliza procesos manuales (partes de horas, inventarios, aprobaciones) con apps personalizadas sin escribir una sola línea de código.",
        features: ["Automatización 24/7", "Apps No-Code", "Eficiencia Total"],
        color: "text-indigo-400",
        accentFrom: "from-indigo-500",
    }
];

/* ─────────────── SERVICE CARD COMPONENT ─────────────── */
function ServiceCard({ service, isActive, onClick }: { service: ServiceData; isActive: boolean; onClick: () => void }) {
    const IconComponent = service.icon;
    return (
        <div
            onClick={onClick}
            className={cn(
                "tech-card group relative bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-5 sm:p-6 cursor-pointer transition-all duration-300",
                "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.2)] hover:ring-1 hover:ring-white/10",
                isActive && "border-blue-500/40 shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] ring-1 ring-blue-500/30"
            )}
        >
            {/* TOP ACCENT LINE (appears on hover) */}
            <div className={cn(
                "absolute top-0 left-4 right-4 h-px bg-gradient-to-r to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                service.accentFrom
            )} />

            {/* ICON - WRAPPED IN WHITE FOR FULL COLOR VISIBILITY */}
            <div className="mb-4 sm:mb-5">
                <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-2.5 transition-transform duration-300 group-hover:scale-110">
                    {service.type === 'vector' && IconComponent ? (
                        <IconComponent className="w-full h-full" />
                    ) : (
                        <img src={service.logo} alt={service.name} className="w-full h-full object-contain" />
                    )}
                </div>
            </div>

            {/* TEXT */}
            <h4 className="text-white font-bold text-sm sm:text-base mb-1.5 leading-tight">{service.name}</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 font-mono uppercase tracking-[0.15em]">{service.category}</p>

            {/* DESC (visible on larger cards) */}
            <p className="hidden sm:block text-xs text-slate-400/70 mt-3 leading-relaxed line-clamp-2">{service.desc}</p>
        </div>
    );
}

/* ─────────────── MAIN COMPONENT ─────────────── */
export function TechStack() {
    const [activeService, setActiveService] = useState<ServiceData | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- PARTICLE CANVAS ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; a: number }> = [];
        let raf: number;

        const resize = () => {
            canvas.width = canvas.offsetWidth * devicePixelRatio;
            canvas.height = canvas.offsetHeight * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
            seed();
        };

        const seed = () => {
            particles = [];
            const area = canvas.offsetWidth * canvas.offsetHeight;
            const n = Math.min(Math.floor(area / 20000), 120);
            for (let i = 0; i < n; i++) {
                particles.push({
                    x: Math.random() * canvas.offsetWidth,
                    y: Math.random() * canvas.offsetHeight,
                    r: Math.random() * 1.5 + 0.3,
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: (Math.random() - 0.5) * 0.08,
                    a: Math.random() * 0.25 + 0.05,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96, 165, 250, ${p.a})`;
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section className="relative min-h-screen bg-[#030305] overflow-hidden py-24 lg:py-32" id="technology">
            <style>{techStyles}</style>

            {/* ═══ BACKGROUND LAYERS ═══ */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#030305] to-[#030305] pointer-events-none z-0" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-50" />
            {/* Grid mesh overlay for HUD feel */}
            <div
                className="absolute inset-0 pointer-events-none z-[1] opacity-[0.04]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
            />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* ═══ HEADER ═══ */}
                <div className="text-center mb-16 lg:mb-20">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md mb-8">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-[11px] font-bold tracking-[0.25em] text-slate-200 uppercase">Google Cloud Partner</span>
                    </div>
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-white tracking-tight mb-5 leading-[0.95]">
                        Ecosistema{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
                            Google Enterprise
                        </span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed">
                        Infraestructura, seguridad e inteligencia artificial de nivel Fortune 500 para tu empresa.
                    </p>
                </div>

                {/* ═══ BENTO GRID ═══ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" style={{ gridAutoFlow: 'dense' }}>

                    {/* ── CORE CARD (2×2 on desktop, 2×1 on mobile) ── */}
                    <div className="col-span-2 lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-3 relative rounded-3xl p-[1px] overflow-hidden group">
                        {/* Animated Spinning Gradient Border */}
                        <div
                            className="absolute top-[-60%] left-[-60%] w-[220%] h-[220%] animate-[spin_6s_linear_infinite] z-0"
                            style={{
                                background: 'conic-gradient(transparent 40%, #3b82f6 45%, transparent 50%, transparent 85%, #6366f1 90%, transparent 95%)',
                            }}
                        />

                        {/* Card Content */}
                        <div className="relative z-10 h-full bg-[#060609] rounded-[calc(1.5rem-1px)] flex flex-col items-center justify-center text-center p-8 sm:p-10 lg:p-14 min-h-[220px] lg:min-h-0">
                            {/* Subtle radial glow */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.06)_0%,_transparent_70%)] rounded-[calc(1.5rem-1px)]" />

                            <div className="relative group">
                                {/* Premium Glow Ring */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-xl group-hover:blur-2xl transition-all duration-500" />

                                {/* Rotating Border */}
                                <div className="absolute -inset-1 rounded-full border border-white/10 border-t-blue-500/50 animate-[spin_10s_linear_infinite]" />

                                {/* Logo Container - ZOOMED & PREMIUM GLOW (STATIC - v5 READABLE) */}
                                <div className="relative z-10 bg-black backdrop-blur-md rounded-full p-0 border border-white/20 shadow-[0_0_40px_-5px_rgba(59,130,246,0.6)] overflow-hidden w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center group-hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.9)] transition-shadow duration-500">
                                    <img
                                        src={PremiumLogo}
                                        alt="Google Enterprise Ecosystem"
                                        className="w-full h-full object-cover scale-[1.15]"
                                    />
                                </div>
                            </div>

                            <h3 className="relative z-10 text-lg sm:text-xl lg:text-2xl font-display font-black text-white uppercase tracking-[0.05em] mb-2 mt-8">
                                Ecosistema Google Enterprise
                            </h3>
                            <p className="relative z-10 text-xs sm:text-sm text-slate-500 font-light max-w-xs">
                                Tu departamento de inteligencia artificial
                            </p>
                        </div>
                    </div>

                    {/* ── SERVICE CARDS ── */}
                    {services.map(service => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            isActive={activeService?.id === service.id}
                            onClick={() => setActiveService(service)}
                        />
                    ))}
                </div>
            </div>

            {/* ═══ DETAIL MODAL ═══ */}
            {activeService && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setActiveService(null)}
                >
                    <div
                        className="relative w-full max-w-4xl bg-[#08080c] border border-white/[0.08] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[90vh] md:max-h-[80vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActiveService(null)}
                            className="absolute top-5 right-5 p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full z-50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left Panel */}
                        <div className="w-full md:w-72 bg-[#060609] p-8 sm:p-10 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/[0.06] shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                                {activeService.type === 'vector' && activeService.icon ? (
                                    <activeService.icon className={cn("w-10 h-10", activeService.color)} />
                                ) : (
                                    <img src={activeService.logo} alt={activeService.name} className="w-10 h-10 object-contain" />
                                )}
                            </div>
                            <h3 className="text-xl font-black text-white mb-1.5 font-display uppercase leading-tight">{activeService.name}</h3>
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{activeService.category}</span>
                        </div>

                        {/* Right Panel */}
                        <div className="flex-1 p-8 sm:p-10 md:p-12 overflow-y-auto">
                            <h4 className="text-2xl sm:text-4xl font-extralight text-white mb-5 leading-snug">{activeService.desc}</h4>
                            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 border-l-2 border-white/[0.08] pl-5">{activeService.text}</p>

                            <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.05]">
                                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Características Clave</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {activeService.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <CheckCircle2 className={cn("w-4 h-4 shrink-0", activeService.color)} />
                                            <span className="text-sm text-slate-300">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
