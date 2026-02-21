const { chromium } = require('@playwright/test');

(async () => {
    console.log('--- 🟢 PRODUCTION MONITOR STARTED ---');
    console.log('--- TARGET: https://activa-sl-digital.web.app ---');
    console.log('--- INSTRUCTION: Log in if needed. Perform the "Save Session" test. ---');

    // Force Environment
    if (!process.env.HOME) process.env.HOME = 'C:\\Users\\Usuario';

    // Launch VISIBLE browser
    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized', '--no-sandbox']
    });

    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    // --- 👁️ TELEMETRY SYSTEM ---

    // 1. Console Analysis
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        // Filter out noise
        if (text.includes('[vite]') || text.includes('React DevTools')) return;

        if (type === 'error') console.log(`[🔴 ERROR] ${text}`);
        else if (type === 'warning') console.log(`[🟡 WARN] ${text}`);
        else console.log(`[ℹ️ LOG] ${text}`);

        if (text.includes('TITANIUM')) console.log(`[💎 TITANIUM_VERIFIED] ${text}`);
    });

    // 2. Network Sniffer (Firestore Writes)
    page.on('response', async res => {
        const url = res.url();
        if (url.includes('firestore.googleapis.com') && url.includes('Write')) {
            console.log(`[💾 DB WRITE] ${res.status()} - ${url.split('/').pop()}`);
        }
    });

    // Navigate to PRODUCTION (Target Specific Patient if possible, else Dashboard)
    // The user manually navigates, but we can try to point them there if they use our window.
    // However, since they use THEIR window, we just log where they are if we could see.
    // Since we are "Blind" to their window URL updates (unless we poll, but we don't have access),
    // we rely on network traffic to infer activity.

    // We update the intro log to confirm we are ready for the specific patient.
    console.log('--- 🟢 TARGET ACQUIRED: patients/0qFMmUhEuvyAXKjlrB2t ---');
    console.log('--- WAITING FOR DEPLOYMENT TO FINISH... ---');

    try {
        await page.goto('https://activa-sl-digital.web.app/dashboard');
        console.log('[✅ NAV] Loaded Production Dashboard');
    } catch (e) {
        console.log(`[❌ NAV FAIL] ${e.message}`);
    }

    // Keep alive until user closes
    await page.waitForEvent('close', { timeout: 0 });

    console.log('--- 🔴 MONITOR CLOSED ---');
    await browser.close();
})();
