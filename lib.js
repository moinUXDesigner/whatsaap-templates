/**
 * Shared Sinch/ACL WhatsApp Template Management API logic, used by both
 * the CLI script (create_templates.js) and the web UI (server.js).
 */
const ENV = process.env.WA_ENV || "production"; // "production" or "uat"

const ENDPOINTS = {
  production: {
    TOKEN_URL: "https://auth.aclwhatsapp.com/realms/ipmessaging/protocol/openid-connect/token",
    BASE_URL: "https://api.aclwhatsapp.com",
  },
  uat: {
    TOKEN_URL: "https://apiuat.aclwhatsapp.com/auth/realms/ipmessaging/protocol/openid-connect/token",
    BASE_URL: "https://apiuat.aclwhatsapp.com",
  },
};

const CONFIG = {
  WABA_ID: process.env.WA_WABA_ID || "",
  USERNAME: process.env.WA_USERNAME || "",
  PASSWORD: process.env.WA_PASSWORD || "",
  DELAY_MS: Number(process.env.WA_DELAY_MS) || 180000, // pause between requests to stay under rate limits
};

const { TOKEN_URL, BASE_URL } = ENDPOINTS[ENV];

// All templates are transactional bill-status notifications -> Utility category
// (ACL/Sinch docs use Title-case enum values: "Marketing" / "Utility")
const CATEGORY = "Utility";
const LANGUAGE = "en";

async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: "ipmessaging-client",
    username: CONFIG.USERNAME,
    password: CONFIG.PASSWORD,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`Failed to get access token (HTTP ${res.status}): ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

function buildPayload(tpl) {
  return {
    name: tpl.name,
    language: LANGUAGE,
    category: CATEGORY,
    allow_category_change: true, // lets Meta auto-correct category instead of rejecting outright
    components: [
      {
        type: "BODY",
        text: tpl.body,
        example: {
          body_text: [tpl.example],
        },
      },
    ],
  };
}

async function createTemplate(tpl, accessToken) {
  const url = `${BASE_URL}/access-api/v1/wa/${CONFIG.WABA_ID}/message_templates`;
  const payload = buildPayload(tpl);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data, payload };
}

// Checks the live API for whether a template with this name already
// exists, since that's the actual source of truth (results.json is only a
// local cache that can miss runs or get out of sync). Returns:
//   { exists: true, data }   - confirmed to exist (HTTP 200)
//   { exists: false }        - confirmed not to exist (HTTP 400 "not found")
//   { exists: null }         - inconclusive (network error / unexpected status)
async function getTemplateStatus(name, accessToken) {
  const url = `${BASE_URL}/access-api/v1/wa/${CONFIG.WABA_ID}/message_templates/${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 200) {
      const data = await res.json().catch(() => ({}));
      return { exists: true, data };
    }
    if (res.status === 400) {
      return { exists: false };
    }
    return { exists: null };
  } catch {
    return { exists: null };
  }
}

// Decides whether to skip or create a template: the live API is the source
// of truth; previouslySucceededNames (parsed from results.json) is only a
// fallback for when the existence check itself is inconclusive.
async function resolveTemplate(tpl, accessToken, previouslySucceededNames) {
  const status = await getTemplateStatus(tpl.name, accessToken);

  if (status.exists === true) {
    return { name: tpl.name, ok: true, skipped: true, reason: "exists", data: status.data };
  }

  if (status.exists === false) {
    const result = await createTemplate(tpl, accessToken);
    return { name: tpl.name, skipped: false, ...result };
  }

  // Inconclusive check - fall back to the local record.
  if (previouslySucceededNames.has(tpl.name)) {
    return { name: tpl.name, ok: true, skipped: true, reason: "assumed-from-local-record" };
  }
  const result = await createTemplate(tpl, accessToken);
  return { name: tpl.name, skipped: false, ...result };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  ENV,
  CONFIG,
  getAccessToken,
  buildPayload,
  createTemplate,
  getTemplateStatus,
  resolveTemplate,
  sleep,
};
