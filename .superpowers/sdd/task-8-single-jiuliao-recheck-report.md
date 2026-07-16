# Task 8 single-route recheck: 九寮溪自然步道

Review date: 2026-07-16
Canonical name: `九寮溪自然步道`

## Decision

Rejected. No catalog record was added or changed.

## Newly checked official URLs

- https://www.forest.gov.tw/0000268
- https://yilan.forest.gov.tw/0000143
- https://travel.yilan.gov.tw/zh-tw/attraction/461/

`data/routes/sources.json` already contained the pre-existing Forestry trail detail URL:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=012

## Direct official values

### 1) 農業部林業及自然保育署：自然步道頁

Source: https://www.forest.gov.tw/0000268

Direct values published on the page:

- `routeName`: `九寮溪自然步道`
- `region`: `宜蘭縣大同鄉`
- `difficulty`: `1`
- `distanceKm`: `3`
- `elevationDifferenceM`: `125` (from highest 375 m and lowest 250 m)
- `permitNotes`: `入山管制 否`
- route planning text: `半天`
- entrance evidence:
  - `玉蘭瀑布`
  - `台七線大同加油站`

### 2) 農業部林業及自然保育署宜蘭分署：社區型自然步道頁

Source: https://yilan.forest.gov.tw/0000143

Direct values published on the page:

- `routeName`: `九寮溪自然步道`
- `region`: `宜蘭縣大同鄉`
- `difficulty`: `1`
- `distanceKm`: `3`
- `elevationDifferenceM`: `125`
- `permitNotes`: `入山管制 否`
- route planning text: `半天`
- entrance evidence:
  - `玉蘭瀑布`
  - `台七線大同加油站`

### 3) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=012

Direct values published on the page:

- `routeName`: `九寮溪自然步道`
- `region`: `宜蘭縣大同鄉`
- `difficulty`: `1`
- `distanceKm`: `3` (page summary)
- `elevationDifferenceM`: `125`
- `permitNotes`: `入山申請 否`
- route planning text: `建議時間 半天`
- detailed boundary text:
  - `崙埤村護溪管制站 →（2.2K，40分鐘）→ 步道入口`
  - `→（1.8K，40分鐘）→ 九寮溪瀑布觀瀑平臺`
  - `→（4K，80分鐘）→ 原路返回管制站`

The published detailed route sums to `8.0 km` and `160 minutes`.

### 4) 宜蘭縣政府旅遊頁

Source: https://travel.yilan.gov.tw/zh-tw/attraction/461/

Direct values published on the page:

- `routeName`: `九寮溪自然步道`
- boundary text: `車輛停放大同鄉旅遊服務中心附設停車場，行至步道起點約1公里(單趟步行約20分鐘)`
- trail text: `步道起點至戈霸瀑布3公里`
- duration text: `步行往返約3小時`
- caution text: `步道需3-4小時，評估體力再行`

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `distanceKm` is in direct official conflict.
   - Forestry summary page publishes `3公里`.
   - Yilan Branch summary page also publishes `3公里`.
   - The same Forestry detail page publishes segment distances that add up to `8.0 km` for the explicitly listed route from `崙埤村護溪管制站` out-and-back.
   - Yilan County's official tourism page publishes a different boundary split: parking to trailhead `約1公里` one way, then trailhead to waterfall `3公里`.

2. `durationMinutes` is also in direct official conflict.
   - Forestry summary page publishes only `半天`.
   - Yilan Branch page also publishes only `半天`.
   - The Forestry detail page publishes segment times that add up to `160 minutes`.
   - Yilan County's official tourism page publishes `步行往返約3小時`, and separately warns `步道需3-4小時`.
   - Under the task rules, `半天` cannot be converted into minutes, and the remaining official minute values do not agree on one exact duration.

3. `checkpoints` cannot be assigned unambiguously for one exact canonical boundary.
   - Forestry summary / branch pages identify entrances as `玉蘭瀑布` and `台七線大同加油站`.
   - Forestry detail page uses `崙埤村護溪管制站 → 步道入口 → 九寮溪瀑布觀瀑平臺 → 原路返回管制站`.
   - Yilan County tourism page instead frames the access boundary as `大同鄉旅遊服務中心附設停車場 → 步道起點 → 戈霸瀑布`.
   - These are not just different checkpoint labels for the same clearly bounded line; they describe different outer endpoints and different access inclusions.

4. The conflict is not limited to cross-agency wording. The Forestry source set itself conflicts between summary values (`3公里`, `半天`) and the detailed route (`8.0 km`, `160 minutes`) for the same canonical page.

5. Because `distanceKm`, `durationMinutes`, and `checkpoints` cannot be assigned as one unambiguous official set for the same canonical route, this route still fails the requirement for a directly supported exact single-route record.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
