import React, { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users } from 'lucide-react';
import { Session, Patient } from '../../../lib/types';
import { Card } from '@monorepo/ui-system';

type ExtendedSession = Session & { patientId?: string | number };

interface WeeklyAgendaWidgetProps {
  sessions: ExtendedSession[];
  patients: Patient[];
  onSessionClick: (session: Session, patient?: Patient) => void;
  onSessionMove?: (sessionId: string, newDate: Date) => void;
}

export const WeeklyAgendaWidget: React.FC<WeeklyAgendaWidgetProps> = ({
  sessions,
  patients,
  onSessionClick,
  onSessionMove,
}) => {
  // 1. Get current week days
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday start like a civilized person
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  // Track drag state for visual feedback
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // 2. Hydrate Sessions with Patient Data & Date Objects
  const hydratedSessions = useMemo(() => {
    return sessions.map((s) => {
      // Handle ISO vs Legacy Dates
      let dateObj: Date;
      if (s.date.includes('/')) {
        const [d, m, y] = s.date.split('/');
        dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      } else {
        dateObj = new Date(s.date);
      }

      const patient = patients.find((p) => String(p.id) === String(s.patientId || ''));
      return {
        ...s,
        dateObj,
        patient,
        patientName: patient?.name || 'Inexistente', // Fallback
      };
    });
  }, [sessions, patients]);

  // --- DND HANDLERS ---

  const handleDragStart = (e: React.DragEvent, session: ExtendedSession) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        sessionId: session.id,
        patientId: session.patientId,
        originDate: session.date,
      }),
    );
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(String(session.id));
  };

  const handleDragOver = (e: React.DragEvent, dayIdx: number) => {
    e.preventDefault(); // Necesssary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(dayIdx);
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    setDraggingId(null);
    setDragOverDay(null);

    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      if (onSessionMove && data.sessionId) {
        // Optimistic check? Or just fire.
        onSessionMove(data.sessionId, targetDate);
      }
    } catch {
      // Invalid drag data — ignore
    }
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Users className="text-indigo-600" strokeWidth={1.5} /> Agenda Semanal
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
            {(() => {
              // Safe render logic
              const d1 = !isNaN(startOfCurrentWeek.getTime()) ? startOfCurrentWeek : new Date();
              const d2 = !isNaN(weekDays[6].getTime()) ? weekDays[6] : new Date();
              return (
                <>
                  {format(d1, 'd MMM', { locale: es })} - {format(d2, 'd MMM', { locale: es })}
                </>
              );
            })()}
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
          Arrastra para re-agendar
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-cols-7 min-w-[800px] gap-4 h-full">
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const isDragOver = dragOverDay === idx;

            const daySessions = hydratedSessions
              .filter((s) => isSameDay(s.dateObj, day))
              .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

            return (
              <div
                key={idx}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={(e) => handleDrop(e, day)}
                className={`flex flex-col gap-3 rounded-xl p-2 transition-all duration-200 h-full min-h-[500px]
                                    ${isDragOver ? 'bg-indigo-100/50 ring-2 ring-indigo-300 scale-[1.01]' : ''}
                                    ${isToday && !isDragOver ? 'bg-indigo-50/50 ring-1 ring-indigo-100' : ''}
                                    ${!isToday && !isDragOver ? 'hover:bg-slate-50' : ''}
                                `}
              >
                <div className="text-center pb-2 border-b border-slate-100/50 pointer-events-none select-none">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}
                  >
                    {(() => {
                      try {
                        return format(day, 'EEE', { locale: es });
                      } catch {
                        return '---';
                      }
                    })()}
                  </p>
                  <p
                    className={`text-xl font-black ${isToday ? 'text-indigo-700' : 'text-slate-700'}`}
                  >
                    {(() => {
                      try {
                        return format(day, 'd');
                      } catch {
                        return '-';
                      }
                    })()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] custom-scrollbar min-h-[200px] pointer-events-auto">
                  {daySessions.map((s, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, s)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverDay(null);
                      }}
                      onClick={() => onSessionClick(s, s.patient)}
                      className={`
                                                relative text-left p-2 rounded-lg border text-xs shadow-sm transition-all cursor-move
                                                ${draggingId === String(s.id) ? 'opacity-50 scale-95 ring-2 ring-indigo-400' : 'hover:shadow-md hover:-translate-y-0.5'}
                                                ${s.isAbsent
                          ? 'bg-red-50 border-red-100'
                          : s.type === 'group'
                            ? 'bg-purple-50 border-purple-100'
                            : 'bg-white border-slate-200'
                        }
                                            `}
                    >
                      <div className="font-bold text-slate-700 truncate group-hover:text-indigo-600 mb-0.5 pointer-events-none">
                        {s.patientName}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 pointer-events-none">
                        {s.isAbsent ? (
                          <span className="text-[9px] font-black text-red-600 bg-red-100 px-1 rounded">
                            AUS
                          </span>
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${s.paid ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          />
                        )}
                        <span className="text-[10px] text-slate-500 truncate">
                          {s.type === 'group' ? 'Grupal' : '1:1'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {daySessions.length === 0 && !isDragOver && (
                    <div className="flex-1 flex items-center justify-center opacity-20 pointer-events-none">
                      <div className="w-1 h-1 bg-slate-400 rounded-full" />
                    </div>
                  )}
                  {isDragOver && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50/20 animate-pulse">
                      <span className="text-[9px] text-indigo-400 font-bold">Soltar aquí</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
