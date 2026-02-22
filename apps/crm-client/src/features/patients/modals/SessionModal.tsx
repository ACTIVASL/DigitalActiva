import React, { useState } from 'react';
import { SessionTimer, Button, Badge, Card } from '@monorepo/ui-system';
import {
  X,
  ClipboardCheck,
  Lightbulb,
  CheckSquare,
  Save,
  ClipboardList,
  Trash2,
  AlarmClock,
  Repeat,
} from 'lucide-react';

import {
  CLINICAL_GUIDES,
  SESSION_ACTIVITIES,
  EVALUATION_AREAS,
  ClinicalGuideKey,
} from '../../../lib/clinicalUtils';
import { formatDateForInput } from '../../../lib/patientUtils';

import { Session } from '../../../lib/types'; // Session has recurrence: RecurrenceRule

export interface QualitativeAssessment {
  musical: string;
  emotional: string;
  cognitive: string;
  physical: string;
}

// Extended Session for UI fields not yet in Shared Schema
// We override recurrence to match the strict type from Session if needed, or rely on Session's definition.
// Since Session (from shared) has recurrence, we need to make sure we match it or extend compatibly.
export interface ExtendedSession extends Partial<Session> {
  mood?: string;
  engagement?: number;
  phase?: number;
  activityDetails?: Record<string, string>;
  scores?: number[];
  groupAnalysis?: string | null;
  qualitative?: Partial<QualitativeAssessment>;
  price?: number;
  paid?: boolean;
  isAbsent?: boolean;
  // Recurrence is already in Session? If so, we don't need to redefine if we match it.
  // But if we want to ensure it's there for onSave:
  // We will cast it in usage.
  [key: string]: unknown;
}

interface SessionModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (data: ExtendedSession) => Promise<void> | void;
  onDelete?: (id: string | number) => void;
  initialData?: ExtendedSession;
  patientType: string;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  onClose,
  onSave,
  onDelete,
  initialData,
  patientType,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const [scores, setScores] = useState<number[]>(initialData?.scores || Array(9).fill(0));
  const [notes, setNotes] = useState(initialData?.notes || ''); // TITANIUM FIX #5: Controlled State
  const [date, setDate] = useState(formatDateForInput(initialData?.date));
  const [time, setTime] = useState(initialData?.time || '10:00');
  const [sessionType] = useState(initialData?.type || 'individual');
  const [activityDetails, setActivityDetails] = useState<Record<string, string>>(
    initialData?.activityDetails || {},
  );
  const [isAbsent, setIsAbsent] = useState(initialData?.isAbsent || false);
  const [price, setPrice] = useState(initialData?.price || 50);
  const [isPaid, setIsPaid] = useState(initialData?.paid || false);
  const [showTimer, setShowTimer] = useState(false);

  // Recurrence State (New) matching RecurrenceRule
  const [isRecurring, setIsRecurring] = useState(false);
  // frequency must be uppercase
  const [recurrenceFreq, setRecurrenceFreq] = useState<'WEEKLY' | 'BIWEEKLY'>('WEEKLY');
  const [recurrenceCount, setRecurrenceCount] = useState(4); // Mapped to occurrences

  // TITANIUM FIX: Sync state with props change
  React.useEffect(() => {
    if (initialData) {
      setScores(initialData.scores || Array(9).fill(0));
      setNotes(initialData.notes || '');
      setDate(formatDateForInput(initialData.date));
      setTime(initialData.time || '10:00');
      setActivityDetails(initialData.activityDetails || {});
      setIsAbsent(initialData.isAbsent || false);
      setPrice(initialData.price || 50);
      setIsPaid(initialData.paid || false);
    } else {
      // Reset for new session
      setScores(Array(9).fill(0));
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:00');
      setActivityDetails({});
      setIsAbsent(false);
      setPrice(50);
      setIsPaid(false);
    }
  }, [initialData]);

  // Safe guide retrieval
  const guideKey = patientType in CLINICAL_GUIDES ? (patientType as ClinicalGuideKey) : 'other';
  const guide = CLINICAL_GUIDES[guideKey] || CLINICAL_GUIDES.other;

  const toggleActivity = (actId: string) => {
    const newDetails = { ...activityDetails };
    if (newDetails[actId] !== undefined) {
      delete newDetails[actId];
    } else {
      newDetails[actId] = '';
    }
    setActivityDetails(newDetails);
  };

  const updateActivityDetail = (actId: string, text: string) => {
    setActivityDetails((prev) => ({ ...prev, [actId]: text }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-3d rounded-2xl animate-in zoom-in-95"
        noPadding={true}
      >
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 border-slate-100">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <ClipboardCheck className="text-pink-600" /> Bitácora de Sesión
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="brand">Enfoque: {guide.focus}</Badge>
              <span className="text-xs text-slate-400 font-medium">({guide.title})</span>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving}>
            <X className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100/50 flex items-start gap-3">
          <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-amber-900 leading-snug">
            <strong>Recordatorio Clínico ({guide.title}):</strong> Objetivos prioritarios:{' '}
            {guide.objectives.join(', ')}. Técnicas sugeridas: {guide.techniques.join(', ')}.
            <span className="italic opacity-80 block mt-1">
              Precaución: {guide.precautions.join(', ')}.
            </span>
          </div>
        </div>

        <form
          className="p-8 space-y-8"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);

            if (!notes.trim()) {
              alert(
                isAbsent
                  ? 'Indique el motivo de la ausencia.'
                  : 'Las notas de la sesión son obligatorias.',
              );
              return;
            }

            // Lock UI
            setIsSaving(true);

            try {
              const qual_mus = (formData.get('qual_mus') as string) || '';
              const qual_emo = (formData.get('qual_emo') as string) || '';
              const qual_cog = (formData.get('qual_cog') as string) || '';
              const qual_fis = (formData.get('qual_fis') as string) || '';
              const groupAnalysis = (formData.get('groupAnalysis') as string) || '';

              const selectedDate = new Date((formData.get('date') as string) || new Date());
              const adjustedDay = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

              const newSession: ExtendedSession = {
                id: initialData?.id || Date.now().toString(),
                date: (formData.get('date') as string) || new Date().toISOString(),
                time: (formData.get('time') as string) || '09:00',
                type: sessionType as 'individual' | 'group',
                notes: notes,
                activities: [],
                activityDetails,
                mood: (formData.get('mood') as string) || 'neutral',
                engagement: Number(formData.get('engagement') || 5),
                phase: 2,
                scores,
                groupAnalysis,
                qualitative: {
                  musical: qual_mus,
                  emotional: qual_emo,
                  cognitive: qual_cog,
                  physical: qual_fis,
                },
                price,
                paid: isPaid,
                isAbsent,
                recurrence: isRecurring
                  ? {
                    frequency: recurrenceFreq,
                    occurrences: recurrenceCount,
                    daysOfWeek: [adjustedDay],
                  }
                  : undefined,
              };

              // AWAIT THE RESULT
              await onSave(newSession);
              // Do not setIsSaving(false) here because parent closes modal typically.
              // If it failed, it throws and we catch.
            } catch (err) {
              alert('Error al guardar: ' + String(err));
              setIsSaving(false); // Unlock only on error
            }
          }}
        >
          <div className="flex justify-center mb-6 gap-6 items-end">
            <div className="flex flex-col w-1/3">
              <label className="label-pro">Fecha y Hora</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-pro col-span-2 text-lg p-2.5"
                  required
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input-pro col-span-1 text-lg p-2.5 text-center"
                  required
                />
              </div>
              <div className="mt-2 text-center">
                {!showTimer ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTimer(true)}
                    className="text-slate-400 hover:text-pink-600 w-full text-xs"
                    icon={AlarmClock}
                  >
                    Activar Cronómetro
                  </Button>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <SessionTimer initialMinutes={45} onComplete={() => alert('Fin de Sesión')} />
                    <button
                      onClick={() => setShowTimer(false)}
                      className="text-[10px] text-slate-300 hover:text-red-400 mt-1 w-full text-center"
                    >
                      Ocultar
                    </button>
                  </div>
                )}
              </div>

              {/* RECURRENCE BLOCK */}
              {!initialData?.id && (
                <div className="flex flex-col w-full bg-indigo-50 p-3 rounded-xl border border-indigo-100 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Repeat className="text-indigo-500" size={18} />
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                        Repetir Sesión
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isRecurring ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isRecurring ? 'left-6' : 'left-1'}`}
                      />
                    </button>
                  </div>

                  {isRecurring && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-indigo-700 block mb-1">
                          Frecuencia
                        </label>
                        <select
                          value={recurrenceFreq}
                          onChange={(e) =>
                            setRecurrenceFreq(e.target.value as 'WEEKLY' | 'BIWEEKLY')
                          }
                          className="w-full text-xs p-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="WEEKLY">Semanal (7 días)</option>
                          <option value="BIWEEKLY">Quincenal (14 días)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-indigo-700 block mb-1">
                          Total Sesiones
                        </label>
                        <select
                          value={recurrenceCount}
                          onChange={(e) => setRecurrenceCount(Number(e.target.value))}
                          className="w-full text-xs p-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={2}>2 sesiones</option>
                          <option value={4}>4 sesiones (1 mes)</option>
                          <option value={8}>8 sesiones (2 meses)</option>
                          <option value={12}>12 sesiones (3 meses)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col w-1/3">
              <label className="label-pro">Estado Asistencia</label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAbsent(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isAbsent ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Asistió
                </button>
                <button
                  type="button"
                  onClick={() => setIsAbsent(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isAbsent ? 'bg-white text-red-600 shadow-sm ring-1 ring-red-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Ausencia
                </button>
              </div>
              {isAbsent && (
                <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                  <span className="text-xs font-bold text-slate-500">¿Cobrar sesión?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const willCharge = price === 0;
                      setPrice(willCharge ? initialData?.price || 50 : 0);
                    }}
                    className={`text-xs px-2 py-1 rounded font-bold transition-all ${price > 0 ? 'bg-red-100 text-red-700 ring-1 ring-red-200' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {price > 0 ? 'SÍ, COBRAR' : 'NO COBRAR'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col w-1/3">
              <label className="label-pro">Pago</label>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div className="flex flex-col pl-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Importe
                  </span>
                  <div className="flex items-baseline">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-16 bg-transparent font-bold text-lg text-slate-700 outline-none -mt-1"
                    />
                    <span className="text-xs font-bold text-slate-400">€</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={`ml-auto px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-colors ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                >
                  {isPaid ? 'PAGADO' : 'PENDIENTE'}
                </button>
              </div>
            </div>
          </div>

          {!isAbsent && (
            <>
              <div className="space-y-4">
                <label className="label-pro flex items-center gap-2 text-slate-600">
                  <ClipboardList size={16} /> Desarrollo de la Sesión (Ejercicios)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {SESSION_ACTIVITIES.map((act) => {
                    const isSelected = activityDetails[act.id] !== undefined;
                    return (
                      <div
                        key={act.id}
                        className={`border rounded-xl transition-all duration-300 ${isSelected ? 'border-pink-500 bg-pink-50/20 shadow-md transform -translate-y-0.5' : 'border-slate-200 bg-white hover:border-pink-200'}`}
                      >
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer"
                          onClick={() => toggleActivity(act.id)}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-pink-500 border-pink-500' : 'bg-white border-slate-300'}`}
                          >
                            {isSelected && <CheckSquare size={14} className="text-white" />}
                          </div>
                          <span
                            className={`text-sm font-bold ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}
                          >
                            {act.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in">
                            <textarea
                              className="w-full bg-white border border-pink-200 rounded-lg p-3 text-sm text-slate-700 h-24 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none shadow-inner"
                              placeholder={`Detalles: ${act.placeholder}`}
                              value={activityDetails[act.id]}
                              onChange={(e) => updateActivityDetail(act.id, e.target.value)}
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-inner">
                <label className="label-pro mb-6 text-center text-slate-500 w-full border-b border-slate-200 pb-2">
                  Evaluación Cualitativa por Áreas
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
                      Respuesta Sonora-Musical
                    </label>
                    <textarea
                      name="qual_mus"
                      defaultValue={initialData?.qualitative?.musical}
                      className="input-pro h-24 resize-none text-sm bg-white"
                      placeholder="Ritmo, melodía, intensidad..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
                      Respuesta Emocional
                    </label>
                    <textarea
                      name="qual_emo"
                      defaultValue={initialData?.qualitative?.emotional}
                      className="input-pro h-24 resize-none text-sm bg-white"
                      placeholder="Estado de ánimo..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
                      Respuesta Cognitiva
                    </label>
                    <textarea
                      name="qual_cog"
                      defaultValue={initialData?.qualitative?.cognitive}
                      className="input-pro h-24 resize-none text-sm bg-white"
                      placeholder="Atención, memoria, lenguaje..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
                      Respuesta Física/Motora
                    </label>
                    <textarea
                      name="qual_fis"
                      defaultValue={initialData?.qualitative?.physical}
                      className="input-pro h-24 resize-none text-sm bg-white"
                      placeholder="Movimiento, tono..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <label className="label-pro mb-4">Evaluación Cuantitativa (0-3)</label>
                <div className="grid grid-cols-2 gap-4">
                  {EVALUATION_AREAS.map((a, i) => (
                    <div key={i} className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium text-slate-600">{a}</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((v) => (
                          <button
                            type="button"
                            key={v}
                            onClick={() => {
                              const n = [...scores];
                              n[i] = v;
                              setScores(n);
                            }}
                            className={`w-8 h-8 text-xs rounded-lg font-bold transition-all ${scores[i] === v ? 'bg-pink-500 text-white shadow-md scale-110' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <label className="label-pro">Notas Generales / Incidencias</label>
            <textarea
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-pro h-32 text-base"
              placeholder={
                isAbsent ? 'Motivo de la ausencia...' : 'Observaciones generales de la sesión...'
              }
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            {initialData?.id && onDelete && (
              <Button
                type="button"
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  if (window.confirm('¿Eliminar esta cita permanentemente?')) {
                    onDelete(initialData.id!);
                  }
                }}
              >
                Eliminar
              </Button>
            )}
            <Button
              type="submit"
              icon={Save}
              className="shadow-lg hover:shadow-xl px-8"
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar Sesión'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
