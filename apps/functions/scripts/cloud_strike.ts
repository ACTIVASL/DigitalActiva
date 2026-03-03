import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Configuracion Pública del Monorepo (Extraída de engine-auth)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || 'demo-api-key', // No crítico para funciones invocables públicas si no hay AppCheck forzado
    projectId: 'activa-sl-digital',
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1');

const agents = [
    'agentLegalV2',
    'agentOpsV2',
    'agentTechV2',
    'agentProductV2',
    'agentSupportV2',
    'agentMarketingV2',
    'agentSalesV2',
    'agentFinanceV2',
    'agentDirectorV2'
];

const message = process.argv[2] || "SOY GOOGLE ANTIGRAVITY HACIENDO PRUEBAS CLOUD-NATIVE";

const swarmData = {
    action: 'INSIGHT_ADD',
    payload: {
        type: 'opportunity',
        text: message
    }
};

async function launchCloudStrike() {
    console.log(`\n☁️ [CLOUD STRIKE M2M] Inicializando conexión SDK contra Firebase Gen2 Vía: activa-sl-digital (europe-west1)`);
    console.log(`🚀 Payload M2M: "${message}"`);

    const startTime = performance.now();

    const strikes = agents.map(async (agentName) => {
        try {
            // httpsCallable se encarga de resolver la URL .a.run.app de forma dinámica y envolver { data: ... }
            const agentCall = httpsCallable(functions, agentName);
            const response = await agentCall(swarmData);
            return { agent: agentName, status: 'SUCCESS', result: response.data };
        } catch (error: any) {
            return { agent: agentName, status: 'ERROR', reason: error.message || String(error) };
        }
    });

    const results = await Promise.all(strikes);
    const endTime = performance.now();

    const timeMs = Math.round(endTime - startTime);
    console.log(`\n✅ [SWARM M2M COMPLETADO EN ${timeMs}ms]`);

    results.forEach(res => {
        if (res.status === 'SUCCESS') {
            console.log(`  🟢 ${res.agent.padEnd(15)} -> INYECTADO (Data: ${JSON.stringify(res.result)})`);
        } else {
            console.log(`  🔴 ${res.agent.padEnd(15)} -> FALLO (${res.reason})`);
        }
    });
}

launchCloudStrike();
