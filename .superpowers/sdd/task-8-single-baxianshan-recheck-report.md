# Task 8 single-route recheck: 八仙山主峰步道

Review date: 2026-07-16
Canonical name: `八仙山主峰步道`

## Decision

Rejected. No catalog record was added or changed.

## Newly checked official URLs

- https://www.forest.gov.tw/0000296
- https://taichung.forest.gov.tw/trail

`data/routes/sources.json` already contained the pre-existing Forestry trail detail URL:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=052

## Direct official values

### 1) 農業部林業及自然保育署：自然步道頁

Source: https://www.forest.gov.tw/0000296

Direct values published on the page:

- `routeName`: `八仙山主峰步道`
- `region`: `臺中市和平區`
- `difficulty`: `3`
- `distanceKm`: `6`
- `permitNotes`: `入山管制 否`
- `durationMinutes`: not published as an exact minute value; page says `路程規劃 一天`
- entrance evidence:
  - `八仙山主峰`
  - `八仙山森林遊樂區`

### 2) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=052

Direct values published on the page:

- `routeName`: `八仙山主峰步道`
- `region`: `臺中市和平區`
- `difficulty`: `3`
- `distanceKm`: `6` (page summary)
- `permitNotes`: `入山申請 否`
- route-shape text:
  - `步道型態 線型單向`
- route-planning text:
  - `建議時間 一天`
- overview text:
  - `以健行的步伐來回約需8小時`
  - `路程約13公里，需時八小時`
- `checkpoints` candidate labels from detailed route:
  - `靜海寺登山口`
  - `往佳保台山三叉路口`
  - `流籠頭`
  - `八仙山主峰`
- detailed boundary text:
  - `靜海寺登山口→(1.6K, 65分鐘)→往佳保台山三叉路口→(2.1K, 85分鐘)→流籠頭→(0.5K, 15分鐘)→八仙山主峰(6K, 240分鐘)→靜海寺登山口`

If that detailed string is read as one route sequence, the published segment data imply `10.2 km` and `405 minutes`.

### 3) 農業部林業及自然保育署臺中分署：自然步道列表

Source: https://taichung.forest.gov.tw/trail

Direct values published on the page:

- `routeName`: `區域步道-八仙山主峰步道`
- `region`: `臺中市和平區`
- `difficulty`: `3`
- trail status: `全線開放`

The list page does not publish exact `distanceKm`, `durationMinutes`, `checkpoints`, or `permitNotes`.

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `distanceKm` does not have one coherent official route boundary.
   - Forestry summary pages publish `6公里`.
   - The same Forestry detail page also describes the trip as `路程約13公里`.
   - The same detail page's detailed route text returns to `靜海寺登山口`; if its listed segment values are treated literally, they imply `10.2 km`.
   - These three published distance/boundary signals do not resolve to one exact canonical route.

2. `durationMinutes` is not directly supported by one exact official value.
   - Forestry summary page publishes only `一天`.
   - Forestry detail overview says `來回約需8小時` and `需時八小時`.
   - The detailed route text lists segment times that imply `405 minutes` if read as one complete sequence.
   - Under the task rules, `一天` cannot be converted into minutes, and the remaining official time evidence conflicts.

3. The official route shape is internally inconsistent.
   - Forestry detail page explicitly labels the trail `線型單向`.
   - That same page's detailed route text returns from `八仙山主峰` to `靜海寺登山口`.
   - A single catalog route cannot safely mix a one-way summary shape with a returned-to-start detailed sequence unless the official source clearly reconciles them.

4. `checkpoints` are not directly published as one stable official checkpoint list for the same boundary.
   - The detail page names `靜海寺登山口`, `往佳保台山三叉路口`, `流籠頭`, and `八仙山主峰`.
   - The Forestry summary page instead lists only two entrance rows: `八仙山主峰` and `八仙山森林遊樂區`.
   - Because the route boundary itself is not coherent, these labels cannot be safely promoted into one exact canonical checkpoint list.

5. No single allowed official page directly supports the full required set of `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes`, and the allowed official pages do not combine into one conflict-free same-start same-end route.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
