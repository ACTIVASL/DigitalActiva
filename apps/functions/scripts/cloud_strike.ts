import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

// En un entorno de producción, las Application Default Credentials (ADC) de GCP
// autorizan la inyección atómica a Firestore.
initializeApp({
    projectId: 'activa-sl-digital',
});

const db = getFirestore();

const agents = [
    { name: 'agentLegalV2', dept: 'key_partners' },
    { name: 'agentOpsV2', dept: 'key_activities' },
    { name: 'agentTechV2', dept: 'key_resources' },
    { name: 'agentProductV2', dept: 'value_propositions' },
    { name: 'agentSupportV2', dept: 'customer_relationships' },
    { name: 'agentMarketingV2', dept: 'channels' },
    { name: 'agentSalesV2', dept: 'customer_segments' },
    { name: 'agentFinanceV2', dept: 'cost_structure' },
    { name: 'agentDirectorV2', dept: 'revenue_streams' },
    // Añadimos también los agentes M2M core para pruebas de penetración paralela
    { name: 'ceoAgentV2', dept: 'ceoAgent' },
    { name: 'opsAgentCoreV2', dept: 'opsAgent' },
    { name: 'salesAgentCoreV2', dept: 'salesAgent' }
];

const message = process.argv[2] || "SOY GOOGLE ANTIGRAVITY HACIENDO PRUEBAS EVENTARC (M2M ASÍNCRONO)";

async function launchCloudStrike() {
    console.log(`\n☁️ [CLOUD STRIKE M2M - EVENTARC] Inicializando inyección Firestore en activa-sl-digital (europe-west1)`);
    console.log(`🚀 Payload M2M: "${message}"`);

    const startTime = performance.now();

    const strikes = agents.map(async (agentData) => {
        try {
            const ticketId = crypto.randomUUID();
            const collectionPath = `m2m_tickets_${agentData.dept}`;
            const docRef = db.collection(collectionPath).doc(ticketId);

            // Inyectamos el payload M2M que la función Eventarc está esperando
            // En swarmAgents.ts: { action: 'INSIGHT_ADD', payload: { ... } }
            // En atomChat.ts: { message: ... }

            const payload = agentData.name.includes('CoreV2') || agentData.name === 'ceoAgentV2'
                ? { message, status: 'PENDING' }
                : { action: 'INSIGHT_ADD', payload: { type: 'opportunity', text: message }, status: 'PENDING' };

            await docRef.set(payload);
            return { agent: agentData.name, status: 'INJECTED', ticketId, collection: collectionPath };
        } catch (error: any) {
            return { agent: agentData.name, status: 'ERROR', reason: error.message || String(error) };
        }
    });

    const results = await Promise.all(strikes);
    const endTime = performance.now();

    const timeMs = Math.round(endTime - startTime);
    console.log(`\n✅ [INYECCIÓN FIRESTORE COMPLETADA EN ${timeMs}ms]`);
    console.log(`📡 Esperando activación de triggers Eventarc en Google Cloud...`);

    results.forEach(res => {
        if (res.status === 'INJECTED') {
            console.log(`  🟢 ${res.agent.padEnd(15)} -> INYECTADO (Ticket: ${res.collection}/${res.ticketId})`);
        } else {
            console.log(`  🔴 ${res.agent.padEnd(15)} -> FALLO (${res.reason})`);
        }
    });
}

launchCloudStrike();
