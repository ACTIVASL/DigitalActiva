const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('--- MANUAL BROWSER OVERRIDE STARTING ---');

    // Force HOME if missing
    if (!process.env.HOME) {
        console.log('Injecting HOME variable...');
        process.env.HOME = 'C:\\Users\\Usuario';
    }

    console.log('Launching Chromium...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // CAPTURE CONSOLE LOGS
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[BROWSER ERROR]: ${err}`));

    console.log('Navigating to PRODUCTION: https://activa-sl-digital.web.app/...');
    await page.goto('https://activa-sl-digital.web.app/');

    // Wait for React to mount
    await page.waitForTimeout(3000);

    const title = await page.title();
    console.log('Page Title:', title);

    // Check for critical elements
    const loginVisible = await page.getByText('Entrar').isVisible().catch(() => false);
    const dashboardVisible = await page.getByText('Panel').isVisible().catch(() => false);
    const loadingVisible = await page.locator('#splash-screen').isVisible().catch(() => false);

    console.log('--- DIAGNOSTIC DUMP ---');
    console.log('Login Visible:', loginVisible);
    console.log('Dashboard Visible:', dashboardVisible);
    console.log('Splash/Loading Visible:', loadingVisible);

    // Attempt to take a Screenshot (Proof of Life)
    const screenshotPath = path.resolve('evidence.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await browser.close();
    console.log('--- MANUAL BROWSER OVERRIDE SUCCESS ---');
})();
