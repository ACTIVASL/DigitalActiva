import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentRepository } from '../../data/repositories/DocumentRepository';
import { ClinicalDocument } from '@monorepo/shared';
import { queryKeys } from '../../api/queryKeys';
import { useActivityLog } from '../useActivityLog';
import { useToast } from '../../context/ToastContext';
import { ForensicMetadata } from '../../lib/types';

export const useDocumentController = (patientId?: string) => {
  const queryClient = useQueryClient();
  const { logActivity } = useActivityLog();
  const { error: toastError, success: toastSuccess } = useToast();

  // --- READS ---
  const {
    data: documents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: patientId ? queryKeys.patients.documents(patientId) : [],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID required');
      return await DocumentRepository.getByPatientId(patientId);
    },
    enabled: !!patientId,
  });

  // --- WRITES (COMMANDS) ---

  // Upload Command
  const uploadMutation = useMutation({
    mutationFn: async (payload: { file: File; metadata?: ForensicMetadata }) => {
      if (!patientId) throw new Error('No patient selected');
      // Pre-flight Validation (Controller level)
      if (payload.file.size > 100 * 1024 * 1024) throw new Error('El archivo excede 100MB'); // TITANIUM LIMIT

      return await DocumentRepository.upload(patientId, payload.file, payload.metadata);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.documents(patientId!) });
      logActivity('report', `Documento subido: ${data.name} `);
      toastSuccess(`Documento subido: ${data.name}`);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Error al subir archivo';
      toastError(msg);
    },
  });

  // Delete Command
  const deleteMutation = useMutation({
    mutationFn: async (document: ClinicalDocument) => {
      // Typed strictly
      if (!patientId) throw new Error('No patient selected');
      return await DocumentRepository.delete(patientId, document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.documents(patientId!) });
      logActivity('delete', 'Documento eliminado');
      toastSuccess('Documento eliminado correctamente');
    },
    onError: () => {
      toastError('Error al eliminar archivo');
    },
  });

  return {
    documents,
    isLoading,
    isError,
    uploadDocument: (
      file: File,
      category?: 'invoice' | 'consent' | 'report' | 'lab' | 'general' | 'other',
      metadata?: ForensicMetadata,
    ) =>
      uploadMutation.mutateAsync({
        file,
        metadata: {
          ...(metadata || {}),
          category: (category || 'general') as ForensicMetadata['category'],
        } as ForensicMetadata,
      }),
    isUploading: uploadMutation.isPending,
    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
