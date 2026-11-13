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
    tr.className = (tr.className + " clickable").trim();
    tr.addEventListener("click", () => showDetails(t));
    tbody.appendChild(tr);
  });
  log.textContent = `Showing ${list.length} of ${templates.length} template(s).`;
}

const dialog = document.getElementById("detailDialog");
document.getElementById("dlgClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

function showDetails(t) {
  document.getElementById("dlgTitle").textContent = t.name;
  const rows = [
    ["Status", `<span class="status ${statusClass(t.status)}">${escapeHtml(t.status || "unknown")}</span>`],
    ["Category", escapeHtml(t.category || "-")],
    ["Language", escapeHtml(t.language || "-")],
    ["Template ID", escapeHtml(t.id || "-")],
  ];
  if (t.rejected_reason && t.rejected_reason !== "NONE") rows.push(["Rejected reason", escapeHtml(t.rejected_reason)]);
  if (t.quality_score) rows.push(["Quality", escapeHtml(typeof t.quality_score === "object" ? t.quality_score.score || JSON.stringify(t.quality_score) : t.quality_score)]);
  let html = `<table class="dlg-meta">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table>`;
  const comps = Array.isArray(t.components) ? t.components : [];
  if (comps.length) {
    html += comps.map((c) => {
      let inner = c.text ? `<pre>${escapeHtml(c.text)}</pre>` : "";
      if (c.format && c.format !== "TEXT") inner = `<div>Format: ${escapeHtml(c.format)}</div>` + inner;
      if (Array.isArray(c.buttons)) inner += c.buttons.map((b) => `<div>Button: ${escapeHtml(b.type)} - ${escapeHtml(b.text || "")}${b.url ? " (" + escapeHtml(b.url) + ")" : ""}${b.phone_number ? " (" + escapeHtml(b.phone_number) + ")" : ""}</div>`).join("");
      const ex = c.example && (c.example.body_text || c.example.header_text);
      if (ex) inner += `<div class="dlg-ex">Example values: ${escapeHtml(JSON.stringify(ex.length === 1 ? ex[0] : ex))}</div>`;
      return `<h3>${escapeHtml(c.type)}</h3>${inner}`;
    }).join("");
  } else {
    html += `<h3>BODY</h3><pre>${escapeHtml(t.body || "(none)")}</pre>`;
  }
  document.getElementById("dlgBody").innerHTML = html;
  dialog.showModal();
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
