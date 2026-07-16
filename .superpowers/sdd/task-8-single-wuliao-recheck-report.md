# Task 8 single-route recheck: 五寮尖

Review date: 2026-07-16
Canonical name: `五寮尖`

## Scope

Rechecked only canonical `五寮尖` against the allowed official sources: 新北市政府觀光旅遊局、三峽區公所、農業部林業及自然保育署. No catalog records, Hundred Peak records, migrations, secrets, or unrelated files were touched.

## Decision

Rejected. Do not add or update a suburban route in `data/routes/catalog.json`.

## Official URLs checked

- https://www.sanxia.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=0c2325202581f52a936fd5edb0247e92&id=dc5b21213dfb17e5
- https://newtaipei.travel/zh-tw/attractions/detail/110589
- https://www.forest.gov.tw/0000014/0070392

## Direct official values

### 1) 三峽區公所：五寮尖登山步道

Source: https://www.sanxia.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=0c2325202581f52a936fd5edb0247e92&id=dc5b21213dfb17e5

Directly supported values:

- `routeName`: `五寮尖登山步道`
- `distanceKm`: `10.5`
- `durationMinutes`: `390` (`約 6小時 30分`)
- difficulty text only: `勇腳`
- route boundary text:
  - `合作橋`
  - `玉里商店階梯登山口`
  - `岩稜峭壁段(峭壁雄峰)`
  - `大茄苳樹`
  - `五寮尖山頂`
  - `濟公廟`

Why this is insufficient:

- No exact `region` field value is published on the page
- No numeric `difficulty` on the catalog's 0–6 scale
- No direct `permitNotes`
- The published checkpoint text is a suggested route narrative, not a separately structured ordered checkpoint list

### 2) 新北市政府觀光旅遊局：五寮尖登山步道

Source: https://newtaipei.travel/zh-tw/attractions/detail/110589

Directly supported values:

- `routeName`: `五寮尖登山步道`
- `region`: `新北市三峽區` (from body text and address field)
- difficulty text only: `荒野探險型`
- `distanceKm`: `約 10.5 公里`
- `sourceOrganization`: `新北市政府觀光旅遊局`

Why this is insufficient:

- No exact `durationMinutes`
- No numeric `difficulty` on the catalog's 0–6 scale
- No ordered `checkpoints`
- No direct `permitNotes`
- Distance is approximate (`約 10.5 公里`), not an exact official numeric field

### 3) 農業部林業及自然保育署：登山步道標誌清、山友登山不揪心

Source: https://www.forest.gov.tw/0000014/0070392

Directly supported values:

- confirms `五寮尖至溪州山` is an official maintained mountain route
- confirms this longer route is commonly called `五石縱走` or `五溪縱走`
- `distanceKm`: `21` for that longer route

Why this is insufficient:

- This page is not an exact `五寮尖` single-route page
- The official route described there starts at `五寮尖` and continues through multiple additional peaks to `溪洲山`
- The published `21公里` belongs to the extended traverse, not the canonical `五寮尖` route under review
- No exact `durationMinutes`, numeric `difficulty`, ordered `checkpoints`, `region`, or `permitNotes` for the single canonical route

## Rejection reasons

`五寮尖` still fails the catalog bar for an exact single-route suburban record from allowed official sources:

1. No allowed official source directly publishes the catalog's numeric `difficulty`.
   - 三峽區公所 uses `勇腳`.
   - 新北市觀光旅遊局 uses `荒野探險型`.
   - Under the task rules, these text labels cannot be converted into the catalog's numeric scale.

2. No allowed official source directly publishes `permitNotes`.
   - No checked exact canonical page states `入山申請：是/否` or equivalent for this route.
   - This field cannot be filled from silence or from unrelated permit systems.

3. The Forestry source in scope does not describe the same exact canonical route.
   - It documents the longer `五寮尖至溪州山` traverse at `21公里`.
   - Per task rules, this cannot be mixed into the shorter 三峽區公所 / 觀旅局 `五寮尖登山步道` record.

4. `checkpoints` are still not fully safe to assign as one canonical official field set.
   - 三峽區公所 provides a suggested line from `合作橋` to `濟公廟`.
   - 新北市觀光旅遊局 does not publish the same ordered checkpoint chain.
   - The allowed official source set therefore does not provide one complete field package for `region` + `distanceKm` + `durationMinutes` + numeric `difficulty` + ordered `checkpoints` + `permitNotes` on the same exact route record.

5. Because the remaining missing fields are core route fields, the route cannot be added as suburban under the stated evidence rules.

## Result

- `data/routes/catalog.json`: unchanged
- `data/routes/sources.json`: unchanged
- New report created: `.superpowers/sdd/task-8-single-wuliao-recheck-report.md`
