/**
 * Shared Sinch/ACL WhatsApp Template Management API logic, used by both
 * the CLI script (create_templates.js) and the web UI (server.js).
 */
const ENV = process.env.WA_ENV || "production"; // "production" or "uat"

const ENDPOINTS = {
  production: {
    TOKEN_URL: "https://auth.aclwhatsapp.com/realms/ipmessaging/protocol/openid-connect/token",
    BASE_URL: "https://api.aclwhatsapp.com",
    MESSAGES_URL: "https://api.aclwhatsapp.com/pull-platform-receiver/v2/wa/messages",
  },
  uat: {
    TOKEN_URL: "https://apiuat.aclwhatsapp.com/auth/realms/ipmessaging/protocol/openid-connect/token",
    BASE_URL: "https://apiuat.aclwhatsapp.com",
    MESSAGES_URL: "https://apiuat.aclwhatsapp.com/pull-platform-receiver/v2/wa/messages",
  },
};

const CONFIG = {
  WABA_ID: process.env.WA_WABA_ID || "",
  USERNAME: process.env.WA_USERNAME || "",
  PASSWORD: process.env.WA_PASSWORD || "",
  DELAY_MS: Number(process.env.WA_DELAY_MS) || 540000, // pause between requests to stay under rate limits
};

const { TOKEN_URL, BASE_URL, MESSAGES_URL } = ENDPOINTS[ENV];

// Category is per-template (templates.js sets `category`); bill-status
// notifications are Utility, OTP templates are Authentication.
// ACL/Sinch docs use Title-case enum values: "Marketing" / "Utility" / "Authentication".
const DEFAULT_CATEGORY = "Utility";
const LANGUAGE = "en";

async function getAccessToken() {
  const missing = ["USERNAME", "PASSWORD"].filter((k) => !CONFIG[k]);
  if (missing.length) {
    throw new Error(
      `Missing ${missing.map((k) => "WA_" + k).join(" and ")} in .env - the token request would be ` +
        `rejected as "Invalid user credentials" without saying why.`
    );
  }

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
    // Keycloak answers both "no such user" and "wrong password" with the same
    // opaque invalid_grant, so spell out what to actually check.
    if (data.error === "invalid_grant") {
      throw new Error(
        `Auth rejected the ${ENV} credentials for WA_USERNAME="${CONFIG.USERNAME}" (HTTP ${res.status} ` +
          `invalid_grant). WA_USERNAME must be the Sinch/ACL API service-account username issued at ` +
          `onboarding - not a Smartta portal login - and WA_PASSWORD its password. Also confirm WA_ENV ` +
          `(currently "${ENV}") matches the environment the account belongs to.`
      );
    }
    throw new Error(`Failed to get access token (HTTP ${res.status}): ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// Authentication templates use a rigid schema that shares almost nothing with
// the other categories: Meta owns the copy ("<CODE> is your verification
// code."), so the BODY carries no `text` and no `example`, the expiry is
// declared structurally instead of as a {{n}} placeholder, and exactly one OTP
// button is mandatory. `allow_category_change` is not applicable here either -
// sending any of that is what earns a 400 / error code 100.
function buildAuthPayload(tpl) {
  const otp = tpl.otp || {};
  const components = [
    {
      type: "BODY",
      // Appends "For your security, do not share this code." to Meta's copy.
      add_security_recommendation: otp.securityRecommendation !== false,
    },
  ];

  if (otp.expiryMinutes != null) {
    const minutes = Number(otp.expiryMinutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 90) {
      throw new Error(
        `Template "${tpl.name}": otp.expiryMinutes must be an integer between 1 and 90 ` +
          `(got ${JSON.stringify(otp.expiryMinutes)}). Meta rejects anything outside that range.`
      );
    }
    components.push({ type: "FOOTER", code_expiration_minutes: minutes });
  }

  const button = { type: "OTP", otp_type: otp.otpType || "COPY_CODE", text: otp.buttonText || "Copy code" };
  // ONE_TAP/ZERO_TAP autofill needs the Android app identity; COPY_CODE does not.
  if (button.otp_type !== "COPY_CODE") {
    if (!otp.packageName || !otp.signatureHash) {
      throw new Error(
        `Template "${tpl.name}": otp_type "${button.otp_type}" requires otp.packageName and ` +
          `otp.signatureHash (the Android app's package name and signing-key hash).`
      );
    }
    button.package_name = otp.packageName;
    button.signature_hash = otp.signatureHash;
  }
  components.push({ type: "BUTTONS", buttons: [button] });

  return { name: tpl.name, language: LANGUAGE, category: "Authentication", components };
}

function buildStandardPayload(tpl, category) {
  const bodyComponent = { type: "BODY", text: tpl.body };
  // Meta rejects an `example` on a BODY with no {{n}} placeholders - only attach
  // it when there's at least one variable to fill.
  if (tpl.example && tpl.example.length > 0) {
    bodyComponent.example = { body_text: [tpl.example] };
  }

  return {
    name: tpl.name,
    language: LANGUAGE,
    category,
    allow_category_change: true, // lets Meta auto-correct category instead of rejecting outright
    components: [bodyComponent],
  };
}

function buildPayload(tpl) {
  const category = tpl.category || DEFAULT_CATEGORY;
  return category === "Authentication" ? buildAuthPayload(tpl) : buildStandardPayload(tpl, category);
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

// Lists every template that actually exists in the WABA (not just the ones
// defined locally in templates.js), following Meta's cursor-based `paging.next`
// links until exhausted.
async function listAllTemplates(accessToken) {
  let url = `${BASE_URL}/access-api/v1/wa/${CONFIG.WABA_ID}/message_templates`;
  const all = [];
  while (url) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Failed to list templates (HTTP ${res.status}): ${JSON.stringify(data)}`);
    if (Array.isArray(data.data)) all.push(...data.data);
    url = data.paging && data.paging.next ? data.paging.next : null;
  }
  return all;
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

// Sends an already-approved template message to a real recipient. WhatsApp
// Business API forbids business-initiated free-form text outside an active
// customer-service session, so this is the only way to proactively notify
// someone - it re-sends the template itself, filled with tpl.example values.
async function sendTemplateMessage(tpl, to, accessToken) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: tpl.name,
      language: { code: LANGUAGE, policy: "deterministic" },
    },
  };
  if ((tpl.category || DEFAULT_CATEGORY) === "Authentication") {
    // Authentication sends take exactly one variable - the code - and it has to
    // be repeated as the OTP button's parameter, or the copy/autofill button
    // has nothing to hand back to the app.
    const code = String((tpl.example && tpl.example[0]) || "");
    payload.template.components = [
      { type: "body", parameters: [{ type: "text", text: code }] },
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
    ];
  } else if (tpl.example && tpl.example.length > 0) {
    payload.template.components = [
      { type: "body", parameters: tpl.example.map((value) => ({ type: "text", text: String(value) })) },
    ];
  }

  const res = await fetch(MESSAGES_URL, {
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
  listAllTemplates,
  sendTemplateMessage,
  resolveTemplate,
  sleep,
};
