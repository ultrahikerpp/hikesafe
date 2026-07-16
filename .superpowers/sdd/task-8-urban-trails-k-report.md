# Task 8 suburban trails batch K

## Scope

Reviewed only the exact remaining canonical names 東滿步道、北插天山登山步道、霞喀羅國家步道. No Hundred Peak records were changed. No Small Hundred Peak designation was added.

## Added

### 霞喀羅國家步道 — added

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=026)

The official page defines the complete through-route from 石鹿登山口 to 養老登山口. Its detailed sequence lists 13 segments totaling 22.2 km and 610 minutes; the summary rounds the trail length to 22 km. The catalog uses the detailed boundary: 22.2 km, 610 minutes, difficulty 2, height difference 300 m, and the published checkpoints. No starting coordinate, accumulated gain, or evacuation point is published, so those fields remain null or empty. The page states that mountain-entry application is not required.

## Rejected

### 東滿步道 — rejected

Official sources: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=023) and [Forestry Agency official trail overview](https://www.forest.gov.tw/0000278)

The official summary gives a 7.8 km trail and a one-day recommendation but no exact duration. Its detailed route includes 3 km approaches from both forest recreation areas in addition to the 4.19 km, 0.25 km, and 2.92 km trail sections, so the detailed sequence does not share the summary trail boundary. No duration or boundary was inferred.

### 北插天山登山步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=025)

The official summary gives 4.7 km and recommends one day or more. The detailed route provides 0.4 km, 1.5 km, and 2.9 km segments, then describes the remaining ascent to the summit and the return without a complete numeric sequence or exact total time. Because the published boundary and time are incomplete for one coherent route, no record was added.

## Verification

- Node 24 catalog verifier: source registry, schema, field assignments, and duplicate-slug checks pass; only expected overall coverage errors remain.
- `git diff --check`: passed.
- Only `data/routes/catalog.json`, `data/routes/sources.json`, and this report were owned by this batch; no source registry change was necessary because all three official URLs were already registered.
