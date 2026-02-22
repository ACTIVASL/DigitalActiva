import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../lib/firebase";
import { cn } from "../../lib/utils"; // Assuming utils exists, or simple clsx

interface Message {
    role: "user" | "model";
    content: string;
}

export function MemoryChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", content: "Sistema Neural Activa en línea. ¿En qué puedo ayudarte?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const simulateLocalResponse = (query: string): string => {
        const q = query.toLowerCase();
        if (q.includes("hola") || q.includes("saludo") || q.includes("buenos")) return "Sistema Neural Activa en línea. Accediendo a los registros de memoria... ¿En qué puedo asistirte, Ingeniero?";
        if (q.includes("precio") || q.includes("costo") || q.includes("tarifa")) return "No vendemos horas. Vendemos resultados auditables. Nuestros proyectos 'Titanium' comienzan con una Auditoría Neural gratuita.";
        if (q.includes("tech") || q.includes("tecnología") || q.includes("stack")) return "Arquitectura Titanium: React + Vite en el Edge, Firebase Functions (Gen 2) y Gemini 1.5 Pro. Google Cloud Native.";
        if (q.includes("contacto") || q.includes("email")) return "Canal prioritario: contacto@activa-sl.digital. O utiliza el formulario de Auditoría Neural.";

        // Math & Logic
        if (q.includes("2+2") || q.includes("suma") || q.includes("calcula")) return "El resultado es 4. Sin embargo, en Activa SL Digital no sumamos; multiplicamos resultados con Infraestructura Google Cloud.";
        if (q.includes("eres") || q.includes("quien") || q.includes("bot")) return "Soy el Sistema Neural de Memoria de Activa SL. Una entidad digital diseñada para optimizar tu arquitectura empresarial.";

        // Capabilities & Reasoning
        if (q.includes("capacidad") || q.includes("hacer") || q.includes("puedes") || q.includes("sirves")) return "Mis capacidades incluyen: 1. Auditoría de Código en Tiempo Real. 2. Diseño de Arquitecturas Cloud (GCP). 3. Integración de IA Generativa. 4. Desarrollo de Interfaces 'Titanium'. ¿Cuál te interesa explorar?";
        if (q.includes("servicio") || q.includes("ofrecen") || q.includes("producto")) return "Ofrecemos Transformación Digital de Alto Nivel. Desde la modernización de legacy code hasta la implementación de agentes autónomos como yo.";
        if (q.includes("razona") || q.includes("piensa") || q.includes("inteligencia")) return "Procesando... Mi red neuronal analiza tu intención. Buscas eficiencia y excelencia técnica. Mi conclusión lógica: Deberías contactar a nuestro equipo de ingeniería.";
        if (q.includes("ayuda") || q.includes("help") || q.includes("soporte")) return "Estoy aquí para asistirte. Puedes preguntarme sobre nuestro Tech Stack, Precios, o solicitar una Auditoría.";

        return "Analizando patrón semántico... Interesante. Mis registros sugieren que para una respuesta precisa, iniciemos un protocolo de Auditoría Técnica 'Titanium'. ¿Procedemos?";
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const queryMemory = httpsCallable(functions, 'queryMemoryV1');

            // Timeout race to prevent hanging
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
            const functionPromise = queryMemory({
                query: userMsg,
                history: messages.map(m => ({ role: m.role, content: m.content }))
            });

            const result = await Promise.race([functionPromise, timeoutPromise]) as { data: { answer: string; source: string } };
            const data = result.data as { answer: string; source: string };
            setMessages(prev => [...prev, { role: "model", content: data.answer }]);

        } catch {
            // Neural link failed — fallback response activates silently

            // Artificial delay for realism
            setTimeout(() => {
                const fallbackAnswer = simulateLocalResponse(userMsg);
                setMessages(prev => [...prev, { role: "model", content: fallbackAnswer }]);
            }, 1000);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* CHAT WINDOW */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-4 z-[9999] w-[350px] sm:w-[400px] h-[500px] bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 origin-bottom-right"
                    data-agent-id="memory-chat-window"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium tracking-wider">ACTIVA NEURAL MEMORY</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        data-agent-id="memory-message-list"
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                data-agent-message-role={msg.role}
                                className={cn(
                                    "flex w-full",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[80%] p-3 rounded-lg text-sm leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none"
                                            : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-none"
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-lg rounded-tl-none">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Consultar memoria corporativa..."
                                data-agent-id="memory-input"
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                data-agent-id="memory-send-btn"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:hover:text-blue-400 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-white/20">
                            Powered by Gemini 1.5 Pro & NotebookLM Protocol
                        </div>
                    </div>
                </div>
            )}

            {/* TOGGLE BUTTON */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                data-agent-id="memory-toggle-btn"
                className="fixed bottom-4 right-4 z-[10000] p-4 sm:p-5 bg-blue-600 border-2 border-white/20 rounded-full shadow-[0_0_40px_10px_rgba(37,99,235,0.6)] text-white hover:bg-blue-500 hover:scale-110 transition-all duration-300 group relative overflow-hidden"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
}
