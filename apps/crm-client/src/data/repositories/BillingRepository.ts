import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { db, auth } from '@monorepo/engine-auth';
import { Invoice } from '@monorepo/shared';
import { InvoiceRepository } from './InvoiceRepository';

export interface BillableSessionRef {
  id: string;
  type: 'individual' | 'group';
  patientId?: string; // Required for individual
  price: number;
  date: string;
  paid?: boolean;
}

export const BillingRepository = {
  /**
   * ATOMIC INVOICE CREATION
   * Creates the invoice AND updates all related sessions to 'paid: true' in a single transaction.
   * Use this instead of separate calls to prevent "Phantom Revenue".
   */
  /**
   * ATOMIC INVOICE CREATION
   * Creates the invoice AND updates all related sessions to 'paid: true' in a single transaction.
   * Uses atomic sequence generation to prevent duplicate invoice numbers.
   */
  createInvoiceBatch: async (
    invoiceTemplate: Invoice,
    sessions: BillableSessionRef[],
  ): Promise<void> => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Unauthorized');

    // 0. Ensure Sequence exists (Self-Healing)
    await InvoiceRepository.ensureSequenceInitialized();

    await runTransaction(db, async (transaction) => {
      // 1. Generate Atomic ID (locks the sequence document)
      const nextNumber = await InvoiceRepository.getNextNumberAtomic(transaction);

      // 2. Prepare Invoice Data
      const invoiceRef = doc(db, 'invoices', invoiceTemplate.id); // Use the template ID for the doc key, but update the number
      const invoiceData = {
        ...invoiceTemplate,
        number: nextNumber, // OVERRIDE the optimistic number with the atomic one
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      transaction.set(invoiceRef, invoiceData);

      // 3. Update Sessions (Mark as Paid)
      for (const session of sessions) {
        if (session.type === 'individual') {
          if (!session.patientId) continue;
          const sessionRef = doc(db, 'patients', session.patientId, 'sessions', session.id);
          transaction.update(sessionRef, { paid: true, invoiceId: invoiceTemplate.id }); // Using the ID (UUID), not the Number
        } else if (session.type === 'group') {
          const groupRef = doc(db, 'users', uid, 'group_sessions', session.id);
          transaction.update(groupRef, { paid: true, invoiceId: invoiceTemplate.id });
        }
      }
    });
  },

  /**
   * Get unbilled sessions for a group
   * This is a specific query to help the Wizard
   */
  getUnbilledGroupSessions: async (groupName: string): Promise<BillableSessionRef[]> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    try {
      // Query users/{uid}/group_sessions where groupName == X and paid == false
      // Query users/{uid}/group_sessions where groupName == X
      // Removed orderBy('date', 'desc') to avoid Composite Index dependency.
      // We sort in memory.
      // Titanium Optimized: Server-side sorting enabled by Index
      const q = query(
        collection(db, 'users', uid, 'group_sessions'),
        where('groupName', '==', groupName),
        orderBy('date', 'desc'),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => {
          const data = d.data();
          return { ...data, id: d.id } as BillableSessionRef;
        })
        .filter((d) => !d.paid) // Memory filter to avoid composite index requirement immediately
        .map((d) => ({
          id: d.id,
          type: 'group' as const,
          price: d.price || 0,
          date: d.date,
          // Group sessions might not have a single patientId
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  },
};
