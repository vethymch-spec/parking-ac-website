# Google Ads Account Setup For CoolDrivePro

Use this guide before enabling any paid traffic. The goal is to create the account, get the tracking values, verify forms and conversions, then launch Search campaigns only.

## 1. Create The Google Ads Account

1. Go to `https://ads.google.com/` and sign in with the Google account that should own billing.
2. Choose Expert Mode if Google offers a simplified campaign wizard.
3. Choose Create an account without a campaign if that option appears.
4. Set billing country, currency, and time zone carefully. These are hard or impossible to change later.
5. Add billing, but do not enable any campaigns yet.

Recommended choices:

- Time zone: use the business reporting time zone you will check every day.
- Currency: use the currency you want all budgets, CPCs, and invoices to use long term.
- Initial mode: Search only, no Smart Campaign, no Display, no Performance Max at launch.

## 2. Create The First Conversion Actions

Create conversions before campaigns so the account starts collecting clean data from day one.

Minimum launch setup:

| Action | Category | Goal | Count | Include in account-default goals |
| --- | --- | --- | --- | --- |
| `lead` | Submit lead form | Primary | One | Yes |
| `contact_form` | Contact | Primary | One | Yes |
| `whatsapp_click` | Contact | Secondary | One | No at launch |
| `telegram_click` | Contact | Secondary | One | No at launch |

Recommended settings:

- Value: do not assign a fixed value until lead quality is known.
- Attribution: data-driven if available; otherwise use Google's recommended default.
- Click-through conversion window: 30 days is fine for launch.
- View-through conversion window: keep conservative or default.
- Enhanced conversions: skip at launch unless privacy, consent, and PII handling are fully reviewed.

After each conversion action is created, open its tag instructions and copy:

- Google tag ID: looks like `AW-XXXXXXXXXX`.
- Conversion label: the string after the slash in `send_to: 'AW-XXXXXXXXXX/LABEL_HERE'`.

## 3. Use The Right Environment Variables

For launch, use one shared label only for form leads, plus optional separate labels for chat clicks.

Minimum required:

```bash
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
VITE_GOOGLE_ADS_CONVERSION_LABEL=FORM_LEAD_LABEL
VITE_WEB3FORMS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Better setup once all four conversion actions exist:

```bash
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL=LEAD_LABEL
VITE_GOOGLE_ADS_CONTACT_CONVERSION_LABEL=CONTACT_FORM_LABEL
VITE_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL=WHATSAPP_CLICK_LABEL
VITE_GOOGLE_ADS_TELEGRAM_CONVERSION_LABEL=TELEGRAM_CLICK_LABEL
VITE_WEB3FORMS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Do not optimize bidding toward WhatsApp or Telegram clicks until those clicks are matched to real qualified inquiries. The site only sends Ads click conversions for WhatsApp/Telegram when their separate labels are configured.

## 4. Important Cloudflare/Vite Deployment Detail

This site is currently deployed by building locally and uploading `dist/client` with Wrangler. Vite variables are baked into the JavaScript during `npm run build`, so Cloudflare Pages dashboard variables alone will not affect a manually uploaded build.

For local deployment, put the variables in `.env.production.local` before running `npm run build`. This file is ignored by Git.

Then run:

```bash
npm run build
npx wrangler pages deploy dist/client --project-name cooldrivepro
```

If Cloudflare later builds directly from GitHub, add the same variables to Cloudflare Pages Production environment variables as well.

## 5. Create Web3Forms Key

1. Go to `https://web3forms.com/`.
2. Create an access key using `support@cooldrivepro.com` as the receiving email.
3. Confirm the email verification message.
4. Use the access key as `VITE_WEB3FORMS_KEY`.
5. Submit a test form from a live landing page with UTM parameters and confirm the email includes `utm_source`, `utm_campaign`, `utm_term`, and `gclid` when present.

## 6. Build Search Campaigns Only

Start with exact and phrase match only. Use the launch pack files:

- `docs/google-ads-keyword-seed.csv`
- `docs/google-ads-negative-keywords.csv`
- `docs/google-ads-ad-assets.csv`

Recommended first-wave campaigns:

- Search - Parking AC - EN
- Search - Truck Sleeper AC - EN
- Search - RV Van AC - EN
- Search - Fleet ROI - EN
- Search - Distributor - EN
- Search - Brand - EN

Use this final URL suffix:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}
```

Keep auto-tagging enabled so Google Ads appends `gclid`.

## 7. Launch Pitfalls To Avoid

- Do not start with Smart Campaigns. They hide too many controls.
- Do not start with Performance Max or Display. They can spend quickly with weak query control.
- Do not use broad match on day one.
- Do not make chat clicks the only primary conversion.
- Do not target countries where shipping, warranty, or response coverage is not ready.
- Do not mix all languages in one campaign.
- Do not launch before Tag Assistant confirms the Google tag and at least one test conversion.
- Do not judge performance before adding negatives from real search terms for the first 72 hours.

## 8. What To Send Back After Setup

Send these values to finish the website-side setup:

```text
Google Ads customer ID:
VITE_GOOGLE_ADS_ID:
VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL:
VITE_GOOGLE_ADS_CONTACT_CONVERSION_LABEL:
VITE_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL:
VITE_GOOGLE_ADS_TELEGRAM_CONVERSION_LABEL:
VITE_WEB3FORMS_KEY:
Starting daily budget:
Launch countries:
Confirmed WhatsApp number:
Confirmed Telegram handle:
```
