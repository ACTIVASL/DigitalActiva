import { Linkedin, Github, Mail } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5 font-sans relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                    {/* BRAND COLUMN */}
                    <div className="md:col-span-5 space-y-8">
                        <h2 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-3">
                            <img src="/logo-v2.png" alt="ACTIVA SL Digital" className="w-10 h-10 rounded shadow-[0_0_15px_-3px_rgba(96,165,250,0.5)]" />
                            ACTIVA SL DIGITAL.
                        </h2>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            Ingeniería de software para empresas que escalan.
                            <br />Código en propiedad. Sin deuda técnica.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com/ACTIVASL" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-brand-primary hover:text-black transition-all" aria-label="GitHub">
                                <Github size={20} />
                            </a>
                            <a href="https://www.linkedin.com/company/activa-sl-digital" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-brand-primary hover:text-black transition-all" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                            <a href="mailto:contacto@activa-sl.digital" className="p-2 rounded-full bg-white/5 hover:bg-brand-primary hover:text-black transition-all" aria-label="Email">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* NEWSLETTER & SITEMAP */}
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="sm:col-span-3 lg:col-span-1">
                            <h4 className="font-display font-bold text-lg mb-6 text-white">Contacto</h4>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400">¿Listo para escalar tu negocio con tecnología propia?</p>
                                <a
                                    href="mailto:contacto@activa-sl.digital?subject=Consulta%20desde%20web"
                                    className="block w-full py-3 bg-brand-primary/10 border border-brand-primary/50 text-brand-primary text-xs font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-black transition-all rounded-lg text-center"
                                >
                                    Solicitar Reunión
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-lg mb-6 text-white">Soluciones</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><a href="/programas?tab=captacion" className="hover:text-brand-primary hover:tracking-widest hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 block w-fit">Web High-Perf</a></li>
                                <li><a href="/programas?tab=organizacion" className="hover:text-brand-primary hover:tracking-widest hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 block w-fit">CRM Titanium</a></li>
                                <li><a href="/programas?tab=movil" className="hover:text-brand-primary hover:tracking-widest hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 block w-fit">Apps PWA</a></li>
                                <li><a href="/for-agents.html" className="font-mono text-xs text-brand-primary/50 hover:text-brand-primary uppercase tracking-widest transition-all block w-fit mt-4 border border-brand-primary/20 px-2 py-1 rounded">Agent Protocol [A2A]</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-lg mb-6 text-white">Empresa</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><a href="#nosotros" className="hover:text-brand-primary hover:tracking-widest hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 block w-fit">Quiénes Somos</a></li>
                                <li><a href="#proyectos" className="hover:text-brand-primary hover:tracking-widest hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 block w-fit">Casos de Éxito</a></li>
                                <li><a href="mailto:contacto@activa-sl.digital" className="hover:text-brand-primary hover:tracking-widest hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 block w-fit">Contacto</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© 2026 ACTIVA SL DIGITAL. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                        <span className="text-blue-400 font-bold tracking-wider text-xs uppercase">Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
