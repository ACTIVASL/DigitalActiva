import { BookOpen, ArrowUpRight, Mail, Download } from 'lucide-react';

export const BookModal = () => {
  return (
    <div className="space-y-8 font-['Inter']">
      <div className="relative h-64 bg-brand-surface rounded-3xl flex items-center justify-center overflow-hidden mb-8 group ring-1 ring-white/10 shadow-2xl perspective-container">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6] rounded-full blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#EC008C] rounded-full blur-[100px] opacity-20 animate-pulse delay-1000"></div>

        <BookOpen
          size={90}
          strokeWidth={0.8}
          className="text-white/10 absolute transform group-hover:scale-110 transition-transform duration-1000 ease-out"
        />

        <div className="text-center z-10 relative flex flex-col items-center">
          <h3 className="text-white font-['Outfit'] font-bold text-4xl tracking-tight leading-none mb-2">
            MÉTODO ACTIVA
          </h3>
          <p className="text-[#3B82F6] text-xs tracking-[0.3em] uppercase font-bold">
            La Ciencia del Ritmo
          </p>
          <a
            href="https://metodoactiva.es"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold border border-white/20 backdrop-blur-xl transition-all hover:scale-105 hover:border-[#EC008C]/50 uppercase tracking-widest group/link"
          >
            metodoactiva.es{' '}
            <ArrowUpRight
              size={12}
              className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
            />
          </a>
        </div>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-4 scrollbar-hide">
        {['Neurociencia', 'Casos Reales', 'Protocolos'].map((tag, i) => (
          <span
            key={i}
            className="px-5 py-2.5 bg-slate-50 text-[#0A0F1D] text-xs font-bold rounded-xl whitespace-nowrap border border-gray-200/60 shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-5">
        <h4 className="font-['Outfit'] font-bold text-[#0A0F1D] text-sm uppercase tracking-wide">
          Descarga Gratuita
        </h4>
        <div className="relative group">
          <input
            type="email"
            aria-label="Correo electrónico profesional"
            autoComplete="email"
            placeholder="Tu correo electrónico profesional"
            className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#EC008C]/20 focus:border-[#EC008C] transition-all shadow-sm group-hover:bg-white"
          />
          <Mail
            size={20}
            className="absolute left-4 top-5 text-gray-400 group-hover:text-[#EC008C] transition-colors"
          />
        </div>
        <button className="w-full bg-[#0A0F1D] text-white py-5 rounded-2xl font-['Outfit'] font-bold hover:bg-[#3B82F6] transition-all duration-500 shadow-xl shadow-[#0A0F1D]/20 flex items-center justify-center gap-3 group border border-white/10 active:scale-[0.98]">
          <Download
            size={20}
            className="group-hover:-translate-y-1 transition-transform duration-300"
          />{' '}
          Recibir Cap. 1 Gratis
        </button>
      </div>

      <div className="text-center border-t border-gray-100 pt-6">
        <p className="text-xs text-[#94A3B8] font-medium tracking-wide">
          ¿Ya estás convencido?{' '}
          <a
            href="#"
            className="text-[#EC008C] font-bold hover:underline ml-1 uppercase text-[10px]"
          >
            Comprar versión completa ($15)
          </a>
        </p>
      </div>
    </div>
  );
};
