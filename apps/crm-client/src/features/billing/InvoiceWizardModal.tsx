import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PatientRepository } from '../../data/repositories/PatientRepository';
import { SessionRepository } from '../../data/repositories/SessionRepository';
import { BillingRepository } from '../../data/repositories/BillingRepository';
import { GroupSessionRepository } from '../../data/repositories/GroupSessionRepository';
import { format } from 'date-fns';
import { X, Receipt } from 'lucide-react';
import { useInvoiceController } from '../../hooks/controllers/useInvoiceController';
import { useSettingsController } from '../../hooks/controllers/useSettingsController';
import { ClinicSettings } from '../../lib/types';
import { BillableSession, WizardMode, WizardStep } from './components/wizard/wizardTypes';
import { auth } from '@monorepo/engine-auth';

// Sub-components
import { WizardStep1_Mode } from './components/wizard/WizardStep1_Mode';
import { InvoiceClientSelector } from './components/InvoiceClientSelector';
import { InvoiceSessionSelector } from './components/InvoiceSessionSelector';
import { WizardStep4_Summary } from './components/wizard/WizardStep4_Summary';

interface InvoiceWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceWizardModal: React.FC<InvoiceWizardModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [mode, setMode] = useState<WizardMode>('INDIVIDUAL');

  // Selection State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState('');

  const { createInvoice, isCreating } = useInvoiceController();
  const { settings, updateSettings } = useSettingsController();
  const [billingData, setBillingData] = useState<NonNullable<ClinicSettings['billing']>>({
    legalName: '',
    nif: '',
    address: '',
    logoUrl: '',
    email: '',
    phone: '',
  });

  // --- EFFECT: SYNC SETTINGS & INIT ---
  useEffect(() => {
    if (settings?.billing) {
      setBillingData({
        legalName: settings.billing.legalName || '',
        nif: settings.billing.nif || '',
        address: settings.billing.address || '',
        logoUrl: settings.billing.logoUrl || '',
        email: settings.billing.email || '',
        phone: settings.billing.phone || '',
      });
    }
  }, [settings]);

  useEffect(() => {
    if (isOpen) setCustomInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
  }, [isOpen]);

  // --- DATA FETCHING ---
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'list'],
    queryFn: () => PatientRepository.getAll(),
    enabled: isOpen && mode === 'INDIVIDUAL',
    staleTime: 0,
  });

  const { data: allGroupSessions = [] } = useQuery({
    queryKey: ['group_sessions_all'],
    queryFn: () => GroupSessionRepository.getAll(),
    enabled: isOpen && mode === 'GROUP',
  });

  const availableGroups = useMemo(() => {
    const uniqueNames = new Set(
      allGroupSessions.map((g) => g.groupName).filter((name): name is string => !!name),
    );
    return Array.from(uniqueNames);
  }, [allGroupSessions]);

  const { data: billableSessions = [] } = useQuery<BillableSession[]>({
    queryKey: ['billable_sessions', mode, selectedPatientId, selectedGroupName],
    queryFn: async () => {
      if (mode === 'INDIVIDUAL' && selectedPatientId) {
        const sessions = await SessionRepository.getSessionsByPatientId(selectedPatientId);
        return sessions
          .filter((s) => s.id && !s.paid)
          .map(
            (s) =>
              ({
                ...s,
                patientId: selectedPatientId,
                _type: 'individual' as const,
              }) as unknown as BillableSession,
          );
      }
      if (mode === 'GROUP' && selectedGroupName) {
        const sessions = await BillingRepository.getUnbilledGroupSessions(selectedGroupName);
        return sessions.map(
          (s) => ({ ...s, _type: 'group' as const }) as unknown as BillableSession,
        );
      }
      return [];
    },
    enabled:
      (mode === 'INDIVIDUAL' && !!selectedPatientId) || (mode === 'GROUP' && !!selectedGroupName),
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedSessions = billableSessions.filter((s) =>
    selectedSessionIds.includes(String(s.id)),
  );

  // --- ACTIONS ---
  const handleGenerate = async () => {
    if (mode === 'INDIVIDUAL' && !selectedPatient) return alert('Selecciona un paciente');
    if (mode === 'GROUP' && !selectedGroupName) return alert('Selecciona un grupo');
    if (selectedSessionIds.length === 0) return alert('Selecciona al menos una sesión');
    if (!customInvoiceNumber) return alert('El número de factura es obligatorio');

    // Upsert Settings
    try {
      await updateSettings({ billing: billingData });
    } catch {
      // Settings autosave is non-critical; billing data will be used from local state
    }

    const total = selectedSessions.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    const issueDate = new Date(invoiceDate);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 7);

    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return alert('No hay usuario autenticado');

    const invoicePayload = {
      id: crypto.randomUUID(),
      number: customInvoiceNumber,
      userId: currentUserId,
      patientId: mode === 'INDIVIDUAL' ? (selectedPatient?.id as string) : 'GROUPS',
      patientName:
        mode === 'INDIVIDUAL' ? selectedPatient?.name || 'Cliente' : selectedGroupName || 'Grupo',
      date: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'PENDING' as const,
      items: selectedSessions.map((s) => ({
        id: crypto.randomUUID(),
        description:
          mode === 'INDIVIDUAL'
            ? `Sesión Individual - ${s.date}`
            : `Sesión Grupal (${selectedGroupName}) - ${s.date}`,
        quantity: 1,
        unitPrice: Number(s.price) || 0,
        total: Number(s.price) || 0,
        sessionId: s.id as string,
      })),
      subtotal: total,
      taxRate: 0,
      taxAmount: 0,
      total: total,
      notes:
        mode === 'INDIVIDUAL'
          ? `Factura música para ${selectedPatient?.name}`
          : `Factura de servicios grupales: ${selectedGroupName}`,
    };

    const batchSessions = selectedSessions.map((s) => ({
      id: String(s.id),
      type: s._type,
      patientId: s.patientId,
      price: Number(s.price),
      date: String(s.date),
    }));

    try {
      await createInvoice({ invoice: invoicePayload, sessions: batchSessions });
      onClose();
      setStep(1);
      setSelectedPatientId(null);
      setSelectedGroupName(null);
      setSelectedSessionIds([]);
    } catch {
      alert('Error al generar factura');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* HEAD */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Receipt size={24} className="text-pink-600" /> Nueva Factura
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Asistente de Facturación Inteligente (Refactored)
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <WizardStep1_Mode
              onSelectMode={(m) => {
                setMode(m);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <InvoiceClientSelector
              mode={mode}
              patients={patients}
              availableGroups={availableGroups}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setStep(3);
              }}
              onSelectGroup={(name) => {
                setSelectedGroupName(name);
                setStep(3);
              }}
              onChangeMode={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <InvoiceSessionSelector
              mode={mode}
              billableSessions={billableSessions}
              selectedSessionIds={selectedSessionIds}
              onSelectionChange={setSelectedSessionIds}
              onChangeSelection={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <WizardStep4_Summary
              mode={mode}
              selectedSessions={selectedSessions}
              selectedName={
                mode === 'INDIVIDUAL' ? selectedPatient?.name || '' : selectedGroupName || ''
              }
              invoiceDate={invoiceDate}
              setInvoiceDate={setInvoiceDate}
              customInvoiceNumber={customInvoiceNumber}
              setCustomInvoiceNumber={setCustomInvoiceNumber}
              billingData={billingData}
              setBillingData={setBillingData}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as WizardStep)}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              Atrás
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 3 && selectedSessionIds.length === 0)
                  return alert('Selecciona al menos una sesión');
                setStep((prev) => (prev + 1) as WizardStep);
              }}
              disabled={
                (step === 2 &&
                  ((mode === 'INDIVIDUAL' && !selectedPatientId) ||
                    (mode === 'GROUP' && !selectedGroupName))) ||
                (step === 3 && selectedSessionIds.length === 0)
              }
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isCreating}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-pink-200 disabled:opacity-70 flex items-center gap-2"
            >
              {isCreating && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Crear Factura
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
