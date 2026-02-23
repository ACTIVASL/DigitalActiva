import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
    // Read rules from the root directory
    const rulesPath = path.resolve(__dirname, '../../../../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    try {
        testEnv = await initializeTestEnvironment({
            projectId: 'activa-sl-digital',
            firestore: {
                rules,
                host: 'localhost',
                port: 8080,
            },
        });
    } catch (e) {
        console.error('CRITICAL: Firebase Emulator unreachable. Cannot run rules test.', e);
        throw e; // Force vitest to fail
    }
}, 20000);

beforeEach(async () => {
    if (!testEnv) throw new Error('Test environment not initialized');
    await testEnv.clearFirestore();
});

afterAll(async () => {
    if (testEnv) await testEnv.cleanup();
});

describe('Firestore Security Rules: Users & Patients', () => {
    it('should deny unauthenticated read/write to users collection', async () => {
        if (!testEnv) throw new Error('Test environment not initialized');
        const unauthedDb = testEnv.unauthenticatedContext().firestore();
        const userDoc = doc(unauthedDb, 'users/user123');

        await assertFails(getDoc(userDoc));
        await assertFails(setDoc(userDoc, { email: 'hacker@hacker.com' }));
    });

    it('should allow authenticated users to read and write their own profile', async () => {
        if (!testEnv) throw new Error('Test environment not initialized');
        const aliceDb = testEnv.authenticatedContext('alice123', { email: 'alice@activa.com' }).firestore();
        const aliceDoc = doc(aliceDb, 'users/alice123');
        const bobDoc = doc(aliceDb, 'users/bob456');

        // Alice can write and read her own record
        await assertSucceeds(setDoc(aliceDoc, { email: 'alice@activa.com' }));
        await assertSucceeds(getDoc(aliceDoc));

        // Alice cannot read Bob's record
        await assertFails(getDoc(bobDoc));
    });

    it('should only allow patients to be created if they belong to the authenticated user', async () => {
        if (!testEnv) throw new Error('Test environment not initialized');
        const doctorDb = testEnv.authenticatedContext('doc123').firestore();
        const patientDocDoc = doc(doctorDb, 'patients/pat1');
        const invalidPatientDoc = doc(doctorDb, 'patients/pat2');

        // Valid patient creation (userId matches auth uid)
        await assertSucceeds(setDoc(patientDocDoc, {
            userId: 'doc123',
            name: 'John Doe',
            age: 45,
            diagnosis: 'TBI',
            status: 'active'
        }));

        // Invalid creation (trying to create a patient for another user)
        await assertFails(setDoc(invalidPatientDoc, {
            userId: 'otherDoc',
            name: 'Jane Doe',
            age: 45,
            diagnosis: 'TBI',
            status: 'active'
        }));
    });

    it('should deny read access to documents without parent ownership', async () => {
        if (!testEnv) throw new Error('Test environment not initialized');
        const docDb = testEnv.authenticatedContext('doc123').firestore();
        // In final test we'd seed a parent, but this alone verifies the rule blocking it
        const randomDoc = doc(docDb, 'documents/doc1');

        // Trying to read a document without owning the parent should fail according to rules
        await assertFails(getDoc(randomDoc));
    });
});
