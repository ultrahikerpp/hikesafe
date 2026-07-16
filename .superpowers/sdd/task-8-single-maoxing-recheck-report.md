# Task 8 single-route recheck: 茂興懷舊步道

Review date: 2026-07-16
Canonical name: `茂興懷舊步道`

## Decision

Rejected. No catalog record was added or changed.

## Newly checked official URLs

- https://tps.forest.gov.tw/TPSWeb/wSite/ct?ctNode=283&mp=1&xItem=2970
- https://travel.yilan.gov.tw/zh-tw/attraction/404/

`data/routes/sources.json` already contained the pre-existing Forestry trail detail URL:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=016

## Direct official values

### 1) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=016

Direct values published on the page:

- `routeName`: `茂興懷舊步道`
- `region`: `宜蘭縣大同鄉`
- `difficulty`: `1`
- `distanceKm`: `1.6` (page summary as `步道全長 1.6 公里`)
- `durationMinutes`: not published as an exact number; page says `建議時間 半天`
- `permitNotes`: `入山申請 否`
- `checkpoints` candidate labels from detailed route:
  - `茂興車站`
  - `主線步道(1.1K)終點`
  - `上環線步道終點`
  - `下環線步道終點`
- route-shape text:
  - `步道型態 部分環狀`
- detailed boundary text:
  - `主線：茂興車站→(30分鐘)→主線步道(1.1K)終點→原路折返→(30分鐘)→茂興車站`
  - `上環線：茂興車站→(0.25K,10分鐘)→上環線步道終點→走鐵軌旁木棧道→茂興車站`
  - `下環線：茂興車站→(0.25K,10分鐘)→下環線步道終點→走鐵軌旁木棧道→茂興車站`

The published detailed route does not define one single exact canonical boundary. It instead publishes three selectable route variants from the same start point.

### 2) 太平山國家森林遊樂區：茂興懷舊步道頁

Source: https://tps.forest.gov.tw/TPSWeb/wSite/ct?ctNode=283&mp=1&xItem=2970

Direct values published on the page:

- `routeName`: `茂興懷舊步道`
- location / access text: `茂興車站(需於太平山莊搭乘蹦蹦車進入)`
- `distanceKm`: `0.9` (page field `步道長度：0.9公里`)
- `durationMinutes`: not published
- `difficulty`: not published as a numeric field
- `region`: not published as a normalized county/town field on the trail page
- `permitNotes`: not published
- partial-opening text:
  - `主線局部開放至200公尺處`
- route split text:
  - `茂興懷舊步道可分為主線道400公尺及上、下環線500公尺`
  - `100公尺處為蹦蹦車頭轉向的「轉車盤」`

### 3) 宜蘭縣政府旅遊頁

Source: https://travel.yilan.gov.tw/zh-tw/attraction/404/

Direct values published on the page:

- `routeName`: `茂興懷舊步道`
- route-character text: `沿著蹦蹦車茂興月台鐵軌鋪設`
- checkpoint-like text:
  - `茂興車站`
  - `蕨類原生園區`
  - `雲端棧道`
- `distanceKm`: not published
- `durationMinutes`: not published
- `difficulty`: not published
- `permitNotes`: not published

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `distanceKm` is in direct official conflict.
   - Forestry detail page publishes `步道全長 1.6 公里`.
   - Taipingshan official page publishes `步道長度：0.9公里`.
   - Taipingshan official page further narrows current access with `主線局部開放至200公尺處`.

2. `durationMinutes` is not directly supported by one exact official value.
   - Forestry detail page publishes only `建議時間 半天`.
   - The same Forestry detail page includes segment times for three route variants, not one canonical route.
   - Taipingshan and Yilan County pages do not publish an exact duration.
   - Under the task rules, `半天` cannot be converted into minutes.

3. `checkpoints` cannot be assigned unambiguously for one exact canonical boundary.
   - Forestry detail page publishes three separate route variants from `茂興車站`: a main line, an upper loop, and a lower loop.
   - Taipingshan official page also describes the trail as `主線道400公尺及上、下環線500公尺`, plus a currently limited `200公尺` opening.
   - These sources do not publish one exact start/end checkpoint list for a single canonical route; they publish interchangeable sub-routes and a temporary partial opening.

4. No single allowed official page directly supports the full required set of `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes`.
   - Forestry detail page lacks exact minutes and does not collapse its three route variants into one canonical checkpoint boundary.
   - Taipingshan page lacks direct numeric `difficulty`, normalized `region`, and `permitNotes`.
   - Yilan County page lacks `distanceKm`, `durationMinutes`, `difficulty`, and `permitNotes`.

5. Because `distanceKm`, `durationMinutes`, and `checkpoints` cannot be assigned as one unambiguous official set for the same exact canonical route, and because the currently published opening status further narrows only part of the trail, this route fails the requirement for a directly supported exact canonical suburban-route record.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
