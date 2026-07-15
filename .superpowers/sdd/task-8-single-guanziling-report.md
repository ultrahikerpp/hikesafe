# Single-route suburban check: 關子嶺碧雲寺-水火同源登山步道

## Decision

Rejected. No catalog record was added.

## Official source

- 農業部林業及自然保育署：<https://recreation.forest.gov.tw/Trail/RT?tr_id=106>

The page identifies the exact canonical route and provides a single route description from 碧雲寺三寶殿 to 水火同源. It also provides a coherent summary boundary of 1.5 km, difficulty 1, elevation difference 150 m, and 入山申請：否.

## Rejection reason

The official page provides only 「建議時間：半天」. It does not provide an exact duration in minutes. `durationMinutes` is a required positive integer in `RouteInput`, so assigning a value would require inference. The route is therefore rejected under the official-source-only rule.

No coordinates, elevation gain, or evacuation points were invented. The existing source registry entry for `tr_id=106` was sufficient; no source registry change was required.

## Verification

- Node 24 catalog verifier: run after this report was added; no route data or source-registry validation issue was introduced. Overall catalog coverage remains incomplete by design.
- `git diff --check`: passed.
