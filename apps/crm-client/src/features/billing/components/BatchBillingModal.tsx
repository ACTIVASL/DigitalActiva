import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, CheckSquare, Rocket, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PatientRepository } from '../../../data/repositories/PatientRepository';
import { useInvoiceController } from '../../../hooks/controllers/useInvoiceController';
import { Patient, Session } from '../../../lib/types';
import { Button } from '@monorepo/ui-system';
import { auth } from '@monorepo/engine-auth';

interface BatchBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BillingCandidate {
  patient: Patient;
  sessions: Session[];
  total: number;
  selected: boolean;
}

export const BatchBillingModal: React.FC<BatchBillingModalProps> = ({ isOpen, onClose }) => {
  // State
  const [selectedDate, setSelectedDate] = useState(new Date()); // Defaults to current month
  const [candidates, setCandidates] = useState<BillingCandidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  // Controllers
  const { createInvoice } = useInvoiceController();

  // Fetch Patients (Source of Truth for Sessions Cache)
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', 'batch_billing'],
    queryFn: () => PatientRepository.getAll(),
    enabled: isOpen,
  });

  // --- RECALCULATE CANDIDATES WHEN DATE/PATIENTS CHANGE ---
  useEffect(() => {
    if (!patients) return;

    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);

    const newCandidates: BillingCandidate[] = patients
      .map((patient: Patient) => {
        const unbilledSessions = (patient.sessions || []).filter((session: Session) => {
          if (!session.date) return false;

          const sDate = parseISO(session.date);
          const inRange = isWithinInterval(sDate, { start, end });

          return inRange && !session.paid;
        });

        const total = unbilledSessions.reduce(
          (acc: number, s: Session) => acc + (Number(s.price) || 0),
          0,
        );

        return {
          patient,
          sessions: unbilledSessions,
          total,
          selected: unbilledSessions.length > 0,
        };
      })
      .filter((c: BillingCandidate) => c.sessions.length > 0);

    setCandidates(newCandidates);
  }, [patients, selectedDate]);

  // --- ACTIONS ---

  const toggleCandidate = (patientId: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.patient.id === patientId ? { ...c, selected: !c.selected } : c)),
    );
  };

  const handleExecuteBatch = async () => {
    const selectedCandidates = candidates.filter((c) => c.selected);
    if (selectedCandidates.length === 0) return;

    if (!confirm(`¿Generar ${selectedCandidates.length} facturas automáticas?`)) return;

    setIsGenerating(true);
    setExecutionLog([]);
    setProgress(0);

    for (let i = 0; i < selectedCandidates.length; i++) {
      const candidate = selectedCandidates[i];
      const { patient, sessions, total } = candidate;

      try {
        // Generate Invoice Object
        const invoiceNumber = `INV-BATCH-${Date.now().toString().slice(-6)}-${i}`;

        const issueDate = new Date(); // Today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) throw new Error('No hay usuario autenticado');

        const invoicePayload = {
          id: crypto.randomUUID(),
          number: invoiceNumber,
          userId: currentUserId,
          patientId: String(patient.id),
          patientName: patient.name,
          date: issueDate.toISOString(),
          dueDate: dueDate.toISOString(),
          status: 'PENDING' as const,
          items: sessions.map((s) => ({
            id: crypto.randomUUID(),
            description: `Consultoría Tecnológica - ${s.date}`,
            quantity: 1,
            unitPrice: Number(s.price) || 0,
            total: Number(s.price) || 0,
            sessionId: String(s.id),
          })),
          subtotal: total,
          taxRate: 0,
          taxAmount: 0,
          total: total,
          notes: `Facturación Mensual (${format(selectedDate, 'MMMM yyyy', { locale: es })})`,
        };

        const batchSessions = sessions.map((s) => ({
          id: String(s.id),
          type: 'individual' as const,
          patientId: String(patient.id),
          price: Number(s.price),
          date: String(s.date),
        }));

        await createInvoice({ invoice: invoicePayload, sessions: batchSessions });

        setExecutionLog((prev) => [...prev, `✅ ${patient.name}: ${total}€`]);
      } catch {
        setExecutionLog((prev) => [...prev, `❌ ${patient.name}: ERROR`]);
      }

      // Update Progress
      setProgress(Math.round(((i + 1) / selectedCandidates.length) * 100));
      // Artificial delay for UX (feeling of work)
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsGenerating(false);
  };

  // --- RENDER ---

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Rocket size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Piloto Automático</h2>
              <p className="text-sm text-slate-500 font-medium">Facturación Masiva por Lotes</p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* LEFT PANEL: FILTERS & SUMMARY */}
          <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col gap-6">
            {/* Month Selector */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Periodo de Facturación
              </label>
              <input
                type="month"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={format(selectedDate, 'yyyy-MM')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                disabled={isGenerating}
              />
            </div>

            {/* Stats */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Pacientes</span>
                <span className="font-bold text-slate-900 text-lg">
                  {candidates.filter((c) => c.selected).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Sesiones</span>
                <span className="font-bold text-slate-900 text-lg">
                  {candidates
                    .filter((c) => c.selected)
                    .reduce((acc, c) => acc + c.sessions.length, 0)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-black text-slate-400 uppercase">Total</span>
                <span className="font-black text-indigo-600 text-2xl">
                  {candidates
                    .filter((c) => c.selected)
                    .reduce((acc, c) => acc + c.total, 0)
                    .toFixed(2)}
                  €
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-auto bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-700 flex gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <p>
                Se generarán facturas en estado <b>PENDIENTE</b>. Revisa los datos antes de
                enviarlas a los clientes.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: LIST */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
            {/* EXECUTION OVERLAY */}
            {isGenerating && (
              <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-4 text-center">
                  <h3 className="text-2xl font-black text-slate-900 animate-pulse">
                    Generando Facturas...
                  </h3>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-slate-500 font-mono font-bold">{progress}% Completado</p>

                  <div className="h-40 overflow-y-auto bg-slate-900 rounded-xl p-4 text-left font-mono text-xs text-emerald-400 border border-slate-800 shadow-inner custom-scrollbar">
                    {executionLog.map((log, i) => (
                      <div key={i} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>

                  {progress === 100 && (
                    <Button onClick={onClose} className="w-full mt-4" variant="primary">
                      Finalizar
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-700">Candidatos a Facturar</h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCandidates((prev) => prev.map((c) => ({ ...c, selected: true })))
                  }
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() =>
                    setCandidates((prev) => prev.map((c) => ({ ...c, selected: false })))
                  }
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Ninguno
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {isLoading ? (
                <div className="text-center p-10 text-slate-400">Cargando datos...</div>
              ) : candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <CheckCircle2 size={48} className="text-slate-200 mb-4" />
                  <p>No hay proyectos pendientes en este periodo.</p>
                </div>
              ) : (
                candidates.map((candidate) => (
                  <div
                    key={candidate.patient.id}
                    onClick={() => !isGenerating && toggleCandidate(String(candidate.patient.id))}
                    className={`
                                            group flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all
                                            ${candidate.selected
                        ? 'bg-indigo-50/50 border-indigo-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200 opacity-60 grayscale'
                      }
                                        `}
                  >
                    <div
                      className={`
                                            w-5 h-5 rounded flex items-center justify-center transition-colors
                                            ${candidate.selected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-transparent'}
                                        `}
                    >
                      <CheckSquare size={14} />
                    </div>

                    <div className="flex-1">
                      <h4
                        className={`font-bold text-sm ${candidate.selected ? 'text-indigo-900' : 'text-slate-600'}`}
                      >
                        {candidate.patient.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {candidate.sessions.length} registros encontrados
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`block font-black ${candidate.selected ? 'text-indigo-600' : 'text-slate-400'}`}
                      >
                        {candidate.total.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <Button
                onClick={handleExecuteBatch}
                disabled={isGenerating || candidates.filter((c) => c.selected).length === 0}
                className="w-full justify-center py-4 text-base shadow-lg shadow-indigo-200"
                variant="primary"
                icon={Rocket}
              >
                Generar Facturas (
                {candidates
                  .filter((c) => c.selected)
                  .reduce((acc, c) => acc + c.total, 0)
                  .toFixed(2)}
                €)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
