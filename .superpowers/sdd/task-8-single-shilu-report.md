# Task 8 single-route review: 十字路來吉古道

## Decision

Accept one suburban catalog record for the exact canonical target `十字路來吉古道`.

## Official boundary and fields

Source: [台灣山林悠遊網：十字路來吉古道](https://recreation.forest.gov.tw/Trail/RT?tr_id=096)

- Official route type: linear, one-way.
- Official detailed route: 0.7 km outbound in 25 minutes, then 0.7 km return in 35 minutes.
- Catalog boundary: complete out-and-back, 1.4 km and 60 minutes.
- Officially stated difficulty: 2.
- Officially stated elevation difference: 100 m.
- Officially stated permit requirement: 入山申請：是.
- Officially stated checkpoints: 十字路來吉古道登山口, 步道終點, and the return to the trailhead.
- Start coordinates, accumulated elevation gain, and evacuation points are not stated by this source and remain `null` / `[]`.

The single official source is assigned exactly once to all 16 `RouteInput` fields through `sourceReferences`; no values are inferred.

## Verification

- Node 24 catalog verification: passed all non-coverage checks.
- `git diff --check`: passed.
