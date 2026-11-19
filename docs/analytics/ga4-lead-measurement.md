# CoolDrivePro GA4 lead measurement

This change is not deployed. It does not modify Google Analytics, Google Ads, DNS, or the production server.

## What the events mean

| Event | When it fires | Lead success? |
| --- | --- | --- |
| `click_tel` | Click on a `tel:` link | No. Contact click only. |
| `mailto` | Click on a `mailto:` link | No. Contact click only. |
| `whatsapp_click` | Click on a WhatsApp link | No. Contact click only. |
| `form_start` | First focus inside a form marked `data-lead-form`, once per form | No. Attempt only. |
| `inquiry_failed` | Online submission failed, timed out, or was rejected | No. |
| `inquiry_mailto_fallback` | A mail draft was opened because online submission was not confirmed | No. The visitor still has to send the email. |
| `inquiry_accepted` | Provider or queue acknowledged the submission, once | Acknowledgement only. `delivery_confirmed=false`. |
| `inquiry_delivered` | Response explicitly says delivery was confirmed | Yes. This signal does not exist on the current inquiry path. |
| `generate_lead` | Same moment as `inquiry_delivered`, once | Yes, and only then. |

`acceptance_type` is `form_provider`, `queue`, or `delivered`. A durable-queue reference is `queue`, not delivered. Analytics parameters do not include email, name, phone, message, or the queue reference.

Every explicit event includes `site=cooldrivepro` and `measurement_origin=explicit`. The measurement ID remains `G-1ETBFY8C9H`. Local, test, and other hostnames do not load that tag and do not call `gtag`.

The existing Google Ads label `AW-18126437861/LTqWCOzCqKQcEOX7rcND` fires once, and only after `inquiry_accepted` or `inquiry_delivered`. It no longer fires from a submit click, from an email field, or from scanning the page for thank-you text.

## Version divergence

GitHub `main` at `aa74b63` (2026-10-24) is not established as equal to production or to the local source of truth.

Checked read-only on 2026-11-19:

- `https://cooldrivepro.com/` responded through Caddy. HTML `last-modified` was Thu, 12 Nov 2026 16:37:31 GMT. The built entry is `/assets/index-BjK1bL79.js`.
- That HTML contains one `G-1ETBFY8C9H` config and the Google Ads tag `AW-18126437861`. It also contained the submit-click email `user_data` snippet and the thank-you text conversion scanner. This branch removes both from the source template.
- Production `assets/leadForms-B6bQ4-Nb.js` posts to same-origin `/api/inquiry` with a 30 second timeout and treats the attempt as confirmed only when `success` and `reference` are both present. This repository still posts to Web3Forms. The POST URL was intentionally not changed.
- `GET /api/inquiry` returns `405` JSON `Method not allowed`. Common health paths returned the SPA HTML with HTTP 200, so the `inquiry_mode: durable_queue` health body was not re-read from the public site. The authorized report of that mode still stands. Queue acceptance must not be labeled as inbox delivery.
- GitHub's homepage title and description differ from production HTML. Production HTML also has prerendered hreflang that the source template does not.
- There is no `AGENTS.md` in this checkout. `OPENCLAW_HANDOVER.md` still describes Railway/Manus and is not the live Caddy/Tencent layout.
- The local disk source of truth could not be read. It may be newer than both this GitHub snapshot and the 12 Nov production build.

Do not merge these form files over a newer `/api/inquiry` client. Port `leadMeasurement.ts` and call `recordInquiryAcknowledgement` with `classifyInquiryAcknowledgement` after that newer client receives `success` and `reference`.

## QA matrix

Use a local or preview host. Do not submit a production form. `?measure_debug=1` on a non-production host shows a panel that replays outcomes without sending an inquiry. Automated coverage is `npm test`.

| Case | Action | Expected measurement | Must not happen |
| --- | --- | --- | --- |
| Contact click | Click phone, email, or WhatsApp | One `click_tel`, `mailto`, or `whatsapp_click` | `inquiry_accepted`, `generate_lead`, ads conversion |
| Form attempt | Focus the first field | One `form_start` for that form | A second `form_start` from this code on the next field |
| Provider accept | Web3Forms `{success:true}` | One `inquiry_accepted` with `acceptance_type=form_provider` and `delivery_confirmed=false`; one ads conversion | `generate_lead`, `inquiry_delivered` |
| Queue accept | `{success:true, reference, inquiry_mode:"durable_queue"}` | One `inquiry_accepted` with `acceptance_type=queue` | Calling it delivered; `generate_lead` |
| Confirmed delivery | `delivery_confirmed:true` or `delivery_status:"delivered"` | One `inquiry_delivered` and one `generate_lead` | A second pair on retry of the same submission |
| Rejected / no reference queue | `success:false`, or queue mode without `reference` | One `inquiry_failed` | Success events |
| Timeout / network | Abort or fetch failure | `inquiry_failed` with `error_class` `timeout` or `network` | Error text or email in the hit |
| Mail fallback | Online submit cannot be confirmed | `inquiry_failed` when the attempt failed, plus one `inquiry_mailto_fallback` | Success UI that says the request was received; `mailto` key-event-style click; `generate_lead` |
| Retry | Failure, then a new acknowledgement for the same submission id | One failure, then one acceptance | A second acceptance |
| Repeat success | Acknowledgement twice for the same id | The first acceptance only | Another lead or ads conversion |
| Analytics missing | `gtag` absent or throwing | Form still completes its own success or error path | An exception from measurement |
| Consent denied | `analytics_storage: denied` in the data layer | Debug record only | A `gtag` call |
| Preview / test host | Any event on localhost or a non-production host | Debug record, tag not loaded | A hit to `G-1ETBFY8C9H` |
| Personal data | Params include email, name, phone, or message | Those keys dropped | Any of those values in the hit |

## Proposed GA4 / Ads admin changes

Do not apply these as part of this branch.

1. Leave the new events unmarked. After a production deploy has been verified, `inquiry_accepted` is the candidate key event for acknowledgement. It is not inbox delivery.
2. Do not mark `generate_lead` as a key event until `inquiry_delivered` is actually observed. `generate_lead` no longer means a form click or a queued inquiry.
3. `click_tel` and `mailto` are existing key events and will start receiving click data. They are not delivered inquiries. Review whether they should remain key events. `purchase` and `thank_you_page` still have no instrumentation and should not be used as inquiry goals.
4. Turn off Enhanced measurement form interactions, or filter `measurement_origin=explicit`, before comparing `form_start` with history. Enhanced measurement can emit its own `form_start`.
5. Keep using measurement ID `G-1ETBFY8C9H`. Do not add a tag, stream, or property for tests. Preview traffic is excluded in the page instead.
6. Continue to filter CoolDrivePro reports by host. The property also contains other domains.
7. In Google Ads, review the lead-form conversion action. It now counts an acknowledged submission, not a visible thank-you message and not an email address.

## Separate follow-ups

- Unknown public paths such as `/health` and `/api/health` return the homepage HTML with HTTP 200. That is a soft-404 / crawler issue and is outside this measurement change.
- Homepage title, meta description, and hreflang differ between this GitHub source and the 12 Nov production HTML. SEO rendering was not changed here.

## Rollback

Revert this branch. No analytics admin setting, DNS record, or production file was changed, so there is nothing to undo in GA4 or on the server until someone chooses to deploy.
