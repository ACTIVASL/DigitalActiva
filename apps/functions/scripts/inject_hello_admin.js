const admin = require('firebase-admin');

// Inicializa el Admin SDK. Al pasar projectId asume las credenciales por defecto (gcloud o emulator).
admin.initializeApp({ projectId: "activa-sl-digital" });

const db = admin.firestore();

async function fire() {
    console.log("🚀 [ATOM M2M ADMIN] Entrando al tejido de Firebase con privilegios absolutos...");
    const canvasRef = db.collection('system_context').doc('master_canvas');

    try {
        const snap = await canvasRef.get();
        let data = {};
        if (snap.exists) {
            data = snap.data();
        }

        // Marketing se mapea en el departamento 'channels'
        const currentChannels = data.channels || { insights: [] };
        const currentInsights = currentChannels.insights || [];

        const newInsight = {
            id: Date.now(),
            text: "HOLA. Inyección M2M Directa al departamento de Marketing. Zero clics, Serverless puro.",
            type: "opportunity"
        };

        const updatedChannels = {
            ...currentChannels,
            insights: [newInsight, ...currentInsights]
        };

        await canvasRef.set({ channels: updatedChannels }, { merge: true });

        console.log(`✅ [SUCCESS] Nota inyectada en Marketing (channels) usando ADMIN.`);
        console.log(`👁️ Súper Atom: La mutación está en la base de datos. Revisa el Canvas.`);
        process.exit(0);

    } catch (e) {
        console.error("❌ Fallo crítico en M2M Admin:", e);
        process.exit(1);
    }
}

fire();
