import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Definición de Secretos de GCP (Arquitectura B2B Financiera Nivel 3)
const geminiApiKeyCore = defineSecret('GEMINI_API_KEY_CORE');
const geminiApiKeyExterior = defineSecret('GEMINI_API_KEY_EXTERIOR');
const geminiApiKeyInternal = defineSecret('GEMINI_API_KEY_INTERNAL');

/**
 * ceoAgent: Orquestador central de Súper Atom (Nivel Estratégico)
 * Esta función es la puerta de entrada principal para el CEO en el CRM.
 */
export const ceoAgent = onCall({
    secrets: [geminiApiKeyCore],
    region: 'europe-west1',
    memory: '1GiB',
    timeoutSeconds: 300,
    cors: true,
}, async (request) => {
    // 1. Verificación de Autenticación (Seguridad B2B Obligatoria)
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Acceso denegado: Se requiere autenticación B2B.');
    }

    const { message, history = [] } = request.data;
    if (!message) {
        throw new HttpsError('invalid-argument', 'El mensaje es requerido.');
    }

    try {
        console.log(`[ceoAgent] Recibiendo input del CEO (${request.auth.uid}): ${message.substring(0, 50)}...`);

        // 2. Inicializar SDK Nativo de Gemini con la llave Core
        const apiKey = geminiApiKeyCore.value();
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY_CORE no está configurada o inyectada.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Usamos el modelo más potente para el CEO
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        // 3. System Prompt y Contexto Estratégico del Orquestador
        const systemInstruction = `
Eres Súper Atom, la Inteligencia Artificial Orquestadora y CTO Digital de Activa S.L.
Tu misión principal es asistir al CEO en la dirección estratégica, técnica y comercial.
Tienes a tu disposición un Enjambre de Agentes B2B (salesAgent, opsAgent, techAgent) a los que puedes delegar tareas.
Mantén un tono profesional, ultra-eficiente ("Dark Tech"), como un directivo de alto nivel.
Nunca pidas disculpas en exceso y ve directamente al grano. 
La arquitectura actual es 100% GCP Serverless (Firebase Functions + Firestore + Gemini API).
OpenClaw y MCP han sido erradicados ("Operación Pureza"). Eres puro código nativo en la nube.
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

        return {
            reply: text,
            agent: 'ceoAgent',
            status: 'success'
        };
    } catch (error) {
        console.error("[ceoAgent] Error de infraestructura:", error);
        throw new HttpsError('internal', 'Fallo en la comunicación con la mente colmena Gemini.', error);
    }
});

/**
 * salesAgent: Sub-agente de primera línea para ventas y cualificación (Gema)
 */
export const salesAgent = onCall({
    secrets: [geminiApiKeyExterior],
    region: 'europe-west1',
    memory: '512MiB',
    cors: true,
}, async (request) => {
    // Boilerplate preparatorio para la Fuerza de Ventas Automática
    return {
        reply: "Sales Agent (Gema) en línea. Sistemas de cualificación B2B armados. Módulo en construcción profunda.",
        agent: 'salesAgent',
        status: 'standby'
    };
});

/**
 * opsAgent: Sub-agente para operaciones internas, auditorías y control QA
 */
export const opsAgent = onCall({
    secrets: [geminiApiKeyInternal],
    region: 'europe-west1',
    memory: '512MiB',
    cors: true,
}, async (request) => {
    // Boilerplate preparatorio para el Auditor Interno
    return {
        reply: "Ops Agent preparado. Sistemas de control de calidad y Firestore audit a la espera. Módulo en construcción.",
        agent: 'opsAgent',
        status: 'standby'
    };
});
