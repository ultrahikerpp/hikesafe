# Single-route suburban check: 澀水森林步道

## Decision

Rejected. The `seshui-forest-trail` catalog record added in commit `8d88ab8`
was reverted, and no replacement catalog record was kept.

## Official source

- 農業部林業及自然保育署：<https://recreation.forest.gov.tw/Trail/RT?tr_id=075>

The official page directly publishes these route facts:

- 步道全長：2.5 km
- 建議時間：半天
- 詳細路線：澀水社區旅遊服務站 → 景觀橋 → 土地公廟 → 水上平台，之後原路折返澀水社區旅遊服務站

## Rejection reason

`RouteInput.distanceKm` and `RouteInput.durationMinutes` must be exact numeric
catalog values. This source does not publish exact values for the full
out-and-back boundary in schema-ready form:

- The page's direct length is 2.5 km, but the detailed route explicitly
  continues with 原路折返. Recording `distanceKm: 2.5` would omit the official
  return boundary.
- Doubling the 2.5 km segment to 5 km would be an inferred round-trip value,
  not an official directly published distance.
- The page's direct time is only `半天`. Converting that to `durationMinutes`
  would be an inferred duration, not an exact official minute value.

Because the schema requires precise `distanceKm` and `durationMinutes`, this
route must stay out of `data/routes/catalog.json`.

This matches the earlier finding already recorded in
`.superpowers/sdd/task-8-batch-7c-report.md`, which rejected 澀水森林步道 for
the same reason: the page gives a 2.5 km segment to 水上平台 and an explicit
原路折返, but no exact official round-trip distance or minute duration.

## Verification

- `git diff --check`: passed.
- `node --import tsx scripts/verify-route-catalog.ts`: failed only on the
  expected overall incomplete-catalog targets after this reversion
  (`Hundred peaks: 100`, `Suburban routes: 53`, `Small hundred peaks: 3`), with
  no missing-source or duplicate-slug errors introduced.
- This report documents the reviewer-directed reversion only; no other route
  records were changed.
