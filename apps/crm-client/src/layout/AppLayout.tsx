import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar'; // Keep Sidebar for "Tools" navigation
import { MobileBottomNav } from './MobileBottomNav';
import { useUIStore } from '../stores/useUIStore';
import { TitaniumBackground } from '@monorepo/ui-system';
import logoCircular from '../assets/logo-alpha.png';
import { Bell } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  userEmail: string;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentView,
  onNavigate,
  userEmail,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { quickAppointment } = useUIStore();

  // TITANIUM FOCUS MODE: Hide Nav on Mobile Input Focus
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // check if text input
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsFocused(true);
      }
    };
    const handleBlur = () => setIsFocused(false);

    // Capture phase is better for focus events on window
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);
    return () => {
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] relative overflow-hidden bg-[#050505] font-sans text-slate-200">

      {/* 1. ONYX STEALTH BACKGROUND */}
      <TitaniumBackground />

      {/* 2. SIDEBAR (TOOLS & UTILITIES) */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        userEmail={userEmail}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={onLogout}
      />

      {/* 3. MOBILE NAV */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onNewAction={() => quickAppointment.open('new')}
        isMenuOpen={isMobileMenuOpen}
        isFocused={isFocused}
      />

      {/* 4. MAIN EXECUTIVE STACK */}
      <main
        id="executive-stack"
        className="flex-1 relative z-10 h-screen overflow-y-auto overflow-x-hidden flex flex-col no-select scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {/* EXECUTIVE HEADER (Sticky) */}
        <header className="sticky top-0 z-50 w-full px-6 py-3 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 shadow-lg">
              <img src={logoCircular} alt="Activa Logo" className="w-5 h-5 opacity-90" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xs font-bold tracking-[0.2em] text-white">ACTIVA <span className="text-slate-500">DIGITAL_OS</span></h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-mono text-emerald-500/80">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>

          {/* GLOBAL COMMAND & SEARCH REMOVED */}\n          <div className="flex-1"></div>

          {/* NOTIFICATIONS & STATUS */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-black"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-800 hidden md:block"></div>
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-[10px] font-bold text-slate-300">SYSTEM V.4.2</span>
              <span className="text-[9px] font-mono text-slate-500">LATENCY: 12ms</span>
            </div>
          </div>
        </header>

        {/* CONTENT STACK */}
        <div className="w-full max-w-[1800px] mx-auto p-4 md:p-8 lg:p-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};
