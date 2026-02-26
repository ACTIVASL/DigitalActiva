import React, { useState, useEffect } from 'react';
import { useFirebaseAuthState } from './useAuth';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  Lock
} from 'lucide-react';
import { TitaniumBackground } from '@monorepo/ui-system';

export interface LoginViewProps {
  logoUrl?: string;
  onLoginSuccess?: () => void;
}

/* eslint-disable */
export const LoginView = ({ }: LoginViewProps) => {
  const { user, signIn, signUp, signInWithGoogle, loading, error: authError } = useFirebaseAuthState();
  const navigate = useNavigate();

  // TITANIUM: Standard Guest Guard
  // If user is detected (via the Combined Brain), go to Dashboard.
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Feature States
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isRegistering) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
      // Navigation handled by useEffect
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    // Navigation handled by useEffect
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-[#0f172a]">
      {/* 1. BACKGROUND: TITANIUM CORPORATE */}
      <TitaniumBackground />

      {/* 2. MAIN CARD: ULTRA GLASSMORPHISM */}
      <div
        className="relative z-50 w-full max-w-[400px] p-8 md:p-10 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] ring-1 ring-white/5"
      >

        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative w-32 h-32 mb-6 group cursor-default scale-110">
            {/* Glow Behind */}
            <div className="absolute inset-0 rounded-full bg-blue-600 opacity-40 blur-xl animate-pulse-slow"></div>

            {/* Logo Container - Circular Mask + Border */}
            <div className="relative w-full h-full rounded-full border-[3px] border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.6)] flex items-center justify-center overflow-hidden bg-[#020617] ring-1 ring-white/20">
              <img
                src="/activa-logo-new.png"
                alt="Activa Logo"
                className="w-full h-full object-contain p-0"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white tracking-tight font-display mb-1">
            ACTIVA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">SL</span>
          </h2>
          <p className="text-sm font-medium text-slate-400 tracking-[0.3em] uppercase">
            BIENVENIDO
          </p>
        </div>

        {/* AUTH ERROR MESSAGE */}
        {authError && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-3 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300 font-medium">{authError}</p>
          </div>
        )}

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-[0.2em] pl-1">
              ID Profesional
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur-[2px]"></div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="ID Corporativo"
                className="relative w-full bg-[#050b14]/90 border border-slate-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 placeholder:text-slate-700 font-medium tracking-wide"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-[0.2em] pl-1">
              Contraseña
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur-[2px]"></div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegistering ? "new-password" : "current-password"}
                placeholder="••••••••••••"
                className="relative w-full bg-[#050b14]/90 border border-slate-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 placeholder:text-slate-700 font-medium tracking-wide"
              />
            </div>
          </div>

          {/* EXTRAS */}
          <div className="flex items-center justify-between px-1 pt-2">
            {!isRegistering && (
              <div
                className="flex items-center group cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center mr-2 ${rememberMe ? 'bg-brand-primary border-brand-primary' : 'border-slate-600 bg-transparent group-hover:border-slate-500'}`}>
                  {rememberMe && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <span className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors select-none">Recordarme</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-bold text-brand-primary hover:text-blue-400 transition-colors uppercase tracking-wider ml-auto"
            >
              {isRegistering ? 'Ya tengo cuenta' : 'Crear cuenta'}
            </button>
          </div>

          <div className="pt-4 space-y-4">
            {/* HIDDEN SUBMIT FOR "ENTER" KEY SUPPORT */}
            <button type="submit" className="hidden" disabled={loading}></button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#050b14] px-2 text-slate-600">Acceso Corporativo</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-3 px-4 py-4 border border-slate-700 rounded-xl bg-slate-800/50 text-sm font-bold text-white shadow-lg hover:bg-slate-800 hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer relative z-50`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>GOOGLE WORKSPACE</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform ml-auto" />
            </button>
          </div>
        </form>

        {/* Footer Credits */}
        <div className="mt-8 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5">
            <Lock size={10} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Secured by Activa Cloud
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
