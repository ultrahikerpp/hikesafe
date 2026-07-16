# Task 8 single-route recheck: 望洋山步道

Review date: 2026-07-16
Canonical name: `望洋山步道`

## Decision

Rejected. No catalog record was added or changed.

## Newly checked official URLs

- https://www.forest.gov.tw/0000276
- https://tps.forest.gov.tw/TPSWeb/wSite/ct?ctNode=287&mp=1&xItem=2973
- https://travel.yilan.gov.tw/zh-tw/attraction/407/

`data/routes/sources.json` already contained the pre-existing Forestry trail detail URL:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=021

## Direct official values

### 1) 農業部林業及自然保育署：自然步道頁

Source: https://www.forest.gov.tw/0000276

Direct values published on the page:

- `routeName`: `望洋山步道`
- `region`: `宜蘭縣南澳鄉`
- `difficulty`: `2`
- `distanceKm`: `1.2`
- `durationMinutes`: not published; page says `半天`
- `permitNotes`: `入山管制 否`
- entrance evidence:
  - `步道入口`
  - three separate unlabeled entrance rows with elevation `1880` / `1873` / `2043`

### 2) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=021

Direct values published on the page:

- `routeName`: `望洋山步道`
- `region`: `宜蘭縣南澳鄉`
- `difficulty`: `2`
- `distanceKm`: `1.2` (page summary)
- `durationMinutes`: not published as an exact number; page says `建議時間 半天`
- `permitNotes`: `入山申請 否`
- `checkpoints` candidate labels from detailed route:
  - `翠峰山莊旁步道入口`
  - `望洋山觀景臺`
  - `支線叉路口`
  - `支線終點`
- route-shape text:
  - `步道型態 線型單向`
- detailed boundary text:
  - `翠峰山莊旁步道入口→(0.9K,25分鐘)→望洋山觀景臺(折返)→(0.7K,20分鐘)→支線叉路口→(0.3K,10分鐘)→支線終點→翠峰山莊旁步道入口`

The published detailed route sums to `1.9 km` and `55 minutes`.

### 3) 太平山國家森林遊樂區：望洋山步道頁

Source: https://tps.forest.gov.tw/TPSWeb/wSite/ct?ctNode=287&mp=1&xItem=2973

Direct values published on the page:

- `routeName`: `望洋山步道`
- `distanceKm`: `1.2`
- `region`: no direct county/town field published on the trail itself; page gives location text `翠峰景觀道路 16.5K`
- `difficulty`: no numeric field published; page describes the trail as `難易適中`
- `permitNotes`: not published
- entrance / boundary evidence:
  - `步道的入口就在翠峰山屋旁`
  - `步道在0.25公里處會有一條岔路`
  - `一邊是往下走，通向觀湖亭`
  - `一邊是往上走通向觀日亭`

### 4) 宜蘭縣政府旅遊頁

Source: https://travel.yilan.gov.tw/zh-tw/attraction/407/

Direct values published on the page:

- `routeName`: `望洋山步道`
- `region`: no normalized region field; page address is `宜蘭縣南澳鄉翠峰湖`
- `distanceKm`: not published
- `durationMinutes`: not published
- `difficulty`: not published
- `permitNotes`: not published

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `durationMinutes` is not directly supported by one exact official value.
   - Forestry summary page publishes only `半天`.
   - Forestry detail page also publishes only `建議時間 半天`.
   - The same Forestry detail page publishes segment times that add up to `55 minutes`.
   - Under the task rules, `半天` cannot be converted into minutes, and the page does not publish one unambiguous exact minute total.

2. `distanceKm` is internally inconsistent on the Forestry detail evidence if the detailed route is treated as the same canonical boundary.
   - Forestry summary page publishes `1.2公里`.
   - Forestry detail page also publishes `步道全長 1.2 公里`.
   - The same Forestry detail page publishes a detailed route whose segment distances add up to `1.9 km`.
   - Because the same official detail page also labels the trail `線型單向` while its route text includes `折返` and returns to `翠峰山莊旁步道入口`, the exact route boundary is not unambiguous.

3. `checkpoints` are not directly stable across the official source set for one exact route.
   - Forestry detail page names `望洋山觀景臺`, `支線叉路口`, and `支線終點`.
   - Taipingshan official page instead describes a `0.25公里` fork leading to `觀湖亭` and `觀日亭`.
   - Forestry summary page lists three entrance rows with elevations only, without checkpoint names.
   - These do not form one clearly published checkpoint list for the same exact start/end definition.

4. No single allowed official page directly supports the full required set of `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes`.
   - Forestry summary page lacks exact minutes and named checkpoints.
   - Forestry detail page lacks an exact minute field and conflicts internally on route shape and summed boundary.
   - Taipingshan page lacks direct `difficulty`, `permitNotes`, and a normalized `region` field.
   - Yilan County page lacks `distanceKm`, `durationMinutes`, `difficulty`, and `permitNotes`.

5. Because the route still lacks one exact, conflict-free official support set for `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes`, it fails the requirement for a directly supported exact canonical suburban-route record.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
