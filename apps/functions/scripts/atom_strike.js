const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- ATOM STRIKE: THE GOD MODE CLI ---
// Modo de uso: node atom_strike.js <coleccion> <documento> <ruta_json_payload_o_json_bruto>

async function strike() {
    console.log("⚡ [ATOM STRIKE]: Inicializando Matriz de Inyección...");

    // 1. Cargar Credenciales
    const keyPath = path.join(__dirname, 'atom_key.json');
    if (!fs.existsSync(keyPath)) {
        console.warn("⚠️ NO SE ENCONTRÓ LLAVE MAESTRA ABSOLUTA (atom_key.json). Intentando con credenciales por defecto del sistema (ADC)...");
        admin.initializeApp({ projectId: "activa-sl-digital" });
    } else {
        console.log("🔐 Llave Maestra encontrada. Bypass de seguridad activado.");
        const serviceAccount = require(keyPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();

    // Parse args
    const collection = process.argv[2];
    const doc = process.argv[3];
    const rawPayload = process.argv[4];

    if (!collection || !doc || !rawPayload) {
        console.error("❌ USO: node atom_strike.js <coleccion> <documento> '<json_payload>'");
        process.exit(1);
    }

    try {
        const payload = JSON.parse(rawPayload);
        console.log(`📡 Inyectando en [${collection}/${doc}]... Payload:`, payload);

        // Operación ATOMICA de Fusión (Merge)
        const ref = db.collection(collection).doc(doc);
        await ref.set(payload, { merge: true });

        console.log("✅ [IMPACTO CONFIRMADO]: Base de datos alterada. Esperando reacción del Cristal Sensorial (Frontend).");
        process.exit(0);
    } catch (e) {
        console.error("🔥 FALLO CRÍTICO EN INYECCIÓN M2M:", e);
        process.exit(1);
    }
}

strike();
