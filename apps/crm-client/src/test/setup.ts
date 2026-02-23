import { beforeAll, afterAll, afterEach } from 'vitest';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { app } from '../config/firebase';

// Configure Emulators for testing environment
beforeAll(() => {
    // Only connect to emulators if we're in the test environment and haven't already
    const db = getFirestore(app);
    const auth = getAuth(app);
    const functions = getFunctions(app);

    try {
        // These ports match firebase.json
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch {
        // Ignore errors if already connected
    }
});

afterEach(() => {
    // Clean up any specific test state here if needed
});

afterAll(() => {
    // Clean up global state
});
