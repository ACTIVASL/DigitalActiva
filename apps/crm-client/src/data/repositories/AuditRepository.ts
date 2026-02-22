import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@monorepo/engine-auth';

export type AuditLogMetadata =
  | { type: 'finance'; amount?: number; invoiceId?: string; status?: 'paid' | 'pending' | 'void' }
  | { type: 'report'; documentId?: string; url?: string; format: 'pdf' }
  | { type: 'session'; sessionId: string; patientId: string }
  | { type: 'patient'; patientId: string; action: 'create' | 'update' | 'delete' }
  | { type: 'settings'; setting: string }
  | { type: 'system'; action: string }
  | { type: 'security'; event: string }
  | { type: 'delete'; entity: string; id: string };

export interface AuditLogEntry {
  id: string;
  type: AuditLogMetadata['type'];
  message: string;
  timestamp: string; // ISO String for UI
  createdAt: Timestamp | Date; // Server Timestamp for ordering/security
  userId: string;
  metadata?: AuditLogMetadata;
}

const COLLECTION = 'activity_logs';

export const AuditRepository = {
  /**
   * Creates an immutable audit log entry.
   * Uses serverTimestamp() to ensure forensic validity.
   */
  async log(
    type: AuditLogMetadata['type'],
    message: string,
    metadata?: AuditLogMetadata,
  ): Promise<void> {
    const user = auth.currentUser;

    if (!user) {
      // Audit skipped — no authenticated user
      return;
    }

    try {
      // TITANIUM SAFETY: Strip 'undefined' values which crash Firestore addDoc
      const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata)) : null;

      await addDoc(collection(db, COLLECTION), {
        type,
        message,
        timestamp: serverTimestamp(),
        userId: user.uid,
        metadata: safeMetadata,
        userAgent: navigator.userAgent,
      });
    } catch {
      // Audit log failure is non-critical
    }
  },

  /**
   * Retrieves logs for a specific user.
   * Enforces strict filtering by userId.
   */
  async getLogs(userId: string, limitCount = 50): Promise<AuditLogEntry[]> {
    try {
      // Note: We need a composite index for userId + timestamp desc.
      // If it fails, we fallback to memory sort like before, but ideally index exists.
      const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        const safeDate = (val: unknown): Date => {
          if (!val) return new Date();
          if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function')
            return val.toDate();
          if (val instanceof Date) return val;
          if (typeof val === 'string') return new Date(val);
          if (typeof val === 'number') return new Date(val);
          return new Date();
        };

        const dateObj = safeDate(data.timestamp);

        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? safeDate(data.createdAt) : dateObj,
          timestamp: dateObj.toISOString(),
        } as AuditLogEntry;
      });
    } catch {
      // Fallback for missing index — client-side sort
      const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId),
        limit(100), // Fetch a bit more to sort
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const safeDate = (val: unknown): Date => {
            if (!val) return new Date();
            if (val instanceof Timestamp) return val.toDate();
            if (val instanceof Date) return val;
            if (typeof val === 'string') return new Date(val);
            if (typeof val === 'number') return new Date(val);
            return new Date();
          };

          const dateObj = safeDate(data.timestamp);

          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? safeDate(data.createdAt) : dateObj,
            timestamp: dateObj.toISOString(),
          } as AuditLogEntry;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limitCount);
    }
  },
};
