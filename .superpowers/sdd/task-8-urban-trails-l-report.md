# Task 8 suburban trails batch L

## Scope

Reviewed only the exact canonical names 大霸尖山登山步道、紅河谷越嶺步道、哈盆越嶺步道. No Hundred Peak records were changed. No Small Hundred Peak designation was added.

## Existing

### 大霸尖山登山步道 — already present

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=027)

This canonical route already exists in `catalog.json`. The existing record uses the page's complete three-day detailed boundary: 觀霧山莊 → 九九山莊 → 大霸尖山霸基 → 九九山莊 → 觀霧山莊, totaling 60.6 km and 2,040 minutes. It was previously reviewed and is not duplicated or modified in this batch.

## Rejected

### 紅河谷越嶺步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=030)

The official page publishes a 15 km trail length, height difference of 810 m, difficulty 2, and no entry application requirement, but its recommended time is `-` and it does not publish a complete numeric detailed route boundary or exact duration. No `durationMinutes` or other missing boundary facts were inferred, so no record was added.

### 哈盆越嶺步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=031)

The page describes the restored section as a 14 km round trip taking 6–7 hours, while its trail-information summary separately lists 7.5 km and one day. Because the official duration is a range and the two published boundary descriptions do not provide one exact catalog boundary with an integer duration, no record was added.

## Verification

- Node 24 catalog verifier: source registry, schema, field assignments, and duplicate-slug checks pass; only expected overall coverage errors remain.
- `git diff --check`: passed.
- Only `data/routes/catalog.json`, `data/routes/sources.json`, and this report were owned by this batch. The two new official URLs were already registered; catalog and source registry were not modified.
