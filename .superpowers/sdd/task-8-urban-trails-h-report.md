# Task 8 suburban trails batch H

## Scope

Reviewed only the exact remaining canonical names 里龍山、南澳古道、拳頭姆自然步道. No Hundred Peak records were changed. No Small Hundred Peak designation was added without an official Sports Administration source; 里龍山 uses the official designation 080.

## Added

### 里龍山 — added

Official sources:

- [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=133)
- [Sports Administration Small Hundred Peaks no. 080](https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=79)

The Forestry page publishes a 4.07 km trail length and a detailed out-and-back route. The catalog records the complete round-trip boundary as 8.14 km and 300 minutes, matching the detailed 120 + 50 + 40 + 90 minute sequence. It also records the official 850 m elevation difference, difficulty 3, entry permit requirement, and the current bridge warning. Unpublished cumulative gain, start coordinates, and evacuation points remain null/empty.

### 南澳古道 — added

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=002)

The page publishes a 3.8 km outbound route and a detailed return sequence. The catalog records the complete round-trip boundary as 7.6 km and 300 minutes, with the published 100 m elevation difference, difficulty 1, no entry permit, and ordered checkpoints. Unpublished cumulative gain, start coordinates, and evacuation points remain null/empty.

## Rejected

### 拳頭姆自然步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=005)

The page summary publishes 1.3 km, while its detailed route sequence totals 1.8 km. Because the official summary and detailed route do not define one consistent boundary, no catalog record or inferred duration/distance was added.

## Verification

- Node 24 catalog verifier: source registry, schema, field assignments, and duplicate-slug checks pass; only expected overall coverage errors remain.
- `git diff --check`: passed.
- Only `data/routes/catalog.json`, `data/routes/sources.json`, and this report were changed by this batch.
