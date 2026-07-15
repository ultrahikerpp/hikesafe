# Task 8 Batch 7g report

## Scope

This tiny batch assessed only the exact remaining canonical names:

- 茶之道步道
- 對高岳森林浴步道
- 阿里山國家森林遊樂區巨木群步道

No hundred-peak data was changed.

## Accepted

### 對高岳森林浴步道

Official source: https://recreation.forest.gov.tw/Trail/RT?tr_id=093

The catalog uses the complete out-and-back boundary stated in the official detailed route: 3.4 km and 180 minutes. The official summary lists the 1.7 km one-way trail length; the catalog does not mix that one-way distance with the round-trip checkpoints. The page states difficulty 2, elevation difference 74 m, and no mountain-entry application.

All 16 `RouteInput` fields have exactly one `sourceReferences` assignment to the registered official source. Unpublished start coordinates, elevation gain, and evacuation points remain `null`/`[]`; no small-hundred designation was asserted.

## Rejected

### 茶之道步道

Official source: https://recreation.forest.gov.tw/Trail/RT?tr_id=092

Rejected because the official summary says 1.86 km while the detailed route segments total 2.9 km. The batch does not infer which boundary should govern.

### 阿里山國家森林遊樂區巨木群步道

Official source: https://recreation.forest.gov.tw/Trail/RT?tr_id=094

Rejected because the official detailed route describes two separate sections (600 m and 500 m) with different starts and ends. There is no single coherent route boundary to represent as one catalog record.

## Verification

- Node 24 catalog verifier: run after the change; expected remaining failures are only overall 100/100/100 coverage.
- `git diff --check`: run after the change.
