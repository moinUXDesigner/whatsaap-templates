# WhatsApp Template Creator

Bulk-creates WhatsApp Business message templates via Sinch India's (ACL)
WhatsApp Business Messaging API — the API behind the Smartta portal — and
generates a companion JSON file for bulk-importing the same templates into
the internal Communicator app (SMS/Email/WhatsApp).

## Setup

1. Node.js 18+ (uses the built-in `fetch`, no npm install needed).
2. Copy `.env.example` to `.env` and fill in your real values:
   ```
   WA_ENV=production        # or "uat"
   WA_WABA_ID=...           # found in Smartta portal settings / Sinch onboarding docs
   WA_USERNAME=...          # Sinch/ACL API service-account username (not your MFA portal login)
   WA_PASSWORD=...
   WA_DELAY_MS=180000       # pause between template creation requests, in ms
   ```
   `.env` is gitignored — never commit real credentials.

## Usage

### Web UI (recommended)

```
node --env-file=.env server.js
```

Open `http://localhost:4173`. The page shows all templates from
`templates.js`, lets you **Start / Pause / Resume / Stop** a run, and shows
a live countdown to the next attempt (`WA_DELAY_MS` between each template,
to stay under rate limits).

Before creating each template, the app checks the live API for whether a
template with that name already exists and skips it if so — `results.json`
is only a fallback/report, not the source of truth (see `lib.js`'s
`resolveTemplate`).

### CLI

```
node --env-file=.env create_templates.js
```

Same creation logic, run end-to-end in the terminal. Progress is written
incrementally to `results.json` after every template.

## Files

- `templates.js` — the template definitions (`name`, `body` with `{{n}}`
  placeholders, `example` values for Meta's template review).
- `lib.js` — shared Sinch/ACL API logic (auth, create, existence check),
  used by both `create_templates.js` and `server.js`.
- `create_templates.js` — CLI entry point.
- `server.js` + `public/` — web UI entry point (Node `http` server, SSE for
  live progress, no framework/build step).
- `bulk_templates.json` — generated from `templates.js`, formatted for the
  Communicator app's bulk template import (`templateid`, `sms_template`,
  `email_template`, `whatsapp_template` keys; `{#var#}` placeholders for
  SMS/Email, `{{n}}` for WhatsApp).
- `results.json` — gitignored; per-template creation log, used as a resume
  fallback if the live existence check is inconclusive.

## Regenerating bulk_templates.json

If `templates.js` changes, regenerate it:

```js
node -e '
const templates = require("./templates.js");
const toVar = (body) => body.replace(/\{\{\d+\}\}/g, "{#var#}");
const bulk = templates.map((t) => {
  const sms_template = toVar(t.body);
  return { templateid: t.name, sms_template, email_template: sms_template, whatsapp_template: t.body };
});
require("fs").writeFileSync("bulk_templates.json", JSON.stringify(bulk, null, 2));
'
```
