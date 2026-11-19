# Inquiry client reconciliation checklist

Status: the browser client matches the supplied local inquiry server response that can be proven. The excluded `cooldrivepro-inquiry.mjs` is still required for validation and the HTML receipt. This package is not a live production checkout.

No production rollout is authorized. Do not merge, publish, change DNS, or change Google Analytics or Google Ads admin settings. Do not submit a live inquiry. Do not invent the missing `/api/inquiry` server.

The attached snapshot checksum matched `b6c5ebc166274a22358d36c2b64241e93fa8138f24725d039c898cce6ebe3c78` (250 files). Its `client/src/lib/leadForms.ts` posts JSON to `/api/inquiry`, aborts after 30 seconds, and accepts the attempt only when `success` and `reference` are both present. The supplemental `netlify.toml` checksum matched the file already in this repo. `AGENTS.md` says production publish is `python3 scripts/publish-tencent.py` using `operations/active-tencent-release.json`. That script and the `operations` directory were not in the archive. No server handler for `/api/inquiry` was in `server/`, `workers/`, or `netlify/functions`. `netlify/functions/form-submission.js` is a separate URL-encoded Zoho redirect handler, not this JSON queue. The native APU form action is restored to `/api/inquiry` with no access key. Its browser navigation is not measured as a delivered lead.

## What is already known, and what is not

Observed in the public production bundle dated 12 Nov 2026 (`assets/leadForms-B6bQ4-Nb.js`):

- The browser posts JSON to same-origin `/api/inquiry`.
- The request uses a 30 second abort.
- The attempt is confirmed only when the HTTP response is OK, `success` is true, and `reference` is a non-empty string.
- Otherwise the client rejects the attempt as unconfirmed.

That observation is a client contract only. It is not a copy of the server, the retry policy, or the user-facing copy. Those come from the snapshot. Queue acceptance, including `inquiry_mode: "durable_queue"` plus `reference`, is not inbox delivery.

## When the snapshot arrives

Compare these surfaces before editing:

| Surface | Keep from the snapshot | Measurement change allowed |
| --- | --- | --- |
| Submit URL, method, headers, and JSON body | Exact current queue request | None |
| Success rule | Snapshot rule. The 12 Nov bundle required `success` and `reference` | Pass that response to `classifyInquiryAcknowledgement` |
| Timeout | Snapshot timeout | Do not shorten or lengthen it |
| Automatic retry | Snapshot behavior only | Do not add a second POST |
| Error and success copy, including translations | Snapshot strings and i18n keys | Do not show a received or thank-you state for a failed or mail-fallback attempt |
| Mail fallback | Snapshot conditions and recipient | Record `inquiry_mailto_fallback` only. No `generate_lead` |
| Contact, footer, compact, landing, and blog forms | Snapshot fields, validation, and routing | Add `data-lead-form` and call the measurement helper after the snapshot's own result |
| WhatsApp, `tel:`, and `mailto:` links | Snapshot targets | One click event. No lead success |
| `index.html` tag | Existing `G-1ETBFY8C9H` | Load it only on `cooldrivepro.com` and `www.cooldrivepro.com` |
| Consent | Snapshot behavior | If analytics storage is denied, do not call `gtag` |

Reject the snapshot integration if it would:

- Point the queue client back at `api.web3forms.com`.
- Treat `success` plus `reference` as `generate_lead`, `inquiry_delivered`, or an ads conversion.
- Treat message text that contains "delivered" as delivery.
- Copy email, name, phone, message, or the queue reference into analytics.
- Add a second Google tag or a new measurement ID.
- Change SEO titles, hreflang, page copy, or languages in order to land the measurement patch.

## Implementation shape

1. Put the snapshot's inquiry module back as the only submit path.
2. After the snapshot's own success condition, call `recordInquiryAcknowledgement` with `classifyInquiryAcknowledgement(responseBody)`.
3. On the snapshot's failure, timeout, and mail-fallback paths, call `recordInquiryFailure` and, when a draft is opened, `recordMailtoFallback`.
4. Leave `generate_lead` and the Google Ads label tied only to a structured delivery flag. If the snapshot has no such flag, do not add one.
5. Keep the hostname gate around `G-1ETBFY8C9H` and the existing Cloudflare beacon.

## Tests to rerun after the snapshot, still with mocks

Use a mocked `fetch` for `/api/inquiry`. Do not call the live route.

- `success: true` and a reference: one `inquiry_accepted`, `acceptance_type=queue`, `delivery_confirmed=false`. No `generate_lead` and no ads conversion.
- `success: true` without a reference: the snapshot's unconfirmed failure. No success UI and no lead event.
- Explicit structured delivery, only if the snapshot actually returns that field: one `inquiry_delivered` and one `generate_lead`.
- The word "delivered" inside a message: not delivery.
- Timeout at the snapshot's timeout value, HTTP rejection, and network failure.
- One failed attempt followed by one acknowledged attempt for the same submission id. A second acknowledgement does not emit again.
- Consent denied, missing `gtag`, and a throwing `gtag`: the form still finishes and no hit is marked sent.
- Hosts other than `cooldrivepro.com` and `www.cooldrivepro.com`, including a Netlify preview host: events stay local.
- Analytics payload has no email, name, phone, message, or reference.

Then run `npm test` for the measurement files and `npm run build`. Confirm the built contact page still gates `G-1ETBFY8C9H`.

## Proven from the 2026-11-02 inquiry-mail handoff

Checksum `9a9b9c6e25c9d3fcaa94e35380656f11b5036f9dfed13c782ad22e5f86c28cc2`. `server.mjs` and `cooldrivepro-worker.mjs` match between the native copy and the staged copy. They do not match the hashes in `baseline.json`, and the active site selector points at `cooldrivepro-colors-20261113`, not this mail server. No equality with live production is claimed.

`cooldrivepro-worker.mjs` sends `POST /api/inquiry` to `handleCooldriveInquiry`. After that handler returns OK and the submission sink has stored a receipt, `server.mjs` answers JSON clients with HTTP 202 `{ ok: true, queued: true, email: false, success: true, reference }`. `email: false` is explicit non-delivery. A later SMTP pass can mark a stored record `notified`, but that status is not returned on this HTTP response.

The browser bundle `leadForms-B6bQ4-Nb.js` posts JSON to `/api/inquiry` with `Accept: application/json`, a 30 second abort, and requires `success` and `reference`. This branch does the same. The proven 202 body is classified as `inquiry_accepted` with `delivery_confirmed=false`.

## Still required from a sanitized copy

`cooldrivepro-inquiry.mjs` only. It contains `readCooldriveLead`, `handleCooldriveInquiry`, and `cooldriveReceiptHtml`. Without it, validation errors, rejected fields, and the native form's HTML confirmation cannot be proven. A copy with recipient addresses replaced by placeholders is sufficient. `deploy.server.py` and `verify.mjs` are not needed for the client contract.

## External checks that remain blocked

- Netlify preview logs for the current branch require a Netlify token. The last public status was `state: error` with `published_at: null`.
- The Cloudflare Workers check fails immediately and already failed on `main` on 12 Nov 2026. Its dashboard log is not readable here.
- Do not investigate those services again unless a new log or a changed status arrives.
- Production publish remains unauthorized even after the client reconciliation.

## Rollback

Revert `cursor/ga4-lead-measurement-06df`. No GA4 admin setting, DNS record, or production file has been changed by this branch.
