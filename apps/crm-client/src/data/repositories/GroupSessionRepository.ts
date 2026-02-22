import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from '@monorepo/engine-auth';
import { GroupSession, GroupSessionSchema } from '@monorepo/shared';

// REFACTOR: Use Subcollections for Security (users/{uid}/group_sessions)
// This avoids root-level permission issues and missing composite indexes.
const getCollectionRef = (uid: string) => collection(db, 'users', uid, 'group_sessions');

export const GroupSessionRepository = {
  /**
   * Create a new group session in User's subcollection
   */
  create: async (session: GroupSession & { id?: string }): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      // TITANIUM DATA FIREWALL: Validation
      // Relax strict id check for creation payload
      const validationPayload = { ...session, id: session.id || 'temp-id' };
      const parsed = GroupSessionSchema.safeParse(validationPayload);

      if (!parsed.success) {
        // Prevent corrupt data
        throw new Error(`Invalid Session Data: ${parsed.error.message}`);
      }

      // Subcollection Path
      const collectionRef = getCollectionRef(user.uid);
      const sessionId = session.id || doc(collectionRef).id;

      // Clean Payload
      const sessionData = {
        ...parsed.data, // Access validated data
        id: sessionId,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      // Write to users/{uid}/group_sessions/{sessionId}
      await setDoc(doc(collectionRef, sessionId), sessionData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all group sessions from User's subcollection
   */
  getAll: async (): Promise<GroupSession[]> => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      // Simple Query on Subcollection (Implicitly secure, no complex index needed for basic fetch)
      const q = query(getCollectionRef(user.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id, // FORCE ID from metadata to ensure it's never missing
          }) as GroupSession,
      );
    } catch {
      return [];
    }
  },

  /**
   * Update a group session
   */
  update: async (sessionId: string, updates: Partial<GroupSession>): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Unauthorized');

      const docRef = doc(db, 'users', user.uid, 'group_sessions', sessionId);
      await updateDoc(docRef, updates);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a group session
   */
  delete: async (sessionId: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Unauthorized');

      // TITANIUM STANDARD: Sequential Delete (Robustness over Atomicity for Legacy Cleanup)

      // 1. Delete from Subcollection (Primary Source of Truth)
      const docRef = doc(db, 'users', user.uid, 'group_sessions', sessionId);
      await deleteDoc(docRef);

      // 2. Delete from Root Collection (Legacy/Fallback) - Best Effort
      try {
        const rootDocRef = doc(db, 'group_sessions', sessionId);
        await deleteDoc(rootDocRef);
      } catch {
        // Legacy root delete skipped — best effort
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete ALL sessions for a specific group name
   * (Effectively deletes the "Group")
   */
  deleteAllSessionsForGroup: async (groupName: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Unauthorized');

      // 1. Query all sessions with this groupName
      const q = query(getCollectionRef(user.uid), where('groupName', '==', groupName));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      // 2. Batch Delete
      const batch = writeBatch(db);

      snapshot.docs.forEach((docSnap) => {
        // Delete from Subcollection
        batch.delete(docSnap.ref);
      });

      await batch.commit();
    } catch (error) {
      throw error;
    }
  },
};
