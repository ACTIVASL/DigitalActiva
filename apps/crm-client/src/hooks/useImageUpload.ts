import { useState } from 'react';
import { TitaniumStorage } from '../lib/storage';

interface UseImageUploadResult {
  uploading: boolean;
  error: string | null;
  uploadImage: (file: File, path: string) => Promise<string | null>;
  compressImage: (file: File) => Promise<Blob>;
}

export const useImageUpload = (): UseImageUploadResult => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Native Canvas Compression (Titanium Standard)
   * Avoids heavy external dependencies.
   */
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const maxWidth = 800; // Titanium Standard Profile Size
      const maxHeight = 800;
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Compression failed'));
            },
            'image/jpeg',
            0.8, // 80% Quality
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    setUploading(true);
    setError(null);
    try {
      // 1. Compress
      const compressedBlob = await compressImage(file);

      // 2. Upload
      const url = await TitaniumStorage.upload(path, compressedBlob);

      setUploading(false);
      return url;
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al subir imagen');
      setUploading(false);
      return null;
    }
  };

  return { uploading, error, uploadImage, compressImage };
};
