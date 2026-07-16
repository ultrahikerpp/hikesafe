# Task 8 suburban trails batch N

## Scope

Reviewed only the exact remaining canonical names 大雪山國家森林遊樂區步道群、八仙山主峰步道、能高越嶺道-西段. No Hundred Peak records were changed. No Small Hundred Peak designation was added.

## Rejected

### 大雪山國家森林遊樂區步道群 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=049)

The official page explicitly describes the site as a group containing multiple trails, including 長壽山、橫嶺山、稍來山 and 鳶嘴山, rather than one route boundary. Its summary fields therefore cannot represent a single coherent route record. No catalog record or inferred distance, duration, or route facts was added.

### 八仙山主峰步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=052)

The page summary reports a 6 km linear one-way trail, while the detailed sequence returns from 八仙山主峰 to 靜海寺登山口 and includes a 240-minute return segment. The same page also describes the trip as approximately eight hours round trip. These statements do not define one coherent distance/time boundary, so no catalog record or inferred value was added.

### 能高越嶺道-西段 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=064)

The page summary reports 15.2 km, while the detailed first-day west-section sequence from 屯原登山口 to 天池山莊 totals 13.0 km (4.5 + 3.5 + 5.0 km). The detailed second-day sequence then continues through the east section, so it cannot be used to repair the west-section boundary. Because the summary and detailed boundary are inconsistent, no catalog record or inferred duration/distance was added.

## Verification

- Node 24 catalog verifier: source registry, schema, source assignments, canonical names, and duplicate-slug checks pass; only expected overall coverage errors remain.
- `git diff --check`: passed.
- This batch changed only this report; `catalog.json` and `sources.json` were not modified.
