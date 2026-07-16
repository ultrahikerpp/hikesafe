# Task 8 suburban-only batch M report

## Scope

This batch assessed only the exact remaining canonical names requested:

- 塔曼山步道
- 北得拉曼巨木步道
- 馬里光瀑布步道

No Hundred Peak records were changed. Only `catalog.json` and this report were changed; the requested source pairs for trail IDs 034–036 were already registered in `sources.json`.

## Accepted

### 塔曼山步道

- Added as a suburban route with no Small Hundred Peak designation.
- The Forestry and Nature Conservation Agency page gives the detailed boundary from 大水塔登山口 to 塔曼山 and back: 3.0 km outward plus 3.0 km return, with 180 minutes outward and 120 minutes return.
- The catalog therefore records the coherent detailed-route boundary as 6.0 km and 300 minutes, rather than mixing the page's 3 km summary with the round-trip time.
- Official facts used: elevation difference 130 m, difficulty 2, and no entry-mountain application for this boundary. Start coordinates, cumulative gain, and evacuation points are unpublished and remain `null`/`[]`.

## Rejected or already present

### 北得拉曼巨木步道

Rejected. The Forestry and Nature Conservation Agency publishes a 2.6 km trail length and a qualitative recommended time of one day, but no precise duration for the route boundary. No duration was inferred.

### 馬里光瀑布步道

Already present in the catalog as `maliguang-waterfall-trail`. Its existing record matches the official Forestry detailed route: 0.6 km outward, 0.6 km return, 25 minutes total, difficulty 1, and 50 m elevation difference. No duplicate record was added.

## Verification

- Node 24 verifier: `Hundred peaks: 100`, `Suburban routes: 53`, `Small hundred peaks: 3`, `Missing sources: 0`, and `Duplicate slugs: 0`. The command remains nonzero only for the known unfinished suburban and Small Hundred Peak coverage requirements.
- `git diff --check`: passed.
