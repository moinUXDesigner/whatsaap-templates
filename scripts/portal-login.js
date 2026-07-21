/**
 * One-time interactive login for the Smartta portal (smartta.aclwhatsapp.com).
 * Opens a real browser window so you can log in and complete MFA by hand,
 * then saves the authenticated session for the headless scraper scripts to
 * reuse (scrape-groups.js, scrape-contacts.js) until it expires.
 *
 * Run: npm run portal:login
 */
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { chromium } = require("playwright");
const { BASE_URL, STORAGE_STATE_PATH } = require("./portal-lib.js");

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, () => { rl.close(); resolve(); }));
}

(async () => {
  fs.mkdirSync(path.join(__dirname, "..", ".auth"), { recursive: true });

  const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.goto(BASE_URL);

  console.log(`Opened: ${BASE_URL}`);
  console.log("A new Chromium window should have opened - check your taskbar/Alt-Tab, it can open behind other windows.");
  console.log("You must log in (including MFA) INSIDE THAT WINDOW, not in your regular browser -");
  console.log("this script can only save the session from the window it's controlling.");
  await waitForEnter("Once you're logged in there and see the portal dashboard, press Enter here to save the session... ");

  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log(`Saved session to ${STORAGE_STATE_PATH}`);

  await browser.close();
})();
