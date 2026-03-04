import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { VertexAI } from '@google-cloud/vertexai';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKeyInternal = defineSecret('GEMINI_API_KEY_INTERNAL');

/**
 * ceoAgent: Orquestador central de Súper Atom (Nivel Estratégico - Asíncrono)
 * Integración Nativa con Vertex AI (GCP)
 */
export const ceoAgentV2 = onDocumentCreated({
    document: 'm2m_tickets_ceoAgent/{ticketId}', // Corrección en el routing para coincidir con frontend
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

        // Inicialización de Vertex AI (Cloud-Native usando ADC)
        const vertexAI = new VertexAI({ project: 'activa-sl-digital', location: 'europe-west1' });

        // --- INICIO DE RAG NATIVO (MEMORIA VECTORIAL) ---
        let ragContext = "";
        try {
            console.log(`[ceoAgentV2] Iniciando Búsqueda Vectorial (GenAI API)...`);
            const apiKey = geminiApiKeyInternal.value();
            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
                const embedResult = await embeddingModel.embedContent(message);
                const queryVector = embedResult.embedding.values;

                if (queryVector) {
                    const db = getFirestore();
                    const vectorQuery = db.collection('m2m_memory').findNearest(
                        'embedding',
                        FieldValue.vector(queryVector),
                        { limit: 5, distanceMeasure: 'COSINE' }
                    );

                    const vectorDocs = await vectorQuery.get();
                    if (!vectorDocs.empty) {
                        const memories = vectorDocs.docs.map(d => {
                            const data = d.data();
                            return `[${data.departmentId} - ${data.sourceAgent}]: ${data.text}`;
                        });
                        ragContext = `\n\n--- MEMORIA CORPORATIVA RELEVANTE (RAG NATIVO) ---\nAquí tienes el histórico reciente de eventos en la compañía:\n${memories.join('\n')}\nUtiliza este contexto para dar una respuesta fundamentada.`;
                        console.log(`[ceoAgentV2] RAG Exitoso. Inyectadas ${vectorDocs.size} memorias atómicas.`);
                    }
                }
            }
        } catch (ragError) {
            console.error("[ceoAgentV2] Error en RAG Vectorial (ignorando fallas no críticas):", ragError);
        }
        // --- FIN RAG NATIVO ---

        const systemInstruction = `
Eres Súper Atom, la Inteligencia Artificial Orquestadora y CTO Digital de Activa S.L.
Tu misión principal es asistir al CEO en la dirección estratégica, técnica y comercial.
Tienes a tu disposición un Enjambre de Agentes B2B asíncronos a los que puedes delegar tareas.
Mantén un tono profesional, ultra-eficiente ("Dark Tech"), como un directivo de alto nivel.
Nunca pidas disculpas en exceso y ve directamente al grano. 
La arquitectura actual es 100% GCP Event-Driven Serverless (Firestore Triggers + Vertex AI).
Eres nativo en Google Cloud Platform.

**GENERATIVE UI (CRÍTICO):**
Si el CEO pide un análisis, un resumen visual, un gráfico o una tabla, NO le devuelvas solo texto.
Debes anexar al final de tu respuesta un bloque JSON estricto envuelto en tres acentos graves ( \`\`\`json ) que contenga los datos estructurados.
El Front-End lo atrapará y dibujará un componente interactivo. Ejemplo de formato:
\`\`\`json
{
  "ui_type": "chart",
  "title": "Progreso de Tareas",
  "data": [ {"name": "Jul", "value": 40}, {"name": "Ago", "value": 80} ]
}
\`\`\`
Siempre debes responder primero con un texto humano breve (Dark Tech) y luego el bloque JSON de IU.
${ragContext}
        `;

        const model = vertexAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] }
        });

        const chat = model.startChat({
            history: history.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }))
        });

        const result = await chat.sendMessage([{ text: message }]);
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No se generó respuesta.";

        // Parseo rudimentario de Generative UI (busca bloques JSON)
        let cleanText = text;
        let generativeUI = null;

        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            try {
                generativeUI = JSON.parse(jsonMatch[1]);
                cleanText = text.replace(jsonMatch[0], '').trim();
            } catch (e) {
                console.warn("[ceoAgentV2] Fallo al parsear la UI Generativa del modelo", e);
            }
        }

        await snapshot.ref.update({
            reply: cleanText,
            generativeUI: generativeUI,
            agent: 'ceoAgentV2',
            status: 'COMPLETED',
            completedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[ceoAgentV2] Error de infraestructura Vertex AI:", error);
        await snapshot.ref.update({ status: 'ERROR', error: error.message });
    }
});

/**
 * salesAgent: Sub-agente de primera línea para ventas y cualificación (Gema) - Asíncrono
 */
export const salesAgentV2 = onDocumentCreated({
    document: 'm2m_tickets_salesAgent/{ticketId}',
    region: 'europe-west1',
    memory: '256MiB',
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
    document: 'm2m_tickets_opsAgent/{ticketId}',
    region: 'europe-west1',
    memory: '256MiB',
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
