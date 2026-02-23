import { useState, useCallback, useMemo, useEffect } from 'react';
import { addWeeks } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import { useActivityLog } from '../../../hooks/useActivityLog';
import { useDeletePatient } from '../../../api/queries';
import {
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
} from '../../../api/mutations/useSessionMutations';
import { Patient, Session, CognitiveScores } from '../../../lib/types';
import { Activity, BarChart3, ClipboardCheck, DollarSign, CheckSquare, Folder } from 'lucide-react';

interface UsePatientControllerProps {
  patient: Patient;
  onUpdate: (patient: Patient) => void;
  onBack: () => void;
}

export const usePatientController = ({ patient, onUpdate, onBack }: UsePatientControllerProps) => {
  const { logActivity } = useActivityLog();
  const { canDelete, canViewFinancials, isPremium } = useAuth();

  // UI State
  const [activeTab, setActiveTab] = useState('treatment');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  const [showCognitiveModal, setShowCognitiveModal] = useState(false);
  const [cognitiveInitialTab, setCognitiveInitialTab] = useState<'general' | 'moca' | 'mmse'>(
    'general',
  );
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // TITANIUM HEALER: Background Consistency Check
  const [hasSynced, setHasSynced] = useState(false);
  const runHealer = useCallback(() => {
    if (patient.id && !hasSynced) {
      import('../../../data/repositories/SessionRepository').then(({ SessionRepository }) => {
        SessionRepository.syncLegacySessions(patient).catch(() => { /* silent */ });
        setHasSynced(true);
      });
    }
  }, [patient, hasSynced]);

  // Trigger on mount or patient change
  useEffect(() => {
    // Trigger sync only if patient ID changes
    if (patient.id) {
      runHealer();
    }
  }, [patient.id, runHealer]);

  // Mutations
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();
  const { mutateAsync: createSession } = useCreateSession();
  const { mutateAsync: updateSession } = useUpdateSession();
  const { mutateAsync: deleteSession } = useDeleteSession();

  // Handlers
  const handleDeletePatient = useCallback(() => {
    if (!patient.id) return;
    deletePatient(String(patient.id), {
      onSuccess: () => {
        logActivity('delete', `Paciente eliminado permanentemente: ${patient.name}`);
        showToast('Paciente eliminado correctamente', 'success');
        onBack();
      },
      onError: () => {
        showToast('Error al eliminar paciente', 'error');
      },
    });
  }, [patient.id, patient.name, deletePatient, logActivity, onBack, showToast]);

  const handleDeleteSession = useCallback(
    async (sessionId: string | number) => {
      if (
        !confirm(
          '🛑 ¿ELIMINAR SESIÓN DEFINITIVAMENTE?\n\nEsta acción no se puede deshacer. La sesión desaparecerá de la base de datos para siempre.',
        )
      ) {
        return false;
      }

      try {
        if (patient.id) {
          // TITANIUM: NUCLEAR DELETE (User Request: "ELIMINAR ENSERIO")
          // Replaced Soft Delete (Recycle Bin) with Hard Delete
          await deleteSession({ patientId: String(patient.id), sessionId: String(sessionId) });
          logActivity('delete', `Sesión eliminada permanentemente (Nuclear): ${patient.name}`);
          showToast('Sesión eliminada para siempre', 'success');

          setShowSessionModal(false);
          return true;
        }
      } catch {
        showToast('Error al eliminar sesión', 'error');
        return false;
      }
      return false;
    },
    [patient.id, patient.name, deleteSession, logActivity, showToast],
  );

  const handleSaveSession = useCallback(
    async (sessionData: Session | Partial<Session>) => {
      const isNew = !selectedSession;
      try {
        if (isNew) {
          if (patient.id) {
            type BasePayload = Record<string, unknown>;
            const rawData = sessionData as BasePayload;
            const rec = rawData.recurrence as { frequency?: string; occurrences?: number } | undefined;

            if (rec) {
              const { frequency, occurrences } = rec; // Fixed properties
              const count = occurrences || 1;
              const weeksToAdd = frequency === 'BIWEEKLY' ? 2 : 1;
              const baseDate = new Date(sessionData.date || new Date());

              const promises = [];
              for (let i = 0; i < count; i++) {
                const newDate = addWeeks(baseDate, i * weeksToAdd);
                // Avoid mutating original reference and remove recurrence from individual items
                const rest = { ...rawData };
                delete rest.recurrence;

                const sessionPayload = {
                  ...rest,
                  id: Date.now().toString() + i,
                  date: newDate.toISOString(),
                };
                promises.push(
                  createSession({
                    patientId: String(patient.id),
                    session: sessionPayload as Session,
                  }),
                );
              }
              await Promise.all(promises);
              logActivity(
                'session',
                `Bucle Creativo: ${count} sesiones recurrentes creadas para ${patient.name}`,
              );
            } else {
              await createSession({
                patientId: String(patient.id),
                session: sessionData as Session,
              });
              if (sessionData.isAbsent) {
                logActivity('session', `Ausencia registrada por ${patient.name}`, {
                  type: 'session',
                  sessionId: String(sessionData.id || 'new'),
                  patientId: String(patient.id),
                });
              } else {
                logActivity('session', `Sesión completada con ${patient.name}`, {
                  type: 'session',
                  sessionId: String(sessionData.id || 'new'),
                  patientId: String(patient.id),
                });
              }
            }
          }
        } else {
          if (patient.id && sessionData.id) {
            await updateSession({
              patientId: String(patient.id),
              sessionId: String(sessionData.id),
              data: sessionData,
            });
            if (sessionData.paid) {
              logActivity('finance', `Pago registrado: Sesión de ${patient.name}`);
            } else if (sessionData.isAbsent) {
              logActivity('session', `Sesión marcada como AUSENCIA: ${patient.name}`);
            } else {
              logActivity('session', `Sesión actualizada: ${patient.name}`);
            }
          }
        }
        setShowSessionModal(false);
        showToast('Sesión guardada correctamente', 'success');
        return true;
      } catch {
        showToast('Error al guardar sesión', 'error');
        return false;
      }
    },
    [
      selectedSession,
      patient.id,
      patient.name,
      createSession,
      updateSession,
      logActivity,
      showToast,
    ],
  );

  const handleUpdateCognitive = useCallback(
    (data: CognitiveScores & { functionalScores?: number[] }) => {
      // Create Snapshot Record for History Line
      const newRecord = {
        id: Date.now().toString(),
        date: data.date || new Date().toISOString(), // Ensure strict string
        results: {
          moca: String(data.moca || '').split('/')[0] || '0',
          mmse: String(data.mmse || '').split('/')[0] || '0',
          gds: String(data.gds || ''), // Ensure string
        },
        notes: 'Evaluación rápida registrada.',
      };

      const updatedHistory = [...(patient.evaluationHistory || []), newRecord];

      onUpdate({
        ...patient,
        cognitiveScores: { ...patient.cognitiveScores, ...data },
        currentEval: data.functionalScores,
        evaluationHistory: updatedHistory,
      });

      if (patient.id) {
        logActivity('patient', `Evaluación Cognitiva: MOCA ${data.moca} | MMSE ${data.mmse}`, {
          type: 'patient',
          patientId: String(patient.id),
          action: 'update',
        });
      }

      setShowCognitiveModal(false);
      setCognitiveInitialTab('general');
      showToast('Evaluación actualizada e historial registrado', 'success');
    },
    [patient, onUpdate, showToast, logActivity],
  );

  const handleRestoreSession = useCallback(
    async (session: Session) => {
      if (!patient.id || !session.id) return;
      try {
        // Restore by removing deletedAt
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { deletedAt: _deletedAt, ...rest } = session;
        await updateSession({
          patientId: String(patient.id),
          sessionId: String(session.id),
          data: { ...rest, deletedAt: undefined } as Session, // Force undefined to update
        });
        logActivity('session', `Sesión restaurada de papelera: ${patient.name}`);
        showToast('Sesión restaurada correctamente', 'success');
      } catch {
        showToast('Error al restaurar sesión', 'error');
      }
    },
    [patient.id, patient.name, updateSession, logActivity, showToast],
  );

  // Centralized Data Processing
  const activeSessions = useMemo(() => {
    return [...(patient.sessions || [])]
      .filter((s) => !s.deletedAt)
      .sort((a, b) => {
        const parseDate = (dStr: string) => {
          if (!dStr) return 0;
          if (dStr.includes('/')) {
            const [d, m, y] = dStr.split('/');
            return new Date(`${y}-${m}-${d}`).getTime();
          }
          return new Date(dStr).getTime();
        };
        return parseDate(b.date) - parseDate(a.date);
      });
  }, [patient.sessions]);

  const deletedSessions = useMemo(() => {
    return [...(patient.sessions || [])]
      .filter((s) => s.deletedAt)
      .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  }, [patient.sessions]);

  // Tabs Config
  const tabs = [
    { id: 'treatment', label: 'Plan de Tratamiento', icon: Activity },
    { id: 'evaluation', label: 'Evaluación (0-3)', icon: BarChart3 },
    { id: 'sessions', label: 'Bitácora', icon: ClipboardCheck },
    { id: 'documents', label: 'Gestor Documental', icon: Folder },
    ...(canViewFinancials ? [{ id: 'billing', label: 'Facturación', icon: DollarSign }] : []),
    { id: 'lifecycle', label: 'Ciclo Vital & Alta', icon: CheckSquare },
  ];

  return {
    activeTab,
    setActiveTab,
    showSessionModal,
    setShowSessionModal,
    selectedSession,
    setSelectedSession,
    showCognitiveModal,
    setShowCognitiveModal,
    cognitiveInitialTab,
    setCognitiveInitialTab,
    showGuideModal,
    setShowGuideModal,
    showEditProfile,
    setShowEditProfile,
    showReportModal,
    setShowReportModal,
    showPaywall,
    setShowPaywall,
    isDeleting,
    canDelete,
    isPremium,
    tabs,
    // Computed Data
    activeSessions,
    deletedSessions,
    // Methods
    handleDeletePatient,
    handleDeleteSession,
    handleRestoreSession,
    handleSaveSession,
    handleUpdateCognitive,
    notification, // Export notification state
    showToast, // Export trigger if needed
  };
};
