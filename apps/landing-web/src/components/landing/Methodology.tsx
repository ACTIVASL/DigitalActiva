import { Activity, BookOpen, MonitorPlay, ArrowRight } from 'lucide-react';
import { NeonIcon } from '../ui/NeonIcon';

const Methodology = ({ onOpenModal }: { onOpenModal: (type: string) => void }) => {
  const pillars = [
    {
      icon: Activity,
      title: 'Consultoría Estratégica',
      description:
        'Auditoría profunda de procesos. Identificamos cuellos de botella y diseñamos la arquitectura digital que tu empresa necesita.',
      color: 'text-brand-primary',
      glowHex: '#60a5fa',
      glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(96,165,250,0.5)]',
      border: 'group-hover:border-brand-primary/50',
      bg: 'group-hover:bg-brand-primary/5',
      action: 'consultoria',
    },
    {
      icon: BookOpen,
      title: 'Desarrollo Ágil',
      description:
        'Ingeniería de software de ciclo rápido. Entregamos valor en semanas, no en meses. Metodologías Scrum/Kanban.',
      color: 'text-slate-300',
      glowHex: '#94a3b8',
      glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(148,163,184,0.5)]',
      border: 'group-hover:border-slate-400/50',
      bg: 'group-hover:bg-slate-400/5',
      action: 'desarrollo',
    },
    {
      icon: MonitorPlay,
      title: 'Soporte Vitalicio',
      description:
        'No te abandonamos tras la entrega. Mantenimiento evolutivo, seguridad continua y monitorización proactiva de tu infraestructura.',
      color: 'text-white',
      glowHex: '#ffffff',
      glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)]',
      border: 'group-hover:border-white/50',
      bg: 'group-hover:bg-white/5',
      action: 'soporte',
    },
  ];

  return (
    <section className="relative py-24 bg-brand-dark overflow-hidden" aria-label="Metodología de trabajo">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-slate-700/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-display font-bold text-brand-primary tracking-[0.2em] uppercase mb-4">
            MÉTODO DE TRABAJO
          </h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
            De la Idea al <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-white">
              Software en Producción
            </span>
          </h3>
          <p className="text-lg text-slate-400 font-body font-light leading-relaxed">
            Tres pilares que garantizan que tu proyecto se entrega a tiempo, dentro de presupuesto y con calidad de producción desde el día uno.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              onClick={() => onOpenModal(pillar.action)}
              className={`group relative p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/5 ${pillar.border} transition-all duration-500 hover:-translate-y-2 ${pillar.glow} overflow-hidden cursor-pointer`}
            >
              {/* Inner Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 ${pillar.bg} transition-opacity duration-500`}
              ></div>

              {/* Icon Container */}
              <div className="relative mb-8">
                <NeonIcon
                  icon={pillar.icon}
                  color={pillar.color}
                  glowColor={pillar.glowHex}
                  size="md"
                />
              </div>

              {/* Content */}
              <div className="relative">
                <h4 className="text-2xl font-display font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {pillar.title}
                </h4>
                <p className="text-slate-400 font-body leading-relaxed mb-8 group-hover:text-slate-300 transition-colors duration-300">
                  {pillar.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-display font-bold text-white/50 group-hover:text-white transition-colors duration-300">
                  EXPLORAR
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Methodology;
