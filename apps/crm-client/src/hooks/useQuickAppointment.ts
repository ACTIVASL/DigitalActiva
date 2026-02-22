import { useCallback } from 'react';
import { toast } from '@monorepo/ui-system';
import { Session } from '../lib/types';
import { usePatients, useCreatePatient, useUpdatePatient } from '../api/queries';
import { useActivityLog } from '../hooks/useActivityLog';
import { useUIStore } from '../stores/useUIStore';
import { DEFAULT_SAFETY_PROFILE, DEFAULT_MUSICAL_IDENTITY, DEFAULT_SOCIAL_CONTEXT } from './defaults';

/**
 * Handles quick appointment creation (new patient or existing patient).
 * Manages the full flow: patient creation, session creation, optimistic UI.
 */
export const useQuickAppointment = () => {
    const { logActivity } = useActivityLog();
    const { data: patients = [] } = usePatients();
    const createPatient = useCreatePatient();
    const updatePatient = useUpdatePatient();
    const quickAppointment = useUIStore((state) => state.quickAppointment);

    const handleQuickAppointment = useCallback(async (data: {
        date: string;
        time: string;
        name: string;
        mode: 'new' | 'existing';
        patientId?: string | number;
    }) => {
        const isoDate = data.date;
        const newSessionId = Date.now().toString();

        const newSessionBase: Session = {
            id: newSessionId,
            date: isoDate,
            time: data.time || '10:00',
            type: 'individual',
            notes: 'Cita programada desde Calendario',
            price: 50,
            paid: false,
            isAbsent: false,
            billable: true,
            activities: [],
        };

        if (data.mode === 'new') {
            const payload = {
                name: data.name,
                age: 0,
                diagnosis: 'Sin diagnosticar',
                pathologyType: 'other' as const,
                joinedDate: isoDate,
                sessions: [newSessionBase],
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
                onError: () => {
                    toast.error('Error al crear la cita y el paciente. Verifique los datos.');
                },
            });
        } else {
            const patient = patients.find((p) => String(p.id) === String(data.patientId));
            if (patient && patient.id) {
                try {
                    const { SessionRepository } = await import('../data/repositories/SessionRepository');
                    await SessionRepository.create(String(patient.id), newSessionBase);

                    const updatedSessions = [newSessionBase, ...(patient.sessions || [])];
                    const updatedPatient = { ...patient, sessions: updatedSessions };
                    await updatePatient.mutateAsync(updatedPatient);

                    logActivity('session', `Cita rápida creada para ${patient.name}`);
                } catch {
                    toast.error('Error al agendar la cita. Inténtelo de nuevo.');
                }
            }
        }
        quickAppointment.close();
    }, [patients, createPatient, updatePatient, logActivity, quickAppointment]);

    return { handleQuickAppointment };
};
