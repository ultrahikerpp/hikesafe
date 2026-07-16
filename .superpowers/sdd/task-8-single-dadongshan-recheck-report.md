# Task 8 single-route recheck: 奮起湖大凍山步道

Review date: 2026-07-16
Canonical name: `奮起湖大凍山步道`

## Scope

Rechecked only canonical `奮起湖大凍山步道` against the allowed official sources: 農業部林業及自然保育署、嘉義分署（嘉義林區管理處現站群頁）. No catalog records, Hundred Peak records, migrations, secrets, or unrelated files were touched.

No prior `.superpowers/sdd` report in the shared workspace directly covered this exact canonical route name.

## Decision

Rejected. Do not add or update a suburban route in `data/routes/catalog.json`.

## Official URLs checked

- https://www.forest.gov.tw/0000329
- https://recreation.forest.gov.tw/Trail/RT?tr_id=100
- https://recreation.forest.gov.tw/Trail/RT?tr_id=100&typ=2

## Direct official values

### 1) 農業部林業及自然保育署：自然步道頁

Source: https://www.forest.gov.tw/0000329

Directly supported values:

- `routeName`: `奮起湖大凍山步道`
- `region`: `嘉義縣竹崎鄉`
- `distanceKm`: `7.1`
- `difficulty`: `2`
- `permitNotes`: `入山管制 否`
- duration text:
  - `路程規劃 一天`
- entrance evidence:
  - `山頂觀景平台三角點`
  - `位於派出所旁`
  - `頂湖石獅象入口`
  - `頂湖產業道路入口`

Why this is insufficient:

- No exact `durationMinutes`; page publishes only `一天`
- The same page publishes multiple entrance rows, not one reconciled canonical start/end pair
- No ordered `checkpoints` list

### 2) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=100&typ=2

Directly supported values:

- `routeName`: `奮起湖大凍山步道`
- `distanceKm`: `7.1`
- `difficulty`: `2`
- `elevationDifferenceM`: `331`
- `permitNotes`-relevant text:
  - `入山申請 否`
- duration text:
  - `建議時間 一天`
- candidate checkpoint labels from detailed route:
  - `多林登山口`
  - `樹石盟`
  - `登頂叉路口`
  - `大凍山頂觀景平台`
  - `休憩亭`
  - `柳杉林地`
- detailed route text:
  - `多林登山口 →（0.8k，40分鐘）→ 樹石盟 →（0.5k，40分鐘）→ 登頂叉路口 →（0.3k，25分鐘）→ 大凍山頂觀景平台 →（0.3k，25分鐘）→ 登頂叉路口 →（0.9k，50分鐘）→ 休憩亭 →（0.4k，30分鐘）→ 柳杉林地 →（0.4k，30分鐘）→ 多林登山口`
Why this is insufficient:

- No exact `durationMinutes`; page publishes only `一天`
- If the detailed route segment times are summed literally, they imply `240 minutes`
- If the detailed route segment distances are summed literally, they imply `3.6 km`
- Those implied values do not match the same page's summary `distanceKm = 7.1`
- The detailed route text does not safely prove one exact canonical same-boundary route for the catalog

### 3) 農業部林業及自然保育署：台灣山林悠遊網主頁

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=100

Directly supported values:

- `routeName`: `奮起湖大凍山步道`
- trail status notice:
  - `奮起湖大凍山步道多林端入口至回頭嶺路段因橋梁損壞維修，即日起至115年10月31日暫停開放，請由其他路段通行。`

Why this is insufficient:

- This page helps confirm current official route identity and partial closure scope
- But it still does not publish one exact `durationMinutes` value or one structured single-boundary `checkpoints` list
- The closure notice further signals that different entrances/segments are in play, so we should not compress the broader trail system into one exact suburban-route record without stronger single-route support

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `durationMinutes` is not directly published as one exact official value.
   - Forestry summary page says `路程規劃 一天`.
   - Forestry detail page says `建議時間 一天`.
   - Under the task rules, `一天` cannot be converted into minutes.

2. The official detailed route does not reconcile with the official summary distance.
   - Forestry detail page summary publishes `步道全長 7.1 公里`.
   - That same page's detailed route segments add up to only `3.6 km`.
   - The same detailed route segment times add up to `240 minutes`.
   - Because the segment totals and summary totals do not describe one coherent boundary, they cannot be safely promoted into exact catalog `distanceKm` and `durationMinutes`.

3. The official pages expose multiple entrances, not one exact canonical start/end route.
   - Forestry summary page lists four entrance rows: `山頂觀景平台三角點`, `位於派出所旁`, `頂湖石獅象入口`, `頂湖產業道路入口`.
   - Under the task rules, we cannot mix different entrances, branch lines, or broader 奮起湖／大凍山 trail-system scope into one exact suburban route unless the official source clearly reconciles them.

4. `checkpoints` are not directly supported as one stable official ordered list for the same route boundary.
   - The detailed route text names `多林登山口`, `樹石盟`, `登頂叉路口`, `大凍山頂觀景平台`, `休憩亭`, and `柳杉林地`.
   - But the official summary page separately lists a different entrance set with four entrances.
   - Because the route boundary itself is unresolved, these labels cannot be safely promoted into one exact canonical checkpoint chain.

5. No single allowed official page directly supports the full required set of `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes`, and the allowed official pages do not combine into one conflict-free same-boundary route.

## Result

- `data/routes/catalog.json`: unchanged
- `data/routes/sources.json`: unchanged
- New report created: `.superpowers/sdd/task-8-single-dadongshan-recheck-report.md`
