# Task 8 single-route review: 奮瑞古道

## Decision

Accepted one suburban route record for the exact canonical target `奮瑞古道`.

## Official source

- Organization: 農業部林業及自然保育署
- URL: https://recreation.forest.gov.tw/Trail/RT?tr_id=099
- Reviewed: 2026-07-16

The official page describes a single linear, two-way trail with a total length of
6.5 km. Its detailed route is one coherent boundary:

南登山口 →(1.3 km, 30 minutes)→ 涼亭 →(3.2 km, 90 minutes)→ 七步回音谷
→(1.0 km, 30 minutes)→ 瑞太古道登山口 →(1.0 km, 30 minutes)→ 北登山口
（奮瑞、瑞太古道登山口）

The segments sum to 6.5 km and 180 minutes, so the catalog uses that complete
one-way boundary. The same page supplies 嘉義縣竹崎鄉, difficulty 2, height
difference 500 m, and 入山申請：否. It does not publish WGS84 start coordinates,
cumulative elevation gain, or evacuation points; those fields remain null/null/[]
without inference.

## Source assignment

The record's `sourceReferences` assigns the single official source exactly once to
all 16 RouteInput fields:

`slug`, `mountainName`, `routeName`, `region`, `kind`, `startLat`, `startLng`,
`distanceKm`, `designations`, `elevationGainM`, `elevationDifferenceM`,
`durationMinutes`, `difficulty`, `checkpoints`, `evacuationPoints`, `permitNotes`.

No additional source or designation was added.
