# Task 8 suburban trails batch J

## Scope

Reviewed only the exact remaining canonical names 茂興懷舊步道、鐵杉林自然步道、望洋山步道. No Hundred Peak records were changed. No Small Hundred Peak designation was added.

## Rejected

### 茂興懷舊步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=016)

The official page publishes a 1.6 km partially looped trail and a recommended time of half a day. Its detailed route separately offers a 1.1 km main line with return, plus distinct 0.25 km upper- and lower-loop options. These alternatives do not define one catalog boundary with one exact duration, so no distance or duration was inferred.

### 鐵杉林自然步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=018)

The official page publishes a 1.3 km trail and a recommended time of half a day. The detailed route instead includes the approach from 太平山莊 and the return sequence, totaling 4.4 km and 150 minutes. Because the summary trail boundary and detailed itinerary boundary differ, no catalog record was added.

### 望洋山步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=021)

The official page publishes a 1.2 km linear trail, while its detailed route includes a 0.9 km segment to the observatory, a 0.7 km segment to the branch, and a 0.3 km branch, totaling 1.9 km and 55 minutes. The published summary and detailed sequence therefore do not define the same boundary, so no distance or duration was inferred.

## Verification

- Node 24 catalog verifier: source registry, schema, field assignments, and duplicate-slug checks pass; only expected overall coverage errors remain.
- `git diff --check`: passed.
- Only `data/routes/catalog.json`, `data/routes/sources.json`, and this report were owned by this batch; existing unrelated changes were preserved.
