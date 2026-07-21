const tbody = document.getElementById("tbody");
const searchInput = document.getElementById("searchInput");
const groupTitle = document.getElementById("groupTitle");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

const params = new URLSearchParams(location.search);
const slug = params.get("slug") || "";
const groupName = params.get("name") || slug;
groupTitle.textContent = groupName ? `Group: ${groupName}` : "Group Contacts";

let contacts = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function render(list) {
  tbody.innerHTML = list
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.countryCode)}</td><td>${escapeHtml(c.msisdn)}</td><td>${escapeHtml(
          c.name
        )}</td><td>${escapeHtml(c.designation)}</td></tr>`
    )
    .join("");
  resultCount.textContent = contacts.length ? `${list.length} of ${contacts.length} contact(s)` : "";
}

function matches(contact, term) {
  return Object.values(contact).some((v) => String(v).toLowerCase().includes(term));
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  render(term ? contacts.filter((c) => matches(c, term)) : contacts);
});

(async () => {
  if (!slug) {
    emptyState.hidden = false;
    return;
  }
  const res = await fetch(`/api/groups/${encodeURIComponent(slug)}/contacts`);
  contacts = res.ok ? await res.json() : [];
  emptyState.hidden = contacts.length > 0;
  render(contacts);
})();
