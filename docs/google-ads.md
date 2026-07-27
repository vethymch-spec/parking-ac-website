# Google Ads Tracking Setup

CoolDrivePro loads the Google tag only when a build-time environment variable is configured. No Google Ads account IDs or conversion labels are hard-coded in the repo.

Use this file for tracking setup. Use `docs/google-ads-launch-plan.md` for the campaign launch checklist, keyword plan, and operating rules.

## Required Environment Variables

Set these in Cloudflare Pages for Production and Preview builds:

```bash
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
VITE_GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXXXXXXXXX
```

`VITE_GOOGLE_ADS_CONVERSION_LABEL` is used as the default label for form lead actions only. WhatsApp and Telegram clicks require their own labels before direct Google Ads click conversions are sent.

## Lead Form Delivery

Set this key so paid-search landing page, blog CTA, and contact page forms submit directly without relying on a backend function:

```bash
VITE_WEB3FORMS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

If the key is missing or Web3Forms is unavailable, forms open a prefilled email to `support@cooldrivepro.com` as a backup. Form submissions include non-PII attribution fields such as `utm_source`, `utm_campaign`, `utm_term`, `gclid`, `gbraid`, and `wbraid` in the lead email/Web3Forms payload. These fields are not sent to Google Ads conversion events.

## Optional Per-Action Labels

Use separate labels when Google Ads has separate conversion actions for each source. This is recommended for launch because form leads and chat clicks should not be optimized the same way.

```bash
VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL=XXXXXXXXXXXXXXX
VITE_GOOGLE_ADS_CONTACT_CONVERSION_LABEL=XXXXXXXXXXXXXXX
VITE_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL=XXXXXXXXXXXXXXX
VITE_GOOGLE_ADS_TELEGRAM_CONVERSION_LABEL=XXXXXXXXXXXXXXX
```

## Tracked Actions

- Blog lead form submissions: `generate_lead`, direct Ads conversion `lead`
- Contact page form submissions: `generate_lead`, direct Ads conversion `contact_form`
- Paid-search landing page form submissions: `generate_lead`, direct Ads conversion `lead`
- WhatsApp floating button clicks: `whatsapp_click`, direct Ads conversion only when `VITE_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL` is configured
- Telegram floating button clicks: `telegram_click`, direct Ads conversion only when `VITE_GOOGLE_ADS_TELEGRAM_CONVERSION_LABEL` is configured

The event payload intentionally avoids names, emails, phone numbers, or message text.

## Production Setup Steps

1. In Google Ads, create conversion actions for the tracked lead actions.
2. Copy the Google tag ID, usually formatted as `AW-XXXXXXXXXX`.
3. Copy the conversion label for each action. If only one label is available at launch, use it for form leads only.
4. Add the `VITE_GOOGLE_ADS_*` variables in Cloudflare Pages production environment variables.
5. Add `VITE_WEB3FORMS_KEY` so form leads submit directly.
6. Rebuild and deploy production so Vite can bake the variables into the client bundle.
7. Verify production with Google Tag Assistant before enabling campaigns.

Do not add names, emails, phone numbers, message text, or other lead PII to conversion event parameters.

## Recommended Conversion Setup

| Website action | Google Ads conversion action | Goal setting | Notes |
| --- | --- | --- | --- |
| Blog lead form submit | `lead` | Primary | Highest-intent blog and calculator leads. |
| Contact form submit | `contact_form` | Primary | Main sales/contact inquiry. |
| WhatsApp click | `whatsapp_click` | Secondary at launch | Promote to Primary only if click quality is proven. |
| Telegram click | `telegram_click` | Secondary at launch | Useful for markets where Telegram is common. |

Because this site is currently deployed by running `npm run build` locally and uploading `dist/client`, Vite variables must be present during the local build, for example in `.env.production.local`. Cloudflare Pages dashboard variables are still useful for Git-based builds, but they do not change an already-built static upload.

## Verification Checklist

- `npm run build:fast` succeeds locally.
- Production page source contains a bundled Google Ads ID after env vars are configured.
- Google Tag Assistant detects the Google tag on `https://www.cooldrivepro.com/`.
- Landing page form submission reaches Web3Forms/email with UTM and click ID fields preserved.
- A test contact form submit fires the configured `contact_form` conversion.
- A test blog lead form submit fires the configured `lead` conversion.
- WhatsApp and Telegram clicks fire their click conversions.
- Google Ads Diagnostics shows no missing tag or label errors after propagation.
