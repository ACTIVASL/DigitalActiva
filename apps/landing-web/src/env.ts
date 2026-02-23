import { z } from 'zod';

const envSchema = z.object({
    VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
    VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
    VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
    VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
    VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
    VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),
    VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
});

// Validate the current environment variables against the schema.
// Vite statically replaces import.meta.env.XXX, so we must map them explicitly.
const _env = envSchema.parse({
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

export const env = _env;
