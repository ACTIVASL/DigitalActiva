import React, { useState, useEffect } from 'react';
import {
    CheckCircle2, AlertCircle
} from 'lucide-react';

// import { useAuth } from '../../context/AuthContext'; // Removed unused

import {
    type SquadMember, type Insight, type SectionConfig, type SectionData, type ModelData,
    INITIAL_MODEL_DATA, SECTIONS,
} from './canvasData';

import { CanvasSidebar } from './CanvasSidebar';
// import { CompanyPulse } from '../dashboard/CompanyPulse'; // Removed
import { NotebookConsultationModal } from '../notebook/NotebookConsultationModal';
import { CanvasCard } from './components/CanvasCard';
import { SmartConnectionModal } from './components/SmartConnectionModal';

// --- VISUAL FLOW CONNECTOR (SVG) REMOVED ---


export default function StrategicCanvas() {
    // const { logout } = useAuth(); // Removed unused
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<SquadMember | null>(null);

    // handleLogout removed (unused)

    const [modelData, setModelData] = useState<ModelData>(() => {
        try {
            const saved = localStorage.getItem('activa_dashboard_v9');
            if (!saved) return INITIAL_MODEL_DATA;
            // Safe parsing with type assertion strategy
            const parsed = JSON.parse(saved) as Record<string, unknown>;
            const merged: ModelData = { ...INITIAL_MODEL_DATA };

            Object.keys(parsed).forEach(key => {
                if (merged[key]) {
                    const rawData = parsed[key] as Record<string, unknown>;

                    // Start with safe merge of simple properties
                    const rawSquad = rawData.squad as Record<string, unknown>[];
                    const squad = Array.isArray(rawSquad) ? rawSquad.map((m) => ({
                        ...m,
                        active: m.active !== undefined ? m.active : true,
                        // Ensure required fields exist if they were missing in legacy data
                        role: m.role || "Unknown Role",
                        salary: m.salary || 0,
                        function: m.function || "Unknown Function",
                        agent: m.agent || "ACTIVA-Bot",
                        result: m.result || "N/A"
                    })) as SquadMember[] : merged[key].squad;

                    merged[key] = {
                        ...merged[key],
                        ...(rawData as unknown as SectionData),
                        squad: squad
                    };
                }
            });
            return merged;
        } catch { return INITIAL_MODEL_DATA; }
    });

    useEffect(() => { try { localStorage.setItem('activa_dashboard_v9', JSON.stringify(modelData)); } catch { /* noop */ } }, [modelData]);

    const openEditor = (key: string) => setActiveSection(key);
    const closeEditor = () => setActiveSection(null);

    const handleUpdate = (updates: Partial<SectionData>) => {
        if (!activeSection) return;
        setModelData(prev => ({
            ...prev,
            [activeSection]: {
                ...prev[activeSection],
                ...updates
            }
        }));
    };

    const addInsight = (text: string, type: string) => {
        if (!activeSection) return;
        const insights = modelData[activeSection]?.insights || [];
        handleUpdate({ insights: [...insights, { id: Date.now(), text, type: type as 'strategy' | 'risk' | 'opportunity' }] });
    };

    const deleteInsight = (id: number) => {
        if (!activeSection) return;
        const insights = modelData[activeSection]?.insights || [];
        handleUpdate({ insights: insights.filter((i: Insight) => i.id !== id) });
    };

    const [draggedInsight, setDraggedInsight] = useState<Insight | null>(null);
    const [notification, setNotification] = useState<{ title: string; text: string; type: string } | null>(null);

    const handleDragStart = (e: React.DragEvent, insight: Insight) => { setDraggedInsight(insight); e.dataTransfer.effectAllowed = "copy"; };

    const handleDrop = (e: React.DragEvent, member: SquadMember, sectionContext: SectionConfig) => {
        e.preventDefault();
        if (!draggedInsight) return;
        if (!member.active) { setNotification({ title: 'Empleado Inactivo', text: 'No se pueden delegar tareas a empleados en reserva.', type: 'error' }); return; }
        const prompt = `🚨 *ASIGNACIÓN DE TAREA ESTRATÉGICA* 🚨\n\n👤 *Para:* ${member.role} (${sectionContext.title})\n🎯 *Objetivo del Dpto:* ${sectionContext.ceoObjective}\n📝 *Tarea Asignada:* ${draggedInsight.text}\n🏷️ *Tipo:* ${draggedInsight.type.toUpperCase()}\n\n> *INSTRUCCIÓN:* Como responsable de este área, analiza esta tarea y genera un plan de acción inmediato de 3 pasos.`;
        const ta = document.createElement("textarea"); ta.value = prompt; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.focus(); ta.select();
        try {
            document.execCommand('copy');
            setNotification({ title: `Tarea delegada a ${member.role}`, text: 'Instrucción copiada. Pegar en NotebookLM.', type: 'success' });
            setTimeout(() => { window.open(member.notebookUrl || 'https://notebooklm.google.com', '_blank'); }, 1200);
            setDraggedInsight(null); setTimeout(() => setNotification(null), 5000);
        } catch { setNotification({ title: 'Error al copiar', text: 'No se pudo copiar la instrucción automáticamente.', type: 'error' }); }
        document.body.removeChild(ta);
    };

    return (
        <div className="flex w-full h-screen bg-[#020617] font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">

            {/* 1. SIDEBAR NAVIGATION */}
            <CanvasSidebar
                activeSection={activeSection}
                onNavigate={setActiveSection}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* 2. MAIN CONTENT AREA - FIXED HEIGHT (Dashboard Mode) */}
            <div className="flex-1 relative h-full bg-[#020617] overflow-hidden">

                {/* BACKGROUND FX */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
                </div>

                {/* CONTENT CONTAINER - COMPACT PADDING */}
                <div className="relative z-10 w-full h-full mx-auto p-4 flex flex-col gap-3">

                    {/* TOP BAR REMOVED */}

                    {/* CANVAS GRID - FLEX COLUMN WITH OPTIMIZED PROPORTIONS */}
                    <main className="flex-1 flex flex-col gap-3 relative z-10 pb-4 min-h-0">

                        {/* TOP ROW (5 COLS) - Takes ~64% of vertical space */}
                        <div className="flex-[1.8] grid grid-cols-1 md:grid-cols-5 gap-3 min-h-0">
                            <CanvasCard section={SECTIONS.key_partners} data={modelData.key_partners} squadData={modelData.key_partners?.squad} onClick={() => openEditor('key_partners')} className="md:row-span-2 h-full" />
                            <div className="flex flex-col gap-3 h-full min-h-0">
                                <CanvasCard section={SECTIONS.key_activities} data={modelData.key_activities} squadData={modelData.key_activities?.squad} onClick={() => openEditor('key_activities')} className="flex-1 min-h-0" />
                                <CanvasCard section={SECTIONS.key_resources} data={modelData.key_resources} squadData={modelData.key_resources?.squad} onClick={() => openEditor('key_resources')} className="flex-1 min-h-0" />
                            </div>
                            <CanvasCard section={SECTIONS.value_propositions} data={modelData.value_propositions} squadData={modelData.value_propositions?.squad} onClick={() => openEditor('value_propositions')} className="md:row-span-2 h-full ring-4 ring-purple-500/10 border-purple-500/30 transform md:-translate-y-2 z-20 shadow-[0_0_50px_rgba(168,85,247,0.15)]" />
                            <div className="flex flex-col gap-3 h-full min-h-0">
                                <CanvasCard section={SECTIONS.customer_relationships} data={modelData.customer_relationships} squadData={modelData.customer_relationships?.squad} onClick={() => openEditor('customer_relationships')} className="flex-1 min-h-0" />
                                <CanvasCard section={SECTIONS.channels} data={modelData.channels} squadData={modelData.channels?.squad} onClick={() => openEditor('channels')} className="flex-1 min-h-0" />
                            </div>
                            <CanvasCard section={SECTIONS.customer_segments} data={modelData.customer_segments} squadData={modelData.customer_segments?.squad} onClick={() => openEditor('customer_segments')} className="md:row-span-2 h-full" />
                        </div>

                        {/* BOTTOM ROW (2 COLS) - Takes ~36% of vertical space via flex-1 */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
                            <CanvasCard section={SECTIONS.cost_structure} data={modelData.cost_structure} squadData={modelData.cost_structure?.squad} onClick={() => openEditor('cost_structure')} className="h-full min-h-0" />
                            <CanvasCard section={SECTIONS.revenue_streams} data={modelData.revenue_streams} squadData={modelData.revenue_streams?.squad} onClick={() => openEditor('revenue_streams')} className="h-full min-h-0" />
                        </div>
                    </main>
                </div>
            </div>

            {/* OVERLAYS (Outside main content for z-index containment) */}
            {notification && (
                <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-top-5 duration-300" role="alert" aria-live="assertive">
                    <div className={`backdrop-blur-md border px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-sm ${notification.type === 'error' ? 'bg-red-900/90 border-red-500/50' : 'bg-slate-800/90 border-emerald-500/50'}`}>
                        <div className={`p-2 rounded-full ${notification.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {notification.type === 'error' ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <div><h4 className={`font-bold text-sm ${notification.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{notification.title}</h4><p className="text-xs text-slate-300 mt-1">{notification.text}</p></div>
                    </div>
                </div>
            )}

            {activeSection && (
                <SmartConnectionModal section={SECTIONS[activeSection]} data={modelData[activeSection]} onClose={closeEditor} onChange={handleUpdate} onAddInsight={addInsight} onDeleteInsight={deleteInsight} onDragStart={handleDragStart} onDropMember={handleDrop} draggedInsight={draggedInsight} />
            )}

            {selectedEmployee && (
                <NotebookConsultationModal
                    isOpen={!!selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    employeeName={selectedEmployee.role}
                    employeeRole={selectedEmployee.function}
                    agentName={selectedEmployee.agent}
                    notebookUrl={selectedEmployee.notebookUrl}
                />
            )}

            <style>{`.premium-scrollbar::-webkit-scrollbar{width:4px;height:4px}.premium-scrollbar::-webkit-scrollbar-track{background:transparent}.premium-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:10px}.premium-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}.premium-scrollbar{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent}`}</style>
        </div>
    );
}
