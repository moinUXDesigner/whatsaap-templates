/**
 * Shared Smartta portal automation helper (Playwright), used by the
 * dev-time scraper scripts. Mirrors the plain-function/module.exports
 * style of the project's lib.js.
 */
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const BASE_URL = "https://smartta.aclwhatsapp.com";
const AUTH_DIR = path.join(__dirname, "..", ".auth");
const STORAGE_STATE_PATH = path.join(AUTH_DIR, "smartta-storage.json");

function requireStorageState() {
  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    throw new Error(`No saved portal session at ${STORAGE_STATE_PATH}. Run "npm run portal:login" first.`);
  }
  return STORAGE_STATE_PATH;
}

async function openAuthenticatedContext({ headless = true } = {}) {
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ storageState: requireStorageState() });
  return { browser, context };
}

// Call after navigating to a page that requires auth - if the portal bounced
// us to a login screen, the saved session has expired.
function assertStillLoggedIn(page, expectedPathFragment) {
  if (!page.url().includes(expectedPathFragment)) {
    throw new Error(
      `Expected to be on a page containing "${expectedPathFragment}" but landed on ${page.url()} - ` +
        `the saved session has likely expired. Run "npm run portal:login" again.`
    );
  }
}

module.exports = { BASE_URL, STORAGE_STATE_PATH, openAuthenticatedContext, assertStillLoggedIn };
