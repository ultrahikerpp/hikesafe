# Task 8 final suburban trail batch

Date: 2026-07-16

## Scope

Assessed only the exact remaining canonical names 奮起湖大凍山步道、土匪山步道、關子嶺大凍山步道. Hundred-peak data was not changed.

## Accepted

- 關子嶺大凍山步道 — accepted using the official detailed out-and-back boundary: 大凍山步道入口 →（0.7 km，20 minutes）→ 橫石亭 →（0.65 km，20 minutes）→ 曉風亭 →（0.95 km，30 minutes）→ 大棟山三角點 →（2.3 km，50 minutes）→ 大凍山步道入口. The catalog records 4.6 km and 120 minutes, matching the detailed route. The official summary separately lists 2.3 km; that is not mixed with the round-trip boundary.

The official page supplies 臺南市白河區, difficulty 2, height difference 471 m, and 入山申請：否. Start coordinates, cumulative elevation gain, and evacuation points are not published and remain null/null/[]; no small-hundred designation is asserted. All 16 RouteInput fields are assigned exactly once to the registered official source.

The same official page currently reports the trail as temporarily closed for facility repairs through 2026-07-31. The catalog has no availability-status field, so this status is recorded here rather than encoded as a route fact.

## Rejected

- 奮起湖大凍山步道 — rejected. The official summary lists 7.1 km, while the detailed route segments total 3.6 km; no single defensible boundary is selected.
- 土匪山步道 — rejected. The official summary lists 0.85 km, while the detailed route gives only 登山口→（60分）→涼亭 and does not publish a complete boundary duration; no duration or route boundary is inferred.

## Verification

- Node 24 catalog verifier: run after the change; expected remaining failures are only the overall 100/100/100 coverage gaps.
- `git diff --check`: run after the change.

Official sources:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=100
- https://recreation.forest.gov.tw/Trail/RT?tr_id=103
- https://recreation.forest.gov.tw/Trail/RT?tr_id=105
