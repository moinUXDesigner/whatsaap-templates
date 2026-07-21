/**
 * APTRANSCO Bill Tracking System — Bulk WhatsApp Template Creator
 * ------------------------------------------------------------------
 * Creates all 26 WhatsApp message templates (converted from the SMS
 * templates doc) in ONE run, using Sinch India's (ACL) WhatsApp
 * Business Messaging API — the real API behind your Smartta portal:
 *
 *   Docs: https://docs.aclwhatsapp.com/wa/Template%20Management%20API/Create%20Template
 *
 * AUTH is 2-step:
 *   1. POST username/password to the token endpoint -> get access_token
 *   2. Use that access_token as a Bearer token on message_templates calls
 *
 * SETUP
 * ------
 * 1. Node.js 18+ (has global fetch built in — no extra installs needed)
 * 2. Copy .env.example to .env and fill in your real WABA ID + Sinch
 *    username/password (issued to you at onboarding)
 * 3. node create_templates.js
 *
 * The script will:
 *   - Fetch a fresh access token
 *   - Create templates one by one (with a short delay to avoid rate limits)
 *   - Print PASS/FAIL for each
 *   - Write a full results log to results.json at the end
 */

const fs = require("node:fs");

// Loads .env from cwd automatically so plain `node create_templates.js` works,
// not just `node --env-file=.env create_templates.js`. No-op if .env is missing.
try {
  process.loadEnvFile();
} catch {}

const { CONFIG, getAccessToken, resolveTemplate, sleep } = require("./lib.js");
const templates = require("./templates.js");

function loadPreviousResults() {
  try {
    return JSON.parse(fs.readFileSync("results.json", "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  if (!CONFIG.WABA_ID || !CONFIG.USERNAME || !CONFIG.PASSWORD) {
    console.error(
      "\n❌ Missing WA_WABA_ID, WA_USERNAME, or WA_PASSWORD. Copy .env.example to .env, fill it in, " +
        "and run with: node create_templates.js\n"
    );
    process.exit(1);
  }

  const previouslySucceeded = new Set(loadPreviousResults().filter((r) => r.ok).map((r) => r.name));

  console.log("Fetching access token...");
  const accessToken = await getAccessToken();
  console.log("Got access token.\n");

  console.log(`Creating ${templates.length} WhatsApp templates...\n`);

  const results = [];

  for (const tpl of templates) {
    process.stdout.write(`-> ${tpl.name} ... `);
    try {
      const result = await resolveTemplate(tpl, accessToken, previouslySucceeded);
      if (result.skipped) {
        if (result.reason === "exists") {
          const existing = result.data && Array.isArray(result.data.data) ? result.data.data[0] : null;
          console.log(
            existing
              ? `SKIPPED (already exists - id: ${existing.id || "n/a"}, status: ${existing.status || "UNKNOWN"})`
              : "SKIPPED (already exists on WhatsApp)"
          );
        } else {
          console.log("SKIPPED (assumed from previous results.json)");
        }
      } else if (result.ok) {
        console.log(`OK (id: ${result.data.id || "n/a"}, status: ${result.data.status || "PENDING"})`);
      } else {
        console.log(`FAILED (HTTP ${result.status}) - ${JSON.stringify(result.data.error || result.data)}`);
      }
      results.push(result);
      fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
      if (result.skipped) continue; // no create call happened, no need for the rate-limit delay
    } catch (err) {
      console.log(`ERROR - ${err.message}`);
      results.push({ name: tpl.name, ok: false, error: err.message });
      fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
    }
    await sleep(CONFIG.DELAY_MS);
  }

  const passed = results.filter((r) => r.ok).length;
  console.log(`\nDone: ${passed}/${templates.length} succeeded. Full log written to results.json`);
}

main();
