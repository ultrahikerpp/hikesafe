# Task 8 single-route recheck: 東滿步道

Review date: 2026-07-16
Canonical name: `東滿步道`

## Decision

Rejected. No catalog record was added or changed.

## Newly checked official URLs

- https://www.forest.gov.tw/0000278
- https://www.forest.gov.tw/taichung_intro/news/0076484

`data/routes/sources.json` already contained the pre-existing Forestry trail detail URL:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=023

## Direct official values

### 1) 農業部林業及自然保育署：自然步道頁

Source: https://www.forest.gov.tw/0000278

Direct values published on the page:

- `routeName`: `東滿步道`
- `region`: `桃園市復興區；新北市三峽區`
- `difficulty`: `2`
- `distanceKm`: `7.7`
- `permitNotes`: `入山管制 否`
- route planning text: `一天`
- entrance evidence:
  - `東眼山端`
  - `滿月圓端`
- route description text:
  - `自海拔870公尺的東眼山林道終點開始`
  - `直下往海拔500尺的滿月圓瀑布區`

The page does not publish named intermediate checkpoints or an exact minute total.

### 2) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=023

Direct values published on the page:

- `routeName`: `東滿步道`
- `region`: `桃園市復興區；新北市三峽區`
- `difficulty`: `2`
- `distanceKm`: `7.7` (page summary as `步道全長 7.7 公里`)
- `permitNotes`: `入山申請 否`
- route planning text: `建議時間 一天`
- detailed route text:
  - `東眼山森林遊樂區→(3K,60分鐘)→東滿步道西側入口`
  - `→(4.19K,115分鐘)→拉卡山登山步道岔路口`
  - `→(0.25K,5分鐘)→北插天山登山步道岔路口`
  - `→(2.92K,120分鐘)→東滿步道東側入口`
  - `→(3K,60分鐘)→滿月圓森林遊樂區`

The published detailed route sums to `13.36 km` and `360 minutes`.

### 3) 農業部林業及自然保育署新竹分署：開放公告

Source: https://www.forest.gov.tw/taichung_intro/news/0076484

Direct values published on the page:

- reopening date: `2025-07-14`
- boundary text:
  - `自北插天山步道岔路口至滿月圓國家森林遊樂區登山口(4.5K~7.5K)日前封閉施工`
  - `自東眼山國家森林遊樂區登山口，越過北插天山與東眼山間之鞍部再下往滿月圓國家森林遊樂區登山口，總長約7.5K`

This official notice describes the trail itself as approximately `7.5K` between the two forest recreation area trailheads, not the `13.36 km` boundary implied by the detail-page segment list from forest recreation area to forest recreation area.

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `distanceKm` is not supported by one unambiguous official boundary.
   - Forestry summary page publishes `7.7公里`.
   - Forestry detail page also publishes `步道全長 7.7 公里`.
   - The same Forestry detail page publishes detailed route segments that add up to `13.36 km`.
   - The Forestry reopening notice separately describes the trail itself as `總長約7.5K` between the two forest recreation area trailheads.

2. `durationMinutes` is not directly supported by one exact official value for the same canonical route boundary.
   - Forestry summary page publishes only `一天`.
   - Forestry detail page also publishes only `建議時間 一天`.
   - The same Forestry detail page publishes segment times that add up to `360 minutes`.
   - Under the task rules, `一天` cannot be converted into exact minutes.

3. `checkpoints` cannot be assigned safely for one exact canonical route.
   - Forestry summary page gives only two endpoint labels: `東眼山端` and `滿月圓端`.
   - Forestry detail page instead frames the route as `東眼山森林遊樂區 → 東滿步道西側入口 → 拉卡山登山步道岔路口 → 北插天山登山步道岔路口 → 東滿步道東側入口 → 滿月圓森林遊樂區`.
   - The 2025 reopening notice defines a different explicit boundary segment: `東眼山國家森林遊樂區登山口` to `滿月圓國家森林遊樂區登山口`, and separately references the repaired section `4.5K~7.5K`.
   - These are not just alternate labels for one identical start/end route; they mix forest recreation areas, trail entrances, and internal junctions under different outer boundaries.

4. The conflict is internal to the Forestry source set.
   - The same official detail page simultaneously presents `步道全長 7.7 公里` and a segmented route totaling `13.36 km`.
   - The Forestry reopening notice further suggests the actual trail segment is about `7.5K` from trailhead to trailhead.
   - Because the official source set does not publish one exact, stable boundary that cleanly matches both the summary distance and the segmented route, the canonical route is not unambiguous.

5. No allowed official page directly supports the full required set of `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes` for one exact canonical route.
   - Forestry summary page lacks named checkpoints and exact minutes.
   - Forestry detail page lacks an exact minute field and conflicts internally on route boundary.
   - The Forestry reopening notice clarifies a different trailhead-to-trailhead boundary, but does not provide the complete required field set.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
