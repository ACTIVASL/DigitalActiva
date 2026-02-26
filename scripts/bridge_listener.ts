// scripts/bridge_listener.ts
import * as admin from 'firebase-admin';

// Check if Firebase Admin is initialized.
// If run via standard npm run scripts in our monorepo where GOOGLE_APPLICATION_CREDENTIALS
// is set, this will pick it up automatically.
if (!admin.apps.length) {
    console.log("⚡ [ANTIGRAVITY BRIDGE]: Initializing Firebase Admin...");
    admin.initializeApp();
}

const db = admin.firestore();
const bridgeRef = db.collection('system_bridge').doc('atom_channel');

console.log("==========================================");
console.log("⚛️ TITANIUM BRIDGE LISTENER ACTIVE ⚛️");
console.log("📡 Listening to: system_bridge/atom_channel");
console.log("==========================================");

// The Core Listener
bridgeRef.onSnapshot(async (snapshot) => {
    if (!snapshot.exists) {
        console.log("⏳ [Antigravity]: Waiting for Atom API... Document missing, creating default shell...");
        await bridgeRef.set({
            command: "idle",
            status: "ready",
            payload: {},
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            response: ""
        });
        return;
    }

    const data = snapshot.data();

    // Check if there is a pending command from Atom
    if (data && data.status === 'pending') {
        processCommand(data.command, data.payload, snapshot.ref);
    }
}, (err) => {
    console.error("❌ [Antigravity ERROR]: Listener detached.", err);
});


// Command Router / Executor
async function processCommand(command: string, payload: any, ref: FirebaseFirestore.DocumentReference) {
    console.log(`\n📥 [ATOM COMMAND RECEIVED]: '${command}'`);

    // Default immediate lock so Atom knows we are working on it.
    await ref.update({ status: 'processing' });

    let responseData = "";

    try {
        switch (command.toLowerCase()) {
            case 'ping':
                responseData = "PONG. Antigravity System Active.";
                break;
            case 'secret':
            case 'get_secret':
            case 'dime_la_palabra':
                console.log("🔐 [Antigravity]: Atom requested the Hive Mind Secret.");
                responseData = "JUAN3:16";
                break;
            case 'status':
                responseData = "🟢 All Systems Nominal. Monorepo Sync OK.";
                break;
            default:
                console.log(`⚠️ [Antigravity]: Unknown command from Atom: ${command}`);
                responseData = `ERROR: Unrecognized command '${command}'. Supported: ping, status, secret.`;
                break;
        }

        console.log(`📤 [ANTIGRAVITY EXECUTING]: Returning Response...`);

        // Write the result back to Atom
        await ref.update({
            response: responseData,
            status: 'completed',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ [ANTIGRAVITY DONE]: Response delivered to Atom.\n`);

    } catch (error: any) {
        console.error(`💥 [ANTIGRAVITY CRASH]: Error executing command`, error);
        await ref.update({
            response: `EXECUTION ERROR: ${error.message}`,
            status: 'error',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }
}

// Keep process running
process.on('SIGINT', () => {
    console.log('\n🛑 [ANTIGRAVITY BRIDGE]: Shutting down listener...');
    process.exit(0);
});
