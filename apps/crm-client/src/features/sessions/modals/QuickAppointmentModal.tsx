import React, { useState } from 'react';
import { Clock, Repeat, CalendarDays } from 'lucide-react';
import { Button } from '@monorepo/ui-system';
import { Patient } from '../../../lib/types';
import { generateRecurringDates, RecurrenceFrequency } from '../../../lib/recurrenceEngine';
import { SessionRepository } from '../../../data/repositories/SessionRepository';

interface QuickAppointmentModalProps {
  onClose: () => void;
  patients: Patient[];
  onSave: (data: {
    date: string;
    time: string;
    name: string;
    mode: 'new' | 'existing';
    patientId?: string | number;
  }) => void;
  mode?: 'existing' | 'new';
  initialPatientId?: string; // TITANIUM: Allow pre-selecting patient
}

export const QuickAppointmentModal: React.FC<QuickAppointmentModalProps> = ({
  onClose,
  patients,
  onSave,
  mode = 'existing',
  initialPatientId = '',
}) => {
  // Mode prop added to auto-select tab
  const [currentMode, setCurrentMode] = useState(mode);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [newPatientName, setNewPatientName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');

  // RECURRENCE STATE
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency>('WEEKLY');
  const [recurrenceCount, setRecurrenceCount] = useState(4); // Default 1 month approx

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentMode === 'existing' && !selectedPatientId) {
        alert('Selecciona un paciente');
        return;
      }
      if (currentMode === 'new' && !newPatientName) {
        alert('Escribe el nombre del paciente');
        return;
      }

      // 1. Handle Single Appointment (Standard Flow)
      // We assume onSave handles the single creation via Mutation in App.tsx
      onSave({
        mode: currentMode,
        patientId: selectedPatientId,
        name: newPatientName,
        date,
        time,
      });

      // 2. Handle Recurrence (Titanium Engine)
      if (isRecurring && currentMode === 'existing' && selectedPatientId) {
        // Generate FUTURE dates (excluding current one which is handled above)
        const rule = {
          frequency: recurrenceFreq,
          occurrences: recurrenceCount,
        };
        const futureDates = generateRecurringDates(date, rule);

        if (futureDates.length > 0) {
          // Build Session Objects
          const sessionsPayload = futureDates.map((futureDate) => ({
            id: '', // Will be generated
            date: futureDate,
            time: time,
            type: 'individual' as const,
            notes: `Reunión recurrente (${recurrenceFreq})`,
            price: 50, // Default price, ideally fetch from patient settings
            paid: false,
            billable: true,
            isAbsent: false,
            activities: [],
          }));

          // Atomic Batch Write

          await SessionRepository.createBatch(selectedPatientId, sessionsPayload);
          alert(`Se han generado ${sessionsPayload.length} reuniones futuras automáticamente.`);
        }
      }
    } catch (err) {
      alert('Error al procesar la cita');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-3d p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="text-pink-600" /> Agendar Cita
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex bg-slate-50 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setCurrentMode('existing')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${currentMode === 'existing' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
              Existente
            </button>
            <button
              type="button"
              onClick={() => setCurrentMode('new')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${currentMode === 'new' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
              Nuevo
            </button>
          </div>
          {currentMode === 'existing' ? (
            <select
              className="input-pro text-lg p-3"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
            >
              <option value="">- Seleccionar -</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input-pro text-lg p-3"
              placeholder="Nombre del nuevo paciente"
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
              required
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-pro">Fecha</label>
              <input
                type="date"
                className="input-pro text-lg p-3"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-pro">Hora</label>
              <input
                type="time"
                className="input-pro text-lg p-3"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* TITANIUM RECURRENCE UI */}
          {currentMode === 'existing' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-bold text-slate-700">Repetir Reunión</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="label-pro text-[10px]">Frecuencia</label>
                    <select
                      className="input-pro text-xs py-2"
                      value={recurrenceFreq}
                      onChange={(e) => setRecurrenceFreq(e.target.value as RecurrenceFrequency)}
                    >
                      <option value="WEEKLY">Semanal</option>
                      <option value="BIWEEKLY">Quincenal</option>
                      <option value="MONTHLY">Mensual</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-pro text-[10px]">Repeticiones</label>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="input-pro text-xs py-2"
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-[10px] text-slate-400 text-center mt-1">
                    Se crearán {recurrenceCount} reuniones adicionales.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">Confirmar Cita</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
