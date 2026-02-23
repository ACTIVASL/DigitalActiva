import { useState, useEffect } from 'react';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { app } from './firebase'; // Import app instance directly

// UI Imports (Assuming these exist and work)
import { PremiumBackground } from '@monorepo/ui-system';
import { ArrowRight } from 'lucide-react';
import logoTitanium from './assets/logo-titanium.png';

// --- V2: BARE METAL AUTH ---
// No hooks, no abstractions. Direct SDK calls.

export const LoginViewV2 = () => {
    const [status, setStatus] = useState<string>('Ready');
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Add log helper
    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 8));
    };

    // 1. Initial Diagnostics
    useEffect(() => {
        const auth = getAuth(app);
        addLog(`System Init. SDK: v${import.meta.env.VITE_FIREBASE_API_KEY ? 'OK' : 'MISSING'}`);
        addLog(`ApiKey: ${import.meta.env.VITE_FIREBASE_API_KEY?.slice(0, 6)}...`);
        addLog(`Auth Domain: ${auth.config.authDomain}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoogleLogin = async () => {
        if (loading) return;

        setLoading(true);
        setStatus('Initializing...');
        addLog('--- STARTING AUTH SEQUENCE ---');

        try {
            const auth = getAuth(app);
            addLog('1. Auth Instance: OK');

            // A. Persistence
            addLog('2. Setting Persistence...');
            await setPersistence(auth, browserLocalPersistence);
            addLog('Persistence: LOCAL');

            // B. Provider
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            addLog('3. Provider Configered (Select Account)');

            // C. Popup
            setStatus('Waiting for User...');
            addLog('4. Opening Popup...');

            const result = await signInWithPopup(auth, provider);

            // D. Success
            if (result.user) {
                setStatus('SUCCESS');
                addLog(`5. SUCCESS! User: ${result.user.email}`);
                addLog('Reloading in 2s...');

                setTimeout(() => {
                    window.location.reload(); // Hard reload to force app state sync
                }, 1500);
            }

        } catch (err: unknown) {
            setStatus('FAILED');

            let code = 'unknown';
            let msg = 'An unknown error occurred';

            // Safe extraction for standard JS errors and Firebase errors
            if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
                const fErr = err as { code: string; message: string };
                code = fErr.code;
                msg = fErr.message;
            } else if (err instanceof Error) {
                msg = err.message;
            } else if (typeof err === 'string') {
                msg = err;
            }

            addLog(`ERROR: ${code}`);
            addLog(`MSG: ${msg}`);

            if (code === 'auth/popup-blocked') {
                alert('EL NAVEGADOR BLOQUEÓ LA VENTANA. Por favor habilita popups para este sitio.');
            } else if (code === 'auth/popup-closed-by-user') {
                addLog('User closed popup.');
            } else {
                alert(`Error Login: ${code} - ${msg}`);
            }
        } finally {
            setLoading(false);
            if (status !== 'SUCCESS') setStatus('Ready');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-[#0f172a]">
            <PremiumBackground />

            <div className="relative z-50 w-full max-w-[420px] p-8 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">

                {/* HEADER */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 mb-4 rounded-full border-2 border-brand-primary overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <img src={logoTitanium} className="w-full h-full object-cover scale-110" alt="Logo" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">ACTIVA S.L.</h2>
                    <p className="text-xs font-bold text-cyan-400 tracking-[0.3em] mt-1">SISTEMA REINICIADO (V2)</p>
                </div>

                {/* --- THE BUTTON (REDESIGNED) --- */}
                <div className="space-y-6">
                    <div className="relative group">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl opacity-75 blur transition duration-200 ${loading ? 'animate-pulse' : ''}`}></div>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="relative w-full flex items-center justify-between px-6 py-4 bg-slate-900 rounded-xl leading-none overflow-hidden group-hover:bg-slate-800 transition-all border border-slate-700 hover:border-cyan-500/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white tracking-wide">GOOGLE WORKSPACE</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{loading ? 'CONECTANDO...' : 'ACCESO CORPORATIVO'}</p>
                                </div>
                            </div>
                            <ArrowRight className={`text-slate-500 group-hover:text-white transition-transform ${loading ? 'opacity-0' : 'group-hover:translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* --- FORENSIC TERMINAL (ALWAYS VISIBLE) --- */}
                <div className="mt-8 p-4 bg-black/80 rounded-xl border border-slate-800 font-mono text-[10px] text-green-500/80 h-40 overflow-y-auto custom-scrollbar shadow-inner">
                    <div className="flex justify-between border-b border-slate-800 pb-1 mb-2">
                        <span className="font-bold text-green-400">TERMINAL DE ACCESO</span>
                        <span className="text-slate-500">{status}</span>
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 border-l-2 border-transparent hover:border-green-500/50 pl-1">
                            {log}
                        </div>
                    ))}
                    {logs.length === 0 && <span className="opacity-30">Waiting for interaction...</span>}
                </div>

            </div>
        </div>
    );
}
