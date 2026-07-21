/**
 * Scrapes the Smartta portal's groups list (smartta.aclwhatsapp.com/group/list)
 * into data/groups.json, using the session saved by portal-login.js.
 *
 * Run: npm run scrape:groups
 */
const path = require("node:path");
const fs = require("node:fs");
const { openAuthenticatedContext, assertStillLoggedIn, BASE_URL } = require("./portal-lib.js");

const DATA_DIR = path.join(__dirname, "..", "data");
const GROUPS_PATH = path.join(DATA_DIR, "groups.json");

function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Dumps every <table> on the page (index, id/class, row count, first row's
// cell texts) so the right selector can be identified from real DOM
// structure instead of guessing. Run with DEBUG_TABLES=1.
async function dumpTables(page) {
  const info = await page.$$eval("table", (tables) =>
    tables.map((t, i) => {
      const rows = [...t.querySelectorAll("tbody tr")];
      const firstRowCells = rows[0] ? [...rows[0].querySelectorAll("td")].map((td) => td.textContent.trim()) : [];
      return {
        index: i,
        id: t.id || null,
        class: t.className || null,
        rowCount: rows.length,
        firstRowCells,
      };
    })
  );
  console.log(`Found ${info.length} <table> element(s) on the page:`);
  console.log(JSON.stringify(info, null, 2));
}

async function scrapeGroups() {
  const headed = process.env.DEBUG_HEADED === "1";
  const { browser, context } = await openAuthenticatedContext({ headless: !headed });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/group/list`, { waitUntil: "networkidle" });
  assertStillLoggedIn(page, "/group/list");

  // The table can still be hydrating client-side after network requests
  // settle - wait for an actual non-empty cell before scraping, instead of
  // trusting networkidle alone.
  await page
    .waitForFunction(
      () => [...document.querySelectorAll("table tbody tr td")].some((td) => td.textContent.trim().length > 0),
      { timeout: 15000 }
    )
    .catch(() => console.warn("Warning: no non-empty table cell appeared within 15s - scraping whatever is there."));

  if (process.env.DEBUG_TABLES === "1") {
    await dumpTables(page);
  }

  const groups = await page.$$eval("table tbody tr", (rows) =>
    rows.map((tr) => {
      const cells = [...tr.querySelectorAll("td")].map((td) => td.textContent.trim());
      return {
        groupName: cells[0],
        userCount: Number(cells[1]) || 0,
        variableCount: Number(cells[2]) || 0,
        uploadStatus: cells[3],
        createdOn: cells[4],
        updatedOn: cells[5],
      };
    })
  );

  const valid = groups.filter((g) => g.groupName);
  const skipped = groups.length - valid.length;
  if (skipped > 0) {
    console.warn(`Skipped ${skipped} row(s) with no group name (likely picked up a non-groups table - try DEBUG_TABLES=1).`);
  }

  const withSlugs = valid.map((g) => ({ ...g, slug: slugify(g.groupName) }));

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(GROUPS_PATH, JSON.stringify(withSlugs, null, 2));
  console.log(`Wrote ${withSlugs.length} group(s) to ${GROUPS_PATH}`);

  await browser.close();
  return withSlugs;
}

if (require.main === module) {
  scrapeGroups().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { scrapeGroups, slugify, GROUPS_PATH };
