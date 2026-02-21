

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center relative overflow-hidden">
            {/* BACKGROUND ANIMATION */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-brand-dark to-brand-dark z-0" />

            <div className="relative z-10 text-center px-6">
                <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-6 uppercase tracking-tight">
                    Centro de Comando <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Titanium AI</span>
                </h1>
                <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light">
                    Protocolo de Inteligencia Artificial Activa S.L. Digital.<br />
                    Utilice la interfaz neuronal para consultas técnicas o auditorías.
                </p>

                <div className="animate-bounce text-blue-400 mt-10">
                    <p className="text-sm font-mono uppercase tracking-widest mb-2">Iniciar Interfaz</p>
                    <div className="w-px h-10 bg-gradient-to-b from-blue-400 to-transparent mx-auto"></div>
                </div>
            </div>

            {/* The global MemoryChat is in App.tsx, but if we want to force it open or style it differently, we could. 
                For now, relying on the global one is consistent. 
            */}
        </div>
    );
}
