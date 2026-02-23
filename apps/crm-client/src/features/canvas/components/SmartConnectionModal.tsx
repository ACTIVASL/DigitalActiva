import { useState } from 'react';
import {
    X, Crown, Layers, Plus, ExternalLink, Edit, Trash2, Camera, Upload,
    MoreVertical, UserCheck, UserX, User, ShieldCheck, AlertTriangle, Terminal, Goal,
    StickyNote, AlertOctagon, ArrowUpRight, Target,
    Magnet, Shield, PhoneForwarded, Rocket, Package, Award
} from 'lucide-react';
import { SectionConfig, SectionData, Insight, SquadMember, INITIAL_MODEL_DATA } from '../canvasData';

interface SmartConnectionModalProps {
    section: SectionConfig;
    data: SectionData;
    onClose: () => void;
    onChange: (updates: Partial<SectionData>) => void;
    onAddInsight: (text: string, type: string) => void;
    onDeleteInsight: (id: number) => void;
    onDragStart: (e: React.DragEvent, insight: Insight) => void;
    onDropMember: (e: React.DragEvent, member: SquadMember, section: SectionConfig) => void;
    draggedInsight: Insight | null;
}

export function SmartConnectionModal({
    section,
    data,
    onClose,
    onChange,
    onAddInsight,
    onDeleteInsight,
    onDragStart,
    onDropMember,
    draggedInsight
}: SmartConnectionModalProps) {
    const Icon = section.icon;
    const [newInsightText, setNewInsightText] = useState("");
    const [insightType, setInsightType] = useState("strategy");
    const [mobileTab, setMobileTab] = useState('squad');
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<SquadMember>>({});

    const squad = data.squad || INITIAL_MODEL_DATA[section.id].squad;
    const products = data.products;
    const sectionCost = Array.isArray(squad) ? squad.reduce((acc, role) => role.active ? acc + (role.salary * (role.multiplier || 1)) : acc, 0) : 0;
    const activeCount = Array.isArray(squad) ? squad.reduce((acc, role) => role.active ? acc + (role.multiplier || 1) : acc, 0) : 0;

    const handleAdd = () => { if (!newInsightText.trim()) return; onAddInsight(newInsightText, insightType); setNewInsightText(""); };

    const handleAddMember = () => {
        onChange({
            squad: [...squad, {
                role: "Nuevo Especialista",
                salary: 30000,
                active: true,
                function: "Pendiente de asignar",
                agent: "ACTIVA-Bot",
                result: "N/A",
                multiplier: 1,
                name: "Nuevo Agente",
                phone: ""
            }]
        });
    };

    const handleRemoveMember = (index: number) => {
        const s = [...squad];
        s.splice(index, 1);
        onChange({ squad: s });
        setOpenMenuIndex(null);
    };

    const handleToggleActive = (index: number) => {
        const s = [...squad];
        s[index] = { ...s[index], active: !s[index].active };
        onChange({ squad: s });
    };

    const handleEditClick = (member: SquadMember, index: number) => {
        setEditingMemberIndex(index);
        setEditForm({ ...member });
        setOpenMenuIndex(null);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm((prev) => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const saveEdit = () => {
        if (editingMemberIndex === null) return;
        const s = [...squad];
        // Merge partial editForm with existing member structure, ensuring required fields are present if it were a new member, 
        // but here we are editing an existing one so s[editingMemberIndex] exists.
        // We cast editForm to SquadMember for the merge, but safely.
        // Actually, we should just merge.
        const updatedMember: SquadMember = {
            ...s[editingMemberIndex],
            ...editForm,
            salary: typeof editForm.salary === 'string' ? parseInt(editForm.salary) : (editForm.salary || 0)
        };

        s[editingMemberIndex] = updatedMember;
        onChange({ squad: s });
        setEditingMemberIndex(null);
        setEditForm({});
    };

    const cancelEdit = () => { setEditingMemberIndex(null); setEditForm({}); };

    const getProductIcon = (name: string) => {
        if (name.includes("CAPTACIÓN")) return Magnet;
        if (name.includes("ORGANIZACIÓN")) return Shield;
        if (name.includes("SECRETARÍA")) return PhoneForwarded;
        if (name.includes("TRANSFORMACIÓN")) return Rocket;
        return Package;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300" onClick={() => setOpenMenuIndex(null)}>
            <div className="bg-[#0f172a] w-full max-w-7xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-700/50 h-[92vh] ring-1 ring-white/10 relative" onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(null); }}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                {/* Header */}
                <div className="px-4 lg:px-10 py-6 lg:py-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50 relative z-10 shrink-0">
                    <div className="flex items-center gap-4 lg:gap-8 overflow-hidden">
                        <div className={`p-3 lg:p-5 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.3)] ${section.iconBg} ${section.iconColor} ring-1 ring-white/20 relative overflow-hidden flex items-center justify-center shrink-0`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mix-blend-overlay"></div>
                            <Icon className="w-8 h-8 lg:w-10 lg:h-10 relative z-10 drop-shadow-md" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-black text-2xl lg:text-4xl text-white tracking-tighter flex flex-col lg:flex-row lg:items-center gap-2 mb-1 lg:mb-2 truncate">
                                <span className="truncate">{section.title}</span>
                                <span className="bg-slate-800/80 text-slate-300 text-[10px] lg:text-xs px-3 py-1 rounded-full font-bold border border-slate-600/50 uppercase tracking-widest backdrop-blur-md w-fit flex items-center gap-2">
                                    {activeCount} Expertos Activos <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                </span>
                            </h2>
                            <div className="hidden lg:flex items-center gap-3 mt-3 bg-black/30 border border-white/10 text-white px-5 py-2.5 rounded-xl shadow-inner max-w-2xl">
                                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0 border-r border-white/10 pr-3 mr-1">KPI CEO</span>
                                <p className="text-sm font-medium text-slate-200 truncate">{section.ceoObjective}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 lg:p-4 bg-slate-800/50 hover:bg-red-500/20 hover:border-red-500/50 border border-white/10 rounded-full transition-all text-slate-400 hover:text-red-400 group shrink-0 ml-2">
                        <X className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Mobile Tabs */}
                <div className="flex lg:hidden border-b border-white/5 bg-slate-900/40 shrink-0 relative z-20">
                    <button onClick={() => setMobileTab('squad')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${mobileTab === 'squad' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>Equipo</button>
                    <button onClick={() => setMobileTab('strategy')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${mobileTab === 'strategy' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>Estrategia</button>
                </div>

                <div className="flex flex-col lg:flex-row flex-grow overflow-hidden bg-[#020617] relative z-10">
                    {/* LEFT: SQUAD (Responsive) */}
                    <div className={`w-full lg:w-5/12 border-r border-white/5 p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto premium-scrollbar ${mobileTab === 'squad' ? 'flex' : 'hidden lg:flex'}`}>
                        <div className="lg:hidden flex items-start gap-3 bg-black/30 border border-white/10 text-white px-4 py-3 rounded-xl shadow-inner mb-2">
                            <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">KPI CEO</span><p className="text-sm font-medium text-slate-200 leading-snug">{section.ceoObjective}</p></div>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3"><Layers className="w-4 h-4 text-indigo-500" /> Equipo Humano + IA</label>
                            <div className="flex items-center gap-3">
                                <button onClick={handleAddMember} className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all" title="Añadir nuevo miembro"><Plus className="w-4 h-4" /></button>
                                <div className="text-xs font-bold text-slate-300 bg-slate-800/50 border border-slate-700/50 px-4 py-1.5 rounded-full shadow-lg"><span className="text-slate-500 mr-2 hidden sm:inline">OPEX:</span>{(sectionCost / 1000).toFixed(0)}k €/año</div>
                            </div>
                        </div>

                        {/* Products */}
                        {products && products.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Catálogo de Servicios Premium</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map((prod, i) => {
                                        const PI = getProductIcon(prod.name); return (
                                            <div key={i} className="bg-gradient-to-br from-indigo-900/20 to-slate-900/40 border border-indigo-500/20 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                                                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="flex justify-between items-start relative z-10"><div className="flex items-center gap-3"><div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300"><PI className="w-5 h-5" /></div><div><div className="font-black text-white text-sm tracking-wide">{prod.name}</div><div className="text-[10px] text-emerald-400 font-bold tracking-wider">DESDE {prod.price}/MES</div></div></div></div>
                                                <div className="text-xs text-slate-300 relative z-10 font-medium leading-relaxed border-t border-white/5 pt-2">{prod.desc}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-2 bg-slate-800 rounded-full border border-slate-600"><ShieldCheck className="w-5 h-5 text-slate-400" /></div>
                                    <div><div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">La Promesa Titanium</div><div className="text-xs text-slate-300 font-medium">Soberanía Digital • Seguridad Bancaria • Eficiencia Total</div></div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 pb-20 lg:pb-0 relative">
                            {/* Edit Overlay */}
                            {editingMemberIndex !== null && (
                                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-start justify-center pt-10">
                                    <div className="bg-[#0f172a] border border-indigo-500/50 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Edit className="w-5 h-5 text-indigo-400" /> Editar Perfil</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center shrink-0">
                                                    {editForm.photo ? <img src={editForm.photo} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-slate-500" />}
                                                </div>
                                                <div><label className="block text-xs font-bold text-slate-400 mb-1">Foto de Perfil</label><label className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-2 transition-colors"><Upload className="w-3 h-3" /> Subir Imagen<input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} /></label></div>
                                            </div>
                                            <div><label className="block text-xs font-bold text-slate-400 mb-1">Rol / Cargo</label><input type="text" name="role" value={editForm.role || ''} onChange={handleEditFormChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" /></div>
                                            <div><label className="block text-xs font-bold text-slate-400 mb-1">Función Principal</label><input type="text" name="function" value={editForm.function || ''} onChange={handleEditFormChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" /></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="block text-xs font-bold text-slate-400 mb-1">Agente IA</label><input type="text" name="agent" value={editForm.agent || ''} onChange={handleEditFormChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" /></div>
                                                <div><label className="block text-xs font-bold text-slate-400 mb-1">Salario Anual (€)</label><input type="number" name="salary" value={editForm.salary || ''} onChange={handleEditFormChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" /></div>
                                            </div>
                                            <div><label className="block text-xs font-bold text-slate-400 mb-1">Enlace NotebookLM</label><input type="text" name="notebookUrl" value={editForm.notebookUrl || ''} onChange={handleEditFormChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-indigo-500 outline-none placeholder:text-slate-700" placeholder="https://..." /></div>
                                        </div>
                                        <div className="flex gap-2 mt-6 justify-end">
                                            <button onClick={cancelEdit} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
                                            <button onClick={saveEdit} className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg transition-colors">Guardar Cambios</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Squad Cards */}
                            {Array.isArray(squad) && squad.map((member, i) => (
                                <div key={i}
                                    className={`bg-slate-900/40 p-5 lg:p-6 rounded-3xl border shadow-sm flex flex-col gap-5 transition-all group relative overflow-visible ${draggedInsight && member.active ? 'border-dashed border-indigo-500/50 bg-indigo-900/10 cursor-alias' : 'border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/40'} ${!member.active ? 'opacity-50 grayscale border-dashed bg-slate-950/20' : ''}`}
                                    onDragOver={(e) => { if (member.active) { e.preventDefault(); e.currentTarget.classList.add('scale-[1.02]', 'border-indigo-400', 'bg-indigo-900/20'); } }}
                                    onDragLeave={(e) => { e.currentTarget.classList.remove('scale-[1.02]', 'border-indigo-400', 'bg-indigo-900/20'); }}
                                    onDrop={(e) => { if (member.active) { e.preventDefault(); e.currentTarget.classList.remove('scale-[1.02]', 'border-indigo-400', 'bg-indigo-900/20'); onDropMember(e, member, section); } }}
                                >
                                    {/* Config menu */}
                                    <div className="absolute top-4 right-4 z-50">
                                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === i ? null : i); }} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                        {openMenuIndex === i && (
                                            <div className="absolute right-0 top-8 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-1 w-40 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                                                <button className={`px-4 py-2 text-left text-xs font-bold flex items-center gap-2 transition-colors border-b border-white/5 ${member.active ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-700'}`} onClick={(e) => { e.stopPropagation(); handleToggleActive(i); }}>
                                                    {member.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />} {member.active ? 'En Misión' : 'En Base'}
                                                </button>
                                                <button className="px-4 py-2 text-left text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors" onClick={(e) => { e.stopPropagation(); handleEditClick(member, i); }}><Edit className="w-3 h-3" /> Editar</button>
                                                <button className="px-4 py-2 text-left text-xs font-bold text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2 transition-colors border-t border-white/5" onClick={(e) => { e.stopPropagation(); handleRemoveMember(i); }}><Trash2 className="w-3 h-3" /> Eliminar</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Human Role */}
                                    <div
                                        className="flex items-start gap-4 relative z-10 pointer-events-none"
                                        data-agent-name={member.name}
                                        data-agent-phone={member.phone}
                                        data-contact-whatsapp={member.phone ? `https://wa.me/${member.phone}` : undefined}
                                    >
                                        <div className={`p-1 rounded-2xl shadow-inner border border-white/5 flex items-center justify-center overflow-hidden w-12 h-12 shrink-0 ${!member.active ? 'bg-slate-900' : 'bg-slate-800'}`}>
                                            {member.photo ? <img src={member.photo} alt={member.role} className="w-full h-full object-cover" /> : <User className={`w-6 h-6 ${!member.active ? 'text-slate-600' : 'text-slate-400'}`} />}
                                        </div>
                                        <div className="flex-1 pr-6">
                                            {member.name && <div className="text-xs font-bold text-cyan-400 mb-0.5 tracking-wide">{member.name}</div>}
                                            <div className={`text-sm font-bold leading-tight pr-2 ${!member.active ? 'text-slate-500' : 'text-slate-100'}`}>{member.role} {member.multiplier ? `(x${member.multiplier})` : ''}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-0.5 whitespace-nowrap w-fit ${member.active ? 'text-emerald-400 bg-emerald-950/50 border-emerald-500/20' : 'text-slate-500 bg-slate-900 border-slate-700'}`}>{member.salary.toLocaleString('es-ES')}€</span>
                                                {!member.active && <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400 uppercase tracking-wider">INACTIVO</span>}
                                                {member.phone && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1 cursor-help" title="Contacto Gestionado por Gemini"><ShieldCheck className="w-3 h-3 text-indigo-400" /> SECURE LINE</span>}
                                            </div>
                                            <div className={`text-xs mt-2 font-medium px-3 py-1.5 rounded-lg border inline-block leading-relaxed ${member.active ? 'text-slate-500 bg-black/20 border-white/5' : 'text-slate-600 bg-transparent border-transparent'}`}>{member.function}</div>
                                            {member.result === 'Informe Pendiente' && <div className="mt-1 text-[10px] text-red-400 font-bold animate-pulse flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> REQUERIDO</div>}
                                        </div>
                                    </div>

                                    {/* Agent */}
                                    {member.active && (
                                        <div className="flex items-center justify-between gap-3 pl-4 border-l-2 border-indigo-500/30 ml-5 py-1 relative z-10 group/agent">
                                            <div className="flex items-center gap-3"><div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20 flex items-center justify-center"><Terminal className="w-4 h-4 text-indigo-400" /></div><div><div className="text-xs font-bold text-indigo-300">{member.agent}</div><div className="text-[10px] text-indigo-500/70 font-medium">Proceso Automático</div></div></div>
                                            <button onClick={(e) => { e.stopPropagation(); window.open(member.notebookUrl || 'https://notebooklm.google.com', '_blank'); }} className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 text-indigo-300 rounded-lg backdrop-blur-md shadow-lg transition-all opacity-0 group-hover/agent:opacity-100 transform translate-x-2 group-hover/agent:translate-x-0" title="Abrir NotebookLM"><ExternalLink className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}

                                    {/* KPI */}
                                    {member.active && (
                                        <div className="bg-emerald-900/5 p-4 rounded-2xl border border-emerald-500/10 flex items-start gap-3 relative z-10 pointer-events-none">
                                            <Goal className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /><div><span className="text-[10px] font-bold text-emerald-600/80 uppercase block mb-0.5 tracking-wider">KPI / Resultado Clave</span><span className="text-xs text-slate-300 font-medium leading-tight">{member.result}</span></div>
                                        </div>
                                    )}
                                    {member.active && <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${section.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>}
                                    {draggedInsight && member.active && (
                                        <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                            <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-2xl transform scale-110 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" />Soltar para Delegar</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* RIGHT: STRATEGY BOARD */}
                    <div className={`flex-1 p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto bg-slate-900/20 relative ${mobileTab === 'strategy' ? 'flex' : 'hidden lg:flex'}`}>
                        <div className="absolute inset-0 bg-grid-slate-800/[0.1] -z-10" style={{ backgroundSize: '20px 20px' }} />
                        <div className="flex-1 flex flex-col gap-4 h-full pb-20 lg:pb-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/5 gap-4">
                                <div className="flex items-center gap-3"><div className="p-2 bg-slate-800 rounded-lg text-slate-400 border border-white/5 flex items-center justify-center"><StickyNote className="w-5 h-5" /></div><h4 className="font-bold text-base text-slate-200">Pizarra Estratégica</h4></div>
                                <div className="flex gap-2 w-full md:max-w-md">
                                    <select value={insightType} onChange={(e) => setInsightType(e.target.value)} className="bg-slate-900 text-xs font-bold text-slate-300 rounded-xl px-2 lg:px-3 border border-slate-700 focus:outline-none focus:border-indigo-500">
                                        <option value="strategy">Estrategia</option><option value="risk">Riesgo</option><option value="opportunity">Oportunidad</option>
                                    </select>
                                    <input type="text" placeholder="Nueva nota..." className="flex-1 bg-slate-900 text-sm text-slate-200 rounded-xl px-3 lg:px-4 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 min-w-0" value={newInsightText} onChange={(e) => setNewInsightText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
                                    <button onClick={handleAdd} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shrink-0"><Plus className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 auto-rows-max">
                                {data.insights && data.insights.map((insight) => (
                                    <div key={insight.id} draggable="true" onDragStart={(e) => onDragStart(e, insight)}
                                        className={`relative group p-5 rounded-2xl border backdrop-blur-md shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl cursor-grab active:cursor-grabbing ${insight.type === 'risk' ? 'bg-red-500/10 border-red-500/30' : insight.type === 'opportunity' ? 'bg-emerald-500/10 border-emerald-500/30' : `${section.iconBg} ${section.border.replace('30', '20')}`}`}>
                                        <div className="flex justify-between items-start mb-2 pointer-events-none">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${insight.type === 'risk' ? 'bg-red-500/20 text-red-300 border-red-500/30' : insight.type === 'opportunity' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-900/30 text-white/70 border-white/10'}`}>
                                                {insight.type === 'risk' ? 'Riesgo' : insight.type === 'opportunity' ? 'Oportunidad' : 'Estrategia'}
                                            </span>
                                            <div className={`p-1.5 rounded-full ${insight.type === 'risk' ? 'bg-red-500/20 text-red-400' : insight.type === 'opportunity' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'}`}>
                                                {insight.type === 'risk' ? <AlertOctagon className="w-3 h-3" /> : insight.type === 'opportunity' ? <ArrowUpRight className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-slate-200 leading-relaxed pointer-events-none">{insight.text}</p>
                                        <div className="hidden lg:block absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">Arrastra para delegar</div>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteInsight(insight.id); }} className="absolute bottom-3 right-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {(!data.insights || data.insights.length === 0) && (
                                    <div className="col-span-2 py-10 border-2 border-dashed border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                                        <StickyNote className="w-8 h-8 mb-2 opacity-50" /><p className="text-sm font-medium">No hay notas estratégicas aún.</p><p className="text-xs opacity-70">Añade riesgos, oportunidades o tácticas arriba.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
