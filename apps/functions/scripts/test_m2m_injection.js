/**
 * TEST M2M 10/10 - ACTIVA S.L. API-FIRST
 * Script local para simular la inyección de una orden de IA (Perplexity/Súper Atom)
 * hacia el Canvas Reactivo.
 * 
 * Uso local (Si el emulador está corriendo):
 * node test_m2m_injection.js
 */

const axios = require('axios');

// Cambiar esta URL por la de producción una vez desplegado en GCP
const TARGET_URL = 'http://127.0.0.1:5001/activa-sl-corporate/europe-west1/m2mRouter';
const BEARER_TOKEN = 'SUPER_ATOM_CORE_2026';

async function firePayload() {
    console.log("🚀 [M2M TEST] Iniciando inyección desde agente en la sombra...");

    const payload10_10 = {
        "_audit_meta": {
            "source_agent": "SUPER_ATOM_CORE",
            "action_type": "UPDATE",
            "target_collection": "system_context",
            "confidence_score": 0.99,
            "execution_time_ms": 42
        },
        "payload": {
            // Actualizamos la colección maestra que escucha el Canvas
            "id": "master_canvas",
            "status": "ready",
            "customer_segments": {
                "insights": [
                    { "id": Date.now(), "text": "Nuevo nicho B2B detectado: Clínicas privadas Madrid centro", "type": "opportunity" },
                    { "id": Date.now() + 1, "text": "Competencia agresiva en pauta digital", "type": "risk" }
                ]
            }
        }
    };

    try {
        const start = Date.now();
        const response = await axios.post(TARGET_URL, payload10_10, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        const elapsed = Date.now() - start;

        console.log(`✅ [M2M SUCCESS] Inyección completada en ${elapsed}ms.`);
        console.log(`📦 Respuesta del Enrutador:`, response.data.message);
        console.log(`\n👁️ Revisa el 'StrategicCanvas' en tu navegador. Debería haber parpadeado y actualizado el segmento de clientes sin recargar la página.`);
    } catch (error) {
        console.error("❌ [M2M ERROR] Fallo en la comunicación con la matriz Firebase:");
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
            console.log("Asegúrate de que estás corriendo los emuladores de Firebase: 'npm run serve' en /apps/functions");
        }
    }
}

firePayload();
