# CoolDrivePro Google Ads Post-Account Setup Checklist

Use this immediately after the Google Ads account is created. Do not start meaningful spend until conversion tracking and lead delivery are verified.

## 1. Secure The Account

Google Ads is showing a two-step verification warning. Complete it before the deadline.

Path:

```text
Google Account -> Security -> 2-Step Verification
```

Recommended:

- Add phone verification.
- Add Google Authenticator or passkey.
- Save backup codes.
- Make sure the business owner has access, not only one operator account.

## 2. Pause Any Auto-Created Campaign

If the signup wizard created a Performance Max campaign, pause it until tracking is verified.

Path:

```text
Campaigns -> Campaigns -> select campaign -> Status -> Pause
```

Reason: Performance Max can spend on Display/YouTube/low-intent inventory before conversion quality is proven.

## 3. Confirm Account Settings

Check these once because some are hard to change later.

Path:

```text
Billing -> Settings
Tools -> Preferences
```

Confirm:

- Billing country is correct.
- Currency is correct.
- Time zone is correct.
- Business name and website are correct.
- Payment method is stable.

## 4. Create Conversion Actions

Path:

```text
Goals -> Conversions -> Summary -> New conversion action -> Website
```

Website:

```text
https://www.cooldrivepro.com/
```

Create these conversion actions.

### 4.1 Lead Form Submit

Settings:

```text
Name: lead
Category: Submit lead form
Goal optimization: Primary
Count: One
Value: Do not use a value yet
Click-through conversion window: 30 days
Attribution: Data-driven if available
Enhanced conversions: off for launch
```

Choose manual/event setup, not a thank-you page URL.

Copy:

```text
Google tag ID: AW-XXXXXXXXXX
Conversion label: label after AW-XXXXXXXXXX/
```

### 4.2 Contact Form Submit

Settings:

```text
Name: contact_form
Category: Contact
Goal optimization: Primary
Count: One
Value: Do not use a value yet
```

Copy the conversion label.

### 4.3 WhatsApp Click

Settings:

```text
Name: whatsapp_click
Category: Contact
Goal optimization: Secondary
Count: One
Value: No value
```

Copy the conversion label, but keep it secondary at launch.

### 4.4 Telegram Click

Settings:

```text
Name: telegram_click
Category: Contact
Goal optimization: Secondary
Count: One
Value: No value
```

Copy the conversion label, but keep it secondary at launch.

## 5. Send These Values For Website Setup

After creating conversion actions, collect:

```text
Google Ads customer ID:
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL=
VITE_GOOGLE_ADS_CONTACT_CONVERSION_LABEL=
VITE_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL=
VITE_GOOGLE_ADS_TELEGRAM_CONVERSION_LABEL=
VITE_WEB3FORMS_KEY=
```

Minimum acceptable launch values:

```text
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
VITE_GOOGLE_ADS_CONVERSION_LABEL=form-lead-label
VITE_WEB3FORMS_KEY=web3forms-access-key
```

## 6. Website Deployment After Values Are Ready

Because this site is manually built with Vite before Cloudflare upload, build-time variables must exist before `npm run build`.

Create or update `.env.production.local` locally, then run:

```text
npm run build
npx wrangler pages deploy dist/client --project-name cooldrivepro
```

After deploy, verify:

- Production JS contains the Google Ads ID.
- Google Tag Assistant detects the Google tag.
- Landing page forms submit to Web3Forms/email.
- Form emails contain UTM and `gclid` fields.
- Google Ads Diagnostics sees conversion activity.

## 7. Build The Real Search Campaigns

Create Search campaigns manually. Do not rely on the signup Performance Max campaign as the main launch campaign.

Path:

```text
Campaigns -> New campaign -> Leads -> Search
```

Campaign settings:

```text
Networks: Google Search only
Search partners: Off at launch if available
Display Network: Off
Locations: United States, Canada, United Kingdom, Australia, New Zealand, Ireland
Location option: Presence only
Languages: English
Final URL suffix: utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}
```

Starting campaigns:

- Search - Parking AC - EN
- Search - Truck Sleeper AC - EN
- Search - Fleet ROI - EN
- Search - RV Van AC - EN
- Search - Distributor - EN
- Search - Brand - EN

Use exact and phrase match only in the first week.

## 8. Add Negative Keywords Before Launch

Apply a shared negative list before any budget runs.

Must-have launch negatives:

```text
repair
home ac
window air conditioner
portable room air conditioner
split ac for home
hvac jobs
hvac salary
technician training
free
used
second hand
parts
compressor only
freon
wiring diagram
pdf
manual
amazon
alibaba
temu
reddit
youtube
definition
what is
```

## 9. Day-One Launch Budget

If tracking is verified:

```text
Search total: USD 30-50/day
PMax test only: USD 10-20/day, optional
```

If tracking is not verified:

```text
Keep campaigns paused.
Do not run real spend.
```

## 10. First 7 Days Rules

- Check account twice per day.
- Add negative keywords daily.
- Do not use broad match.
- Do not raise budget by more than 20-30% per day.
- Do not optimize toward chat clicks only.
- Do not judge by clicks; judge by qualified inquiries.
- Pause bad spend quickly, but avoid rebuilding everything every day.
