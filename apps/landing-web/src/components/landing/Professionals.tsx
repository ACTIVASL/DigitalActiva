import { ArrowRight, MonitorPlay, GraduationCap, Sparkles } from 'lucide-react';

import academyInterface from '../../assets/images/academy_campus_interface.webp';
import crmScreenshot from '../../assets/images/crm-dashboard-sme.webp';

interface ProfessionalsProps {
  onOpenModal?: (modal: string, data?: unknown) => void;
}


export const Professionals = ({ onOpenModal }: ProfessionalsProps) => {
  return (
    <section className="relative bg-white overflow-hidden" aria-label="Ecosistema corporativo">
      {/* Ambient Background - Shared (Subtle Light) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[5%] w-[800px] h-[800px] bg-sky-400/5 rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
      </div>

      {/* SECTION HEADER */}
      <div className="relative z-10 pt-32 pb-16 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-sm font-display font-bold text-brand-primary tracking-[0.2em] uppercase mb-4">
          Ecosistema Corporativo
        </h2>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight">
          Herramientas para la <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">
            Excelencia Operativa
          </span>
        </h3>
        <p className="text-lg text-slate-600 font-body font-light leading-relaxed">
          Unificamos gestión, operaciones y análisis de datos en una plataforma integral
          diseñada para empresas que buscan escalar sin fricción.
        </p>
      </div>

      {/* 2. SOFTWARE ACTIVA (CRM) */}
      <div
        className="relative py-32 border-t border-gray-100 bg-slate-50"
        id="software"

      >
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <MonitorPlay size={16} />
              <span className="text-xs font-bold tracking-widest uppercase">
                SOFTWARE EN PROPIEDAD
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight">
              Eleva el Estándar de tu <br />
              <span className="text-brand-primary">Gestión Empresarial</span>
            </h2>

            <p className="text-slate-600 font-body text-lg leading-relaxed max-w-xl">
              La herramienta definitiva para validación de negocio. Transforma tu metodología con un
              sistema que integra CRM, ERP y Business Intelligence en una única plataforma segura y eficiente.
            </p>

            <ul className="space-y-4">
              {[
                'Cumplimiento Normativo (RGPD/ISO)',
                'Informes de Rendimiento Automáticos',
                'Panel de Control Financiero y RRHH',
                'Soporte Técnico Vitalicio',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-sm"></div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="mailto:contacto@activa-sl.digital?subject=Solicitud%20Demo%20CRM"
                className="px-8 py-4 bg-slate-900 border border-brand-primary/50 text-white rounded-full font-bold tracking-wide shadow-[0_0_20px_-5px_rgba(96,165,250,0.5)] hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.8)] hover:border-brand-primary hover:bg-slate-800 transition-all transform active:scale-95 duration-200 inline-flex items-center justify-center"
              >
                SOLICITAR DEMO
              </a>
              <button
                onClick={() => onOpenModal?.('lead-magnet', { interest: 'general' })}
                className="px-8 py-4 bg-white border border-gray-200 text-slate-700 rounded-full font-bold tracking-wide hover:border-brand-primary hover:shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)] transition-all flex items-center gap-2 transform active:scale-95 duration-200"
              >
                <Sparkles size={20} className="text-brand-primary" /> VERSIÓN ENTERPRISE
              </button>
            </div>
          </div>

          {/* Visual: Device Composition (Clean Outline) */}
          {/* TITANIUM: Scale down on mobile to prevent overflow of absolute elements */}
          {/* TITANIUM V5: RESPONSIVE DEVICE LAYOUT STRATEGY */}

          {/* A) DESKTOP & TABLET LANDSCAPE: ORIGINAL COMPOSITION (Hidden on Mobile) */}
          <div className="hidden lg:flex relative z-10 w-full lg:h-[800px] items-center justify-center perspective-container">
            {/* DESKTOP (Back Center) */}
            <div className="relative w-[800px] aspect-[16/10] bg-white rounded-xl shadow-2xl shadow-slate-200 border-[6px] border-slate-800 ring-1 ring-gray-200 z-10 transition-transform duration-700 hover:scale-[1.01] overflow-hidden group/desktop">
              <div className="w-full h-full bg-slate-100 overflow-hidden relative">
                <img src={crmScreenshot} alt="Dashboard CRM" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <div className="absolute left-1/2 -bottom-6 w-1/3 h-4 bg-gradient-to-b from-slate-700 to-slate-900 -translate-x-1/2 rounded-b-xl"></div>
            </div>

            {/* TABLET (Bottom Right) */}
            <div className="absolute -right-12 bottom-20 w-[450px] aspect-[4/3] bg-white rounded-[1.5rem] shadow-xl border-[8px] border-slate-800 ring-1 ring-gray-200 z-20 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden relative"><img src={crmScreenshot} alt="Tablet CRM" className="w-full h-full object-cover object-top" loading="lazy" /></div>
              <div className="absolute top-1/2 -right-1.5 w-1 h-8 bg-gray-400 rounded-l-md -translate-y-1/2"></div>
            </div>

            {/* MOBILE (Bottom Left) */}
            <div className="absolute left-0 bottom-40 w-[240px] aspect-[9/19.5] bg-black rounded-[2.5rem] shadow-xl border-[8px] border-black ring-1 ring-gray-800 z-30 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative"><img src={crmScreenshot} alt="Mobile CRM" className="w-full h-full object-cover object-top" loading="lazy" /><div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl z-40"></div></div>
            </div>
          </div>

          {/* B) MOBILE & TABLET PORTRAIT: VERTICAL STACK (Visible only on small screens) */}
          <div className="lg:hidden relative w-full pt-10 pb-20 flex flex-col items-center gap-8">

            {/* 1. Desktop Device (Top, Full Width) */}
            <div className="relative w-full shadow-xl rounded-xl overflow-hidden border-[4px] border-slate-800">
              <img src={crmScreenshot} alt="CRM Desktop View" className="w-full h-auto object-cover" loading="lazy" />
            </div>

            <div className="flex items-end justify-center gap-4 -mt-12 z-20 w-full px-4">
              {/* 2. Tablet (Left, Tucked In) */}
              <div className="w-2/3 shadow-2xl rounded-xl overflow-hidden border-[4px] border-slate-800 transform -rotate-2 bg-white">
                <img src={crmScreenshot} alt="CRM Tablet View" className="w-full h-auto" loading="lazy" />
              </div>

              {/* 3. Mobile (Right, Overlay) */}
              <div className="w-1/3 shadow-2xl rounded-[1.5rem] overflow-hidden border-[4px] border-black bg-black transform rotate-3 translate-y-8">
                <img src={crmScreenshot} alt="CRM Mobile View" className="w-full h-auto rounded-[1.2rem]" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FORMACIÓN TÉCNICA (CAMPUS) */}
      <div className="relative py-32 border-t border-gray-100" id="academia">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual: Futuristic Interface */}
          <div className="relative perspective-1000 order-2">
            <div className="relative w-full aspect-square md:aspect-[4/3] transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-700">
              <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-[150px] opacity-20"></div>
              <img
                src={academyInterface}
                alt="Interfaz de Formación Tecnológica"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition-all duration-500 hover:drop-shadow-[0_20px_50px_rgba(59,130,246,0.4)]"
              />
            </div>
          </div>
          {/* Content */}
          <div className="order-1 space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary">
              <GraduationCap size={16} />
              <span className="text-xs font-bold tracking-widest uppercase">ACADEMIA ACTIVA</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight">
              Campus Virtual de <br />
              <span className="text-brand-secondary">Alta Ingeniería</span>
            </h2>

            <div className="space-y-6 text-slate-600 font-body text-lg leading-relaxed">
              <p>
                Formamos equipos de alto rendimiento para gestionar tu infraestructura digital.
                Nuestro campus virtual asegura la transferencia de conocimiento completa.
              </p>
              <p>
                No solo entregamos el <strong>Software</strong>, entregamos el manual de operaciones.
                El servicio incluye entrenamiento práctico para tu staff, asegurando autonomía
                y soberanía digital desde el primer día.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-colors">
                <h4 className="text-slate-900 font-bold mb-1">Certificación Técnica</h4>
                <p className="text-sm text-slate-500">Avalada para auditores.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-colors">
                <h4 className="text-slate-900 font-bold mb-1">Onboarding Incluido</h4>
                <p className="text-sm text-slate-500">
                  Formación in-company para tu equipo.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenModal?.('course')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 border border-brand-primary/50 text-white rounded-full font-display font-bold tracking-widest shadow-[0_0_20px_-5px_rgba(96,165,250,0.5)] hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.8)] hover:border-brand-primary hover:bg-slate-800 transition-all duration-300 group"
            >
              VER PLAN DE FORMACIÓN
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
