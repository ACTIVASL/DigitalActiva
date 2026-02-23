import React from 'react';
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

// HOOKS (Extracted from God Component)
import { useGroupSessions } from './hooks/useGroupSessions';
import { useNavigationHandler } from './hooks/useNavigationHandler';
import { useQuickAppointment } from './hooks/useQuickAppointment';
import { DEFAULT_SAFETY_PROFILE, DEFAULT_MUSICAL_IDENTITY, DEFAULT_SOCIAL_CONTEXT } from './hooks/defaults';

// API & TYPES
import { Patient } from './lib/types';
import { usePatients, useCreatePatient, useUpdatePatient } from './api/queries';
import { useActivityLog } from './hooks/useActivityLog';

function App() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { logActivity } = useActivityLog();

  // Redirect to Dashboard on Login
  React.useEffect(() => {
    if (user) {
      if (location.pathname === '/' || location.pathname === '/auth/login') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  // Global State
  const { data: patients = [] } = usePatients();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  // Extracted Hooks
  const { groupSessions, isCreateGroupOpen, setIsCreateGroupOpen, handleSaveGroupSession, handleDeleteGroupSession } = useGroupSessions();
  const { currentView, handleNavigate } = useNavigationHandler();
  const { handleQuickAppointment } = useQuickAppointment();

  // Patient Handlers
  const handleUpdatePatient = async (updatedPatient: Patient) => {
    updatePatient.mutate(updatedPatient, {
      onSuccess: () => {
        logActivity('patient', `Paciente actualizado: ${updatedPatient.name}`);
      },
      onError: () => toast.error('Error al actualizar paciente'),
    });
  };

  const handleNewPatient = async (newPatientData: Partial<Patient>) => {
    const payload = {
      ...newPatientData,
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
      onError: () => toast.error('Error al crear paciente'),
    });
  };

  // Loading State
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Cargando aplicación"
        className="h-screen w-screen bg-[#020617] flex items-center justify-center"
      >
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Login
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
