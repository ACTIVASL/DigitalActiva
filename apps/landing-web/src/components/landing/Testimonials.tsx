import { Quote } from 'lucide-react';
import { RevealSection } from '../ui/RevealSection';

export const Testimonials = () => {
    return (
        <section className="relative py-32 overflow-hidden bg-brand-dark border-t border-white/5" aria-label="Casos de uso y resultados">
            {/* Background Effects — Brand Primary Only */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
                <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* HEADLINE */}
                <RevealSection>
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-4 text-brand-primary">
                            CASOS DE USO
                        </h2>
                        <h3 className="text-4xl md:text-6xl font-display font-black text-white leading-tight mb-6 tracking-tighter">
                            Resultados que <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-white to-brand-secondary">
                                TRANSFORMAN NEGOCIOS
                            </span>
                        </h3>
                        <p className="text-slate-400 text-xl font-body font-light leading-relaxed max-w-2xl mx-auto">
                            Escenarios reales donde nuestra tecnología resuelve problemas empresariales concretos.
                        </p>
                    </div>
                </RevealSection>

                {/* TESTIMONIALS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            quote:
                                'Reducción del 70% en tiempo de gestión administrativa gracias a la automatización del CRM propio. Las tareas manuales se convirtieron en flujos automáticos.',
                            name: 'Caso de Uso',
                            role: 'Sector Instalaciones',
                            highlight: 'Eficiencia Operativa',
                            metric: '-70%',
                            metricLabel: 'Tiempo Admin',
                        },
                        {
                            quote:
                                'Centralización de 4 herramientas desconectadas en una sola plataforma. Visibilidad total del negocio desde un único dashboard, accesible desde cualquier dispositivo.',
                            name: 'Caso de Uso',
                            role: 'Sector Salud',
                            highlight: 'Control Total',
                            metric: '4→1',
                            metricLabel: 'Plataformas',
                        },
                        {
                            quote:
                                'Web optimizada con carga en <1 segundo y SEO técnico avanzado. Incremento proyectado de conversiones basado en benchmarks del sector retail.',
                            name: 'Caso de Uso',
                            role: 'Sector E-Commerce',
                            highlight: 'Alto Rendimiento',
                            metric: '<0.5s',
                            metricLabel: 'Carga Web',
                        },
                    ].map((item, i) => (
                        <RevealSection key={i} delay={i * 150}>
                            <div className="group relative h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <Quote className="w-10 h-10 text-brand-primary/20 group-hover:text-brand-primary transition-colors" />
                                        <div className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-wide">
                                            {item.highlight}
                                        </div>
                                    </div>

                                    {/* Metric Badge */}
                                    <div className="mb-6 flex items-baseline gap-2">
                                        <span className="text-4xl font-display font-black text-brand-primary">{item.metric}</span>
                                        <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">{item.metricLabel}</span>
                                    </div>

                                    <p className="text-slate-300 text-lg font-body font-light leading-relaxed italic mb-8 flex-grow">
                                        "{item.quote}"
                                    </p>

                                    <div className="border-t border-white/10 pt-6 mt-auto">
                                        <p className="text-white font-display font-bold text-lg">{item.name}</p>
                                        <p className="text-brand-primary font-medium text-sm">{item.role}</p>
                                    </div>
                                </div>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

