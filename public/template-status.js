const tbody = document.getElementById("tbody");
const log = document.getElementById("log");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");

let templates = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function statusClass(status) {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "pending";
    case "REJECTED":
    case "DISABLED":
    case "PAUSED":
      return "failed";
    default:
      return "pending";
  }
}

function truncate(text, max) {
  const s = String(text || "");
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function render(list) {
  tbody.innerHTML = "";
  list.forEach((t, i) => {
    const tr = document.createElement("tr");
    if (t.status === "PENDING") tr.className = "row-pending";
    tr.innerHTML = `<td>${i + 1}</td><td>${escapeHtml(t.name)}</td><td>${escapeHtml(t.category || "")}</td><td class="status ${statusClass(
      t.status
    )}">${escapeHtml(t.status || "unknown")}</td><td class="detail" title="${escapeHtml(t.body || "")}">${escapeHtml(
      truncate(t.body, 70)
    )}</td><td>${escapeHtml(t.language || "")}</td>`;
    tbody.appendChild(tr);
  });
  log.textContent = `Showing ${list.length} of ${templates.length} template(s).`;
}

function applyFilter() {
  const term = searchInput.value.trim().toLowerCase();
  render(term ? templates.filter((t) => t.name.toLowerCase().includes(term)) : templates);
}

async function refresh() {
  refreshBtn.disabled = true;
  log.textContent = "Loading templates from WhatsApp...";
  try {
    const res = await fetch("/api/templates/all");
    const data = await res.json();
    if (!res.ok) {
      log.textContent = data.error || "Failed to load templates.";
      return;
    }
    templates = data;
    applyFilter();
  } catch (err) {
    log.textContent = `Error: ${err.message}`;
  } finally {
    refreshBtn.disabled = false;
  }
}

refreshBtn.addEventListener("click", refresh);
searchInput.addEventListener("input", applyFilter);
refresh();
