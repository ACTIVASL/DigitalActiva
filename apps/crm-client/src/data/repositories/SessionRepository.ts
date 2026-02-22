import { db, auth } from '@monorepo/engine-auth';
import { deepSanitize } from '@monorepo/shared';
import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  doc,
  writeBatch,
  arrayUnion,
  runTransaction,
  getDocs,
} from 'firebase/firestore';
import { Session, Patient } from '../../lib/types';
import { AuditRepository } from './AuditRepository';

export const SessionRepository = {
  /**
   * Fetch sessions globally by date range.
   * Uses Collection Group Query: 'sessions'.
   * @requires Index: collectionId: 'sessions', fields: [userId: ASC, date: ASC]
   */
  getSessionsByDateRange: async (
    startDate: string,
    endDate: string,
  ): Promise<(Session & { patientId: string })[]> => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('No authenticated user');

    // Ideally, we use ISO dates 'YYYY-MM-DD' for lexicographical range queries.
    // Legacy dates are 'DD/MM/YYYY', which fail range queries (30/01 > 01/02).
    // For TITANIUM RIGOR, we expect ISO.
    // If data is 'DD/MM/YYYY', this query will return garbage sorting.
    // We will assume data is migrated or we fetch all and filter in memory (temporary fallback).

    // 1. Try Collection Group
    const sessionsRef = collectionGroup(db, 'sessions');
    // We filter by userId to ensure we only get this therapist's sessions
    const q = query(
      sessionsRef,
      where('userId', '==', uid),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
    );

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => {
        const data = d.data() as Session;
        // Extract PatientID from path: patients/{patientId}/sessions/{sessionId}
        // d.ref.parent is 'sessions' collection
        // d.ref.parent.parent is 'patients/{patientId}' document
        const patientId = d.ref.parent.parent?.id || 'unknown';
        return { ...data, id: d.id, patientId };
      });
    } catch (error: unknown) {
      // Index missing or query failed — propagate
      throw error;
    }
  },

  /**
   * Fetch all sessions for a specific patient from their subcollection.
   * This is the Source of Truth, creating a fallback for the legacy array.
   */
  getSessionsByPatientId: async (patientId: string): Promise<Session[]> => {
    const sessionsRef = collection(db, 'patients', patientId, 'sessions');
    const snapshot = await getDocs(sessionsRef);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Session);
  },

  /**
   * Fetch ALL group sessions for History.
   * Order by date descending.
   */
  getAllGroupSessions: async (): Promise<(Session & { patientId: string })[]> => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('No authenticated user');

    const sessionsRef = collectionGroup(db, 'sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', uid),
      where('type', '==', 'group'),
      orderBy('date', 'desc'), // Enabled by Titanium Index
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => {
        const data = d.data() as Session;
        const patientId = d.ref.parent.parent?.id || 'unknown';
        return { ...data, id: d.id, patientId };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // In-memory sort fallback
  },

  /**
   * Create a session in the patient's subcollection.
   */
  create: async (patientId: string, session: Session): Promise<string> => {
    const uid = auth.currentUser?.uid;

    // --- TITANIUM DEMO MODE FALLBACK ---
    if (!uid) {
      const stored = localStorage.getItem('demo_patients');
      if (stored) {
        const patients = JSON.parse(stored) as Patient[];
        const patientIndex = patients.findIndex((p) => String(p.id) === String(patientId));
        if (patientIndex > -1) {
          const newSession = {
            ...session,
            id: session.id ? String(session.id) : String(Date.now()),
            paid: session.paid ?? false, // Ensure defaults
            isAbsent: session.isAbsent ?? false,
          };
          const sessions = patients[patientIndex].sessions || [];
          patients[patientIndex].sessions = [...sessions, newSession];
          localStorage.setItem('demo_patients', JSON.stringify(patients));
          return String(newSession.id);
        }
      }
      return 'demo-session-id';
    }

    // Force string ID
    const sessionId = session.id ? String(session.id) : String(Date.now());

    const ref = doc(db, 'patients', patientId, 'sessions', sessionId);

    const payload = deepSanitize({
      ...session,
      id: sessionId,
      userId: uid,
      createdAt: new Date().toISOString(),
    });

    // TITANIUM STANDARD: Atomic Batch Write
    const batch = writeBatch(db);

    // 1. Write to Subcollection (Titanium Source of Truth)
    batch.set(ref, payload);

    // 2. Dual-Write to Legacy Array (For UI Compatibility)
    // This ensures usePatients() query sees the new session immediately without refactoring the whole frontend.
    const patientRef = doc(db, 'patients', patientId);
    batch.update(patientRef, {
      sessions: arrayUnion(payload),
    });

    await batch.commit();

    // TITANIUM AUDIT: Log Activity
    await AuditRepository.log('session', 'Nueva Sesión Programada', {
      type: 'session',
      sessionId,
      patientId,
    });

    return sessionId;
  },

  /**
   * Creates multiple sessions in a single atomic batch.
   * TITANIUM: Used for Recurring Sessions.
   * Ensures either all sessions are created or none, preventing partial data states.
   * Limit: 500 ops (Firestore limit), but typically < 50 for UX reasons.
   */
  createBatch: async (patientId: string, sessions: Session[]): Promise<void> => {
    const uid = auth.currentUser?.uid;

    // --- TITANIUM DEMO MODE FALLBACK ---
    if (!uid) {
      const stored = localStorage.getItem('demo_patients');
      if (stored) {
        const patients = JSON.parse(stored) as Patient[];
        const patientIndex = patients.findIndex((p) => String(p.id) === String(patientId));
        if (patientIndex > -1) {
          const existingSessions = patients[patientIndex].sessions || [];
          // Sanitize IDs
          const newSessions = sessions.map((s) => ({
            ...s,
            id: s.id ? String(s.id) : String(Date.now() + Math.random()),
            paid: s.paid ?? false,
            isAbsent: s.isAbsent ?? false,
          }));
          patients[patientIndex].sessions = [...existingSessions, ...newSessions];
          localStorage.setItem('demo_patients', JSON.stringify(patients));
        }
      }
      return;
    }

    if (sessions.length === 0) return;

    const batch = writeBatch(db);
    const patientRef = doc(db, 'patients', patientId);

    // Prepare Legacy Array Updates
    // Note: arrayUnion takes varargs. We can pass multiple items.
    // However, we must ensure each session has a unique ID and proper structure.

    const preparedSessions = sessions.map((s) => {
      const sid = s.id ? String(s.id) : String(Date.now() + Math.random());
      return deepSanitize({
        ...s,
        id: sid,
        userId: uid,
        createdAt: new Date().toISOString(),
      });
    });

    // 1. Write each session to Subcollection (Source of Truth)
    preparedSessions.forEach((session) => {
      const ref = doc(db, 'patients', patientId, 'sessions', String(session.id));
      batch.set(ref, session);
    });

    // 2. Update Legacy Array (Atomic Update)
    // arrayUnion(...items)
    if (preparedSessions.length > 0) {
      batch.update(patientRef, {
        sessions: arrayUnion(...preparedSessions),
      });
    }

    await batch.commit();
  },

  update: async (patientId: string, sessionId: string, data: Partial<Session>): Promise<void> => {
    const uid = auth.currentUser?.uid;

    // --- TITANIUM DEMO MODE FALLBACK ---
    if (!uid) {
      const stored = localStorage.getItem('demo_patients');
      if (stored) {
        const patients = JSON.parse(stored) as Patient[];
        const patientIndex = patients.findIndex((p) => String(p.id) === String(patientId));
        if (patientIndex > -1) {
          const sessions = patients[patientIndex].sessions || [];
          const sessionIndex = sessions.findIndex((s) => String(s.id) === String(sessionId));
          if (sessionIndex > -1) {
            sessions[sessionIndex] = { ...sessions[sessionIndex], ...data };
            patients[patientIndex].sessions = sessions;
            localStorage.setItem('demo_patients', JSON.stringify(patients));
          }
        }
      }
      return;
    }

    // TITANIUM UPGRADE: Transactional Sync for "Notes" & "Updates"
    // Ensures the legacy array (UI Cache) matches the Subcollection (Source of Truth)
    try {
      await runTransaction(db, async (transaction) => {
        const patientRef = doc(db, 'patients', patientId);
        const sessionRef = doc(db, 'patients', patientId, 'sessions', sessionId);

        // 1. Read Patient (Blocking)
        const patientSnap = await transaction.get(patientRef);
        const sessionSnap = await transaction.get(sessionRef);

        if (!sessionSnap.exists()) {
          // Session missing in subcollection — auto-create (heal)
          transaction.set(
            sessionRef,
            {
              ...data,
              id: sessionId,
              userId: auth.currentUser?.uid,
              healedAt: new Date().toISOString(),
            },
            { merge: true },
          );
        } else {
          transaction.update(sessionRef, { ...data, updatedAt: new Date().toISOString() });
        }

        // 3. Update Legacy Array (Mirror)
        if (patientSnap.exists()) {
          const p = patientSnap.data() as Patient;
          const sessions = p.sessions || [];

          // Find and Splice (Titanium Hardened: Trim whitespace)
          const index = sessions.findIndex((s) => String(s.id).trim() === String(sessionId).trim());

          if (index !== -1) {
            // Update existing item
            sessions[index] = { ...sessions[index], ...data };
            transaction.update(patientRef, { sessions });
          } else {
            // RECOVERY MODE: If missing in array, append it (Dual-Write Consistency)
            // This fixes the "Ghost Session" issue where a session exists in DB but not in UI List.
            // Session restored to legacy array (heal)
            sessions.push({ ...data, id: sessionId } as Session);
            transaction.update(patientRef, { sessions });
          }
        }
      });

      // TITANIUM AUDIT: Log Activity
      await AuditRepository.log('session', 'Sesión Actualizada', {
        type: 'session',
        sessionId,
        patientId,
      });
    } catch (e) {
      throw e;
    }
  },

  delete: async (patientId: string, sessionId: string): Promise<void> => {
    const uid = auth.currentUser?.uid;

    // --- TITANIUM DEMO MODE FALLBACK ---
    if (!uid) {
      const stored = localStorage.getItem('demo_patients');
      if (stored) {
        const patients = JSON.parse(stored) as Patient[];
        const patientIndex = patients.findIndex((p) => String(p.id) === String(patientId));
        if (patientIndex > -1) {
          const sessions = patients[patientIndex].sessions || [];
          patients[patientIndex].sessions = sessions.filter(
            (s) => String(s.id) !== String(sessionId),
          );
          localStorage.setItem('demo_patients', JSON.stringify(patients));
        }
      }
      return;
    }

    // TITANIUM UPGRADE: Use Transaction for Atomic Consistency
    // Prevents Race Conditions on the Legacy Array
    try {
      await runTransaction(db, async (transaction) => {
        const patientRef = doc(db, 'patients', patientId);
        const sessionRef = doc(db, 'patients', patientId, 'sessions', sessionId);

        // 1. Read Patient (Blocking)
        const patientSnap = await transaction.get(patientRef);

        // 3. Logic: Update Legacy Array
        if (patientSnap.exists()) {
          const p = patientSnap.data() as Patient;
          const sessions = p.sessions || [];
          // Filter with Trim Hardening
          const updatedSessions = sessions.filter(
            (s) => String(s.id).trim() !== String(sessionId).trim(),
          );

          if (updatedSessions.length !== sessions.length) {
            // Only write if something changed
            transaction.update(patientRef, { sessions: updatedSessions });
          }
        }

        // 4. Delete Subcollection Doc (Source of Truth)
        transaction.delete(sessionRef);
      });

      // TITANIUM AUDIT: Log Activity
      await AuditRepository.log('delete', 'Sesión Eliminada', {
        type: 'delete',
        id: sessionId,
        entity: 'session',
      });
    } catch (e) {
      throw e; // Propagate error so Mutation knows it failed
    }
  },

  /**
   * MIGRATION TOOL:
   * Moves sessions from Patient.sessions (Array) to patients/{id}/sessions (Subcollection).
   * This is atomic per patient.
   */
  /**
   * TITANIUM HEALER:
   * Syncs sessions from the Legacy Array to the Subcollection (Source of Truth).
   * This ensures editable documents exist for all historical data.
   * Non-destructive: Does NOT clear the array.
   */
  syncLegacySessions: async (patient: Patient): Promise<void> => {
    const uid = auth.currentUser?.uid;
    if (!uid || !patient.id) return;

    if (!patient.sessions || patient.sessions.length === 0) return;

    // We use a batch to ensure efficiency
    const batch = writeBatch(db);
    const sessionsRef = collection(db, 'patients', String(patient.id), 'sessions');
    let updateCount = 0;

    patient.sessions.forEach((session) => {
      // Trust existing ID or generate one if strictly necessary (legacy data might have weak IDs)
      // But we must preserve the ID in the array to keep the link.
      const sessionId = session.id
        ? String(session.id)
        : `legacy_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const docRef = doc(sessionsRef, sessionId);

      // We use 'set' with merge to be idempotent.
      // If it exists, we update/ensure. If not, we create.
      batch.set(
        docRef,
        {
          ...session,
          id: sessionId,
          userId: uid,
          syncedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      updateCount++;
    });

    if (updateCount > 0) {
      await batch.commit();
    }
  },
};
