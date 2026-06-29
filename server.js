/**
 * Local web UI for running the WhatsApp template creation job and watching
 * live progress in the browser, instead of a bare terminal.
 *
 * SETUP / RUN
 * ------------
 *   node --env-file=.env server.js
 *   open http://localhost:4173
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const { CONFIG, getAccessToken, resolveTemplate, sleep } = require("./lib.js");
const templates = require("./templates.js");

const PORT = Number(process.env.PORT) || 4173;
const PUBLIC_DIR = path.join(__dirname, "public");
const RESULTS_PATH = path.join(__dirname, "results.json");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

let job = { running: false, results: [], paused: false, stopRequested: false, remainingMs: null, total: templates.length };
let clients = [];
let uploadedTemplates = null; // set via POST /api/templates/upload, in the bulk_templates.json shape converted to {name, body, example}

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) res.write(payload);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// Derives example values for a {{n}}-placeholder body when the source data
// (bulk_templates.json shape) has no example field of its own.
function deriveExample(body) {
  const numbers = [...new Set([...body.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1])))].sort((a, b) => a - b);
  return numbers.map((n) => `Sample ${n}`);
}

// Converts an uploaded bulk_templates.json-shaped entry into the
// {name, body, example} shape the WhatsApp creation API call expects.
function convertUploadedEntry(entry) {
  const name = String(entry.templateid || "").trim();
  const body = String(entry.whatsapp_template || "").trim();
  if (!name || !body) return null;
  return { name, body, example: deriveExample(body) };
}

function loadPreviousResults() {
  try {
    return JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function persistResults() {
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(job.results, null, 2));
}

// Waits up to `ms` (in ~1s steps), but freezes the countdown while job.paused
// is true and returns immediately if job.stopRequested becomes true. Called
// with ms=0 before each template purely to block on pause/stop.
async function waitInterruptible(ms) {
  let remaining = ms;
  while (true) {
    if (job.stopRequested) {
      job.remainingMs = null;
      return;
    }
    if (job.paused) {
      job.remainingMs = remaining > 0 ? remaining : null;
      broadcast({ type: "tick", remainingMs: job.remainingMs, paused: true });
      await sleep(500);
      continue;
    }
    if (remaining <= 0) {
      job.remainingMs = null;
      return;
    }
    job.remainingMs = remaining;
    broadcast({ type: "tick", remainingMs: remaining, paused: false });
    const step = Math.min(1000, remaining);
    await sleep(step);
    remaining -= step;
  }
}

async function runJob(templateList) {
  const previouslySucceeded = new Set(loadPreviousResults().filter((r) => r.ok).map((r) => r.name));
  job = { running: true, results: [], paused: false, stopRequested: false, remainingMs: null, total: templateList.length };
  broadcast({ type: "start", total: templateList.length });

  try {
    if (!CONFIG.WABA_ID || !CONFIG.USERNAME || !CONFIG.PASSWORD) {
      throw new Error("Missing WA_WABA_ID, WA_USERNAME, or WA_PASSWORD. Check your .env file.");
    }

    broadcast({ type: "log", message: "Fetching access token..." });
    const accessToken = await getAccessToken();
    broadcast({ type: "log", message: `Got access token. Creating ${templateList.length} templates...` });

    for (const tpl of templateList) {
      if (job.stopRequested) break;
      await waitInterruptible(0); // blocks here while paused, before touching the next template
      if (job.stopRequested) break;

      broadcast({ type: "progress", name: tpl.name, state: "running" });
      let result;
      try {
        result = await resolveTemplate(tpl, accessToken, previouslySucceeded);
        job.results.push(result);
        broadcast({
          type: "progress",
          name: tpl.name,
          state: result.skipped ? "skipped" : result.ok ? "success" : "failed",
          detail: result.skipped
            ? result.reason === "exists"
              ? "already exists on WhatsApp"
              : "assumed already created (from previous results.json — API check inconclusive)"
            : result.ok
              ? `id: ${result.data.id || "n/a"}, status: ${result.data.status || "PENDING"}`
              : `HTTP ${result.status} - ${JSON.stringify(result.data.error || result.data)}`,
        });
      } catch (err) {
        result = { name: tpl.name, ok: false, error: err.message };
        job.results.push(result);
        broadcast({ type: "progress", name: tpl.name, state: "failed", detail: err.message });
      }
      persistResults();

      if (result.skipped) continue; // no create call happened, no need to wait out the rate-limit delay

      if (job.stopRequested) break;
      await waitInterruptible(CONFIG.DELAY_MS);
      if (job.stopRequested) break;
    }

    const passed = job.results.filter((r) => r.ok).length;
    const payload = { passed, total: templateList.length, results: job.results };
    broadcast(job.stopRequested ? { type: "stopped", ...payload } : { type: "done", ...payload });
  } catch (err) {
    broadcast({ type: "error", message: err.message });
  } finally {
    job.running = false;
    job.paused = false;
    job.stopRequested = false;
    job.remainingMs = null;
  }
}

function serveStatic(req, res, pathname) {
  const filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === "/api/templates" && req.method === "GET") {
    const source = new URL(req.url, `http://${req.headers.host}`).searchParams.get("source");
    const list = source === "upload" ? uploadedTemplates || [] : templates;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(list.map((t) => ({ name: t.name }))));
    return;
  }

  if (pathname === "/api/templates/upload" && req.method === "POST") {
    readJsonBody(req)
      .then((parsed) => {
        if (!Array.isArray(parsed)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Expected a JSON array of templates." }));
          return;
        }
        const converted = parsed.map(convertUploadedEntry).filter(Boolean);
        const skipped = parsed.length - converted.length;
        uploadedTemplates = converted;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ count: converted.length, skipped, templates: converted.map((t) => ({ name: t.name })) }));
      })
      .catch(() => {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON file." }));
      });
    return;
  }

  if (pathname === "/api/state" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        running: job.running,
        paused: job.paused,
        remainingMs: job.remainingMs,
        results: job.results,
        total: job.total,
      })
    );
    return;
  }

  if (pathname === "/api/start" && req.method === "POST") {
    if (job.running) {
      res.writeHead(409, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "A run is already in progress." }));
      return;
    }
    readJsonBody(req)
      .then((body) => {
        const source = body.source === "upload" ? "upload" : "builtin";
        const list = source === "upload" ? uploadedTemplates : templates;
        if (!list || list.length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: source === "upload" ? "No file uploaded yet." : "No built-in templates found." }));
          return;
        }
        runJob(list);
        res.writeHead(202, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ started: true }));
      })
      .catch(() => {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request body." }));
      });
    return;
  }

  if (pathname === "/api/pause" && req.method === "POST") {
    if (!job.running) {
      res.writeHead(409, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No run in progress." }));
      return;
    }
    job.paused = true;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ paused: true }));
    return;
  }

  if (pathname === "/api/resume" && req.method === "POST") {
    if (!job.running) {
      res.writeHead(409, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No run in progress." }));
      return;
    }
    job.paused = false;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ paused: false }));
    return;
  }

  if (pathname === "/api/stop" && req.method === "POST") {
    if (!job.running) {
      res.writeHead(409, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No run in progress." }));
      return;
    }
    job.stopRequested = true;
    res.writeHead(202, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ stopping: true }));
    return;
  }

  if (pathname === "/api/events" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");
    clients.push(res);
    req.on("close", () => {
      clients = clients.filter((c) => c !== res);
    });
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Template creator UI running at http://localhost:${PORT}`);
});
