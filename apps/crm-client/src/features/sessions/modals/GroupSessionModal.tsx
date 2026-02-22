import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Activity, Zap, Heart, Trash2, Settings } from 'lucide-react';
import { Button } from '@monorepo/ui-system';
import { Patient, GroupSession } from '../../../lib/types';

interface GroupSessionModalProps {
  onClose: () => void;
  onSave: (data: GroupSession) => Promise<void> | void;
  onDelete?: (id: string) => void;
  patients?: Patient[];
  initialGroupName?: string;
  mode?: 'schedule' | 'evolution';
  initialData?: GroupSession; // Strict Type
}

export const GroupSessionModal: React.FC<GroupSessionModalProps> = ({
  onClose,
  patients = [],
  onSave,
  onDelete, // Destructure here to fix 'Cannot find name'
  initialGroupName = '',
  mode = 'evolution',
  initialData,
}) => {
  // Store full participant objects { name, id? }
  // On load, if initialData has names but no IDs, treat as guests
  const [participants, setParticipants] = useState<{ name: string; id?: string }[]>(
    // initialData?.participants is not in Type, rely on participantNames or passed props
    // initialData?.participants is strict typed now
    initialData?.participants?.map((p) => ({ name: p.name, id: p.id })) || [],
  );

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [sessionPrice, setSessionPrice] = useState(initialData?.price || 150);

  // Parse date safely
  const defaultDate = initialData?.date || new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [groupName, setGroupName] = useState(initialData?.groupName || initialGroupName);

  // METRICS
  const [engagementScore, setEngagementScore] = useState(initialData?.engagementScore || 5);
  const [cohesionScore, setCohesionScore] = useState(initialData?.cohesionScore || 5);
  const [energyLevel, setEnergyLevel] = useState<'High' | 'Medium' | 'Low'>(
    initialData?.energyLevel || 'Medium',
  );

  useEffect(() => {
    if (initialGroupName && !groupName) setGroupName(initialGroupName);
  }, [initialGroupName, groupName]);

  const handleAddParticipant = () => {
    // 1. Try add Real Patient
    if (selectedPatientId) {
      const patient = patients.find((p) => p.id === selectedPatientId);
      if (patient) {
        if (!participants.some((p) => p.id === patient.id)) {
          setParticipants([...participants, { name: patient.name, id: String(patient.id) }]);
        }
        setSelectedPatientId('');
        return;
      }
    }

    // 2. Try add Guest
    if (guestName.trim()) {
      if (!participants.some((p) => p.name.toLowerCase() === guestName.trim().toLowerCase())) {
        setParticipants([...participants, { name: guestName.trim() }]);
      }
      setGuestName('');
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const isScheduleMode = mode === 'schedule';

  const [showConfigMenu, setShowConfigMenu] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white w-full ${isScheduleMode ? 'max-w-md' : 'max-w-5xl'} rounded-2xl shadow-3d p-6 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh] transition-all duration-300 relative`}
      >
        {/* CONFIG MENU DROPDOWN */}
        {showConfigMenu && (
          <div className="absolute top-16 right-6 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 min-w-[200px] animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setShowConfigMenu(false);
                // Already editing, maybe focus?
                document.getElementById('groupNameInput')?.focus();
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg flex items-center gap-3 text-slate-700 font-bold text-sm transition-colors"
            >
              <Users size={16} className="text-blue-500" /> Editar Grupo
            </button>
            {/* DELETE OPTION - UNCONDITIONAL */}
            {/* DELETE OPTION - ROBUST */}
            <button
              onClick={async () => {
                const sessionId = initialData?.id || initialData?.groupId;

                if (!sessionId) {
                  alert('Error: ID de sesión no encontrado.');
                  return;
                }

                if (onDelete) {
                  // Use the prop provided by parent (App.tsx) which handles state + log
                  if (
                    confirm(
                      '¿Estás seguro de eliminar esta sesión y todos sus registros asociados? (Acción irreversible)',
                    )
                  ) {
                    onDelete(String(sessionId));
                    // Close handled by parent or state change, but we can close menu
                    setShowConfigMenu(false);
                  }
                } else {
                  // Fallback for standalone usage (unlikely but safe)
                  if (confirm('¿Estás seguro de eliminar esta sesión?')) {
                    try {
                      const { GroupSessionRepository } =
                        await import('../../../data/repositories/GroupSessionRepository');
                      await GroupSessionRepository.delete(String(sessionId));
                      alert('Sesión eliminada.');
                      onClose();
                      window.location.reload();
                    } catch (e) {
                      alert('Error al eliminar: ' + (e as Error).message);
                    }
                  }
                }
              }}
              className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg flex items-center gap-3 text-red-600 font-bold text-sm transition-colors mt-1"
            >
              <Trash2 size={16} /> Eliminar Evento
            </button>
          </div>
        )}

        <div className="flex justify-between mb-4 shrink-0 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Users className="text-pink-600" />
              {isScheduleMode ? 'Agendar Workshop / Evento' : 'Bitácora de Workshop / Evento'}
            </h2>
            <p className="text-sm text-slate-400">
              {isScheduleMode
                ? 'Reserva de espacio y horario.'
                : 'Registra asistencia y resultados del evento'}
            </p>
          </div>
          <div className="flex gap-2">
            {/* CONFIG BUTTON */}
            {/* DIRECT DELETE BUTTON (Titanium Clean: No Reloads) */}
            {onDelete && initialData?.id && (
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      '⚠️ ¿Eliminar Definitivamente este Grupo?\n\nSe borrará del calendario.',
                    )
                  ) {
                    onDelete(String(initialData.id));
                  }
                }}
                className="p-2 hover:bg-red-50 rounded-full transition-colors h-fit text-slate-300 hover:text-red-500 mr-1"
                title="Eliminar Grupo"
              >
                <Trash2 size={20} />
              </button>
            )}

            {/* CONFIG BUTTON - FORCED */}
            <button
              onClick={() => setShowConfigMenu(!showConfigMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${showConfigMenu ? 'bg-slate-100 text-slate-900' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Settings size={16} />
              Configurar
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors h-fit text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form
          className="flex-1 overflow-y-auto pr-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const formData = new FormData(e.target as HTMLFormElement);
              if (!groupName?.trim()) {
                alert('Es obligatorio el Nombre del Grupo.');
                return;
              }

              const sessionData: GroupSession = {
                id: initialData?.id || crypto.randomUUID(),
                date: date, // Use state variable
                time: formData.get('time') as string,
                phase: Number(formData.get('phase')) || 1,
                activities: ['Dinámica'], // Default or derive from form
                location: formData.get('location') as string,
                // type: 'group', // Removed: Not in Schema
                participants: participants.map((p) => ({
                  id: p.id || crypto.randomUUID(),
                  name: p.name,
                  attendance: 'present' as const,
                })),
                price: sessionPrice, // Use state variable
                paid: false, // Default
                name: groupName.trim(), // REQUIRED: Name vs GroupName duality in Schema
                status: 'scheduled',
                patientIds: [], // REQUIRED: Defaults to empty for groups
                groupName: groupName.trim(), // Use state variable
                methodology: (formData.get('methodology') as string) || '',
                observations: (formData.get('observations') as string) || '',
                engagementScore: engagementScore,
                cohesionScore: cohesionScore,
                energyLevel: energyLevel,
              };

              if (!sessionData.time || !sessionData.location) {
                alert('Por favor completa hora y lugar');
                return;
              }

              // Await the save to catch async errors from App.tsx/Repositories
              const res = onSave(sessionData);
              if (res instanceof Promise) await res;
            } catch (err) {
              alert(
                'Error al guardar sesión: ' + (err instanceof Error ? err.message : String(err)),
              );
            }
          }}
        >
          <div className={`grid grid-cols-1 ${isScheduleMode ? 'gap-4' : 'lg:grid-cols-12 gap-8'}`}>
            {/* LEFT: Context & Participants */}
            <div
              className={`${isScheduleMode ? 'col-span-1' : 'lg:col-span-4 border-r border-slate-100 pr-4'} space-y-6`}
            >
              <div>
                <label className="label-pro text-pink-600">Nombre del Grupo</label>
                <input
                  id="groupNameInput"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="input-pro font-black text-lg text-slate-800 border-pink-200 focus:border-pink-500 bg-pink-50/30"
                  placeholder="Ej: Taller Memoria"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-pro">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-pro"
                    required
                  />
                </div>
                <div>
                  <label className="label-pro">Hora</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={initialData?.time || '10:00'}
                    className="input-pro"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label-pro">Ubicación</label>
                <input
                  name="location"
                  defaultValue={initialData?.location}
                  className="input-pro"
                  placeholder="Sala..."
                  required
                />
              </div>

              {!isScheduleMode && (
                <div>
                  <label className="label-pro">Fase del Grupo (Global)</label>
                  <select name="phase" className="input-pro" defaultValue={initialData?.phase || 1}>
                    <option value="1">Fase 1: Vinculación (1-5)</option>
                    <option value="2">Fase 2: Activación (6-10)</option>
                    <option value="3">Fase 3: Expresión (11-15)</option>
                    <option value="4">Fase 4: Integración (16-20)</option>
                    <option value="5">Fase 5: Cierre (+21)</option>
                  </select>
                </div>
              )}

              {/* ACTIVITIES & METHODOLOGY */}

              {!isScheduleMode && (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="label-pro mb-2 block flex justify-between">
                      <span>Asistentes</span>
                      <span className="text-slate-400 font-normal">{participants.length}</span>
                    </label>

                    {/* SELECTION BAR */}
                    <div className="flex gap-2 mb-3">
                      <select
                        className="input-pro flex-1 text-sm"
                        value={selectedPatientId}
                        onChange={(e) => {
                          setSelectedPatientId(e.target.value);
                          setGuestName('');
                        }}
                      >
                        <option value="">-- Seleccionar Paciente --</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <span className="text-slate-300 py-2 font-bold text-xs self-center">O</span>

                      <input
                        className="input-pro flex-1 text-sm bg-white"
                        placeholder="Nombre Invitado..."
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          setSelectedPatientId('');
                        }}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())
                        }
                      />

                      <Button
                        type="button"
                        onClick={handleAddParticipant}
                        icon={Plus}
                        size="sm"
                        disabled={!selectedPatientId && !guestName.trim()}
                      >
                        Añadir
                      </Button>
                    </div>

                    {/* LIST */}
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto content-start">
                      {participants.map((p, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold shadow-sm ${p.id
                            ? 'bg-pink-100 text-pink-700 border border-pink-200' // Real Patient
                            : 'bg-slate-100 text-slate-500 border border-slate-200' // Guest
                            }`}
                        >
                          {p.id && <Users size={10} />}
                          {p.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(i)}
                            className="hover:text-red-500 ml-1 opacity-60 hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Recaudación Total:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={sessionPrice}
                        onChange={(e) => setSessionPrice(Number(e.target.value))}
                        className="w-20 text-right font-black bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 ring-pink-500 outline-none"
                      />
                      <span className="font-bold text-slate-600">€</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Evolution & Metrics (HIDDEN IN SCHEDULE MODE) */}
            {!isScheduleMode && (
              <div className="lg:col-span-8 space-y-6 pl-4">
                {/* METRICS PANEL */}
                <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
                  {/* Engagement */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-slate-600 font-bold text-sm">
                      <Activity size={16} className="text-blue-500" /> Participación
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={engagementScore}
                        onChange={(e) => setEngagementScore(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mt-1">
                        <span>Baja</span>
                        <span className="text-lg text-blue-600">{engagementScore}</span>
                        <span>Alta</span>
                      </div>
                    </div>
                  </div>

                  {/* Cohesion */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-slate-600 font-bold text-sm">
                      <Heart size={16} className="text-pink-500" /> Cohesión
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={cohesionScore}
                        onChange={(e) => setCohesionScore(Number(e.target.value))}
                        className="w-full accent-pink-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mt-1">
                        <span>Disperso</span>
                        <span className="text-lg text-pink-600">{cohesionScore}</span>
                        <span>Unido</span>
                      </div>
                    </div>
                  </div>

                  {/* Energy */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-slate-600 font-bold text-sm">
                      <Zap size={16} className="text-amber-500" /> Energía
                    </div>
                    <div className="flex justify-center gap-1">
                      {['Low', 'Medium', 'High'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setEnergyLevel(level as 'High' | 'Medium' | 'Low')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${energyLevel === level
                            ? level === 'High'
                              ? 'bg-amber-100 border-amber-300 text-amber-700'
                              : level === 'Medium'
                                ? 'bg-slate-100 border-slate-300 text-slate-700'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            } ${energyLevel === level ? 'ring-2 ring-offset-1 ring-amber-100' : ''}`}
                        >
                          {level === 'Low' ? 'Baja' : level === 'Medium' ? 'Media' : 'Alta'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label-pro">Agenda / Objetivos</label>
                  <textarea
                    name="methodology"
                    defaultValue={initialData?.methodology}
                    className="input-pro h-20 resize-none"
                    placeholder="¿Qué se trabajó hoy? (Ej: Reminiscencia con fotos antiguas...)"
                  />
                </div>

                <div>
                  <label className="label-pro flex justify-between">
                    <span>Minutas / Acuerdos</span>
                    <span className="text-xs font-normal text-slate-400">
                      Detalles del proyecto y observaciones
                    </span>
                  </label>
                  <textarea
                    name="observations"
                    defaultValue={initialData?.observations}
                    className="input-pro h-32 resize-none bg-yellow-50/50 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-200"
                    placeholder="Describe la dinámica, hitos alcanzados y anécdotas relevantes..."
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6 gap-2 pt-4 border-t border-slate-100 shrink-0">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">{isScheduleMode ? 'Agendar Cita' : 'Guardar Evolución'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
