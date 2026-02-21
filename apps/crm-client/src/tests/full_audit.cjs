const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// CONFIG
const TARGET_URL = 'http://localhost:5173';
const USER_EMAIL = 'info@activa-sl.digital';
const DUMMY_PASS = 'waiting_for_input';

(async () => {
    console.log(`--- TITANIUM AUDIT: ${new Date().toISOString()} ---`);

    // 1. Environment Injection (Break the Blockade)
    if (!process.env.HOME) {
        console.log('[SYS] Injecting HOME variable for Playwright...');
        process.env.HOME = 'C:\\Users\\Usuario';
    }

    // 2. Launch Browser
    console.log('[BROWSER] Launching Chromium (Headless)...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // 3. Navigation
    console.log(`[NAV] Going to ${TARGET_URL}...`);
    await page.goto(TARGET_URL);
    await page.waitForTimeout(2000);

    // 4. Login Detection
    const title = await page.title();
    console.log(`[PAGE] Title: "${title}"`);

    // Detect inputs
    const emailInput = await page.locator('input[type="email"], input[name="email"]');
    const passInput = await page.locator('input[type="password"], input[name="password"]');
    const submitBtn = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');

    if (await emailInput.count() > 0) {
        console.log('[LOGIN] Login Form DETECTED.');

        // 5. Interaction Test (Type Email)
        await emailInput.first().fill(USER_EMAIL);
        console.log(`[INPUT] Typed email: ${USER_EMAIL}`);

        if (await passInput.count() > 0) {
            console.log('[INPUT] Password field available.');
            // note: we stop here or type dummy
            await passInput.first().fill(DUMMY_PASS);
            console.log('[INPUT] Dummy password typed.');
        }

        // Screenshot login state
        const loginShot = path.resolve('audit_login_ready.png');
        await page.screenshot({ path: loginShot });
        console.log(`[EVIDENCE] Login screen captured: ${loginShot}`);

    } else {
        console.log('[WARN] Login form NOT detected. Are we already logged in?');
        const html = await page.content();
        console.log('[DEBUG] Page HTML snippet:', html.slice(0, 500));
    }

    console.log('[STATUS] Audit Ready. Waiting for credentials to proceed with E2E Testing.');

    await browser.close();
})();
