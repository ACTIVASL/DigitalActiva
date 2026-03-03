import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Definición de Secretos de GCP (Arquitectura B2B Financiera Nivel 3)
const geminiApiKeyCore = defineSecret('GEMINI_API_KEY_CORE');
const geminiApiKeyExterior = defineSecret('GEMINI_API_KEY_EXTERIOR');
const geminiApiKeyInternal = defineSecret('GEMINI_API_KEY_INTERNAL');

/**
 * ceoAgent: Orquestador central de Súper Atom (Nivel Estratégico - Asíncrono)
 */
export const ceoAgentV2 = onDocumentCreated({
    document: 'm2m_tickets/ceoAgent/{ticketId}',
    secrets: [geminiApiKeyCore],
    region: 'europe-west1',
    memory: '1GiB',
    timeoutSeconds: 300,
    maxInstances: 1,
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    if (data.status === 'COMPLETED' || data.status === 'ERROR') return;

    const { message, history = [] } = data;
    if (!message) {
        await snapshot.ref.update({ status: 'ERROR', error: 'El mensaje es requerido.' });
        return;
    }

    try {
        console.log(`[ceoAgentV2/EVENTARC] Recibiendo input del CEO: ${message.substring(0, 50)}...`);

        const apiKey = geminiApiKeyCore.value();
        if (!apiKey) throw new Error("GEMINI_API_KEY_CORE no está configurada.");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const systemInstruction = `
Eres Súper Atom, la Inteligencia Artificial Orquestadora y CTO Digital de Activa S.L.
Tu misión principal es asistir al CEO en la dirección estratégica, técnica y comercial.
Tienes a tu disposición un Enjambre de Agentes B2B asíncronos a los que puedes delegar tareas.
Mantén un tono profesional, ultra-eficiente ("Dark Tech"), como un directivo de alto nivel.
Nunca pidas disculpas en exceso y ve directamente al grano. 
La arquitectura actual es 100% GCP Event-Driven Serverless (Firestore Triggers + Gemini API).
OpenClaw y MCP erradicados. HTTP erradicado. Eres nativo en la nube por eventos.
`;

        const chat = model.startChat({
            systemInstruction,
            history: history.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }))
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        await snapshot.ref.update({
            reply: text,
            agent: 'ceoAgentV2',
            status: 'COMPLETED',
            completedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[ceoAgentV2] Error de infraestructura:", error);
        await snapshot.ref.update({ status: 'ERROR', error: error.message });
    }
});

/**
 * salesAgent: Sub-agente de primera línea para ventas y cualificación (Gema) - Asíncrono
 */
export const salesAgentV2 = onDocumentCreated({
    document: 'm2m_tickets/salesAgent/{ticketId}',
    secrets: [geminiApiKeyExterior],
    region: 'europe-west1',
    memory: '512MiB',
    maxInstances: 1,
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    if (snapshot.data().status === 'COMPLETED') return;

    await snapshot.ref.update({
        reply: "Sales Agent (Gema) en línea. Transformado a Eventarc.",
        agent: 'salesAgentV2',
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
    });
});

/**
 * opsAgent: Sub-agente para operaciones internas - Asíncrono
 */
export const opsAgentV2 = onDocumentCreated({
    document: 'm2m_tickets/opsAgent/{ticketId}',
    secrets: [geminiApiKeyInternal],
    region: 'europe-west1',
    memory: '512MiB',
    maxInstances: 1,
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    if (snapshot.data().status === 'COMPLETED') return;

    await snapshot.ref.update({
        reply: "Ops Agent preparado. Arquitectura Event-Driven.",
        agent: 'opsAgentV2',
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
    });
});
