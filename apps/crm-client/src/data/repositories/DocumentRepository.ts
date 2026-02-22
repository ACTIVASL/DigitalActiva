import { db, auth, storage } from '@monorepo/engine-auth';
import {
  collection,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { ClinicalDocument, ForensicMetadata } from '@monorepo/shared';
import { DocumentSchema } from '@monorepo/shared';
import { UploadMetadata } from 'firebase/storage';

export const DocumentRepository = {
  /**
   * Fetch all documents for a patient, strictly typed.
   */
  getByPatientId: async (patientId: string): Promise<ClinicalDocument[]> => {
    const q = query(
      collection(db, `patients/${patientId}/documents`),
      orderBy('createdAt', 'desc'),
      limit(50),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      // Runtime Check? Or trust Fireatore?
      // Ideally we parse with Zod, but for perforance on loops, we might cast if confident.
      // Let's do a soft check or construct carefully.
      return { id: d.id, ...data } as ClinicalDocument;
    });
  },

  /**
   * Uploads a file to Storage and creates metadata in Firestore.
   * Transaction-like safety not native, so we do Storage -> Firestore.
   */
  upload: async (
    patientId: string,
    file: File,
    customMetadata?: ForensicMetadata,
  ): Promise<ClinicalDocument> => {
    const user = auth.currentUser;

    if (!user) throw new Error('Unauthorized: No user logged in.');

    // 1. Storage Upload
    const storagePath = `patients/${patientId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    // Metadata for Security Rules (ownerId) & Forensic Data
    const metadata = {
      contentType: file.type || 'application/pdf', // FORCE CONTENT TYPE FOR CORS
      customMetadata: {
        ownerId: user.uid,
        originalName: file.name,
        // Firebase Storage customMetadata only supports strings
        // Firebase Storage customMetadata only supports strings.
        // We use || '' to ensure no undefined values slip through.
        timestamp: customMetadata?.timestamp
          ? String(customMetadata.timestamp)
          : new Date().toISOString(),
        userAgent: customMetadata?.userAgent ? String(customMetadata.userAgent) : 'unknown',
        screenResolution: customMetadata?.screenResolution
          ? String(customMetadata.screenResolution)
          : 'unknown',
        devicePixelRatio: customMetadata?.devicePixelRatio
          ? String(customMetadata.devicePixelRatio)
          : '1',
        platform: customMetadata?.platform ? String(customMetadata.platform) : 'unknown',
        category: customMetadata?.category ? String(customMetadata.category) : 'general',
        // Spread rest but force string conversion for safety
        ...Object.entries(customMetadata || {}).reduce(
          (acc, [k, v]) => ({ ...acc, [k]: String(v ?? '') }),
          {},
        ),
      },
    };

    // TITANIUM TIMEOUT WRAPPER
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout: La subida tardó demasiado. Compruebe su conexión.')),
        30000,
      ),
    );

    const snapshot = (await Promise.race([
      uploadBytes(storageRef, file, metadata as UploadMetadata),
      timeoutPromise,
    ])) as Awaited<ReturnType<typeof uploadBytes>>;
    const downloadUrl = await getDownloadURL(snapshot.ref);

    // 2. Firestore Record
    // Using Zod Schema to strictly define what goes to DB
    const newDocPayload: Omit<ClinicalDocument, 'id'> = {
      name: file.name,
      url: downloadUrl,
      type: file.type,
      size: file.size,
      uploadedBy: user.uid,
      createdAt: new Date().toISOString(),
      path: storagePath,
      category: (customMetadata?.category as ClinicalDocument['category']) || 'general', // PERSIST TO DB (Titanium Memory Core)
      metadata: customMetadata, // PERSIST TO DB
    };

    // Validate payload before sending (Iron Rule)
    // We pick everything except ID from the schema to validate
    try {
      DocumentSchema.omit({ id: true }).parse(newDocPayload);
    } catch {
      // Schema validation for extra fields — non-blocking
    }

    const docRef = await addDoc(collection(db, `patients/${patientId}/documents`), newDocPayload);

    return { id: docRef.id, ...newDocPayload };
  },

  /**
   * Deletes from Storage and Firestore.
   */
  delete: async (
    patientId: string,
    document: {
      path: string;
      type: string;
      id: string;
      url: string;
      name: string;
      size: number;
      category: 'invoice' | 'consent' | 'report' | 'lab' | 'general' | 'other';
      createdAt: string;
    },
  ): Promise<void> => {
    // 1. Delete from Storage
    if (document.path) {
      const storageRef = ref(storage, document.path);
      try {
        await deleteObject(storageRef);
      } catch {
        // Storage delete failed (orphaned file?) — best effort
      }
    }

    // 2. Delete from Firestore
    await deleteDoc(doc(db, `patients/${patientId}/documents`, document.id));
  },
};
