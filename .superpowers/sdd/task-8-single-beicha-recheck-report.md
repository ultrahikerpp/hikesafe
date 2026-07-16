# Task 8 single-route recheck: 北插天山登山步道

Review date: 2026-07-16
Canonical name: `北插天山登山步道`

## Decision

Rejected. No catalog record was added or changed.

## Checked official URLs

- https://recreation.forest.gov.tw/Trail/RT?tr_id=025
- https://recreation.forest.gov.tw/News/News?id=20220208001
- https://www.sanxia.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=0c2325202581f52aae9ad14db8a51f9d&id=2b0baf69708768d0
- https://www.scenic.tycg.gov.tw/News_Content.aspx?n=9516&s=997330

`data/routes/sources.json` already contained the pre-existing Forestry trail detail URL:

- https://recreation.forest.gov.tw/Trail/RT?tr_id=025

## Direct official values

### 1) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=025

Direct values published on the page:

- `routeName`: `北插天山登山步道`
- `region`: `桃園市復興區`
- `difficulty`: `3`
- `distanceKm`: `4.7` (page summary as `步道全長 4.7 公里`)
- `elevationDifferenceM`: `597`
- `permitNotes`: page summary shows `入山申請 否`; the same page also states the route is within `插天山自然保留區` and requires prior permission to enter
- route planning text: `建議時間 一天以上`
- detailed route text:
  - `小烏來第二登山口CT101→(0.4K, 20分鐘)→赫威山岔(往水源地)`
  - `→(1.5K, 60分鐘)→東滿、水源地岔路(四叉路口)`
  - `→岩戶分遣所線CT106(2.9K,2小時)→多崖山→北插天山`
  - `登頂後原路折返，勿由南北插岔路下山`

The published numeric route segments already total `4.8 km` and `200 minutes` before the unquantified `多崖山→北插天山` segment and before the return.

### 2) 農業部林業及自然保育署：路線調整公告

Source: https://recreation.forest.gov.tw/News/News?id=20220208001

Direct values published on the page:

- published date: `2022-02-08`
- route governance text:
  - `北插天山步道及其支線為每日120人`
  - `北插天山步道原由木屋遺址登三角點路段 ... 將暫停開放，改由岩戶分遣所路線登三角點`
  - `經許可後方能進入`

This notice confirms a route change and reserve-entry control, but does not publish one exact full-route distance, exact full-route duration in minutes, or a complete ordered checkpoint list.

### 3) 新北市三峽區公所：觀光景點頁

Source: https://www.sanxia.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=0c2325202581f52aae9ad14db8a51f9d&id=2b0baf69708768d0

Direct values published on the page:

- summit elevation text: `北插天山標高1727公尺`
- access text:
  - `主要入口處有滿月園森林遊樂區、東眼山森林遊樂區、小烏來遊樂區、烏來福山等處`
  - `進入此區需先向林務局申請`

This page confirms multiple official access areas and reserve-entry control, but not one single canonical route boundary with exact catalog fields.

### 4) 桃園市政府風景區管理處：北插天山山毛櫸

Source: https://www.scenic.tycg.gov.tw/News_Content.aspx?n=9516&s=997330

Direct values published on the page:

- area text: `南北插天山`
- description text: `找個晴朗的日子登上南、北插天山`

This page is a destination description only. It does not publish a route boundary, exact distance, exact duration, numeric difficulty, checkpoints, or permit field set for the canonical trail.

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `distanceKm` is internally inconsistent on the only official page that looks closest to a route record.
   - Forestry detail page publishes `步道全長 4.7 公里`.
   - The same page's already quantified forward segments total `0.4 + 1.5 + 2.9 = 4.8 km`.
   - The same sentence then continues from `多崖山` to `北插天山` with no extra distance value, so the official numeric sequence already exceeds the published total before the summit is reached.
   - Under the task rules, this cannot be repaired by inference, one-way doubling, or trimming.

2. `durationMinutes` is not directly supported by one exact official value for one coherent full route.
   - Forestry detail page publishes only `建議時間 一天以上`.
   - The same page gives only partial segment times: `20分鐘 + 60分鐘 + 2小時 = 200分鐘`.
   - It does not publish the time from `多崖山` to `北插天山`, and it does not quantify the return despite saying `登頂後原路折返`.
   - Under the task rules, `一天以上` cannot be converted into exact minutes.

3. `checkpoints` and route boundary are incomplete for one exact canonical route.
   - Forestry detail page gives an ordered forward path from `小烏來第二登山口CT101` through `赫威山岔` and `東滿、水源地岔路(四叉路口)` to `多崖山` and `北插天山`.
   - But the page does not publish the missing summit approach segment length/time or the ordered return checkpoints with distances/times.
   - New Taipei's official page separately states there are multiple main access areas: `滿月園森林遊樂區、東眼山森林遊樂區、小烏來遊樂區、烏來福山`.
   - So the alternate-source set broadens the mountain access geography, but still does not define one exact start/end route with complete attributable checkpoints.

4. `permitNotes` is not safely reducible to one simple catalog value from the official wording.
   - Forestry detail page summary shows `入山申請 否`.
   - The same page also says the trail and branches are within `插天山自然保留區範圍` and `請事先申請許可方得進入`.
   - Forestry news notice likewise says `經許可後方能進入`.
   - A catalog `permitNotes` string could summarize this nuance, but the route still fails the required distance/time/boundary tests, so no record should be added.

5. No allowed official page directly supports the full required set of `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes` for one exact canonical route.
   - Forestry detail page supplies `difficulty`, `region`, and a partial route sequence, but not a coherent exact full-route distance/time pair.
   - Forestry notice clarifies the permit regime and changed summit line, but not a full record.
   - New Taipei and Taoyuan pages describe the mountain or access options, not one complete catalog route.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
