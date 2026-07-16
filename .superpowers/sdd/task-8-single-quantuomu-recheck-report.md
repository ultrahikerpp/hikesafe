# Task 8 single-route recheck: 拳頭姆自然步道

Review date: 2026-07-16
Canonical name: `拳頭姆自然步道`

## Decision

Rejected. No catalog record was added or changed.

## Newly checked official URLs

- https://www.forest.gov.tw/0000262
- https://travel.yilan.gov.tw/zh-tw/attraction/366/

`data/routes/sources.json` already contained the pre-existing Forestry trail detail URL:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=005

## Direct official values

### 1) 農業部林業及自然保育署：自然步道頁

Source: https://www.forest.gov.tw/0000262

Direct values published on the page:

- `routeName`: `拳頭姆自然步道`
- `region`: `宜蘭縣三星鄉`
- `difficulty`: `1`
- `distanceKm`: `1.3`
- `elevationDifferenceM`: `160` (from highest 310 m, lowest 150 m, and the page also publishes entrance altitude 180 m)
- `permitNotes`: `入山管制 否`
- entrance / boundary evidence: `台七線9.5公里處`
- route planning text: `半天`

### 2) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=005

Direct values published on the page:

- `routeName`: `拳頭姆自然步道`
- `region`: `宜蘭縣三星鄉`
- `difficulty`: `1`
- `elevationDifferenceM`: `160`
- `permitNotes`: `入山申請 否`
- `distanceKm`: `1.3` (page summary)
- route planning text: `建議時間 半天`
- detailed boundary text:
  - `臺7丙線9.5公里出入口 →（0.1K，5分鐘）→ 步道口`
  - `→（0.3K，10分鐘）→ 蘭陽平原眺景平臺`
  - `→（0.5K，15分鐘）→ 蘭陽溪眺景平臺`
  - `→（0.45K，15分鐘）→ 雀榕平臺`
  - `→（0.35K，10分鐘）→ 步道口`
  - `→（0.1K，5分鐘）→ 臺7丙線9.5公里出入口`

The published detailed route sums to `1.8 km` and `60 minutes`.

### 3) 宜蘭縣政府觀光頁

Source: https://travel.yilan.gov.tw/zh-tw/attraction/366/

Direct values published on the page:

- `routeName`: `拳頭姆自然步道`
- `distanceKm`: `1.8`
- `elevationDifferenceM`: `160`
- boundary text: `步道入口就在台七丙線約9.5公里處`
- shape text: `環狀步道1.8公里`

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `distanceKm` is in direct official conflict.
   - Forestry summary page publishes `1.3公里`.
   - Forestry trail detail page also publishes `步道全長 1.3 公里`.
   - The same Forestry detail page publishes segment distances that add up to `1.8 km`.
   - Yilan County's official tourism page also publishes `環狀步道1.8公里`.

2. `durationMinutes` is also in direct official conflict.
   - Forestry summary page publishes only `半天`.
   - Forestry trail detail page publishes only `建議時間 半天`.
   - The same Forestry detail page publishes segment times that add up to `60 minutes`.
   - Under the task rules, `半天` cannot be converted into minutes, and the presence of an explicit `60 minutes` sum does not resolve the conflict because the same official page still labels the route as `半天`.

3. The conflict is not just across different agencies; it exists within the Forestry detail evidence itself (`1.3 km` summary vs. `1.8 km` summed segment route).

4. Because `distanceKm` and `durationMinutes` cannot be assigned as one unambiguous official value for the same canonical route, the route still fails the requirement for a directly supported exact canonical single-route record.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
