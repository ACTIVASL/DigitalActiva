import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, ShieldCheck, User } from 'lucide-react';
import { db, auth, functions } from '@monorepo/engine-auth';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

interface ChatMessage {
    id: string;
    sender: 'user' | 'atom' | 'system';
    text: string;
    timestamp: Date;
}

export function AtomChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- ATOM COMMAND BRIDGE (PURGADO - POLÍTICA ZERO-DOM 10/10) ---
    // La IA ya no tiene permiso para manipular el DOM (`eval`, `click`).
    // El frontend es estrictamente REACTIVO a los cambios que Súper Atom
    // hace directamente en Firestore vía los Endpoints M2M.
    useEffect(() => {
        (window as any).AtomBridge = {
            sendSystemMessage: async (text: string) => {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                try {
                    await addDoc(collection(db, 'chats', uid, 'messages'), {
                        text: text,
                        sender: 'system',
                        timestamp: serverTimestamp()
                    });
                } catch (e) { console.error(e); }
            },
            getPageContent: () => {
                console.warn("[ZERO-DOM POLICY] La IA intentó leer el DOM. Denegado.");
                return "ACCESO DENEGADO. LEY ANTI-RPA ACTIVA. LEE DIRECTAMENTE DE FIRESTORE.";
            },
            clickElement: (selector: string) => {
                console.warn(`[ZERO-DOM POLICY] La IA intentó clicar: ${selector}. Denegado.`);
                return "ACCESO DENEGADO. MUTACIONES SOLO POR API M2M.";
            }
        };
    }, []);
    // ---------------------------------------------------------------

    useEffect(() => {
        if (!isOpen) return;

        const uid = auth.currentUser?.uid;
        if (!uid) {
            setConnectionStatus('error');
            setMessages([{
                id: 'sys-error',
                sender: 'system',
                text: 'Error de Autenticación. No se encontró UID del sistema.',
                timestamp: new Date()
            }]);
            return;
        }

        setConnectionStatus('connecting');

        // Referencia a los mensajes del usuario actual (multi-tenant seguro)
        const messagesRef = collection(db, 'chats', uid, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedMessages: ChatMessage[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                loadedMessages.push({
                    id: doc.id,
                    sender: data.sender as 'user' | 'atom' | 'system',
                    text: data.text,
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
                });
            });

            setMessages(() => {
                // Si estaba conectando y acabo de cargar los mensajes, inyecto el sysmsg local
                if (connectionStatus !== 'connected') {
                    setConnectionStatus('connected');
                }

                // Mezclo el mensaje de sistema inicial con el historial real de BD
                const sysWelcome: ChatMessage = {
                    id: 'sys-welcome',
                    sender: 'system',
                    text: `Enlace Seguro Nube (Firestore) establecido. [UID: ${uid.substring(0, 6)}...]`,
                    timestamp: new Date()
                };

                // Si ya había mensajes, simplemente devuelvo los de DB.
                // Si es la primera carga de DB en esta sesión y estaba vacío, muestro el sysmsg seguido del historial si hubiera.
                return [sysWelcome, ...loadedMessages];
            });
        }, (error) => {
            console.error("Firestore Listen Error:", error);
            setConnectionStatus('error');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'system',
                text: 'Error de Red: No se pudo conectar a la base de datos segura.',
                timestamp: new Date()
            }]);
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- TITANIUM PULSE LOGIC ---
    // If the last message in the array is from the 'user', we assume Atom is processing/thinking in the cloud.
    const isAgentThinking = messages.length > 0 && messages[messages.length - 1].sender === 'user';

    useEffect(() => {
        if (isAgentThinking) {
            document.body.classList.add('titanium-active');
        } else {
            document.body.classList.remove('titanium-active');
        }

        // Cleanup on unmount to prevent stuck glow
        return () => {
            document.body.classList.remove('titanium-active');
        };
    }, [isAgentThinking]);
    // ----------------------------

    const handleSendMessage = async () => {
        if (!inputValue.trim() || connectionStatus !== 'connected') return;

        const text = inputValue.trim();
        setInputValue('');

        if (!permissionsGranted) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'atom',
                text: '[ALERTA DE SEGURIDAD]: Se requieren Permisos Corporativos para procesar este comando en el sistema de Activa SL.',
                timestamp: new Date()
            }]);
            return;
        }

        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
            const messagesRef = collection(db, 'chats', uid, 'messages');
            // 1. Inserción de la orden Humana
            await addDoc(messagesRef, {
                text: text,
                sender: 'user',
                timestamp: serverTimestamp()
            });

            // 2. Invocación Nativa a la Mente Orquestadora (Cloud Function)
            const callCeoAgent = httpsCallable(functions, 'ceoAgent');
            const result = await callCeoAgent({ message: text });

            // 3. Respuesta de confirmación en el Chat
            await addDoc(messagesRef, {
                text: (result.data as any).reply || "Orden procesada por el departamento táctico.",
                sender: 'atom',
                timestamp: serverTimestamp()
            });

        } catch (e: any) {
            console.error("Fallo en el enlace con ceoAgent:", e);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'system',
                text: `[ERROR M2M]: Enlace roto con el Orquestador. Detalle: ${e.message}`,
                timestamp: new Date()
            }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="mb-4 w-[380px] h-[550px] max-h-[80vh] bg-[#060C1A]/95 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.25)] rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 border-b border-indigo-500/20 bg-indigo-900/20 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                {connectionStatus === 'connected' && (
                                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#060C1A]"></span>
                                    </span>
                                )}
                                {connectionStatus === 'error' && (
                                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#060C1A]"></span>
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white font-bold tracking-wide text-sm">ATOM LIVE AGENT</h2>
                                <span className={`text-[10px] flex items-center gap-1.5 font-mono ${connectionStatus === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {connectionStatus === 'connected' ? 'ENLACE NUBE ACTIVO' : connectionStatus.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPermissionsGranted(!permissionsGranted)}
                                className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center border ${permissionsGranted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                                title="Otorgar permisos"
                            >
                                <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat History Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 premium-scrollbar bg-slate-900/50">
                        {messages.length === 0 && connectionStatus === 'connected' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                                <Bot className="w-8 h-8 opacity-50" />
                                <p>Sistemas enlazados. Transmite tu primera directiva.</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                {msg.sender === 'system' ? (
                                    <div className={`text-[10px] uppercase font-bold tracking-widest my-2 mx-auto px-3 py-1 rounded-full text-center ${msg.text.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                                        {msg.text}
                                    </div>
                                ) : (
                                    <div className={`max-w-[85%] rounded-2xl p-3 shadow-md ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 border border-indigo-500/20 text-slate-200 rounded-bl-sm'}`}>
                                        <div className="flex items-center gap-2 mb-1.5 opacity-80">
                                            {msg.sender === 'atom' ? <Bot className="w-3 h-3 text-indigo-400" /> : <User className="w-3 h-3 text-indigo-200" />}
                                            <span className={`text-[9px] font-bold ${msg.sender === 'user' ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                                {msg.sender === 'user' ? 'Samuel' : 'Atom'}
                                            </span>
                                            <span className="text-[9px] mx-auto opacity-50">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-indigo-500/20 bg-slate-900/80 backdrop-blur-md">
                        <div className="relative flex flex-col gap-2">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={connectionStatus === 'connected' ? "Mensaje para Atom..." : "Desconectado"}
                                    disabled={connectionStatus !== 'connected'}
                                    className="w-full bg-[#0B1121] border border-slate-700/50 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || connectionStatus !== 'connected'}
                                    className="absolute right-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-transparent disabled:text-slate-600 text-white rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING BUTTON (Only shown when closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-[60px] h-[60px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_40px_rgba(79,70,229,0.8)] transition-all duration-300 transform hover:scale-105 border border-indigo-300/30"
                >
                    <Bot className="w-7 h-7 text-white" />

                    {/* Pulsing indicator if connected / idle */}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0B1121]"></span>
                    </span>

                    {/* Hover Tooltip/Label */}
                    <div className="absolute right-[75px] top-1/2 -translate-y-1/2 px-4 py-2 bg-[#0B1121] text-indigo-300 text-xs font-bold tracking-widest uppercase rounded-xl border border-indigo-500/30 shadow-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
                        Atom IA
                    </div>
                </button>
            )}
        </div>
    );
}
