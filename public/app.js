const tbody = document.getElementById("tbody");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const logEl = document.getElementById("log");
const countdownEl = document.getElementById("countdown");
const summaryEl = document.getElementById("summary");

const rows = new Map();

function setRow(name, state, detail) {
  const tr = rows.get(name);
  if (!tr) return;
  const statusCell = tr.querySelector(".status");
  statusCell.textContent = state;
  statusCell.className = `status ${state}`;
  if (detail) tr.querySelector(".detail").textContent = detail;
}

function formatMs(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function renderTick(remainingMs, paused) {
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (paused) {
    countdownEl.textContent = remainingMs ? `Paused (${formatMs(remainingMs)} remaining when resumed)` : "Paused";
  } else if (remainingMs) {
    countdownEl.textContent = `Next attempt in: ${formatMs(remainingMs)}`;
  } else {
    countdownEl.textContent = "";
  }
}

function setRunningControls(running) {
  startBtn.disabled = running;
  pauseBtn.disabled = !running;
  stopBtn.disabled = !running;
  if (!running) {
    pauseBtn.textContent = "Pause";
    countdownEl.textContent = "";
  }
}

async function loadTemplates() {
  const res = await fetch("/api/templates");
  const templates = await res.json();
  tbody.innerHTML = "";
  rows.clear();
  templates.forEach((t, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td>${t.name}</td><td class="status pending">pending</td><td class="detail"></td>`;
    tbody.appendChild(tr);
    rows.set(t.name, tr);
  });
}

function applyResult(result) {
  const detail = result.skipped
    ? result.reason === "exists"
      ? "already exists on WhatsApp"
      : "assumed already created (from previous results.json — API check inconclusive)"
    : result.ok
      ? `id: ${result.data?.id || "n/a"}, status: ${result.data?.status || "PENDING"}`
      : `HTTP ${result.status || ""} - ${JSON.stringify(result.data?.error || result.data || result.error || "")}`;
  setRow(result.name, result.skipped ? "skipped" : result.ok ? "success" : "failed", detail);
}

async function syncState() {
  const res = await fetch("/api/state");
  const state = await res.json();
  state.results.forEach(applyResult);
  setRunningControls(state.running);
  if (state.running) {
    logEl.textContent = `Creating ${state.total} templates...`;
    renderTick(state.remainingMs, state.paused);
  }
}

function connectEvents() {
  const es = new EventSource("/api/events");
  es.onmessage = (e) => {
    const event = JSON.parse(e.data);
    if (event.type === "log") {
      logEl.textContent = event.message;
    } else if (event.type === "start") {
      summaryEl.innerHTML = "";
      logEl.textContent = `Creating ${event.total} templates...`;
      setRunningControls(true);
    } else if (event.type === "progress") {
      countdownEl.textContent = "";
      setRow(event.name, event.state, event.detail);
    } else if (event.type === "tick") {
      renderTick(event.remainingMs, event.paused);
    } else if (event.type === "done") {
      logEl.textContent = "";
      setRunningControls(false);
      const failed = event.results.filter((r) => !r.ok);
      summaryEl.innerHTML = failed.length
        ? `<strong>Done: ${event.passed}/${event.total} succeeded.</strong><br>Failed: ${failed
            .map((f) => f.name)
            .join(", ")}`
        : `<strong>Done: ${event.passed}/${event.total} succeeded.</strong> All templates created successfully.`;
    } else if (event.type === "stopped") {
      logEl.textContent = "";
      setRunningControls(false);
      summaryEl.innerHTML = `<strong>Stopped: ${event.passed}/${event.total} succeeded so far.</strong> Click Start to resume the rest later.`;
    } else if (event.type === "error") {
      setRunningControls(false);
      logEl.textContent = `Error: ${event.message}`;
    }
  };
}

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  summaryEl.innerHTML = "";
  const res = await fetch("/api/start", { method: "POST" });
  if (res.status === 409) {
    const data = await res.json();
    alert(data.error);
    startBtn.disabled = false;
  }
});

pauseBtn.addEventListener("click", async () => {
  const endpoint = pauseBtn.textContent === "Resume" ? "/api/resume" : "/api/pause";
  await fetch(endpoint, { method: "POST" });
});

stopBtn.addEventListener("click", async () => {
  if (!confirm("Stop the current run? Already-created templates are safe. You can resume the rest later by clicking Start again.")) {
    return;
  }
  stopBtn.disabled = true;
  await fetch("/api/stop", { method: "POST" });
});

(async () => {
  await loadTemplates();
  await syncState();
  connectEvents();
})();
