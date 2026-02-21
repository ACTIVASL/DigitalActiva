import { useCallback } from 'react';
import { auth } from '@monorepo/engine-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuditRepository, AuditLogEntry } from '../data/repositories/AuditRepository';

// Re-export for compatibility
export type ActivityLogItem = AuditLogEntry;

export const useActivityLog = () => {
  const queryClient = useQueryClient();
  const userId = auth.currentUser?.uid;

  // FETCH LOGS (Read-Only from DB)
  const {
    data: activities = [],
    isLoading: isQueryLoading,
    refetch,
  } = useQuery({
    queryKey: ['activity_logs', userId || 'anonymous'],
    queryFn: async () => {
      // TITANIUM DEMO: Read from LocalStorage if no user or demo user
      if (!userId || auth.currentUser?.email === 'demo@activa-sl.digital') {
        try {
          const stored = localStorage.getItem('demo_logs');
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      }
      return await AuditRepository.getLogs(userId);
    },
    enabled: true, // Always enabled to show local logs
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  // APPEND LOG (Write-Only to DB)
  const logMutation = useMutation({
    mutationFn: async (payload: {
      type: ActivityLogItem['type'];
      message: string;
      metadata?: ActivityLogItem['metadata'];
    }) => {
      await AuditRepository.log(payload.type, payload.message, payload.metadata);
    },
    onSuccess: () => {
      // Invalidate to show new log immediately
      // Must match the key used in useQuery exactly or be a prefix
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });

  const logActivity = useCallback(
    (type: ActivityLogItem['type'], message: string, metadata?: ActivityLogItem['metadata']) => {
      logMutation.mutate({ type, message, metadata });
    },
    [logMutation],
  );

  return {
    activities,
    logActivity,
    latestActivities: activities.slice(0, 4),
    isLoading: logMutation.isPending || isQueryLoading,
    refetch,
  };
};
