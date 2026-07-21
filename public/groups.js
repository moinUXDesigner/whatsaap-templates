const tbody = document.getElementById("tbody");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

let groups = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function render(list) {
  tbody.innerHTML = "";
  list.forEach((g) => {
    const tr = document.createElement("tr");
    tr.className = "clickable-row";
    tr.innerHTML = `<td>${escapeHtml(g.groupName)}</td><td>${escapeHtml(g.userCount)}</td><td>${escapeHtml(
      g.variableCount
    )}</td><td>${escapeHtml(g.uploadStatus)}</td><td>${escapeHtml(g.createdOn)}</td><td>${escapeHtml(g.updatedOn)}</td>`;
    tr.addEventListener("click", () => {
      location.href = `/group.html?slug=${encodeURIComponent(g.slug)}&name=${encodeURIComponent(g.groupName)}`;
    });
    tbody.appendChild(tr);
  });
  emptyState.hidden = list.length > 0;
}

function matches(group, term) {
  return Object.values(group).some((v) => String(v).toLowerCase().includes(term));
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  render(term ? groups.filter((g) => matches(g, term)) : groups);
});

(async () => {
  const res = await fetch("/api/groups");
  groups = await res.json();
  render(groups);
})();
