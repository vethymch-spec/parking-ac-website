# Stage 2 (research) — 2026-06-08

**Data provenance**: Real Google SERP via Serper.dev (200 queries, 0 cached + 200 live).
**Volume / KD**: heuristic estimates (NOT live DataForSEO/Ahrefs); flagged `est_volume` / `est_kd` in artifacts.
**Cannibalization basis**: 163 existing blog slugs in client/public/data/blog/list.json.

## Counts
- Seeds: 200
- SERP fetched: 200
- Total kw in clusters: 168
- Total kw in orphans: 32
- Clusters formed: 79
- Cannibalization flags: 17

## Hub breakdown
- **H2 RV / Motorhome**: 3 clusters, 70 kw, est total volume 40595
- **H9 OEM / Wholesale**: 14 clusters, 21 kw, est total volume 12554
- **H6 Comparison**: 13 clusters, 20 kw, est total volume 18290
- **H8 Regional Guides**: 17 clusters, 19 kw, est total volume 19250
- **H5 Anti-Idle & Fleet**: 9 clusters, 12 kw, est total volume 6070
- **H4 Battery / Solar**: 7 clusters, 9 kw, est total volume 3530
- **H7 Install & Fit**: 13 clusters, 14 kw, est total volume 5365
- **H1 Truck Sleeper**: 2 clusters, 2 kw, est total volume 1100
- **H3 Van / Camper**: 1 clusters, 1 kw, est total volume 550

## Gate evaluation (skill spec)
- Rule: each cluster ≥3 spokes (hub+2 spokes), Hub kw est_volume ≥500, cluster est_kd median ≤40
- Clusters passing all 3 rules: 6 / 79

## Top 10 priority keywords
1. `webasto alternative` — H6 / comparison / est_vol 2200 / est_kd 44 / priority 70
2. `tripac alternative` — H6 / comparison / est_vol 2200 / est_kd 44 / priority 70
3. `dometic alternative` — H6 / comparison / est_vol 2200 / est_kd 44 / priority 70
4. `parking ac oem` — H2 / commercial / est_vol 1100 / est_kd 38 / priority 43
5. `webasto vs eberspacher` — H6 / comparison / est_vol 1100 / est_kd 38 / priority 41
6. `indel b alternative` — H6 / comparison / est_vol 1100 / est_kd 38 / priority 41
7. `truma ac alternative` — H6 / comparison / est_vol 1100 / est_kd 38 / priority 41
8. `kingclima vs guchen` — H6 / comparison / est_vol 1100 / est_kd 38 / priority 41
9. `guchen vs kingclima` — H6 / comparison / est_vol 1100 / est_kd 38 / priority 41
10. `parking ac moq` — H2 / transactional / est_vol 1100 / est_kd 38 / priority 38

## Top 5 clusters by est volume
- **H2-c01** [H2 RV / Motorhome] hub="parking ac oem" — 67 kw, est vol 38945, est kd med 32, template `vs-comparison`
- **H9-c64** [H9 OEM / Wholesale] hub="b2b parking ac supplier" — 7 kw, est vol 5225, est kd med 32, template `b2b-supplier-landing`
- **H6-c26** [H6 Comparison] hub="webasto alternative" — 3 kw, est vol 4400, est kd med 38, template `vs-comparison`
- **H8-c46** [H8 Regional Guides] hub="parking ac mexico" — 3 kw, est vol 3300, est kd med 38, template `regional-buyer-guide`
- **H6-c29** [H6 Comparison] hub="dometic alternative" — 2 kw, est vol 2915, est kd med 44, template `vs-comparison`

## Lane Output Contract
LANE: research
STATUS: pass
ARTIFACTS:
- research/2026-06-08/seeds.txt
- research/2026-06-08/keyword-map.csv (168 rows)
- research/2026-06-08/clusters.json (79 clusters)
- research/2026-06-08/cluster-architecture.mmd
- research/2026-06-08/orphans.csv (32 rows)
- research/2026-06-08/cannibalization-flags.csv (17 rows)
- research/2026-06-08/serp-raw/*.json (cached SERP)
NEXT:
- Pick top 3-5 clusters → invoke `cooldrivepro-seo brief` (Stage 3) to produce SERP-gap briefs
- Resolve cannibalization flags before allocating new slugs
- (Optional upgrade) Inject DataForSEO/Ahrefs key to replace est_volume/est_kd with live data
