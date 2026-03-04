import { onCall, HttpsOptions } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

import { embed } from '@genkit-ai/ai/embedder';
import { textEmbeddingGecko001 } from '@genkit-ai/googleai';
// import { initGenkit } from './genkit';

// Initialize Genkit
// Initialize Genkit
// initGenkit(); // DISABLED TO PREVENT DEPLOYMENT HANG (Auth simulated)

const FUNCTION_OPTS: HttpsOptions = {
    region: 'europe-west1',
    memory: '1GiB',
    timeoutSeconds: 60,
    cors: true,
    maxInstances: 1,
};

/**
 * TRIGGER: Vector Embedding Generation
 * Automatic Neural Lace: Listens for new/updated Daily Notes and generates an embedding.
 */
export const embedNote = onDocumentWritten({
    document: "daily_notes/{noteId}",
    region: "europe-west1",
    maxInstances: 1,
    // We want this to be fast/background
}, async (event) => {
    if (!event.data) return;

    const change = event.data;
    const after = change.after;
    const before = change.before;

    // Handle Deletion
    if (!after.exists) return;

    const note = after.data();
    if (!note) return;

    const content = note.content;
    const beforeData = before.exists ? before.data() : null;

    // 1. If no content, nothing to embed.
    if (!content) return;

    // 2. Loop Prevention: If Creation (no before) and Embedding already exists, skip.
    if (!beforeData && note.embedding) return;

    // 3. Loop Prevention: If Update (before exists) and Content is same and Embedding exists, skip.
    // This prevents infinite loop when we write the embedding back to the document.
    if (beforeData && beforeData.content === content && note.embedding) return;

    console.log(`[Neural Lace] Embedding note: ${event.params.noteId}`);

    try {
        const embedding = await embed({
            embedder: textEmbeddingGecko001,
            content: content,
        });

        // Update with vector
        await after.ref.update({
            embedding: FieldValue.vector(embedding)
        });

        console.log(`[Neural Lace] Success. Vector generated.`);
    } catch (e) {
        console.error("[Neural Lace] Embedding failed", e);
    }
});

/**
 * CALLABLE: Semantic Search
 * Allows the frontend to search notes by meaning.
 */
export const searchNotes = onCall(FUNCTION_OPTS, async (request) => {
    const { query, limit = 5 } = request.data;

    if (!request.auth) {
        throw new Error("Unauthorized");
    }

    console.log(`[Neural Search] Query: ${query}`);

    try {
        // 1. Embed the query
        const queryEmbedding = await embed({
            embedder: textEmbeddingGecko001,
            content: query,
        });

        // 2. Perform Vector Search (Firestore Native)
        const db = getFirestore();
        const coll = db.collection('daily_notes');

        // Filter by user! Important for multi-tenant privacy.
        // Vector search with filters requires a composite vector index.
        const vectorQuery = coll
            .where('userId', '==', request.auth.uid)
            .findNearest('embedding', queryEmbedding, {
                limit: limit,
                distanceMeasure: 'COSINE'
            });

        const snapshot = await vectorQuery.get();

        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            embedding: undefined // Don't send the vector back to client, it's heavy
        }));

        console.log(`[Neural Search] Found ${results.length} matches.`);
        return { results };

    } catch (error) {
        console.error("Search failed:", error);
        throw new Error("Neural Search System Failure");
    }
});

export * from './atomChat';
export * from './atomWorkspace';
export * from './swarmAgents';
