import { Rocket, Shield, ChevronDown } from 'lucide-react';
import { RevealSection } from '../ui/RevealSection';

export const Hero = () => {

  return (
    <section
      id="hero"
      aria-label="Presentación principal"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-brand-dark"
    >
      {/* PREMIUM LIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Layer 1: The Image with 'Ken Burns' Motion */}
        <div className="absolute inset-0 animate-cinematic">
          <img
            src="/spatial-os-concept.webp"
            alt="Activa Spatial OS Interface"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        {/* Layer 2: Corporate Gradient Overlay (Darkness) */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/50 to-brand-dark/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-brand-primary/10 mix-blend-overlay"></div>
      </div>

      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-6 flex flex-col items-center text-center mt-20 lg:mt-0">
        <RevealSection>

          {/* SUPER-BADGE: TECH */}
          <div className="inline-flex items-center gap-3 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-brand-primary/5 border border-brand-primary/20 backdrop-blur-md mb-8 sm:mb-10 group hover:bg-brand-primary/10 transition-all duration-500 cursor-default shadow-[0_0_20px_-5px_rgba(96,165,250,0.5)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-20"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-primary"></span>
            </span>
            <span className="text-brand-primary text-[10px] sm:text-xs font-display font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase group-hover:text-white transition-colors">
              Soluciones Digitales Empresariales
            </span>
          </div>

          {/* MASSIVE HEADLINE - MOBILE OPTIMIZED */}
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-display font-black tracking-tighter text-white leading-[0.95] sm:leading-[0.9] mb-6 sm:mb-8 drop-shadow-2xl uppercase">
            TU EMPRESA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-white to-brand-secondary animate-pulse-slow">
              EN TUS MANOS.
            </span>
          </h1>

          <p className="text-base sm:text-xl lg:text-2xl text-slate-300 font-body font-light max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed text-balance uppercase tracking-wide px-2">
            Software a medida que convierte tu empresa en un <span className="text-white font-bold">Sistema Operativo Propio</span>. <br className="hidden sm:block" />
            <span className="text-brand-primary font-bold block sm:inline mt-2 sm:mt-0">Tu código. Tus datos. Tu control total.</span>
          </p>

          {/* MAGNETIC ACTION BUTTONS - VERTICAL STACK ON MOBILE */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center w-full px-4 sm:px-0 mb-16">
            <a
              href="/programas"
              className="w-full sm:w-auto group relative h-14 sm:h-20 px-8 sm:px-12 rounded-full bg-slate-900 border border-brand-primary/50 text-white text-base sm:text-lg font-display font-bold tracking-wide shadow-[0_0_30px_-5px_rgba(96,165,250,0.5)] hover:shadow-[0_0_50px_-5px_rgba(96,165,250,0.8)] hover:border-brand-primary hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <span className="relative z-10">Ver Catálogo</span>
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 text-brand-primary group-hover:animate-bounce" />
            </a>

            <a
              href="mailto:ingenieria@activa-sl.digital"
              className="w-full sm:w-auto group relative h-14 sm:h-20 px-8 sm:px-12 rounded-full bg-slate-900/50 border border-white/20 text-white text-base sm:text-lg font-display font-bold tracking-wide hover:bg-slate-900 hover:border-brand-primary/50 hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
            >
              <span>Auditoría Técnica</span>
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-brand-primary transition-colors" />
            </a>
          </div>

        </RevealSection>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className="w-5 h-5 text-brand-primary" />
      </div>
    </section>
  );
};

