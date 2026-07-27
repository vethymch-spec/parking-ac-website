# CoolDrivePro Google Ads Launch Plan

This plan is for launching Google Search ads for CoolDrivePro parking air conditioners with conversion tracking already prepared in the website code.

## Launch Gate

Do not enable campaigns until all items below are complete:

- Google Ads billing and advertiser verification are ready.
- `VITE_GOOGLE_ADS_ID` is configured in Cloudflare Pages production environment variables.
- At least one primary conversion label is configured: `VITE_GOOGLE_ADS_CONVERSION_LABEL` or per-action labels.
- `VITE_WEB3FORMS_KEY` is configured so paid traffic form leads do not rely on a missing backend function.
- Build-time variables are present before the local Vite build, for example in `.env.production.local`.
- Production has been rebuilt and deployed after env variable changes.
- Google Tag Assistant confirms the tag on production pages.
- Test conversions are visible in Google Ads Diagnostics.
- Contact handling is ready for same-day replies through email, WhatsApp, and Telegram.

## Initial Account Structure

Start with Search campaigns only. Avoid Display and broad Performance Max until conversion quality is proven.

| Campaign | Goal | Match types | Initial daily budget | Landing pages |
| --- | --- | --- | --- | --- |
| Search - Parking AC - EN | Core commercial demand | Exact + Phrase | USD 30-60 | `/landing/truck-parking-ac` |
| Search - Truck Sleeper AC - EN | Truck and fleet demand | Exact + Phrase | USD 25-50 | `/landing/truck-parking-ac` |
| Search - RV Van AC - EN | RV, van, boondocking demand | Exact + Phrase | USD 15-30 | `/landing/rv-van-12v-ac` |
| Search - Fleet ROI - EN | High-intent ROI and anti-idle demand | Exact + Phrase | USD 20-40 | `/landing/fleet-parking-ac-roi` |
| Search - Distributor - EN | Dealer and regional partner demand | Exact + Phrase | USD 10-25 | `/landing/distributor-parking-ac` |
| Search - Brand - EN | Protect brand demand | Exact | USD 5-10 | `/`, `/contact` |

Use separate campaigns for non-English markets once the English campaign has baseline conversion data. Keep each language in its own campaign so ad copy, search terms, and landing pages stay clean.

## Geographic Targeting

Recommended first wave:

- United States
- Canada
- United Kingdom
- Australia
- New Zealand
- Ireland

Recommended second wave after query review:

- Germany
- Netherlands
- France
- Spain
- Italy
- Poland
- United Arab Emirates
- Saudi Arabia
- South Africa

Use `Presence: People in or regularly in your targeted locations`. Exclude regions where the company cannot sell, ship, support, or legally advertise.

## Bidding And Budget

Start conservatively until conversion tracking is verified.

- Days 1-7: Manual CPC or Maximize Clicks with a CPC cap; exact and phrase only.
- Days 8-21: Review search terms daily and add negatives aggressively.
- After 15-30 qualified conversions: test Maximize Conversions.
- After stable conversion value is known: consider Target CPA or conversion value bidding.

Do not optimize to WhatsApp/Telegram clicks alone until those clicks are matched to real qualified inquiries.

## Landing Page Map

| Intent | Best URL | Notes |
| --- | --- | --- |
| Parking AC supplier | `/landing/truck-parking-ac` | Primary conversion page for core truck and parking AC queries. |
| Split sleeper cab AC | `/landing/truck-parking-ac` | Routes buyers to top-mounted and mini split recommendations. |
| Compact 12V AC | `/landing/rv-van-12v-ac` | Good for light trucks, vans, and RVs. |
| No-idle truck cooling | `/landing/truck-parking-ac` | Shorter paid-search path than long educational content. |
| Fleet ROI | `/landing/fleet-parking-ac-roi` | Primary B2B ROI and fleet pricing page. |
| Fleet management | `/landing/fleet-parking-ac-roi` | B2B fleet audience. |
| 12V vs 24V decision | `/landing/truck-parking-ac` | Captures voltage comparison demand with quote CTA. |
| RV battery AC | `/landing/rv-van-12v-ac` | RV and boondocking demand. |
| Distributor inquiries | `/landing/distributor-parking-ac` | Dealer, installer, and regional partner campaigns. |

## Tracking And UTM Rules

Use a final URL suffix in Google Ads:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}
```

Keep auto-tagging enabled so Google Ads also appends `gclid`.

The site captures `utm_*`, `gclid`, `gbraid`, and `wbraid` into form submissions for lead attribution. These values are included in the lead email/Web3Forms payload, not in Google Ads conversion event parameters.

## First 72 Hours Operating Rules

- Check spend, conversions, and search terms at least twice per day.
- Pause keywords with irrelevant intent after 20-30 clicks and no qualified behavior.
- Add negatives immediately for repair, jobs, home HVAC, parts-only, and DIY traffic.
- Watch mobile traffic quality because chat clicks may inflate conversion counts.
- Do not expand to broad match until there is enough conversion data and a strong negative list.

## Files In This Launch Pack

- `docs/google-ads.md`: tracking setup and conversion configuration.
- `docs/google-ads-account-setup.md`: step-by-step Google Ads account creation and launch setup.
- `docs/google-ads-keyword-seed.csv`: import-ready keyword seed list.
- `docs/google-ads-negative-keywords.csv`: shared negative keyword list.
- `docs/google-ads-ad-assets.csv`: responsive search ad starter copy.
- `client/src/pages/AdLandingPage.tsx`: paid-search landing pages for truck, fleet ROI, RV/van, and distributor traffic.

## Information Still Needed From The Ad Account

- Google Ads customer ID.
- Google tag ID: `AW-XXXXXXXXXX`.
- Conversion labels for lead, contact form, WhatsApp click, and Telegram click.
- Confirmed shipping/support countries.
- Starting daily budget.
- Final Telegram username or bot if `cooldrivepro` is not the correct handle.
