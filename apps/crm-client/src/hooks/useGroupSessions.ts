import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@monorepo/ui-system';
import { GroupSession, Session } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { useActivityLog } from '../hooks/useActivityLog';
import { queryKeys } from '../api/queryKeys';

/**
 * Hook that manages the full lifecycle of Group Sessions:
 * fetching, create/edit, delete — with optimistic UI and rollback.
 */
export const useGroupSessions = () => {
    const { user } = useAuth();
    const { logActivity } = useActivityLog();
    const queryClient = useQueryClient();

    const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

    const fetchGroupSessions = useCallback(() => {
        if (user) {
            import('../data/repositories/GroupSessionRepository').then(({ GroupSessionRepository }) => {
                GroupSessionRepository.getAll().then(setGroupSessions).catch(() => { /* silent */ });
            });
        }
    }, [user]);

    React.useEffect(() => {
        fetchGroupSessions();
    }, [fetchGroupSessions]);

    const handleSaveGroupSession = useCallback(async (data: GroupSession) => {
        const isEdit = groupSessions.some((g) => g.id === data.id);

        // 1. Optimistic UI Update
        setGroupSessions((prev) => {
            if (isEdit) {
                return prev.map((g) => (g.id === data.id ? data : g));
            }
            return [...prev, data];
        });

        // 2. Persist to Firestore
        try {
            const { GroupSessionRepository } = await import('../data/repositories/GroupSessionRepository');
            const { SessionRepository } = await import('../data/repositories/SessionRepository');

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
                            } as Session;
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
        } catch {
            toast.error('Error de sincronización. Restaurando datos...');
            fetchGroupSessions();
        }
    }, [groupSessions, logActivity, queryClient, fetchGroupSessions]);

    const handleDeleteGroupSession = useCallback(async (sessionId: string) => {
        // 1. Optimistic UI
        setGroupSessions((prev) => prev.filter((g) => g.id !== sessionId));

        // 2. Persist
        try {
            const { GroupSessionRepository } = await import('../data/repositories/GroupSessionRepository');
            await GroupSessionRepository.delete(sessionId);
            logActivity('delete', 'Sesión Grupal eliminada');
        } catch {
            toast.error('Error al eliminar. Restaurando datos...');
            fetchGroupSessions();
        }
    }, [logActivity, fetchGroupSessions]);

    return {
        groupSessions,
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        handleSaveGroupSession,
        handleDeleteGroupSession,
    };
};
