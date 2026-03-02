// 🤖 ACTIVA M2M INJECTION SCRIPT (PRUEBA EN VIVO)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyByEGZMSQu7-G5bQ9t6r4hJlm8USFxX2ko",
    authDomain: "activa-sl-digital.firebaseapp.com",
    projectId: "activa-sl-digital",
    storageBucket: "activa-sl-digital.firebasestorage.app",
    messagingSenderId: "426977589558",
    appId: "1:426977589558:web:5eace8b73c7fece7ffdb97"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fire() {
    console.log("🚀 [ATOM M2M] Entrando al tejido de Firebase...");
    const canvasRef = doc(db, 'system_context', 'master_canvas');

    try {
        const snap = await getDoc(canvasRef);
        let data: any = {};
        if (snap.exists()) data = snap.data();

        // Marketing -> channels
        const currentChannels = data.channels || { insights: [] };

        const newInsight = {
            id: Date.now(),
            text: "HOLA MUNDO B2B. Inyección M2M ejecutada al departamento de Marketing. Zero clics, zero UI.",
            type: "opportunity"
        };

        const updatedChannels = {
            ...currentChannels,
            insights: [newInsight, ...currentChannels.insights]
        };

        await setDoc(canvasRef, { channels: updatedChannels }, { merge: true });

        console.log(`✅ [SUCCESS] Nota inyectada en Marketing (channels).`);
        console.log(`👁️ Súper Atom: Misión cumplida. Revisa tu Canvas ahora.`);
        process.exit(0);

    } catch (e) {
        console.error("❌ Fallo en la matriz M2M:", e);
        process.exit(1);
    }
}

fire();
