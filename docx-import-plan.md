# Plan: Word Document Import for WhatsApp Template Creation

Upload the approved-formats `.docx` directly, preview every template it contains
with its Meta category, and create them one row at a time — replacing the manual
docx → `*-templates.js` → `*-bulk-templates.json` retyping chain.

**Status:** proposed, not yet implemented
**Date:** 2026-09-22

## Context

Today the same content is retyped three times. A Word doc of approved message
formats arrives (e.g. `AHI_Alert_Message_Formats_Approval_req.docx`), someone
hand-converts it into a `*-templates.js` array, then hand-converts *that* into a
`*-bulk-templates.json` for the Communicator app. Every `*-templates.js` header
comment in the repo says "converted from …docx" — all of that was manual. The
source doc for MIMS isn't even in the repo any more.

Two things go wrong in that pipeline. Transcription drift: `pms-aar-templates.js`
has a template with 3 placeholders and 5 example values; `appcc-templates-copy.js`
mixes an en-dash and a hyphen in the same sign-off. And category blindness: nothing
in the flow shows Utility vs Authentication before submission, which is exactly how
the earlier `error 100 / HTTP 400` happened — an Authentication template was sent
with a Utility-shaped payload.

The goal: upload the doc, see every template it contains with its proposed category,
fix anything wrong inline, then create them one row at a time with a per-row button.
The existing "view templates" table stays untouched.

## Decisions taken

| Decision | Choice |
|---|---|
| Conversion | Hybrid — deterministic docx parse, then one Claude API call |
| Languages | Create both when the doc carries both (AHI has English + Telugu) |
| Communicator JSON | Export **and** write `<app>-bulk-templates.json` into the repo |
| `*-templates.js` | Keep — written automatically by the export step |
| Claude access | `@anthropic-ai/sdk` — the repo's first runtime dependency |
| Rate limiting | Short fixed cooldown after each create (anti-double-click only) |

## Architecture

The split that matters: **the LLM only does judgement; every mechanical transform
stays in deterministic code.**

```
 .docx ──▶ lib-docx.js          zero-dep zip + document.xml walk
                │               (tables, headings, rows preserved)
                ▼
          lib-extract.js        ONE Claude call — segmentation, naming,
                │               category, language, variable meanings
                ▼
          lib-import.js         deterministic: {#var#} → {{1}}..{{n}},
                │               sms/email/whatsapp derivation, DLT prefix,
                │               validation gate
                ▼
        PREVIEW TABLE  (editable: name, category, body, example)
                │
      ┌─────────┴─────────┐
      ▼                   ▼
 [Create Template]   [Export to repo]
   per row            *-templates.js + *-bulk-templates.json
```

Claude never numbers placeholders or builds the three channel strings. LLMs miscount
positional placeholders; the doc's `{#var#}` markers are positional and unnumbered,
so numbering them is a `replace` with a counter and belongs in code. Claude returns
the body with `{#var#}` exactly as written in the doc, and `lib-import.js` derives
both `{#var#}` (SMS/email) and `{{n}}` (WhatsApp) forms from that single string —
which also guarantees the two can never drift apart.

## Critical fix this feature depends on

`lib.js:33` hardcodes `const LANGUAGE = "en"` and every payload builder uses it.
**Telugu templates are currently being registered with Meta under the English locale.**
`ahi-templates-te.js` holds 20 Telugu bodies, all submitted as `en`.

"Create both language templates" is not achievable without fixing this. Change
`LANGUAGE` from a module constant to a per-template value (`tpl.language || "en"`)
in `buildStandardPayload`, `buildAuthPayload` and `sendTemplateMessage`. Existing
templates already created under `en` are unaffected — Meta keys on name+language and
the Telugu names carry a distinct `_te` suffix, so nothing collides.

## Files

**New**

- `lib-docx.js` — minimal ZIP reader (`zlib.inflateRawSync` + end-of-central-directory
  walk; verified working on both fixtures) and a `word/document.xml` walker that emits
  `{headings[], tables[][][]}` with row/cell structure intact. Structure must survive:
  `textutil` flattens tables to one cell per line and loses the row grouping that
  carries the meaning. No dependency needed.
- `lib-extract.js` — the Claude call. `claude-opus-5`, `output_config.format` with a
  strict JSON schema, `thinking: {type: "adaptive"}`. Schema per template:
  `{name, language, category, body, variables[{position, meaning, sample}],
  dlt_template_id, otp{expiryMinutes,otpType,buttonText}, purpose}`.
- `lib-import.js` — placeholder numbering, channel derivation, DLT prefixing,
  validation, and the two repo writers.
- `public/import.html` + `public/import.js` — upload and preview page.

**Modified**

- `lib.js` — the per-template language fix above.
- `server.js` — new endpoints, a binary-safe body reader, `.docx` in the `MIME` map.
- `package.json` — add `dependencies: {"@anthropic-ai/sdk": "^0.72.0"}`.
- `.env.example` — `ANTHROPIC_API_KEY=`.
- `README.md` — setup now requires `npm install`; document the new flow.

## Endpoints

| Method + path | Does |
|---|---|
| `POST /api/import/upload` | multipart `.docx` → parse → extract → returns `{draftId, templates[]}` |
| `GET /api/import/:id` | re-fetch a draft (page reload) |
| `PATCH /api/import/:id/templates/:idx` | save an inline edit |
| `POST /api/import/:id/templates/:idx/create` | create **one** template |
| `POST /api/import/:id/export` | write both repo files |

Body reading: `readJsonBody` (`server.js:118-131`) does `raw += chunk`, which
string-coerces Buffers and corrupts binary at chunk boundaries. Add a separate
`readBufferBody` using `Buffer.concat(chunks)`, then
`new Request(url, {headers, body}).formData()` — Node 24's undici parses multipart
natively. Verified byte-identical round-trip on the 49,801-byte AHI docx, so no
multipart dependency is needed.

Drafts are keyed by id in a `Map`, not a module-level slot. The existing
`uploadedTemplates` singleton (`server.js:45`) is shared across every browser; don't
repeat that.

## Per-row creation

Reuse `resolveTemplate` from `lib.js:189` — it already does the live-existence check
that is the source of truth, returning `skipped: "exists"` rather than erroring on a
duplicate. Do **not** route through `convertUploadedEntry` (`server.js:142`): it reads
only `templateid` + `whatsapp_template` and silently drops `category` and
`whatsapp_otp`, so every Authentication template would be created as Utility — the
original bug, reintroduced.

Bypass the `job` singleton entirely; per-row creates are independent of the bulk
runner and must not trip its `409 job.running` guards. `persistResults()`
(`server.js:157`) **truncates** `results.json` to the current run — per-row creates
need append-and-replace-by-name instead, or each click erases the previous row's record.

Cooldown: disable all Create buttons for ~3s after a create returns. `CONFIG.DELAY_MS`
(9 min default) is not applied here — the human clicking is the pacer.

## Validation gate

Run before the preview renders; rows failing a hard check are marked and not
creatable until edited. These are the checks already used to verify the APPCC and
MIMS JSON files earlier in this work:

- name matches `^[a-z0-9_]{1,512}$` (repo convention is lowercase, no separators)
- placeholder count agrees across `{#var#}` / `{{n}}` / `example[]`
- no adjacent `{{1}}{{2}}`; body does not start or end with a placeholder
- body ≤ 1024 chars
- Authentication rows: no `body`, exactly one OTP button, `expiryMinutes` 1–90
- duplicate names within the draft, and against the live WABA list

## Two input dialects the extractor must handle

The repo's two fixtures are structurally unrelated, which is the main argument for an
LLM over a rule-based parser:

1. **AHI** — 40 tables, 20 templates, each a 1-row "Why/when" table plus a *ragged*
   7-row table (first 3 rows have 3 cells, last 4 have 2). English + Telugu.
   Placeholders are `{#var#}`. Section headings carry explicit ids
   (`ahiportallive / ahiportallive_te`). DLT registration ids are glued onto label
   cells with inconsistent separators and land on whichever row the author last
   edited — `English template-1777178409504286833`, `English example-1777178409522556101`,
   `English template- 1777178409543907596`. Row position is not meaningful: any
   19-digit id inside a section belongs to that section's SMS template. Belt-and-braces
   here — have code regex-sweep each section for `\d{15,20}` and cross-check the LLM.
2. **abdul-rehman** — zero tables, bare paragraphs, name line then body line. No
   Telugu, no variable glossary, no examples, no DLT ids. Placeholders already in
   `{{n}}` form. Mixed-case names (`Vrm`, `Erm`, `Employeereceiptmessage`) and a
   byte-identical duplicate (`employeerm` / `Employeerm`).

Telugu bodies contain U+200C zero-width non-joiners (`ట్రాన్స్‌ఫార్మర్`). They must
survive byte-for-byte through JSON and into the written files.

## Verification

The strongest check available: **`ahi-connector.json` is hand-made ground truth.** It
holds all 40 AHI entries (20 en + 20 te) with DLT ids already prefixed onto
`sms_template`, and `ahi-templates.js` / `ahi-templates-te.js` hold the matching
bodies and examples.

1. Run `AHI_Alert_Message_Formats_Approval_req.docx` through the full pipeline and
   diff the output against `ahi-connector.json` (40 entries) and the two
   `ahi-templates*.js` files (20 each). Any mismatch is either an extractor bug or a
   pre-existing error in the hand-made file — investigate, don't auto-accept.
2. Run `abdul-rehman/whatsaap-templates.docx`; expect 6 templates matching
   `drawings-bulk-templates.json`. Confirm the duplicate is flagged, not silently merged.
3. Assert every Telugu body survives a JSON round-trip with its U+200C bytes intact.
4. Run the validation gate over all existing `*-templates.js` files; it should flag
   the known `aarticketstatus` arity mismatch (3 placeholders, 5 examples).
5. End-to-end: `npm install && node --env-file=.env server.js`, upload the AHI doc at
   `localhost:4173/import.html`, confirm 40 rows with correct categories, edit one
   name, create one row, confirm it appears on `template-status.html` with the right
   category and language, then export and `git diff` the two written files.

## Problems, pros and cons

**Pros**

- Three manual conversion steps collapse to one upload.
- Category is visible and editable *before* submission — directly prevents the
  Authentication/Utility mismatch that caused the earlier 400.
- Real example values from the doc's "English example" rows, instead of
  `deriveExample`'s `"Sample 1"` placeholders that Meta reviewers currently see.
- DLT registration ids are captured automatically instead of hand-copied.
- Per-row creation gives partial progress. A 40-template AHI run through the bulk
  runner at the 9-minute default takes ~6 hours as one uninterruptible job.
- Fixes a live bug: Telugu templates are currently registered as English.

**Cons and risks**

- **Non-deterministic.** The same doc can yield different generated names on
  re-upload. Mitigated by the editable preview and by the export writing files into
  the repo, after which the result is fixed — but two uploads of one doc are not
  guaranteed identical.
- **Cost and a network dependency.** Roughly $0.30 per AHI-sized upload on
  `claude-opus-5` (~15K in, ~10K out). Uploads fail when the API is unreachable.
- **A new secret.** `ANTHROPIC_API_KEY` joins the WhatsApp credentials in `.env`, and
  the server gains its first outbound call to something other than the ACL API.
- **The repo stops being install-free.** `npm install` becomes mandatory;
  `node_modules/` does not currently exist on disk, so even `npm run dev` would fail
  today. README setup instructions change.
- **Arbitrary file write.** Export writes into the project directory from a web
  request. The app-name → filename derivation must be strictly sanitized
  (`^[a-z0-9-]+$`, no separators, fixed `-bulk-templates.json` suffix) and confined
  to the project root.
- **Approval auto-notify won't cover imports.** The poller (`server.js:65-116`)
  iterates only the built-in `templates.js` list, so imported templates get no
  PENDING→APPROVED test send. Either extend it to drafts or state the limitation;
  I'd state it and keep this change contained.
- **Doc quality is the ceiling.** Nothing here can tell that a template's sign-off
  doesn't match its DLT registration. The validation gate catches structure, not
  whether the text is the approved text.

## Out of scope

Retiring `create_templates.js`, migrating the parked `*-templates.js` files, changing
the bulk runner, and reconciling the three conflicting `WA_DELAY_MS` defaults
(`lib.js` 540000, README 180000, `.env.example` 1500).
