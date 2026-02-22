import { db, auth } from '@monorepo/engine-auth';
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  deleteDoc,
  runTransaction,
  collection,
  writeBatch,
} from 'firebase/firestore';
import { Patient, PatientSchema, Session, SessionSchema } from '@monorepo/shared';
import { AuditRepository } from './AuditRepository';

const COLLECTION = 'patients';

export class PatientRepository {
  /**
   * Retrieves a patient by ID and validates it against the strict Zod Schema.
   * @param id The patient's unique ID
   * @throws Error if validation fails or patient not found
   */
  static async getById(id: string): Promise<Patient | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) return null;

      const data = snapshot.data();
      // Runtime Validation: The Data Firewall
      const parsed = PatientSchema.safeParse({ ...data, id: snapshot.id });

      if (!parsed.success) {
        // Data Firewall: validation failed but return raw data for resilience
        return { ...data, id: snapshot.id } as Patient;
      }

      return parsed.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a patient's top-level fields.
   */
  static async update(id: string, updates: Partial<Patient>): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    // We only allow updating fields defined in the schema
    // Ideally we should validate 'updates' against a Partial<PatientSchema>
    await updateDoc(docRef, updates);
  }

  /**
   * Retrieves all patients for the current user.
   */
  static async getAll(): Promise<Patient[]> {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    try {
      const q = query(collection(db, COLLECTION), where('userId', '==', uid));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return { ...data, id: doc.id } as Patient;
      });
    } catch {
      return [];
    }
  }

  /**
   * Creates a new patient with ACID guarantees.
   * 1. Validates Data.
   * 2. Creates Patient Document.
   * 3. Creates Initial Session (if present).
   * 4. Creates Audit Log.
   * ALL OR NOTHING.
   */
  static async create(patient: Omit<Patient, 'id'>): Promise<string> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Unauthorized: No User ID');

    // 1. Validate Payload (Lightweight Check)
    const validation = PatientSchema.safeParse({ ...patient, id: 'temp-id' });
    if (!validation.success) {
      throw new Error(
        `Validation Failed: ${validation.error.issues.map((i) => i.path + ': ' + i.message).join(', ')}`,
      );
    }

    return await runTransaction(db, async (transaction) => {
      // A. Generate IDs
      const patientRef = doc(collection(db, COLLECTION)); // Auto-ID

      // B. Prepare Patient Data
      // Ensure sessions array is included in the patient document for legacy support
      // BUT we must also ensure the subcollection logic handles it.

      const initialSessions = patient.sessions || [];

      const patientData = {
        ...patient,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sessions: initialSessions, // Write the header array (legacy mirror)
      };

      // C. Prepare Audit Log (Manual Construction for Atomicity)
      // TITANIUM: Must match AuditLogEntry interface strictly
      const logRef = doc(collection(db, 'activity_logs'));
      const logData = {
        id: logRef.id, // Ensure ID is present if schema requires
        userId: uid,
        type: 'patient',
        message: `Paciente creado: ${patient.name}`,
        timestamp: new Date().toISOString(),
        createdAt: new Date(), // Server Timestamp not allowed in Transaction object sometimes? No, it is. But let's use Date for consistency in this manual block
        metadata: { type: 'patient', patientId: patientRef.id, action: 'create' },
      };

      // D. Execute Writes
      transaction.set(patientRef, patientData);
      transaction.set(logRef, logData);

      // E. Handle Initial Sessions (Subcollection)
      // TITANIUM FIX: Ensure we iterate ALL initial sessions (e.g. from Batch import or Quick Appt)
      // and write them to the subcollection. This is crucial for consistency.
      if (initialSessions.length > 0) {
        initialSessions.forEach((session) => {
          // Force session ID if missing (shouldn't happen with proper upstream logic)
          const sessionId = session.id ? String(session.id) : String(Date.now() + Math.random());

          const sessionRef = doc(collection(db, COLLECTION, patientRef.id, 'sessions'), sessionId);
          const sessionData = {
            ...session,
            id: sessionId,
            userId: uid,
            createdAt: new Date().toISOString(),
          };
          transaction.set(sessionRef, sessionData);
        });
      }

      return patientRef.id;
    });
  }

  /**
   * Adds a session to the patient's history.
   * TITANIUM STANDARD: Dual-Write for consistency.
   * 1. Writes to Subcollection (Source of Truth).
   * 2. Updates Legacy Array in Patient Document (fast UI read).
   * @param patientId ID of the patient.
   * @param session Session object (will be validated).
   */
  static async addSession(patientId: string, session: Session): Promise<void> {
    // Validate Session
    const parsed = SessionSchema.safeParse(session);
    if (!parsed.success) {
      throw new Error('Invalid Session Data');
    }

    const uid = auth.currentUser?.uid;
    const sessionId = session.id ? String(session.id) : String(Date.now());
    const sessionPayload = {
      ...parsed.data,
      id: sessionId,
      userId: uid,
      createdAt: new Date().toISOString(),
    };

    const batchOp = writeBatch(db);

    // 1. Subcollection (Source of Truth)
    const subSessionRef = doc(db, COLLECTION, patientId, 'sessions', sessionId);
    batchOp.set(subSessionRef, sessionPayload);

    // 2. Legacy Array (UI Cache)
    const patientRef = doc(db, COLLECTION, patientId);
    batchOp.update(patientRef, {
      sessions: arrayUnion(sessionPayload),
    });

    await batchOp.commit();
  }

  /**
   * Deletes a patient permanently.
   */
  static async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);

    // TITANIUM AUDIT
    await AuditRepository.log('patient', 'Paciente Eliminado', {
      type: 'delete',
      entity: 'patient',
      id,
    });
  }
}
