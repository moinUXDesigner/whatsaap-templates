/**
 * Scrapes each group's contact list (name/number) from the Smartta portal
 * into data/contacts/<slug>.json, using the session saved by portal-login.js
 * and the group list written by scrape-groups.js.
 *
 * The contacts table (smartta.aclwhatsapp.com/group/contact/list) is
 * DOM-paginated (10 rows/page, "Show entries" dropdown + a pager). This
 * script drives that UI directly with Playwright rather than assuming a
 * JSON API exists behind it - none was confirmed. If the portal's table
 * selectors change, the locators below (search "TBD-confirm") are the ones
 * to adjust.
 *
 * Set DEBUG_NETWORK=1 to log every request/response while scraping the
 * first group - useful for spotting a faster JSON API if one exists.
 *
 * Run: npm run scrape:contacts
 */
const path = require("node:path");
const fs = require("node:fs");
const { openAuthenticatedContext, assertStillLoggedIn, BASE_URL } = require("./portal-lib.js");
const { GROUPS_PATH } = require("./scrape-groups.js");

const CONTACTS_DIR = path.join(__dirname, "..", "data", "contacts");
const MAX_PAGES = 500; // safety cap so a selector bug can't loop forever

async function openGroupContacts(page, groupName) {
  await page.goto(`${BASE_URL}/group/list`, { waitUntil: "networkidle" });
  assertStillLoggedIn(page, "/group/list");

  // TBD-confirm: assumes the Action column's 2nd control (after the edit
  // pencil) is the "view contacts" eye icon, per the observed row layout.
  const row = page.locator("table tbody tr", { hasText: groupName });
  const actionCell = row.locator("td").last();
  const actionControls = actionCell.locator("a, button");
  await actionControls.nth(1).click();

  await page.waitForURL(/\/group\/contact\/list/, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
}

// TBD-confirm: picks the largest numeric option in the first <select> on the
// page (the "Show N entries" dropdown), to cut down the number of pages.
async function setLargestPageSize(page) {
  const select = page.locator("select").first();
  if (!(await select.count())) return;
  const options = await select.locator("option").allTextContents();
  const numeric = options.map((o) => parseInt(o, 10)).filter((n) => !Number.isNaN(n));
  if (!numeric.length) return;
  const largest = Math.max(...numeric);
  await select.selectOption({ label: String(largest) });
  await page.waitForLoadState("networkidle");
}

function mapRow(cells) {
  return { countryCode: cells[0], msisdn: cells[1], name: cells[2], designation: cells[3] };
}

// TBD-confirm: "next page" control is assumed to be a link/button containing
// "»", disabled (skip) once its parent <li> carries a "disabled" class.
async function scrapeAllPages(page) {
  const all = [];
  for (let i = 0; i < MAX_PAGES; i++) {
    const rows = await page.$$eval("table tbody tr", (trs) =>
      trs.map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent.trim()))
    );
    all.push(...rows.map(mapRow));

    const nextLink = page.locator('a:has-text("»"), button:has-text("»")').first();
    if (!(await nextLink.count())) break;
    const disabled = await nextLink.evaluate((el) => {
      const li = el.closest("li");
      return (li && li.classList.contains("disabled")) || el.hasAttribute("disabled");
    });
    if (disabled) break;

    await nextLink.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(250); // politeness delay between page loads
  }
  return all;
}

function attachDebugLogging(page) {
  page.on("request", (req) => console.log(`[net] -> ${req.method()} ${req.url()}`));
  page.on("response", (res) => console.log(`[net] <- ${res.status()} ${res.url()}`));
}

async function scrapeContacts() {
  if (!fs.existsSync(GROUPS_PATH)) {
    throw new Error(`${GROUPS_PATH} not found. Run "npm run scrape:groups" first.`);
  }
  const groups = JSON.parse(fs.readFileSync(GROUPS_PATH, "utf8"));
  const { browser, context } = await openAuthenticatedContext({ headless: true });
  fs.mkdirSync(CONTACTS_DIR, { recursive: true });

  for (const [i, group] of groups.entries()) {
    console.log(`Scraping contacts for "${group.groupName}" (${group.userCount} expected)...`);
    const page = await context.newPage();
    if (process.env.DEBUG_NETWORK === "1" && i === 0) attachDebugLogging(page);

    await openGroupContacts(page, group.groupName);
    await setLargestPageSize(page);
    const contacts = await scrapeAllPages(page);

    const outPath = path.join(CONTACTS_DIR, `${group.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(contacts, null, 2));
    console.log(`  wrote ${contacts.length} contact(s) to ${outPath}`);
    await page.close();
  }

  await browser.close();
}

if (require.main === module) {
  scrapeContacts().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { scrapeContacts };
