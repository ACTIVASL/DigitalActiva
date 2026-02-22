import { storage } from '@monorepo/engine-auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const TitaniumStorage = {
  /**
   * Uploads a file to a specific path.
   * @param path Full path including filename (e.g., 'patients/123/profile.jpg')
   * @param file File object
   * @returns Promise<string> Download URL
   */
  upload: async (path: string, file: File | Blob): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      // Metadata could be added here
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Get public URL for a path.
   */
  getURL: async (path: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Delete file at path.
   */
  delete: async (path: string): Promise<void> => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error: unknown) {
      throw error;
    }
  },
};
