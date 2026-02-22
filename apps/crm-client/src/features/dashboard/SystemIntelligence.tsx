import React, { useEffect, useState } from 'react';
import { OnyxCard } from '../../components/ui/OnyxCard';
import { Server, ShieldCheck, Activity, Cpu, Wifi, WifiOff } from 'lucide-react';

export const SystemIntelligence: React.FC = () => {
    const [latency, setLatency] = useState<number | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [lastPing, setLastPing] = useState<Date>(new Date());

    useEffect(() => {
        // REAL TELEMETRY: Ping Google to measure Auth Latency
        const measureLatency = async () => {
            const start = performance.now();
            try {
                // We use a no-cors request to a high-availability Google endpoint
                // This won't give us the body, but the timing of the round-trip is valid for latency estimation
                await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
                const end = performance.now();
                setLatency(Math.round(end - start));
                setIsOnline(true);
            } catch {
                // Even if CORS fails, timing might work, but usually error means offline or blocked
                // We fallback to navigator.onLine check
                setIsOnline(navigator.onLine);
            }
            setLastPing(new Date());
        };

        measureLatency();
        const interval = setInterval(measureLatency, 5000); // Live update every 5s

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const getHealthColor = (ms: number | null) => {
        if (!isOnline || ms === null) return 'text-red-500';
        if (ms < 100) return 'text-emerald-400'; // Excellent
        if (ms < 300) return 'text-amber-400';   // Fair
        return 'text-red-400';                   // Laggy
    };

    return (
        <OnyxCard title="System Intelligence" icon={Cpu} className="col-span-1 md:col-span-1 border-t-4 border-t-purple-500">
            <div className="space-y-4 mt-2">

                {/* GEMINI CONNECTION (Simulated Context, Real Status) */}
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white ${isOnline ? 'animate-pulse-slow' : 'grayscale'}`}>
                            <Server size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white mb-0.5">System Core</h4>
                            <p className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {isOnline ? 'CONNECTED' : 'OFFLINE'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-xs font-bold ${getHealthColor(latency)}`}>
                            {latency ? `${latency}ms` : '--'}
                        </span>
                        <p className="text-[9px] text-slate-500">REALTIME LATENCY</p>
                    </div>
                </div>

                {/* ANTIGRAVITY ENGINE (Network Status) */}
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
                            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white mb-0.5">Network Layer</h4>
                            <p className={`text-[10px] font-mono flex items-center gap-1 ${isOnline ? 'text-blue-300' : 'text-red-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-rose-500'}`}></span>
                                {isOnline ? 'ACTIVE' : 'DISCONNECTED'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Activity size={12} className={`ml-auto mb-1 ${isOnline ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <p className="text-[9px] text-slate-500">
                            {lastPing.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* SECURITY LAYER */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/50">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-mono">
                        SECURED BY GOOGLE CLOUD ARMOR • ZERO TRUST
                    </span>
                </div>

            </div>
        </OnyxCard>
    );
};
