import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, ArrowRight, Zap, Building2, Globe, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- SCHEMA & TYPES ---
const auditSchema = z.object({
    companyName: z.string().min(2, "Nombre de empresa requerido"),
    websiteUrl: z.string().url("URL inválida (https://...)"),
    email: z.string().email("Email corporativo requerido"),
    focus: z.enum(["performance", "security", "scalability", "ai"]),
});

type AuditFormData = z.infer<typeof auditSchema>;

// --- COMPONENT ---
export function AuditForm() {
    const [step, setStep] = useState<'idle' | 'scanning' | 'weighing' | 'success'>('idle');

    const { register, handleSubmit, formState: { errors } } = useForm<AuditFormData>({
        resolver: zodResolver(auditSchema),
    });

    const onSubmit = async (data: AuditFormData) => {
        setStep('scanning');

        try {
            // 1. SCANNING SIMULATION (Visual sugar before the heavy lifting)
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStep('weighing');

            // 2. NEURAL UPLINK (Real Backend Call)
            const neuralAudit = httpsCallable(functions, 'neuralAudit');
            const response = await neuralAudit(data);

            const result = response.data as { docUrl?: string };
            console.log("Neural/Response:", result);

            if (result.docUrl) {
                // Success
                setStep('success');
            } else {
                throw new Error("No Neural Response");
            }

        } catch (error) {
            console.error("Neural/Error:", error);
            // Revert to idle or show error state (For now, just log and keep spinning to maintain illusion or reset)
            alert("Neural Link Interrupted. Check console.");
            setStep('idle');
        }
    };

    return (
        <div
            className="w-full max-w-lg mx-auto relative group"
            data-agent-step={step}
        >
            {/* --- HOLO-CONTAINER --- */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#050505]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">

                {/* NOISE TEXTURE */}
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

                <AnimatePresence mode="wait">

                    {/* --- STATE: IDLE (FORM) --- */}
                    {step === 'idle' && (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6 relative z-10"
                        >
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-4">
                                    <Zap className="w-3 h-3" /> Neural Uplink Ready
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white mb-2">Auditoría Neuronal</h3>
                                <p className="text-slate-400 text-sm">Nuestra IA analizará tu infraestructura en tiempo real.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Input: Company */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Empresa</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            {...register('companyName')}
                                            data-agent-id="audit-input-company"
                                            className={cn(
                                                "w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all",
                                                errors.companyName && "border-red-500/50 focus:ring-red-500"
                                            )}
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                    {errors.companyName && <span className="text-xs text-red-400 ml-1">{errors.companyName.message}</span>}
                                </div>

                                {/* Input: URL */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sitio Web</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            {...register('websiteUrl')}
                                            data-agent-id="audit-input-url"
                                            className={cn(
                                                "w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all",
                                                errors.websiteUrl && "border-red-500/50 focus:ring-red-500"
                                            )}
                                            placeholder="https://acme.com"
                                        />
                                    </div>
                                    {errors.websiteUrl && <span className="text-xs text-red-400 ml-1">{errors.websiteUrl.message}</span>}
                                </div>

                                {/* Input: Email */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Técnico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            {...register('email')}
                                            data-agent-id="audit-input-email"
                                            className={cn(
                                                "w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all",
                                                errors.email && "border-red-500/50 focus:ring-red-500"
                                            )}
                                            placeholder="cto@acme.com"
                                        />
                                    </div>
                                    {errors.email && <span className="text-xs text-red-400 ml-1">{errors.email.message}</span>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                data-agent-id="audit-submit-btn"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.7)] transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <span>Iniciar Escaneo</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </motion.form>
                    )}

                    {/* --- STATE: SCANNING (TERMINAL) --- */}
                    {step === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-10"
                        >
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                                <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin-reverse"></div>
                                <Loader2 className="absolute inset-0 w-full h-full text-blue-400/50 p-6 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Analizando Arquitectura...</h3>
                            <div className="w-full max-w-xs bg-black/50 rounded-lg p-4 font-mono text-[10px] text-green-400/80 leading-relaxed overflow-hidden h-24 relative">
                                <ul className="space-y-1">
                                    <li className="typewriter-line-1">&gt; Conectando con Gemini 1.5 Pro... [OK]</li>
                                    <li className="typewriter-line-2">&gt; Escaneando headers HTTP... [200 OK]</li>
                                    <li className="typewriter-line-3">&gt; Verificando latencia global... [14ms]</li>
                                    <li className="typewriter-line-4">&gt; Detectando fugas de seguridad...</li>
                                </ul>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- STATE: WEIGHING (THINKING) --- */}
                    {step === 'weighing' && (
                        <motion.div
                            key="weighing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-10"
                        >
                            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                                <BrainIcon className="w-10 h-10 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Generando Informe Inteligente</h3>
                            <p className="text-slate-400 text-sm text-center max-w-xs">
                                Estamos redactando un Google Doc nativo con los hallazgos para tu equipo de ingeniería.
                            </p>
                        </motion.div>
                    )}

                    {/* --- STATE: SUCCESS --- */}
                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Informe Generado</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                                Hemos enviado el documento de auditoría ("audit_2026.gdoc") a tu correo corporativo.
                            </p>
                            <button
                                onClick={() => setStep('idle')}
                                className="text-xs text-slate-500 hover:text-white underline decoration-slate-700 underline-offset-4 transition-colors"
                            >
                                Volver al inicio
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

// Icon wrapper
function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.97-3.29" /><path d="M19.97 14.71a4 4 0 0 1-1.97 3.29" /></svg>
    )
}
