import { RevealSection } from '../ui/RevealSection';
import teamImage from '../../assets/images/team-2026.png';


export const About = () => {
    return (
        <section
            id="nosotros"
            aria-label="Sobre nosotros"
            className="py-32 px-6 lg:px-12 bg-gradient-to-b from-slate-900 to-black border-t border-white/5 overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-primary/5 rounded-full blur-[200px] opacity-40 pointer-events-none"></div>

            <div className="max-w-[1440px] mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* COLUMN 1: IMAGE */}
                    <div className="relative order-2 lg:order-1 flex justify-center lg:justify-end pr-0 lg:pr-12">
                        <div className="relative w-80 h-96 md:w-[400px] md:h-[500px] mx-auto lg:mx-0">
                            {/* Main Frame */}
                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                                <div className="absolute inset-0 bg-brand-primary/10 mix-blend-overlay z-10"></div>
                                <img
                                    src={teamImage}
                                    alt="Equipo Activa SL Digital - Ingeniería Corporativa"
                                    className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:grayscale-0 transition-all duration-700"
                                    loading="lazy"
                                />
                                {/* Cyber Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-20"></div>
                            </div>
                        </div>

                        {/* Decorative Back Layers (Static) */}
                        <div className="absolute top-4 -right-4 w-full h-full rounded-[2rem] border-2 border-brand-primary/10 bg-transparent z-0"></div>
                    </div>

                    {/* COLUMN 2: TEXT */}
                    <div className="order-1 lg:order-2">
                        <RevealSection>
                            <span className="text-white text-xs font-display font-bold tracking-[0.2em] uppercase mb-6 block bg-slate-900 border border-brand-primary/50 w-fit px-5 py-2 rounded-full shadow-[0_0_15px_-5px_rgba(96,165,250,0.5)]">
                                ACTIVA SL DIGITAL
                            </span>
                            <h2 className="text-white text-5xl md:text-6xl font-display font-black leading-[1.05] tracking-tighter mb-8">
                                Desarrollo de Software <br /> de Alto Impacto.
                            </h2>
                            <div className="space-y-6">
                                <p className="text-slate-400 text-xl font-body leading-relaxed font-light">
                                    Somos un equipo de ingeniería especializado en construir infraestructura digital a medida. Diseñamos, desarrollamos y desplegamos software que resuelve problemas empresariales reales — CRMs, webs de alto rendimiento y aplicaciones internas que tu equipo controla al 100%.
                                </p>
                            </div>
                        </RevealSection>
                    </div>
                </div>
            </div>
        </section>
    );
};
