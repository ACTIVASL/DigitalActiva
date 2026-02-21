import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// LAYOUT & THEME
import { AppLayout } from '@/layout/AppLayout';
import { ErrorBoundary, CommandMenu, OfflineIndicator, toast } from '@monorepo/ui-system';

// AUTH
import { LoginViewV2 as LoginView } from '@monorepo/engine-auth';
import { useAuth } from './context/AuthContext';

// ROUTES
import { AppRouter } from './routes/AppRouter';

// MODALS
import { GlobalModals } from './features/modals/GlobalModals';

// REPOSITORIES
// (None currently at top level)

// STORES
import { useUIStore } from './stores/useUIStore';

// API & TYPES
import { Patient, GroupSession, NavigationPayload, Session } from './lib/types';
import { usePatients, useCreatePatient, useUpdatePatient } from './api/queries';
import { queryKeys } from './api/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { useActivityLog } from './hooks/useActivityLog';

// --- DEFAULT CONSTANTS FOR STRICT TYPES ---
const DEFAULT_SAFETY_PROFILE = {
  epilepsy: false,
  dysphagia: false,
  flightRisk: false,
  psychomotorAgitation: false,
  hyperacusis: false,
  chokingHazard: false,
  disruptiveBehavior: false,
  alerts: [],
  mobilityAid: 'none' as const,
  allergies: '',
};

const DEFAULT_MUSICAL_IDENTITY = {
  likes: [],
  dislikes: [],
  biographicalSongs: [],
  instrumentsOfInterest: [],
  musicalTraining: false,
  sensitivityLevel: 'medium' as const,
};

const DEFAULT_SOCIAL_CONTEXT = {
  livingSituation: '',
  caregiverNetwork: '',
  recentLifeEvents: [],
};

function App() {
  const { user, logout, loading } = useAuth();


  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // TITANIUM: Force Redirect to Dashboard on Login
  React.useEffect(() => {
    if (user) {
      if (location.pathname === '/' || location.pathname === '/auth/login') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  // GLOBAL STATE (Server State via React Query)
  const { data: patients = [] } = usePatients();

  // MUTATIONS
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  // UI STORE (ZUSTAND - TITANIUM ARCHITECTURE)
  const quickAppointment = useUIStore((state) => state.quickAppointment);
  const groupSession = useUIStore((state) => state.groupSession);

  // MODAL STATES
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // LOAD GROUP SESSIONS (TITANIUM PERMANENCE)
  const fetchGroupSessions = React.useCallback(() => {
    if (user) {
      import('./data/repositories/GroupSessionRepository').then(({ GroupSessionRepository }) => {
        GroupSessionRepository.getAll().then(setGroupSessions).catch(console.error);
      });
    }
  }, [user]);

  React.useEffect(() => {
    fetchGroupSessions();
  }, [fetchGroupSessions]);

  // TITANIUM CRUD LOGIC FOR GROUPS
  // Handles Create, Update, and Delete with instant UI Updates (No Reloads)

  const handleSaveGroupSession = async (data: GroupSession) => {
    const isEdit = groupSessions.some((g) => g.id === data.id);

    // 1. Optimistic UI Update
    setGroupSessions((prev) => {
      if (isEdit) {
        return prev.map((g) => (g.id === data.id ? data : g));
      }
      return [...prev, data];
    });
    groupSession.close();

    // 2. Persist to Firestore
    try {
      const { GroupSessionRepository } = await import('./data/repositories/GroupSessionRepository');
      const { SessionRepository } = await import('./data/repositories/SessionRepository');

      if (isEdit) {
        await GroupSessionRepository.update(String(data.id), data);
        logActivity('session', `Sesión Grupal actualizada: ${data.groupName}`);
      } else {
        await GroupSessionRepository.create(data);

        // Fan-Out for New Sessions
        if (data.participants && Array.isArray(data.participants)) {
          const linkedParticipants = data.participants.filter((p) => p.id);
          if (linkedParticipants.length > 0) {
            const syncPromises = linkedParticipants.map(async (p) => {
              const individualSessionPayload = {
                date: data.date,
                id: `GS-${data.id}-${p.id}`,
                type: 'group' as const,
                groupName: data.groupName,
                groupId: data.id,
                notes: `Sesión Grupal: ${data.groupName}. ${data.observations || ''}`,
                price: Math.round(Number(data.price) / (data.participants?.length || 1)),
                paid: false,
                billable: true,
                isAbsent: false,
                activities: data.activities || [],
              };
              return SessionRepository.create(p.id, individualSessionPayload);
            });
            await Promise.all(syncPromises);
            queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
          }
        }
        logActivity(
          'session',
          `Sesión Grupal creada: ${data.date} (${data.participants?.length || 0} pax)`,
        );
      }
    } catch (e) {
      console.error('Failed to save group session', e);
      // Soft Rollback: Re-fetch data to sync with server truth
      toast.error('Error de sincronización. Restaurando datos...');
      fetchGroupSessions();
    }
  };

  const handleDeleteGroupSession = async (sessionId: string) => {
    // 1. Optimistic UI
    setGroupSessions((prev) => prev.filter((g) => g.id !== sessionId));
    groupSession.close();

    // 2. Persist
    try {
      const { GroupSessionRepository } = await import('./data/repositories/GroupSessionRepository');
      await GroupSessionRepository.delete(sessionId);
      logActivity('delete', 'Sesión Grupal eliminada');
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar. Restaurando datos...');
      fetchGroupSessions();
    }
  };
  const getCurrentViewID = (pathname: string) => {
    if (pathname === '/' || pathname === '/dashboard') return 'dashboard';
    if (pathname === '/patients/adults') return 'patients-adults';
    if (pathname === '/patients/kids') return 'patients-kids';
    if (pathname.startsWith('/patients')) return 'patients';
    if (pathname === '/sessions') return 'sessions';
    if (pathname === '/sessions/group') return 'group-sessions';
    if (pathname === '/calendar') return 'calendar';
    if (pathname === '/settings') return 'settings';
    if (pathname === '/resources') return 'resources';
    if (pathname === '/billing') return 'billing';
    if (pathname === '/canvas') return 'canvas';
    return 'dashboard';
  };

  const currentView = getCurrentViewID(location.pathname);

  // ROUTING HANDLER (ADAPTER FOR LEGACY COMPONENTS)
  const handleNavigate = (viewId: string, data?: NavigationPayload) => {
    // State driven by URL

    // TITANIUM: Native View Transitions
    if (!document.startViewTransition) {
      processNavigation();
      return;
    }

    document.startViewTransition(() => {
      processNavigation();
    });

    function processNavigation() {
      switch (viewId) {
        case 'dashboard':
          navigate('/dashboard');
          break;
        case 'patients':
          // Check if data has mode 'new'
          if (data && typeof data === 'object' && 'mode' in data && data.mode === 'new') {
            // Logic to open new patient modal handled by route param ?action=new if desired,
            // but for now likely handled by internal state or query param.
            // Using query param is cleaner:
            navigate('/patients?action=new');
          } else {
            navigate('/patients');
          }
          break;
        case 'patients-adults':
          navigate('/patients/adults');
          break;
        case 'patients-kids':
          navigate('/patients/kids');
          break;
        case 'sessions':
          navigate('/sessions');
          break;
        case 'groups':
          navigate('/groups');
          break;
        case 'group-sessions':
          navigate('/sessions/group');
          break;
        case 'group-sessions-history':
          navigate('/sessions/group-history');
          break;
        case 'calendar':
          navigate('/calendar');
          break;
        case 'settings':
          navigate('/settings');
          break;
        case 'resources':
          navigate('/resources');
          break;
        case 'patient-detail':
          if (typeof data === 'string' || typeof data === 'number') {
            navigate(`/patients/${data}`);
          } else if (data && typeof data === 'object' && 'id' in data) {
            navigate(`/patients/${data.id}`);
          }
          break;
        case 'reports':
          navigate('/reports');
          break;
        case 'billing':
          navigate('/billing');
          break;
        case 'canvas':
          navigate('/canvas');
          break;
        case 'quick-appointment': {
          // TITANIUM: Global Quick Appointment Trigger from Dashboard
          const payload = data as { mode: 'new' | 'existing' };
          quickAppointment.open(payload?.mode || 'new');
          break;
        }
        default:
          navigate('/dashboard');
      }
    }
  };

  // LOGGING HOOK
  const { logActivity } = useActivityLog();

  // HANDLERS (REACT QUERY MUTATIONS)
  const handleUpdatePatient = async (updatedPatient: Patient) => {
    updatePatient.mutate(updatedPatient, {
      onSuccess: () => {
        logActivity('patient', `Paciente actualizado: ${updatedPatient.name}`);
      },
      onError: (err) => console.error('Failed to sync update:', err),
    });
  };

  const handleNewPatient = async (newPatientData: Partial<Patient>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = newPatientData;
    const payload = {
      ...rest,
      name: newPatientData.name || 'Paciente Sin Nombre',
      sessions: [],
      clinicalFormulation: {},
      reference: `REF-${Math.floor(Math.random() * 10000)}`,
      sessionsCompleted: 0,
      status: 'active' as const,
      safetyProfile: DEFAULT_SAFETY_PROFILE,
      musicalIdentity: DEFAULT_MUSICAL_IDENTITY,
      socialContext: DEFAULT_SOCIAL_CONTEXT,
    };

    createPatient.mutate(payload as Omit<Patient, 'id'>, {
      onSuccess: () => {
        logActivity('patient', `Nuevo paciente registrado: ${newPatientData.name}`);
      },
      onError: (err) => console.error('Failed to create:', err),
    });
  };

  /* TITANIUM UPGRADE: Syncs Quick Appointments with Subcollection & Legacy Array */
  const handleQuickAppointment = async (data: {
    date: string;
    time: string;
    name: string;
    mode: 'new' | 'existing';
    patientId?: string | number;
  }) => {
    // 1. ISO DATE STANDARD (YYYY-MM-DD)
    const isoDate = data.date; // Input is already ISO from <input type="date">

    // Generate Session ID here to ensure consistency
    const newSessionId = Date.now().toString();

    const newSessionBase: Session = {
      id: newSessionId,
      date: isoDate,
      time: data.time || '10:00', // SAFETY DEFAULT
      type: 'individual',
      notes: 'Cita programada desde Calendario',
      price: 50,
      paid: false,
      isAbsent: false,
      billable: true,
      activities: [],
      // Ensure all required fields by Zod are present or optional
    };

    if (data.mode === 'new') {
      const payload = {
        name: data.name,
        age: 0,
        diagnosis: 'Sin diagnosticar',
        pathologyType: 'other' as const,
        joinedDate: isoDate,
        sessions: [newSessionBase], // This initial session must be handled by PatientRepository txn
        clinicalFormulation: {},
        reference: `REF-${Date.now().toString().slice(-4)}`,
        sessionsCompleted: 1,
        status: 'active' as const,
        safetyProfile: DEFAULT_SAFETY_PROFILE,
        musicalIdentity: DEFAULT_MUSICAL_IDENTITY,
        socialContext: DEFAULT_SOCIAL_CONTEXT,
      };

      createPatient.mutate(payload, {
        onSuccess: () => {
          logActivity('session', 'Cita rápida creada (Nuevo Paciente + Sesión Inicial)');
        },
        onError: (err) => {
          console.error('QuickAppointment Error:', err);
          toast.error('Error al crear la cita y el paciente. Verifique los datos.');
        },
      });
    } else {
      const patient = patients.find((p) => String(p.id) === String(data.patientId));
      if (patient && patient.id) {
        // 1. Write to Subcollection (Source of Truth) via Repository
        // This ensures ID consistency and DB write BEFORE UI update logic if we wanted strictly.
        // But we use Optimistic UI in mutation.

        // We use the mutation which handles optimistic UI, but for Sessions specifically
        // we might be calling just 'createSession' hook if we had it exposed here.
        // Since we don't have 'useCreateSession' imported and exposed in App.tsx easily without refactor,
        // we manually orchestrate.

        // BETTER: Use the Repository directly for the WRITE, and manual UI update or invalidate.
        try {
          const { SessionRepository } = await import('./data/repositories/SessionRepository');
          await SessionRepository.create(String(patient.id), newSessionBase);

          // 2. Mock Optimistic Update for Legacy Array support in UI
          const updatedSessions = [newSessionBase, ...(patient.sessions || [])];
          const updatedPatient = { ...patient, sessions: updatedSessions };

          // We update patient top-level to trigger UI refresh if listeners are on patient
          // But really we should just invalidate queries.
          await updatePatient.mutateAsync(updatedPatient);

          logActivity('session', `Cita rápida creada para ${patient.name}`);
        } catch (err) {
          console.error('Titanium Sync Error:', err);
          toast.error('Error al agendar la cita. Inténtelo de nuevo.');
        }
      }
    }
    quickAppointment.close();
  };

  // SILENT LOADING (No Animation, just preventing Login Flash)
  // If loading is true, we show black screen to wait for user resolution
  if (loading) {
    return <div className="h-screen w-screen bg-[#020617]" />;
  }

  // If user is resolved as null, show login
  if (!user) {
    return (
      <div className="relative">
        <LoginView />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {currentView === 'dashboard' || currentView === 'canvas' ? (
        <AppRouter
          patients={patients}
          groupSessions={groupSessions}
          onNavigate={handleNavigate}
          onUpdatePatient={handleUpdatePatient}
          onNewPatient={handleNewPatient}
          setIsCreateGroupOpen={setIsCreateGroupOpen}
        />
      ) : (
        <AppLayout
          userEmail={user?.email || 'demo@activa.com'}
          currentView={currentView}
          onNavigate={(view) => handleNavigate(view)}
          onLogout={async () => {
            await logout();
            navigate('/auth/login', { replace: true });
          }}

        >
          <AppRouter
            patients={patients}
            groupSessions={groupSessions}
            onNavigate={handleNavigate}
            onUpdatePatient={handleUpdatePatient}
            onNewPatient={handleNewPatient}
            setIsCreateGroupOpen={setIsCreateGroupOpen}
          />
        </AppLayout>
      )}

      {/* GLOBAL MODALS */}
      <GlobalModals
        patients={patients}
        groupSessions={groupSessions}
        isCreateGroupOpen={isCreateGroupOpen}
        setIsCreateGroupOpen={setIsCreateGroupOpen}
        onSaveGroupSession={handleSaveGroupSession}
        onDeleteGroupSession={handleDeleteGroupSession}
        onQuickAppointment={handleQuickAppointment}
      />
      <CommandMenu />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

export default App;
