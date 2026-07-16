# Task 8 single-route recheck: 哈盆越嶺步道

Review date: 2026-07-16
Canonical name: `哈盆越嶺步道`

## Scope

Rechecked only canonical `哈盆越嶺步道` against the allowed official sources: 新北市政府、農業部林業及自然保育署. No catalog records, Hundred Peak records, migrations, secrets, or unrelated files were touched.

## Decision

Rejected. Do not add or update a suburban route in `data/routes/catalog.json`.

## Official URLs checked

- https://www.forest.gov.tw/0000283
- https://recreation.forest.gov.tw/Trail/RT?tr_id=031
- https://newtaipei.travel/zh-tw/news/detail/1480

## Direct official values

### 1) 農業部林業及自然保育署：哈盆越嶺步道

Source: https://www.forest.gov.tw/0000283

Directly supported values:

- `routeName`: `哈盆越嶺步道`
- `region`: `新北市烏來區`
- `distanceKm`: `7.5`
- `difficulty`: `2`
- duration text:
  - `路程規劃 一天`
  - `來回約14公里，費時6～7小時`
- route boundary text:
  - `哈盆越嶺步道聯絡新北市與宜蘭兩地`
  - `整建的步道止於露門溪交會地，再原路折返`
- permit text:
  - `入山管制 否`

Why this is insufficient:

- No exact `durationMinutes`; the page gives only `一天` and a `6～7小時` range
- No ordered `checkpoints` list
- The page describes the maintained route end as `露門溪交會地`, but does not publish a structured checkpoint sequence from start to finish

### 2) 農業部林業及自然保育署：台灣山林悠遊網 detail page

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=031

Directly supported values:

- `routeName`: `哈盆越嶺步道`
- `region`: `新北市 / 烏來區`
- `distanceKm`: `7.5`
- `difficulty`: `2`
- `elevationDifferenceM`: `306`
- `permitNotes`-relevant text:
  - `入山申請 否`
  - `本步道僅到7.5k，建議折返`
  - `若欲通往哈盆溪，沿自然山徑續行經過「過露門溪」後，約再2公里即進入「哈盆自然保留區」範圍，須向「林業試驗所」申請方可進入`
  - `9K之後到舊露營地之間，進入自然保留區的緩衝地，之後屬於哈盆自然保留區範圍`
- route boundary text:
  - `一日行程：從烏來福山進入，行至約7K處哈盆溪與露門溪交會處原路折返，約6～7小時步程`

Why this is insufficient:

- No exact `durationMinutes`; the page gives only `建議時間 一天` and `約6～7小時步程`
- No ordered `checkpoints`; `詳細路線` only exposes a map entrypoint and not an attributable textual checkpoint list
- `permitNotes` for the maintained 7.5k route and the onward restricted reserve area are both present, but the route still fails the exact time and checkpoint requirements

### 3) 新北市政府觀光旅遊網：新北市景點或步道封閉資訊

Source: https://newtaipei.travel/zh-tw/news/detail/1480

Directly supported values:

- closure text:
  - `哈盆越嶺步道，前受蘇迪勒及杜鵑颱風接連影響，步道發生多處大規模崩塌，基於安全考量，全線封閉`

Why this is insufficient:

- This is a closure notice, not a canonical route-detail page
- No exact `distanceKm`, `durationMinutes`, `difficulty`, ordered `checkpoints`, or `permitNotes`
- It confirms current access control by New Taipei, but does not resolve the Forestry pages' missing exact route fields

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. `durationMinutes` is not directly published as one exact official value.
   - Forestry overview page gives `費時6～7小時` and `路程規劃 一天`.
   - Forestry detail page gives `約6～7小時步程` and `建議時間 一天`.
   - Under the task rules, a time range or `一天` cannot be converted into one exact minute value.

2. `checkpoints` are not directly supported as one official ordered list for the maintained 7.5 km route.
   - Forestry pages define the route conceptually as entering from `烏來福山` and turning back near the `露門溪` / `哈盆溪` area.
   - But neither page publishes a structured checkpoint chain suitable for the catalog field.
   - The detail page's `詳細路線` section is only a map surface in the scraped output, not a textual list that can be safely attributed field-by-field.

3. The official route boundary is narrower than the broader historical crossing, and the pages themselves warn against mixing them.
   - Forestry overview says the trail connects `新北市與宜蘭兩地`.
   - Forestry detail page explicitly says `本步道僅到7.5k，建議折返`.
   - It separately states that continuing past `過露門溪` toward `哈盆溪` enters `哈盆自然保留區` and requires application to `林業試驗所`.
   - Under the task rules, this means we cannot mix the maintained 7.5 km trail with the longer old crossing or reserve-area continuation to fabricate a fuller route record.

4. `permitNotes` alone is not enough to rescue the record, and even that field is nuanced.
   - Forestry summary fields say `入山管制 否` / `入山申請 否` for the maintained trail.
   - The same official detail page says continuing beyond the maintained route into the reserve requires separate permission from `林業試驗所`.
   - A careful catalog note could summarize that nuance, but the route still fails the exact `durationMinutes` and `checkpoints` requirements.

5. New Taipei's official closure notice reinforces that no alternate allowed source fills the missing exact fields.
   - New Taipei confirms the trail is `全線封閉`.
   - But it does not publish a complete exact single-route record with `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes`.

## Result

- `data/routes/catalog.json`: unchanged
- `data/routes/sources.json`: unchanged
- New report created: `.superpowers/sdd/task-8-single-hapen-recheck-report.md`
