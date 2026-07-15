# Task 8 Batch 7d — suburban-only review

Date: 2026-07-15

## Accepted

- 二崙自然步道 — 4 km circular route, 120 minutes, 30 m height difference, difficulty 1, no mountain-entry application. The official detailed route closes the loop: 0.7 + 0.4 + 0.8 + 0.7 + 1.4 km and 20 + 10 + 25 + 30 + 35 minutes.
- 塔山步道 — 3.5 km official trail length, 240 minutes for the explicit out-and-back detailed route, 563 m height difference, difficulty 2, no mountain-entry application. The catalog distance follows the official trail-length field; checkpoints preserve the complete detailed route boundary.

Both records use `null` for unpublished start coordinates and cumulative gain, `[]` for unpublished evacuation points, and assign all 16 `RouteInput` fields exactly once to the registered Forestry source.

## Rejected

- 龍過脈森林步道 — rejected. The official page reports a 4.2 km trail length, while its detailed route segments sum to 2.52 km. The conflicting official boundaries do not support a single defensible catalog distance, so no inferred value was added.

## Verification

- Node 24 verifier: source and duplicate-slug checks pass; only the expected overall 100/100/100 coverage errors remain.
- `git diff --check`: passed.

Official sources:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=078
- https://recreation.forest.gov.tw/Trail/RT?tr_id=079
- https://recreation.forest.gov.tw/Trail/RT?tr_id=080
