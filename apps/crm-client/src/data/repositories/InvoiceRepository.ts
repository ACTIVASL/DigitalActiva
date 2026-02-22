import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  Transaction,
  limit,
} from 'firebase/firestore';
import { db, auth } from '@monorepo/engine-auth';
import { Invoice } from '@monorepo/shared';
import { AuditRepository } from './AuditRepository';

const COLLECTION = 'invoices';

export const InvoiceRepository = {
  async getAll(): Promise<Invoice[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const q = query(
        collection(db, COLLECTION),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Invoice);
    } catch {
      return [];
    }
  },

  async getByPatient(patientId: string): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('patientId', '==', patientId),
        orderBy('date', 'desc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as Invoice);
    } catch {
      // Fallback for index issues: client-side filtering
      const all = await this.getAll();
      return all.filter((inv) => inv.patientId === patientId);
    }
  },

  async save(invoice: Invoice): Promise<void> {
    const docRef = doc(db, COLLECTION, invoice.id);
    const data = {
      ...invoice,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, data, { merge: true });

    // TITANIUM AUDIT: Log Invoice Save
    const isDraft = invoice.status === 'DRAFT';
    const auditStatus =
      invoice.status === 'PAID' ? 'paid' : invoice.status === 'PENDING' ? 'pending' : 'void';

    await AuditRepository.log(
      'finance',
      isDraft ? 'Borrador de Factura Guardado' : 'Factura Emitida',
      {
        type: 'finance',
        invoiceId: invoice.id,
        amount: invoice.total,
        status: isDraft ? 'pending' : auditStatus,
      },
    );
  },

  async updateStatus(
    id: string,
    status: Invoice['status'],
    paidAt?: string,
    method?: Invoice['paymentMethod'],
  ): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    const updates: Partial<Invoice> & { updatedAt: string } = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (paidAt) updates.paidAt = paidAt;
    if (method) updates.paymentMethod = method;

    await updateDoc(docRef, updates);

    // TITANIUM AUDIT: Log Status Change
    const auditStatus = status === 'PAID' ? 'paid' : status === 'PENDING' ? 'pending' : 'void';

    await AuditRepository.log('finance', `Factura marcada como ${status}`, {
      type: 'finance',
      invoiceId: id,
      status: auditStatus,
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
    // TITANIUM AUDIT
    await AuditRepository.log('finance', 'Factura Eliminada', {
      type: 'finance',
      invoiceId: id,
      status: 'void',
    });
  },

  // --- ATOMIC SEQUENCE HANLDING ---

  /**
   * Ensures the 'sequences/invoices' document exists and is synced with the latest invoice.
   * Call this BEFORE starting the transaction if you suspect it might not exist.
   */
  async ensureSequenceInitialized(): Promise<void> {
    const sequenceRef = doc(db, 'sequences', 'invoices');
    const sequenceSnap = await getDoc(sequenceRef);

    if (!sequenceSnap.exists()) {
      // FALLBACK: If sequence doesn't exist, strictly find the Max
      // This is a "Cold Start" repair.
      const currentYear = new Date().getFullYear();
      let maxSeq = 0;
      try {
        // Try to find the max invoice to seed the counter
        const q = query(collection(db, COLLECTION), orderBy('number', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastInv = snapshot.docs[0].data() as Invoice;
          const parts = lastInv.number.split('-');
          if (parts.length === 3 && parseInt(parts[1]) === currentYear) {
            maxSeq = parseInt(parts[2]);
          }
        }
      } catch {
        // Could not seed from existing data; default to 0
      }

      await setDoc(sequenceRef, {
        current: maxSeq,
        year: currentYear,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  /**
   * Transactional ID Generator.
   * Must be called INSIDE a runTransaction block.
   */
  async getNextNumberAtomic(transaction: Transaction): Promise<string> {
    const sequenceRef = doc(db, 'sequences', 'invoices');
    const sequenceDoc = await transaction.get(sequenceRef);

    let currentSeq = 0;
    const currentYear = new Date().getFullYear();

    if (!sequenceDoc.exists()) {
      throw new Error('SEQUENCE_NOT_INITIALIZED');
    }

    const data = sequenceDoc.data();
    if (data.year !== currentYear) {
      currentSeq = 1;
    } else {
      currentSeq = (data.current || 0) + 1;
    }

    transaction.set(sequenceRef, {
      current: currentSeq,
      year: currentYear,
      updatedAt: new Date().toISOString(),
    });

    return `INV-${currentYear}-${currentSeq.toString().padStart(3, '0')}`;
  },
};
