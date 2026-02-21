/**
 * EDGE CONNECTION SERVICE
 * The "Fiber Optic Cable" of Activa SL.
 * 
 * ROLE:
 * This service does NOT think. It only LISTENS.
 * It connects to the "Nervous System" (Google Antigravity/Firestore) and
 * streams real-time updates to the UI.
 * 
 * DATASOURCE:
 * Currently simulates high-frequency updates from Gemini.
 * In production, this will listen to Firestore 'system_events' collection.
 */

export type PulseType = 'normal' | 'warning' | 'critical' | 'success';

export interface SystemSignal {
    id: string;
    source: 'Gemini' | 'NotebookLM' | 'Antigravity' | 'Drive';
    message: string;
    type: PulseType;
    timestamp: number;
    department?: string;
}

type SignalCallback = (signal: SystemSignal) => void;

class EdgeConnectionService {
    private subscribers: SignalCallback[] = [];
    private pulseInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        this.initializeConnection();
    }

    private initializeConnection() {
        // SIMULATION MODE: Simulating the "Heartbeat" of a busy company
        console.log("[Antigravity] Initializing Quantum Link...");
        setTimeout(() => {
            this.startSimulation();
            this.emit({
                id: 'init',
                source: 'Antigravity',
                message: 'Conexión Segura Establecida con Nodos Empresariales.',
                type: 'success',
                timestamp: Date.now()
            });
        }, 1500);
    }

    public subscribe(callback: SignalCallback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
            // Cleanup interval if no more subscribers
            if (this.subscribers.length === 0 && this.pulseInterval) {
                clearInterval(this.pulseInterval);
                this.pulseInterval = null;
            }
        };
    }

    private emit(signal: SystemSignal) {
        this.subscribers.forEach(cb => cb(signal));
    }

    // SIMULATION ENGINE (PROTOTYPE ONLY)
    // In production, this is replaced by onSnapshot()
    private startSimulation() {
        const events: Partial<SystemSignal>[] = [
            { source: 'NotebookLM', message: 'Gemini analizando notas de Laura (Terapia)...', type: 'normal' },
            { source: 'Drive', message: 'Nuevo contrato subido por RRHH.', type: 'success' },
            { source: 'Gemini', message: 'Detectado patrón de gasto anómalo en Logística.', type: 'warning' },
            { source: 'Antigravity', message: 'Sincronizando 124 cuadernos operativos...', type: 'normal' },
            { source: 'NotebookLM', message: 'Pedro (Mantenimiento) ha cerrado ticket #882.', type: 'success' },
            { source: 'Gemini', message: '¡Alerta de Rentabilidad! Proyecto Alpha cae al 12%.', type: 'critical' },
            { source: 'Drive', message: 'Actualizando hoja de cálculo maestra...', type: 'normal' },
        ];

        this.pulseInterval = setInterval(() => {
            // Random heartbeat
            if (Math.random() > 0.6) {
                const event = events[Math.floor(Math.random() * events.length)];
                this.emit({
                    id: Date.now().toString(),
                    source: event.source as SystemSignal['source'],
                    message: event.message!,
                    type: event.type as PulseType,
                    timestamp: Date.now(),
                    department: 'General'
                });
            }
        }, 3000); // Pulse every ~3 seconds
    }
}

export const EdgeConnection = new EdgeConnectionService();
