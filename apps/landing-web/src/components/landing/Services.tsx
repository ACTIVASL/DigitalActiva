import { useState } from 'react';
import { MonitorPlay, ShieldCheck, Database, Rocket } from 'lucide-react';
import individualImage from '../../assets/images/consultant-sme.webp';
import { NeonIcon } from '../ui/NeonIcon';
import { SpotlightCard } from '../ui/SpotlightCard';
import { Modal } from '../ui/Modal';
import { AuditForm } from '../neural/AuditForm';

const Services = () => {
    const [isAuditOpen, setIsAuditOpen] = useState(false);

    return (
        <section className="relative py-32 bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden" id="solutions" aria-label="Soluciones y servicios">
            {/* Background Nuance - Dark Tech Gradient (Blue Only) */}
            <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-brand-primary/5 via-slate-900/10 to-brand-primary/5 blur-[100px] transform -translate-y-1/2 pointer-events-none opacity-50"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-20 max-w-4xl mx-auto">
                    <h2 className="text-sm font-display font-bold text-brand-primary tracking-[0.2em] uppercase mb-4">
                        INGENIERÍA & DESARROLLO
                    </h2>
                    <h3 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight text-balance">
                        ECOSISTEMA <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            DIGITAL 360°
                        </span>
                    </h3>
                    <p className="text-base sm:text-lg text-slate-400 font-body font-light leading-relaxed max-w-2xl mx-auto text-balance">
                        Arquitectura de Software. Web High-Performance. Apps Nativas. Todo en propiedad.
                    </p>
                </div>

                <div className="space-y-20 lg:space-y-32">
                    {/* OPTION 1: DIGITALIZATION (Left Image, Right Text) */}
                    <div
                        id="digital"
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center group scroll-mt-32"
                    >
                        {/* Image Container */}
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute inset-0 bg-brand-primary/20 rounded-[2rem] blur-2xl opacity-20 transform translate-y-4"></div>

                            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] group-hover:border-brand-primary/30 group-hover:ring-1 group-hover:ring-brand-primary/20">
                                {/* Images filtered to look 'Tech' */}
                                <img
                                    src={individualImage}
                                    alt="Consultoría Tecnológica"
                                    className="w-full h-[350px] sm:h-[500px] object-cover transform transition-transform duration-1000 group-hover:scale-105 grayscale contrast-125 brightness-75"
                                    loading="lazy"
                                    decoding="async"
                                />

                                {/* Floating Badge */}
                                <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 px-6 py-3 bg-black/80 backdrop-blur-xl border border-brand-primary/30 rounded-full shadow-lg">
                                    <Rocket className="w-5 h-5 text-brand-primary" />
                                    <span className="text-sm font-display font-bold text-white tracking-wide">
                                        ESCALA TU APP
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="order-1 lg:order-2 space-y-8 text-center lg:text-left">
                            <div>
                                <h4 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4 flex items-center justify-center lg:justify-start gap-3">
                                    Consultoría <span className="text-brand-primary">Estratégica</span>
                                </h4>
                                <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-6 text-balance">
                                    No solo escribimos código. Diseñamos la arquitectura que tu negocio necesita para crecer sin deuda técnica. Auditoría, Planificación y Ejecución.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-primary/30 hover:bg-white/10 transition-all text-left">
                                    <NeonIcon
                                        icon={MonitorPlay}
                                        color="text-brand-primary"
                                        glowColor="#3b82f6"
                                        size="sm"
                                        bgClass="bg-slate-950 border-brand-primary/20"
                                    />
                                    <div>
                                        <h5 className="text-white font-display font-bold mb-1">
                                            Webs High-Performance
                                        </h5>
                                        <p className="text-sm text-slate-500">
                                            Carga en 0.5s. Puntuación 98/100 en Google.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-primary/30 hover:bg-white/10 transition-all text-left">
                                    <NeonIcon
                                        icon={ShieldCheck}
                                        color="text-brand-primary"
                                        glowColor="#3b82f6"
                                        size="sm"
                                        bgClass="bg-slate-950 border-brand-primary/20"
                                    />
                                    <div>
                                        Seguridad WAF
                                        <p className="text-sm text-slate-500">
                                            Autenticación de grado bancario para tu CRM.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <a
                                    href="/programas"
                                    className="px-8 py-4 bg-slate-900 border border-brand-primary/50 text-white rounded-full font-bold shadow-[0_0_20px_-5px_rgba(96,165,250,0.5)] hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.8)] hover:border-brand-primary hover:bg-slate-800 transition-all w-full sm:w-auto text-center"
                                >
                                    VER CATÁLOGO
                                </a>
                                <button
                                    onClick={() => setIsAuditOpen(true)}
                                    className="px-8 py-4 bg-slate-900/50 border border-white/20 text-white rounded-full font-bold hover:bg-slate-900 hover:border-brand-primary/50 hover:shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)] transition-all w-full sm:w-auto text-center"
                                >
                                    AUDITORÍA TÉCNICA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* OPTION 2: SOFTWARE (Right Image, Left Text) */}
                    <div
                        id="software"
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center group scroll-mt-32"
                    >
                        {/* Content */}
                        <div className="space-y-8 order-1 lg:order-1 text-center lg:text-left">
                            <div>
                                <h4 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4 flex items-center justify-center lg:justify-start gap-3">
                                    Software en <span className="text-brand-secondary">Propiedad</span>
                                </h4>
                                <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-6 text-balance">
                                    Deja de alquilar SaaS. Construimos tu propio "Cerebro Digital". Tu base de datos, tus clientes, tu código. Sin licencias mensuales eternas.
                                </p>
                            </div>

                            <div className="relative group/card cursor-pointer">
                                <SpotlightCard className="rounded-2xl bg-slate-900 shadow-[0_0_30px_-10px_rgba(96,165,250,0.3)] hover:shadow-[0_0_40px_-5px_rgba(96,165,250,0.5)] transition-all p-6 text-left">
                                    <div className="mb-4 flex items-center gap-4">
                                        <Database className="text-brand-primary w-8 h-8 relative z-10" />
                                        <h5 className="text-white font-display font-bold text-xl relative z-10">
                                            CRM Titanium
                                        </h5>
                                    </div>
                                    <p className="text-sm text-slate-400 relative z-10">
                                        Centraliza clientes, facturación y operaciones en un solo dashboard.
                                    </p>
                                </SpotlightCard>
                            </div>
                        </div>

                        {/* Image Container */}
                        <div className="relative order-2 lg:order-2">
                            <div className="absolute inset-0 bg-brand-secondary/20 rounded-[2.5rem] blur-3xl opacity-20 transform translate-y-6 scale-95 group-hover:scale-100 transition-all duration-700"></div>

                            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] group-hover:border-brand-secondary/30 group-hover:ring-1 group-hover:ring-brand-secondary/20">
                                <video
                                    src="/crm-demo.mp4"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full object-contain transform transition-transform duration-1000 group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEURAL AUDIT MODAL */}
            <Modal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)}>
                <AuditForm />
            </Modal>
        </section>
    );
};

export default Services;
