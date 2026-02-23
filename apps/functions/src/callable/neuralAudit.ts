import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { generate } from "@genkit-ai/ai";
import { gemini15Pro, googleAI } from "@genkit-ai/googleai";
import { configureGenkit } from "@genkit-ai/core";
import { z } from "zod";

// --- CONFIGURATION ---
// Initialize Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Ensure Genkit is configured to use Google AI (Vertex or AI Studio depending on env credentials)
configureGenkit({
    plugins: [googleAI()],
    logLevel: "debug",
    enableTracingAndMetrics: true, // Telemetry for Production Observable AI
});

// Define the exact schema we want the AI to return. This guarantees UI stability.
const AuditResponseSchema = z.object({
    title: z.string(),
    executiveSummary: z.string(),
    technicalScore: z.number(),
    modules: z.array(z.object({
        name: z.string(),
        description: z.string(),
        impact: z.enum(["Low", "Medium", "High", "Critical"])
    }))
});

/**
 * NEURAL AUDIT: The Core Intelligence Function (PROD VERSION)
 * 1. Receives company data.
 * 2. Asks Gemini 1.5 Pro via Genkit to generate a technical report structure.
 * 3. Enforces a strict Zod schema for the output so the client never crashes.
 */
export const neuralAudit = onCall({
    cors: true,
    memory: "1GiB",
    timeoutSeconds: 300, // AI calls need more timeout
    region: "europe-west1",
    enforceAppCheck: true // Enforce strict App Check for production APIs
}, async (request) => {

    // 1. VALIDATION
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Neural Link requires authentication.");
    }

    const { companyName, websiteUrl } = request.data;

    if (!companyName || !websiteUrl) {
        throw new HttpsError("invalid-argument", "Missing neural inputs.");
    }

    console.log(`[NEURAL] Starting audit for: ${companyName} (${websiteUrl})`);

    try {
        // 2. THE BRAIN (GEMINI 1.5 PRO)
        console.log("[NEURAL] Reaching out to Gemini 1.5 Pro via Genkit...");

        const promptTemplate = `
        Act as a Principal Cloud Architect at Activa SL.
        Perform a theoretical technical audit for the company "${companyName}" (Website: ${websiteUrl}).
        Evaluate their likely infrastructure based on standard corporate anti-patterns.
        Recommend migrating to an Edge-Native architecture, Neural Cache, and Shield WAF.
        Be professional, brutal, but corporate. Return ONLY valid JSON matching the requested schema.
        `;

        const response = await generate({
            model: gemini15Pro,
            prompt: promptTemplate,
            output: { schema: AuditResponseSchema },
            config: {
                temperature: 0.4,
            }
        });

        const analysis = response.output();

        if (!analysis) {
            throw new Error("Gemini returned empty output against the schema.");
        }

        console.log("[NEURAL] Gemini Analysis Complete:", analysis.title);

        // 3. THE BODY (GOOGLE WORKSPACE) -> Disabled for Phase 2 MVP.
        // We return the raw deterministic analysis to the UI first.
        const docUrl = `https://activamusicoterapia.com/report?company=${encodeURIComponent(companyName)}`;

        return {
            success: true,
            docUrl: docUrl,
            analysis: analysis,
            message: "Neural Connection Successful. Engine running."
        };

    } catch (error: any) {
        console.error("[NEURAL] Error:", error);
        throw new HttpsError("internal", "Neural Link Severed: " + (error.message || "Unknown error"));
    }
});
