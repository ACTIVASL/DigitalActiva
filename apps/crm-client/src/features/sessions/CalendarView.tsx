import React, { useState, useMemo, useCallback, memo } from 'react';
import { Button } from '@monorepo/ui-system';
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Users,
  Sparkles,
  Clock,
  Sun,
} from 'lucide-react';
import { Patient, GroupSession, NavigationPayload } from '../../lib/types';
import { Toast } from '@monorepo/ui-system';
import {
  format,
  addMonths,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarViewProps {
  patients: Patient[];
  groupSessions: GroupSession[];
  onNavigate: (view: string, data?: NavigationPayload) => void;
  onOpenGroupModal: (mode: 'schedule' | 'evolution', data?: GroupSession) => void;
  onOpenSessionModal: () => void;
  onOpenQuickAppointment: (mode: 'new' | 'existing') => void;
}

// --- SUB COMPONENTS (MEMOIZED) ---

interface CalendarEvent {
  id: string | number;
  patientId?: string | number;
  title: string;
  dateObj: Date;
  type: 'individual' | 'group';
  time: string;
  status: 'scheduled' | 'absent';
  notes?: string;
  avatar: string;
}

interface CalendarDayProps {
  day: Date;
  isSelected: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  onSelect: (day: Date) => void;
}

const CalendarDay = memo(({ day, isSelected, isToday, events, onSelect }: CalendarDayProps) => {
  const handleClick = useCallback(() => onSelect(day), [day, onSelect]);
  const hasEvents = events.length > 0;

  return (
    <div
      onClick={handleClick}
      className={`
           relative group flex flex-col p-3 rounded-2xl transition-all duration-300 cursor-pointer
           ${isSelected
          ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 scale-[1.05] z-10'
          : 'bg-white hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50'
        }
           min-h-[90px] lg:min-h-[110px]
         `}
    >
      {/* Day Number */}
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all ${isSelected
            ? 'bg-white/20 text-white'
            : isToday
              ? 'bg-pink-50 text-pink-600 shadow-sm'
              : 'text-slate-600 group-hover:text-indigo-600'
            }`}
        >
          {format(day, 'd')}
        </span>
        {hasEvents && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white text-indigo-600' : 'bg-indigo-50 text-indigo-600'
              }`}
          >
            {events.length}
          </span>
        )}
      </div>

      {/* Visual Dots / Bars */}
      <div className="flex-1 flex flex-col justify-end gap-1.5">
        {events.slice(0, 3).map((ev, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 shadow-sm ${ev.type === 'group'
                ? 'bg-indigo-400'
                : ev.status === 'absent'
                  ? 'bg-red-400'
                  : 'bg-pink-400'
                } ${isSelected ? 'ring-1 ring-white/50' : ''}`}
            ></div>
            <span
              className={`text-[9px] font-semibold truncate ${isSelected ? 'text-indigo-50' : 'text-slate-500'}`}
            >
              {ev.time} {ev.title?.split(' ')[0]}
            </span>
          </div>
        ))}
        {events.length > 3 && (
          <div
            className={`text-[9px] font-bold text-center mt-1 ${isSelected ? 'text-white/70' : 'text-slate-300'}`}
          >
            +{events.length - 3}
          </div>
        )}
      </div>
    </div>
  );
});
CalendarDay.displayName = 'CalendarDay';

interface TimelineEventProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

const TimelineEvent = memo(({ event, onClick }: TimelineEventProps) => {
  const handleClick = useCallback(() => onClick(event), [event, onClick]);

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white border border-transparent hover:border-indigo-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all cursor-pointer overflow-hidden duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm ${event.type === 'group' ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'}`}
          >
            <Clock size={14} /> {event.time}
          </div>
          {event.status === 'absent' && (
            <span className="px-2 py-1 rounded-md bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider">
              Ausente
            </span>
          )}
        </div>
      </div>

      <div>
        {event.type === 'individual' && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
              {event.avatar}
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Paciente
            </span>
          </div>
        )}
        <h4 className="font-bold text-slate-800 text-lg leading-snug group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h4>
        <p className="text-xs text-slate-400 mt-2 line-clamp-1 font-medium">
          {event.notes || 'Notas no disponibles'}
        </p>
      </div>

      {/* Hover Action */}
      <div className="absolute bottom-4 right-4 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
});
TimelineEvent.displayName = 'TimelineEvent';

// --- MAIN EVENT ---

export const CalendarView: React.FC<CalendarViewProps> = memo(
  ({ patients, groupSessions, onNavigate, onOpenGroupModal, onOpenQuickAppointment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [toastData, setToastData] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // 1. DATA AGGREGATION
    const allEvents = useMemo(() => {
      // A. Individual Sessions
      const individuals = patients.flatMap((patient) =>
        (patient.sessions || []).map((session) => ({
          id: session.id,
          patientId: patient.id,
          title: patient.name,
          dateObj: new Date(session.date),
          type: 'individual' as const,
          time: session.time || '00:00',
          status: (session.isAbsent ? 'absent' : 'scheduled') as 'scheduled' | 'absent',
          notes: session.notes,
          avatar: patient.name.charAt(0),
        })),
      );

      // B. Group Sessions
      const groups = groupSessions.map((s) => {
        let dateObj: Date;
        if (s.date.includes('/')) {
          const [d, m, y] = s.date.split('/');
          dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        } else {
          dateObj = new Date(s.date);
        }
        return {
          id: s.id,
          title: s.groupName || 'Sesión Grupal',
          dateObj: dateObj,
          type: 'group' as const,
          time: s.time || '10:00',
          status: 'scheduled' as const, // Fixed literal type
          notes: s.observations,
          avatar: 'G',
        };
      });

      return [...individuals, ...groups].sort((a, b) => a.time.localeCompare(b.time));
    }, [patients, groupSessions]);

    // 2. SELECTED DAY LOGIC
    const selectedEvents = useMemo(() => {
      return allEvents.filter((e) => isSameDay(e.dateObj, selectedDay));
    }, [allEvents, selectedDay]);

    // 3. CALENDAR GRID
    const calendarDays = useMemo(() => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const startDay = monthStart.getDay();
      const paddingStart = startDay === 0 ? 6 : startDay - 1; // Mon=0, Sun=6
      return { days: daysInMonth, padding: paddingStart };
    }, [currentDate]);

    // 4. HANDLERS
    const handleMonthChange = useCallback((offset: number) => {
      setCurrentDate((prev) => addMonths(prev, offset));
    }, []);

    const handleDaySelect = useCallback((day: Date) => {
      setSelectedDay(day);
    }, []);

    const handleEventClick = useCallback(
      (ev: CalendarEvent) => {
        if (ev.type === 'individual' && ev.patientId) {
          const patient = patients.find((p) => String(p.id) === String(ev.patientId));
          if (patient) onNavigate('patient-detail', patient);
        } else if (ev.type === 'group') {
          const groupData = groupSessions.find((g) => g.id === ev.id);
          if (groupData) {
            onOpenGroupModal('evolution', { ...groupData, date: format(ev.dateObj, 'yyyy-MM-dd') });
          }
        }
      },
      [patients, groupSessions, onNavigate, onOpenGroupModal],
    );

    const handleNewAppt = useCallback(
      () => onOpenQuickAppointment('existing'),
      [onOpenQuickAppointment],
    );
    const handleNewGroup = useCallback(() => onOpenGroupModal('schedule'), [onOpenGroupModal]);

    return (
      <div className="min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)] w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-6 p-2 animate-in fade-in duration-500 lg:overflow-hidden overflow-y-auto">
        {toastData && <Toast message={toastData.msg} type={toastData.type} onClose={() => setToastData(null)} />}

        {/* --- LEFT PANEL: THE CALENDAR --- */}
        <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-indigo-100/50 rounded-3xl lg:overflow-hidden relative shrink-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-50/40 to-pink-50/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-indigo-50/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white rounded-full p-1.5 shadow-sm border border-indigo-50">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight px-6 min-w-[200px] text-center">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* QUICK STATS */}
              <div className="hidden xl:flex items-center gap-4 text-xs font-bold text-slate-400 bg-white/50 px-4 py-2 rounded-full border border-white/60 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.4)]"></div>
                  Individual
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.4)]"></div>
                  Grupal
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handleNewAppt}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all border-0 rounded-full px-6"
                icon={CalendarCheck}
              >
                Agendar Cita
              </Button>
              <Button
                size="sm"
                onClick={handleNewGroup}
                variant="secondary"
                className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm rounded-full px-6"
                icon={Users}
              >
                Grupal
              </Button>
            </div>
          </div>

          {/* DAYS HEADER */}
          <div className="grid grid-cols-7 border-b border-indigo-50/30 bg-white/40">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div
                key={d}
                className="py-4 text-center text-[11px] font-bold uppercase text-slate-400 tracking-widest"
              >
                {d}
              </div>
            ))}
          </div>

          {/* CALENDAR GRID */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6 p-2 lg:p-6 gap-2 lg:gap-3 lg:overflow-y-auto custom-scrollbar min-h-[500px] lg:min-h-0">
            {Array(calendarDays.padding)
              .fill(null)
              .map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="bg-transparent opacity-0 pointer-events-none"
                ></div>
              ))}

            {calendarDays.days.map((day, i) => {
              const isSelected = isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              const dayEvents = allEvents.filter((e) => isSameDay(e.dateObj, day));

              return (
                <CalendarDay
                  key={i}
                  day={day}
                  isSelected={isSelected}
                  isToday={isToday}
                  events={dayEvents}
                  onSelect={handleDaySelect}
                />
              );
            })}
          </div>
        </div>

        {/* --- RIGHT PANEL: TIMELINE --- */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6 lg:h-full relative z-20 pb-20 lg:pb-0">
          {/* Date Header Card */}
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 tracking-tighter">
                {format(selectedDay, 'd')}
              </h2>
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mt-1">
                {format(selectedDay, 'MMMM, EEEE', { locale: es })}
              </p>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-indigo-100 transition-colors duration-500"></div>

            <div className="relative z-10 w-14 h-14 rounded-2xl bg-white shadow-lg shadow-indigo-100 flex items-center justify-center border border-indigo-50 text-indigo-500">
              <Sun size={28} className="animate-spin-slow" style={{ animationDuration: '10s' }} />
            </div>
          </div>

          {/* Timeline Scroll Container */}
          <div className="flex-1 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50 flex flex-col p-1 relative">
            {selectedEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-indigo-100 flex items-center justify-center mb-6">
                  <Sparkles size={32} className="text-indigo-300" />
                </div>
                <p className="text-slate-600 font-bold text-lg">Día Despejado</p>
                <p className="text-sm text-slate-400 mt-2 max-w-[200px]">
                  No hay sesiones programadas para este día.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-3">
                {selectedEvents.map((ev, i) => (
                  <TimelineEvent key={i} event={ev} onClick={handleEventClick} />
                ))}
              </div>
            )}

            <div className="h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none absolute bottom-0 left-0 right-0 rounded-b-3xl"></div>
          </div>
        </div>
      </div>
    );
  },
);

CalendarView.displayName = 'CalendarView';
