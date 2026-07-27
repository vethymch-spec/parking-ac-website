# CoolDrivePro Google Ads B2B Launch Strategy

This is the execution playbook for launching CoolDrivePro Google Ads with strict budget control and a lead-quality-first mindset. It is written for parking air conditioner inquiries from fleets, truck owners, RV/van buyers, distributors, dealers, and regional supply partners.

## Executive Decision

The winning launch strategy is not broad traffic. It is controlled commercial intent.

- Primary channel: Google Search.
- Secondary/testing channel: Performance Max only at very low budget if the account wizard forces it.
- Primary conversion: form lead.
- Secondary conversion: WhatsApp/Telegram click only after matching chat clicks to qualified inquiries.
- First-wave geography: United States, Canada, United Kingdom, Australia, New Zealand, Ireland.
- First-week posture: conservative learning period, no aggressive scaling.

Do not judge success by clicks. Judge success by qualified inquiries.

## Launch Gate

Do not spend meaningful budget until these are complete:

1. Billing is stable and the account is not repeatedly failing payment attempts.
2. Advertiser verification, business info, terms/privacy/contact pages are acceptable.
3. `VITE_GOOGLE_ADS_ID` is available from Google Ads.
4. Form lead conversion label is available.
5. `VITE_WEB3FORMS_KEY` is configured for direct form delivery.
6. Production is rebuilt after build-time variables are added.
7. Tag Assistant sees the Google tag on production pages.
8. A test landing page form submit reaches email/Web3Forms with UTM and click IDs.
9. Google Ads Diagnostics sees the conversion action.
10. The team can reply to leads within the same day.

If any item is missing, run only a tiny account-warmup budget or pause.

## Account And Campaign Architecture

### Recommended Structure

Use separate Search campaigns by intent. Do not mix fleet buyers, RV buyers, dealer buyers, and generic parking AC searches in one campaign.

| Campaign | Purpose | Budget Day 1-7 | Landing Page | Match Type |
| --- | --- | ---: | --- | --- |
| Search - Parking AC - EN | Core product demand | USD 20-35/day | `/landing/truck-parking-ac` | Exact + Phrase |
| Search - Truck Sleeper AC - EN | Truck sleeper intent | USD 15-30/day | `/landing/truck-parking-ac` | Exact + Phrase |
| Search - Fleet ROI - EN | Fleet/B2B ROI demand | USD 10-25/day | `/landing/fleet-parking-ac-roi` | Exact + Phrase |
| Search - RV Van AC - EN | RV/van/off-grid demand | USD 10-20/day | `/landing/rv-van-12v-ac` | Exact + Phrase |
| Search - Distributor - EN | Dealer/distributor demand | USD 5-15/day | `/landing/distributor-parking-ac` | Exact + Phrase |
| Search - Brand - EN | Brand protection | USD 3-5/day | `/` or `/contact` | Exact |

If total starting budget is small, start with only two campaigns:

1. `Search - Parking AC - EN`: USD 25/day.
2. `Search - Truck Sleeper AC - EN`: USD 20/day.

Add Fleet, RV/Van, and Distributor only after search terms are clean.

### Performance Max Rule

If the current first campaign is Performance Max, do not use it as the main lead engine yet.

Recommended PMax setup:

- Budget: USD 10-20/day only.
- Final URL expansion: off or restricted to provided landing pages.
- Assets: real product images + selected realistic truck/RV scene images.
- Search themes: only parking AC/truck sleeper/no-idle terms.
- Conversion goal: form lead only.
- Do not include WhatsApp/Telegram as primary goals.

PMax should be treated as account warmup and asset testing. Search should be the profit center.

## Geographic Targeting

First-wave launch countries:

- United States
- Canada
- United Kingdom
- Australia
- New Zealand
- Ireland

Location option must be:

```text
Presence: People in or regularly in your targeted locations
```

Do not use:

```text
Presence or interest
```

Exclude countries where shipping, warranty, language support, or payment handling is not ready.

Second-wave countries after first 7-14 days:

- Germany
- Netherlands
- France
- Spain
- Italy
- Poland
- United Arab Emirates
- Saudi Arabia
- South Africa

Second-wave countries should not be mixed into the same English learning campaign unless the budget is very small and the test is intentional.

## Bidding Strategy

### Days 1-7

Use one of these:

1. Manual CPC if available.
2. Maximize Clicks with CPC cap.
3. Maximize Conversions only if Google forces the setup and conversion tracking is verified.

Do not use Target CPA in the first week unless there are already enough qualified conversions.

Starting CPC guardrails:

- Core parking AC: USD 1.50-3.50 max CPC.
- Truck sleeper AC: USD 2.00-4.50 max CPC.
- Fleet ROI: USD 2.50-6.00 max CPC.
- Distributor: USD 1.50-4.00 max CPC.
- Brand: USD 0.50-1.50 max CPC.

If CPC is too high with no qualified behavior after 20-30 clicks, pause or tighten keywords before raising budget.

### Days 8-21

Move slowly:

- Increase budget by 20-30% only if lead quality is real.
- Keep exact and phrase match.
- Add negatives every day.
- Split high-intent winners into dedicated ad groups.

### After 15-30 Qualified Leads

Then test:

- Maximize Conversions.
- Target CPA only after real CPL is known.
- Separate bidding by lead type if volume supports it.

## Keyword Strategy

Start from these intent clusters.

### Core Parking AC

- `[parking air conditioner]`
- `"parking air conditioner"`
- `[parking ac]`
- `"parking ac unit"`
- `[12v parking air conditioner]`
- `"12v parking ac"`
- `[24v parking air conditioner]`
- `"24v parking ac"`

### Truck Sleeper AC

- `[truck sleeper air conditioner]`
- `"truck sleeper air conditioner"`
- `[semi truck air conditioner]`
- `"semi truck parking ac"`
- `[truck cab air conditioner]`
- `"sleeper cab ac"`

### No-Idle / Battery Powered

- `[no idle truck ac]`
- `"no idle truck air conditioner"`
- `[battery powered truck air conditioner]`
- `"battery powered truck ac"`
- `[apu alternative for trucks]`
- `"anti idle truck cooling"`

### Fleet / ROI

- `[truck idle fuel savings calculator]`
- `"parking ac fuel savings"`
- `"fleet truck air conditioning"`
- `"parking ac for fleets"`

### RV / Van

- `[battery powered rv air conditioner]`
- `"battery powered rv ac"`
- `[12v rv air conditioner]`
- `"12v air conditioner for rv"`
- `[12v van air conditioner]`
- `"van parking ac"`

### Distributor / Dealer

- `[parking ac distributor]`
- `"parking air conditioner distributor"`
- `[truck ac dealer]`
- `"12v air conditioner supplier"`

Do not start broad match. Broad match comes only after search term quality and negative lists are strong.

## Negative Keyword Strategy

Apply the shared negative list before launch. Add negatives daily from search terms.

### Launch Negatives

- repair
- car ac repair
- home ac
- window air conditioner
- portable room air conditioner
- split ac for home
- hvac jobs
- hvac salary
- technician training
- free
- used
- second hand
- parts
- compressor only
- freon
- wiring diagram
- pdf
- manual
- amazon
- alibaba
- temu
- reddit
- youtube
- definition
- what is

### Add Immediately If Seen

- installation service
- near me
- house
- apartment
- room cooler
- mini split home
- portable ac for bedroom
- broken ac
- ac recharge
- auto repair
- course
- certification
- salary
- wholesale cheap if low-quality only

The goal is to remove non-buyers before they teach the algorithm bad behavior.

## Landing Page Routing

Use the shortest path from intent to quote form.

| Intent | Landing Page |
| --- | --- |
| Core parking AC | `https://www.cooldrivepro.com/landing/truck-parking-ac` |
| Truck sleeper / no-idle | `https://www.cooldrivepro.com/landing/truck-parking-ac` |
| Fleet ROI / anti-idle savings | `https://www.cooldrivepro.com/landing/fleet-parking-ac-roi` |
| RV / van / 12V | `https://www.cooldrivepro.com/landing/rv-van-12v-ac` |
| Distributor / dealer | `https://www.cooldrivepro.com/landing/distributor-parking-ac` |

Do not send paid traffic to generic blog pages during launch.

Final URL suffix:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}
```

Auto-tagging must stay enabled so `gclid` is appended.

## Conversion Setup

Primary conversion actions:

- `lead`: landing page and blog lead forms.
- `contact_form`: contact page form.

Secondary conversion actions:

- `whatsapp_click`
- `telegram_click`

Do not optimize bidding to chat clicks alone until each click is matched to real buyer conversations.

Recommended Google Ads goal settings:

| Conversion | Primary/Secondary | Count | Notes |
| --- | --- | --- | --- |
| lead | Primary | One | Main sales inquiry. |
| contact_form | Primary | One | Main contact inquiry. |
| whatsapp_click | Secondary | One | Promote later only if quality is proven. |
| telegram_click | Secondary | One | Promote later only if quality is proven. |

Lead forms must not send PII to Google Ads event parameters.

## Asset Strategy

### Headlines

Use specific, commercial, product-led copy:

- 12V 24V Parking AC
- Truck Parking AC
- No Idle Truck Cooling
- Sleeper Cab AC Units
- Battery Powered AC
- Semi Truck Parking AC
- RV Parking AC Units
- Van Parking AC
- Factory Direct AC
- Parking AC for Trucks
- Get Quote Within 24h
- Fleet Pricing Available
- Top Mounted Truck AC
- Mini Split Truck AC
- CoolDrivePro AC

### Descriptions

- Explore 12V and 24V parking AC units for trucks RVs vans and fleets.
- Keep sleeper cabs cool without idling. Request a CoolDrivePro quote.
- Factory direct parking air conditioners with model recommendation support.
- Battery powered cooling for trucks RVs vans and off grid parking comfort.
- Compare top mounted and mini split parking AC options for your vehicle.

### Images

Use a controlled mix:

- Real product image.
- Truck sleeper installation scene.
- Truck rest-stop scene with rooftop parking AC.
- RV/van scene if running RV campaign.
- Distributor/fleet yard scene only if it clearly shows commercial context.

Avoid:

- Pure lifestyle photos without product.
- Home HVAC images.
- Unrealistic AI product shapes.
- Images with text overlays.
- Heavy logo-only creatives.

## Extensions / Assets

### Sitelinks

1. Truck Parking AC  
   URL: `/landing/truck-parking-ac`  
   Description: `12V and 24V no-idle cooling` / `For sleeper cabs and trucks`

2. Fleet ROI Report  
   URL: `/landing/fleet-parking-ac-roi`  
   Description: `Estimate idle fuel savings` / `Fleet pricing available`

3. RV & Van AC  
   URL: `/landing/rv-van-12v-ac`  
   Description: `Battery powered 12V cooling` / `For RVs vans and light trucks`

4. Dealer Supply  
   URL: `/landing/distributor-parking-ac`  
   Description: `Factory direct product line` / `Distributor inquiries welcome`

### Callouts

- 12V/24V Systems
- No-Idle Cooling
- Fleet Pricing
- Factory Direct
- Model Recommendations
- Quote Within 24h
- RV and Van Options
- Distributor Support

### Structured Snippets

Header: `Types`

- Top-Mounted AC
- Mini Split AC
- 12V Parking AC
- 24V Parking AC
- RV Parking AC
- Fleet Cooling

## Budget Control System

### If Total Budget Is USD 50/day

- Search - Parking AC - EN: USD 25
- Search - Truck Sleeper AC - EN: USD 15
- Search - Fleet ROI - EN: USD 5
- Brand: USD 5

### If Total Budget Is USD 100/day

- Search - Parking AC - EN: USD 35
- Search - Truck Sleeper AC - EN: USD 25
- Search - Fleet ROI - EN: USD 15
- Search - RV Van AC - EN: USD 10
- Search - Distributor - EN: USD 10
- Brand: USD 5

### If Total Budget Is USD 200/day

- Search - Parking AC - EN: USD 60
- Search - Truck Sleeper AC - EN: USD 45
- Search - Fleet ROI - EN: USD 30
- Search - RV Van AC - EN: USD 25
- Search - Distributor - EN: USD 20
- Brand: USD 10
- PMax test: USD 10

Do not increase budgets by more than 20-30% per day during learning.

## First 7 Days Operating Plan

### Day 0: Preflight

- Verify billing is stable.
- Verify tag and form conversion tracking.
- Submit one test form from each landing page.
- Confirm lead email includes UTM and `gclid` if present.
- Apply shared negative list.
- Confirm location targeting uses presence only.
- Confirm Search Partners are off for the first test if available.
- Confirm broad match is off.

### Day 1

- Launch with low budget.
- Check spend every 3-4 hours.
- Confirm impressions and clicks are coming from target countries.
- Submit no major edits unless something is clearly broken.

### Days 2-3

- Review search terms twice per day.
- Add negatives quickly.
- Pause any keyword with 20-30 bad clicks and no qualified behavior.
- Watch mobile traffic. If mobile chats are noisy, reduce mobile exposure if controls are available.

### Days 4-7

- Keep winners steady.
- Separate strong search terms into exact match.
- Pause weak ad groups with spend but no useful behavior.
- Increase budget only if qualified inquiries are real.

## Lead Qualification Scoring

Score every lead manually in the first two weeks.

| Score | Meaning | Action |
| --- | --- | --- |
| A | Fleet, dealer, distributor, 10+ units, clear country/use case | Feed as qualified lead. Prioritize follow-up. |
| B | Individual truck/RV buyer, clear vehicle and budget | Useful lead. Continue. |
| C | Vague buyer, no vehicle, no quantity | Keep but do not optimize too aggressively. |
| D | Repair, parts-only, job seeker, home HVAC, irrelevant | Add negative keywords and mark unqualified. |

Do not let D leads become the algorithm's teacher.

## KPI Targets

Early-stage targets are directional, not final.

| Metric | First 7 Days Signal |
| --- | --- |
| CTR Search | 3%+ acceptable, 5%+ good |
| CPC | Depends by country; watch outliers |
| Landing Page Form Rate | 1-3% acceptable, 3%+ good |
| Qualified Lead Rate | 30%+ of submitted leads should be relevant |
| Bad Click Rate | If high, tighten negatives/keywords/geos |

Do not optimize only for the cheapest CPL. Optimize for qualified CPL.

## Scaling Rules

Scale only when all conditions are true:

1. Billing and approval are stable.
2. Conversions are tracked correctly.
3. At least 3-5 qualified leads are received.
4. Search terms are mostly relevant.
5. The team can respond within 24 hours.

Scaling method:

- Increase budget 20-30%.
- Add exact match versions of winning terms.
- Add one new campaign or geography at a time.
- Keep separate campaigns for different languages.

Do not scale PMax before Search proves lead quality.

## Policy And Compliance Guardrails

Avoid claims that are hard to prove:

- Do not claim guaranteed fuel savings unless backed by calculation/context.
- Do not claim universal fit for all trucks/RVs.
- Do not use fake discounts or fake scarcity.
- Do not use misleading AI images where product shape or installation is unrealistic.
- Keep privacy, terms, contact, and return/shipping pages accessible.

Paid traffic pages should clearly show:

- Product category.
- 12V/24V compatibility.
- Vehicle use cases.
- Quote/contact method.
- Business contact information.
- Policy links.

## Tomorrow's Recommended Launch

If payment and tracking are fully ready:

1. Launch Search only if possible.
2. If PMax is already created, set it to USD 10-20/day and treat it as a test.
3. Launch core Search at USD 30-50/day.
4. Keep exact/phrase only.
5. Check search terms twice per day.

If payment is not stable or tracking is not verified:

1. Do not launch real spend.
2. Finish payment and verification first.
3. Keep the campaign paused.
4. Use the time to build the official Search campaigns.

## Final Strategic Position

CoolDrivePro should not buy broad air conditioner traffic. It should buy high-intent no-idle vehicle cooling demand.

The best first-month objective is not maximum traffic. It is building a clean conversion dataset: real parking AC buyers, fleets, dealers, and vehicle-specific inquiries. Once that dataset exists, the account can scale with confidence.
