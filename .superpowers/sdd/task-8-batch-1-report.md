# Task 8 Batch 1 — 都蘭山 catalog record

**Status: COMPLETE**

**Reviewed:** 2026-07-14

## Delivered

- Added exactly one catalog record for Taiwan Small Hundred Peak `#093 都蘭山`.
- Selected `都蘭山步道` as a 7.6 km / 330 minute round trip from and back to `都蘭山步道觀景平台停車場`.
- Registered the three missing official `(organization, URL)` pairs used by the record.
- Preserved the 75 pre-existing uncommitted source records unchanged.

## Boundary review

The Forestry detailed route is:

`都蘭山步道觀景平台停車場 → 觀景台 → 普悠瑪祭台 → 大石壁 → 都蘭山三角點 → 都蘭山步道觀景平台停車場`

Its published legs total `1.38 + 0.92 + 1.4 + 0.1 + 3.8 = 7.6 km` and `60 + 60 + 75 + 15 + 120 = 330 minutes`. The separate `步道全長 3.79 公里` / `線型單向` summary and the Sports Administration's approximately three-hour ascent were not used for distance, duration, or checkpoints.

## Official sources and field attribution

- [農業部林業及自然保育署 — 都蘭山步道](https://recreation.forest.gov.tw/Trail/RT?tr_id=140) is the primary source. It supports `routeName`, `region`, `distanceKm`, `elevationGainM`, `elevationDifferenceM`, `durationMinutes`, `difficulty`, `checkpoints`, `evacuationPoints`, and `permitNotes`.
- [教育部體育署 — NO.093 都蘭山](https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=92) supports `slug`, `mountainName`, `kind`, and `designations` under the catalog classification contract.
- [農業部林業及自然保育署 — 手機可通訊點標示資訊](https://www.forest.gov.tw/UserFiles/001/Images/web/communication_11502.pdf) explicitly labels WGS84 columns and supports `startLat` / `startLng` from the `都蘭山步道 0K` row: `22.87264`, `121.17931`.

All 16 source-reference-supported `RouteInput` fields are assigned exactly once. `elevationGainM` is `null` and `evacuationPoints` is `[]` because the official route source does not publish those data. The official trail-height semantic remains `elevationDifferenceM: 600`; `permitNotes` preserves `入山申請：否`.

## Verification

- Node: `v24.18.0` from Homebrew `node@24`.
- `npm run routes:verify` could not reach catalog analysis because the shell resolved Node 22 and the sandbox denied the `tsx` IPC socket with `EPERM`.
- Equivalent Node 24 entrypoint: `/opt/homebrew/opt/node@24/bin/node --import tsx scripts/verify-route-catalog.ts`.
- Result: expected remaining coverage failure only — `0` Hundred Peaks, `1` suburban route, and `1` Small Hundred Peak; `Missing sources: 0`; `Duplicate slugs: 0`; no schema or source-registry error.
- Boundary arithmetic check matched the catalog's `7.6` km and `330` minutes.
- Source-reference audit found no missing, unexpected, or duplicate field assignments.
- Source registry audit found no duplicate `(organization, URL)` pairs.
- `git diff --check` passed.

## Scope

Only `data/routes/catalog.json`, `data/routes/sources.json`, and this explicitly requested report belong to the batch. Pre-existing report, plan, and `.DS_Store` changes were left untouched.
