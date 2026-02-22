import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatientRepository } from '../../data/repositories/PatientRepository';
import { queryKeys } from '../../api/queryKeys';
import { Patient, Session } from '@monorepo/shared';
import { toast } from '@monorepo/ui-system';
// useAuth removed

import { useActivityLog } from '../useActivityLog';

export const usePatientController = (patientId?: string) => {
  const queryClient = useQueryClient();
  const { logActivity } = useActivityLog();
  // Assuming auth context handles demo mode logic

  // --- READS ---
  const {
    data: patient,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: patientId ? queryKeys.patients.detail(patientId) : [],
    queryFn: () => {
      if (!patientId) throw new Error('No ID provided');
      return PatientRepository.getById(patientId);
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });

  // --- WRITES (COMMANDS) ---

  // Update Patient Command
  const updatePatientMutation = useMutation({
    mutationFn: async (updates: Partial<Patient>) => {
      if (!patientId) throw new Error('No patient selected');
      // Optimistic update logic could go here
      await PatientRepository.update(patientId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId!) });
      logActivity('patient', `Paciente actualizado: ${patient?.name || patientId}`);
    },
    onError: () => {
      toast.error('Error al actualizar paciente');
    },
  });

  // Add Session Command
  const addSessionMutation = useMutation({
    mutationFn: async (session: Session) => {
      if (!patientId) throw new Error('No patient selected');
      await PatientRepository.addSession(patientId, session);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all }); // Refresh calendar/list
      logActivity('session', `Sesión individual creada: ${variables.date}`);
    },
    onError: () => {
      toast.error('Error al crear sesión');
    },
  });

  // --- COMPUTED STATE (KPIs) ---
  const stats = {
    totalSessions: patient?.sessions?.length || 0,
    completedSessions: patient?.sessions?.filter((s) => !s.isAbsent).length || 0,
    revenue: patient?.sessions?.reduce((acc, s) => acc + (s.price || 0), 0) || 0,
    attendanceRate: patient?.sessions?.length
      ? Math.round(
        (patient.sessions.filter((s) => !s.isAbsent).length / patient.sessions.length) * 100,
      )
      : 0,
  };

  return {
    // State
    patient,
    isLoading,
    isError,
    error,
    stats,

    // Actions (Commands)
    updatePatient: updatePatientMutation.mutate,
    updatePatientAsync: updatePatientMutation.mutateAsync,
    addSession: addSessionMutation.mutate,
    addSessionAsync: addSessionMutation.mutateAsync,

    // Status checks
    isUpdating: updatePatientMutation.isPending,
    isAddingSession: addSessionMutation.isPending,
  };
};
