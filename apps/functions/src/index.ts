import * as admin from 'firebase-admin';

// Initialize Firebase Admin globally once for all Cloud Functions
if (admin.apps.length === 0) {
    admin.initializeApp();
}

export * from './atomChat';
export * from './atomWorkspace';
export * from './swarmAgents';
