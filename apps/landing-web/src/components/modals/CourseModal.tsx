import { Calendar, Video, MapPin, ShieldCheck } from 'lucide-react';

export const CourseModal = () => {
  return (
    <div className="space-y-8 font-['Inter']">
      <div className="bg-brand-surface text-white p-10 rounded-[2.5rem] relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EC008C] rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3B82F6] rounded-full blur-[80px] opacity-20 -ml-10 -mb-10 animate-pulse delay-500"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3B82F6]/10 rounded-full border border-[#3B82F6]/30 mb-4 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></div>
                <span className="text-[#3B82F6] font-bold text-[10px] uppercase tracking-widest">
                  Matrícula Abierta
                </span>
              </div>
              <h3 className="text-5xl font-['Outfit'] font-bold text-white tracking-tighter leading-none">
                Marzo <br />
                <span className="text-white/30">2026</span>
              </h3>
            </div>
            <div className="bg-white/5 p-5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-lg">
              <Calendar size={32} className="text-[#EC008C]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
              <Video size={20} className="text-[#3B82F6]" />{' '}
              <span className="font-medium">8 Semanas Online</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
              <MapPin size={20} className="text-[#EC008C]" />{' '}
              <span className="font-medium">1 Finde Presencial</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h4 className="font-['Outfit'] font-bold text-[#0A0F1D] text-sm uppercase tracking-wide">
          Solicitar Syllabus
        </h4>
        <div className="flex gap-3">
          <input
            type="email"
            aria-label="Email profesional"
            autoComplete="email"
            placeholder="Email profesional"
            className="flex-1 px-6 py-5 bg-slate-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] shadow-sm transition-all hover:bg-white"
          />
          <button className="bg-[#0A0F1D] text-white px-10 rounded-2xl font-bold hover:bg-[#3B82F6] transition-all shadow-xl hover:shadow-2xl active:scale-95 duration-300">
            Enviar
          </button>
        </div>
        <p className="text-[10px] text-[#94A3B8] text-center mt-3 flex items-center justify-center gap-1.5 font-medium tracking-wide">
          <ShieldCheck size={12} /> Plazas limitadas. Selección por entrevista.
        </p>
      </div>
    </div>
  );
};
