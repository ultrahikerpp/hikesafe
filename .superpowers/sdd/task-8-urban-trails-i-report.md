# Task 8 suburban trails batch I

## Scope

Reviewed only the exact remaining canonical names 新寮瀑布步道、九寮溪自然步道、台灣山毛櫸步道. No Hundred Peak records were changed. No Small Hundred Peak designation was added.

## Added

### 台灣山毛櫸步道 — added

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=013)

The official summary publishes a 3.8 km linear trail and the detailed route states 3.8 km outbound followed by 3.8 km returning to the entrance. The catalog records that complete out-and-back boundary as 7.6 km and 180 minutes, matching the published 20 + 20 + 15 + 15 minute outbound sequence and 110 minute return. It also records the official 200 m elevation difference, difficulty 2, and no entry permit. Cumulative gain, start coordinates, and evacuation points remain null/empty because the official page does not publish them.

## Rejected

### 新寮瀑布步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=011)

The official summary publishes 1.2 km, while the detailed sequence includes 0.9 km + 0.1 km + 0.5 km outbound and a separate 1.2 km return. These do not define one consistent route boundary, so no distance or duration was inferred.

### 九寮溪自然步道 — rejected

Official source: [Agriculture and Forestry Agency trail page](https://recreation.forest.gov.tw/Trail/RT?tr_id=012)

The official summary publishes a 3 km linear trail, while the detailed route starts at the control station, adds 2.2 km to the trail entrance, 1.8 km to the waterfall, and 4 km returning to the control station. Because the summary and detailed sequence use different boundaries, no catalog record was added.

## Verification

- Node 24 catalog verifier: source registry, schema, field assignments, and duplicate-slug checks pass; only expected overall coverage errors remain.
- `git diff --check`: passed.
- Only `data/routes/catalog.json`, `data/routes/sources.json`, and this report were owned by this batch; existing unrelated changes were preserved.
