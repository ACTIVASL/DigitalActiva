import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  UserPlus,
  Users,
  Activity,
  MonitorPlay,
  GraduationCap,
} from 'lucide-react';

const logoImg = '/logo-v2.png';

const CRM_URL = 'https://activa-sl-digital.web.app';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'SOLUCIONES', href: '/programas', icon: Activity },
    { label: 'EMPRESAS', href: '/programas?tab=profesionales', icon: GraduationCap },
    { label: 'BLOG', href: '/blog', icon: MonitorPlay },
    { label: 'FAQ', href: '/#faq', icon: Users },
    { label: 'NOSOTROS', href: '/#nosotros', icon: Users },
  ];

  return (
    <header>
      {/* Skip to Content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-6 focus:py-3 focus:bg-brand-primary focus:text-white focus:rounded-full focus:font-bold focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <nav
        role="navigation"
        aria-label="Menú principal"
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-white/5 py-4'
          : 'bg-slate-900/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/5 py-6'
          }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-12 items-center gap-4">
            {/* LEFT: Logo Premium (Activa) */}
            <div className="lg:col-span-2 flex items-center justify-start">
              <Link to="/" className="flex items-center gap-4 group cursor-pointer">
                {/* PREMIUM GLOSS BEZEL - NANO FIT 35PX */}
                <div className="relative w-[35px] h-[35px] rounded-full p-[0px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)] ring-1 ring-brand-primary/30 overflow-hidden">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative">

                    {/* Subtle Top Shine */}
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-20 pointer-events-none transform -rotate-45 z-20"></div>

                    {/* Image - NANOSCALE CONTAIN */}
                    <img
                      src={logoImg}
                      alt="ACTIVA SL DIGITAL"
                      className="w-full h-full object-contain relative z-10 brightness-110 contrast-110"
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* CENTER: Premium Tabs Menu */}
            <div className="hidden lg:flex lg:col-span-8 items-center justify-center h-full">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 shadow-sm backdrop-blur-md">
                {menuItems.map((item) => (
                  item.href.startsWith('#') || item.href.includes('#') ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="px-5 py-2 text-sm font-display font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-300 relative group tracking-wider"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="px-5 py-2 text-sm font-display font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-300 relative group tracking-wider"
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex lg:col-span-2 items-center justify-end gap-4">
              {/* INICIAR SESION CTA */}
              <a
                href={CRM_URL}
                className="hidden lg:flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-900 border border-brand-primary/50 text-white shadow-[0_0_20px_-5px_rgba(96,165,250,0.5)] hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.8)] hover:border-brand-primary hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95 group relative overflow-hidden"
              >
                <UserPlus className="w-4 h-4 text-white relative z-10" />
                <span className="text-xs font-display font-bold uppercase tracking-widest relative z-10">
                  INICIAR SESIÓN
                </span>
              </a>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 text-white bg-white/10 border border-slate-700 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Corporate Dark PREMIUM */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className={`lg:hidden fixed top-0 left-0 w-full h-screen bg-slate-950/95 backdrop-blur-2xl z-40 transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-100%] pointer-events-none'
            }`}
          style={{ paddingTop: '80px' }}
        >
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none"></div>

          <div className="relative h-full overflow-y-auto px-6 pt-8 pb-12 flex flex-col">
            {/* Mobile Links with Staggered Entrance */}
            <div className="flex-1 space-y-8 flex flex-col justify-center min-h-[50vh]">
              {menuItems.map((item, index) => {
                // Stagger Logic: 100ms delay per item
                const delay = `${index * 100}ms`;
                return (
                  <div
                    key={item.label}
                    className={`transform transition-all duration-700 ease-out ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    style={{ transitionDelay: isMenuOpen ? delay : '0ms' }}
                  >
                    {item.href.startsWith('#') || item.href.includes('#') ? (
                      <a
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-4xl sm:text-5xl font-display font-thin tracking-tight text-white/80 hover:text-white hover:pl-4 transition-all duration-300 border-l-2 border-transparent hover:border-brand-primary"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-4xl sm:text-5xl font-display font-thin tracking-tight text-white/80 hover:text-white hover:pl-4 transition-all duration-300 border-l-2 border-transparent hover:border-brand-primary"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Actions with Fade In */}
            <div
              className={`pt-8 border-t border-white/10 space-y-6 transform transition-all duration-1000 delay-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
            >
              <a
                href={CRM_URL}
                className="flex items-center justify-center gap-3 w-full py-5 rounded-full bg-white text-slate-950 font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
              >
                <UserPlus className="w-5 h-5" />
                ACCESO CLIENTES
              </a>

              <div className="text-center">
                <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">Activa S.L. Digital Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
