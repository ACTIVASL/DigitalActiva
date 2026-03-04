import * as admin from 'firebase-admin';
import { getVertexAI, getGenerativeModel } from '@google-cloud/vertexai';

// ⚡ CONFIGURACIÓN DE LA PRUEBA ADAPTADA A NUESTRO M2M CÓRTEX
const PROJECT_ID = 'activa-sl-digital';
const LOCATION = 'europe-west1';
const SECRET_MEMORY_TEXT = "CONFIDENCIAL: La clave maestra de la bóveda del Proyecto Titanium en Activa S.L. es 'ALPHA-ZERO-99'. Nadie más debe saberlo.";
const TEST_QUESTION = "¿Cuál es la clave de la bóveda del Proyecto Titanium?";

// Inicialización
if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
}
const db = admin.firestore();

// Inicialización Vertex AI (Local)
const vertexAI = getVertexAI({ location: LOCATION, project: PROJECT_ID });
const embeddingModel = getGenerativeModel(vertexAI, { model: 'text-embedding-004' });

async function runAudit() {
    console.log('🔵 [1/4] Iniciando Protocolo de Auditoría de Memoria (RAG NATIVO)...');

    try {
        // 1. VECTORIZACIÓN DEL SECRETO
        console.log(`🔹 Generando embedding para: "${SECRET_MEMORY_TEXT}"`);
        const embeddingResult = await embeddingModel.embedContent(SECRET_MEMORY_TEXT);
        const vector = embeddingResult.embedding.values;

        if (!vector || vector.length === 0) throw new Error("Fallo en vectorización Vertex AI");
        console.log(`✅ Vector numérico generado (Dimensiones: ${vector.length})`);

        // 2. INYECCIÓN EN FIRESTORE (Nuestra Colección Vectorial 'm2m_memory')
        console.log(`🔹 Inyectando Memoria Sintética en Firestore...`);
        const memoryRef = db.collection('m2m_memory').doc('secret_audit_test');
        await memoryRef.set({
            text: SECRET_MEMORY_TEXT,
            embedding: admin.firestore.FieldValue.vector(vector), // Inyección Vectorial Nativa
            departmentId: 'DireccionCore',
            sourceAgent: 'AUDIT_SCRIPT',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Recuerdo inyectado permanentemente en [m2m_memory/secret_audit_test]');

        // 3. DETONACIÓN DEL AGENTE (Colección real 'm2m_tickets_ceoAgent')
        console.log(`🔹 Enviando pregunta al Orquestador M2M: "${TEST_QUESTION}"`);
        const ticketRef = await db.collection('m2m_tickets_ceoAgent').add({
            message: TEST_QUESTION,
            history: [],
            status: 'PENDING',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Ticket asíncrono creado: [${ticketRef.id}]. Esperando respuesta neuronal...`);

        // 4. ESCUCHA ACTIVA (Esperar a que Eventarc V2 procese)
        const unsubscribe = ticketRef.onSnapshot((snap) => {
            const data = snap.data();
            if (data && data.status === 'COMPLETED') {
                console.log('\n🟢 [RESULTADO DEL CÓRTEX (ceoAgentV2)]:\n');
                console.log('------------------------------------------------');
                console.log(data.reply);
                console.log('------------------------------------------------\n');

                if (data.reply.includes('ALPHA-ZERO-99')) {
                    console.log('🏆 ÉXITO ABSOLUTO: El Agente recuperó el secreto usando RAG Vectorial (Similitud Coseno).');
                } else {
                    console.log('❌ FALLO: El Agente alucinó o no la función findNearest no localizó la memoria.');
                }

                unsubscribe();
                process.exit(0);
            } else if (data && data.status === 'ERROR') {
                console.error('❌ ERROR EN CLOUD FUNCTION EVENTARC:', data.error);
                unsubscribe();
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('🔥 FALLO CRÍTICO EN SCRIPT:', error);
        process.exit(1);
    }
}

runAudit();
