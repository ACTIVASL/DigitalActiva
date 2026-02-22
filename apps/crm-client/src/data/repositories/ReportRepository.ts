import { db, auth } from '@monorepo/engine-auth';
import { collection, query, orderBy, addDoc, getDocs, collectionGroup } from 'firebase/firestore';
import type { ClinicalReport } from '../../lib/types';
import { AuditRepository } from './AuditRepository';

// We don't have a shared schema for ClinicalReport yet, let's define a local strict one or trust the type.
// For Titanium, we should really have a schema. I will assume types are sufficient for now to match interface, but add runtime check if possible.

export const ReportRepository = {
  /**
   * GLobal Fetch: Get all reports from all patients (requires Firestore Index).
   * Useful for the "Reports" main view.
   */
  getAllGlobal: async (): Promise<ClinicalReport[]> => {
    // Query 'reports' collection group across all patients
    const q = query(collectionGroup(db, 'reports'), orderBy('date', 'desc'));

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ClinicalReport);
    } catch (error: unknown) {
      // Graceful fallback if index is missing
      const err = error as { code?: string };
      if (err.code === 'failed-precondition') {
        throw new Error('Requiere Índice de Firestore (Collection Group: reports).');
      }
      throw error;
    }
  },

  /**
   * Get reports for a single patient.
   */
  getByPatientId: async (patientId: string): Promise<ClinicalReport[]> => {
    const q = query(collection(db, `patients/${patientId}/reports`), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ClinicalReport);
  },

  /**
   * Create a new report in the patient's subcollection.
   */
  create: async (report: Omit<ClinicalReport, 'id' | 'createdBy' | 'createdAt'> & { status?: 'draft' | 'final' }): Promise<ClinicalReport> => {
    if (!auth.currentUser) throw new Error('Unauthorized');

    const { patientId, ...data } = report;
    if (!patientId) throw new Error('Patient ID is required for reports.');

    // Clean payload
    const payload = {
      ...data,
      patientId, // Store ref
      createdBy: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
      status: report.status || 'draft',
    };

    const docRef = await addDoc(collection(db, `patients/${patientId}/reports`), payload);

    // TITANIUM AUDIT: Log Activity
    await AuditRepository.log('report', 'Nuevo Informe Clínico Generado', {
      type: 'report',
      documentId: docRef.id,
      format: 'pdf',
      url: `/patients/${patientId}?tab=history`,
    });

    return { id: docRef.id, ...payload } as ClinicalReport;
  },
};
