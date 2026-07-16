# Task 8 single-route recheck: 尾寮山

Review date: 2026-07-16
Canonical name: `尾寮山`

## Scope

Rechecked only canonical `尾寮山` against the allowed official sources: 農業部林業及自然保育署、台灣山林悠遊網、茂林國家風景區管理處. Read `AGENTS.md`, `data/routes/catalog.json`, `data/routes/sources.json`, `scripts/verify-route-catalog.ts`, `task-8-brief.md`, `task-8-last-forestry-report.md`, `task-8-urban-trails-g-report.md`, and the single-route recheck format in `task-8-single-wuliao-recheck-report.md`. No catalog records, Hundred Peak records, migrations, secrets, or unrelated files were touched.

## Decision

Rejected. Do not add or update a suburban route in `data/routes/catalog.json`.

## Official URLs checked

- https://www.forest.gov.tw/0000339
- https://recreation.forest.gov.tw/Trail/RT?tr_id=131
- https://www.maolin-nsa.gov.tw/zh-tw/attraction/85/

## Direct official values

### 1) 農業部林業及自然保育署：尾寮山登山步道

Source: https://www.forest.gov.tw/0000339

Directly supported values:

- `routeName`: `尾寮山登山步道`
- `region`: `屏東縣高樹鄉、三地門鄉；高雄市茂林區`
- `difficulty`: `2`
- `distanceKm`: `15`
- `permitNotes`: `入山管制 否`
- route-planning text only: `一天`
- published entrance points:
  - `大津瀑布,慈津寶宮`
  - `主線西側約2k`
  - `東側登山口(沙溪林道23.5k)`

Why this is insufficient:

- No exact `durationMinutes`; the page gives only `一天`
- The published entrance list is not one ordered canonical route checkpoint chain
- The page does not publish one exact single-route start/end boundary matching the catalog's required `checkpoints`

### 2) 台灣山林悠遊網：尾寮山登山步道

Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=131

Directly supported values:

- `routeName`: `尾寮山登山步道`
- `region`: `屏東縣高樹鄉、三地門鄉；高雄市茂林區`
- `difficulty`: `2`
- `distanceKm`: `15`
- `permitNotes`: `入山管制 否`
- route-planning text only: `一天`
- published entrance points:
  - `大津瀑布,慈津寶宮`
  - `主線西側約2k`
  - `東側登山口(沙溪林道23.5k)`

Why this is insufficient:

- No exact `durationMinutes`; the page gives only `一天`
- The published entrances again describe access points, not one ordered checkpoint list for a single exact route
- The same page family is the source of the conflicting alternate route summary described below, so it does not by itself resolve one canonical boundary

### 3) 茂林國家風景區管理處：尾寮山登山步道

Source: https://www.maolin-nsa.gov.tw/zh-tw/attraction/85/

Directly supported values:

- `routeName`: `尾寮山登山步道`
- `region`: `屏東縣三地門鄉與高雄市茂林區的交界`
- route description confirms two different entrances:
  - `大津橋旁的產業道路`
  - `口社的沙溪林道23.5K處`
- `distanceKm`: `9.3` (`單程9.3公里`)
- `durationMinutes`: `420-480` (`全程往返時間約需7-8小時`)
- difficulty text only: `中高難度挑戰路線`

Why this is insufficient:

- No numeric `difficulty` on the catalog's 0–6 scale
- No direct `permitNotes`
- The page explicitly mixes two different登山入口, so its text does not define one unambiguous single start/end checkpoint chain
- The published `9.3公里` single-trip route conflicts with the Forestry page's `15公里`

## Rejection reasons

`尾寮山` still fails the catalog bar for an exact single-route suburban record from allowed official sources:

1. The allowed official sources conflict on route distance and route boundary.
   - 林業保育署 / 山林悠遊網 publish `15公里`.
   - 茂林國家風景區管理處 publishes `單程9.3公里` and `全程往返時間約需7-8小時`.
   - Under the task rules, these cannot be merged into one exact canonical route without inferring which entrance and boundary the record should use.

2. The allowed official sources do not publish one exact `durationMinutes` value for the Forestry-defined route.
   - 林業保育署 / 山林悠遊網 give only `一天`.
   - The `7-8小時` figure belongs to the alternate 茂林處 presentation that also uses a different 9.3 km single-trip boundary.
   - Per task rules, `一天` cannot be converted into catalog minutes, and the alternate-source time cannot be transplanted onto the 15 km record.

3. The allowed official sources do not provide one safe canonical ordered `checkpoints` chain.
   - 林業保育署 / 山林悠遊網 publish three entrances or access points, not one ordered route.
   - 茂林處 also states there are two different登山入口.
   - Because the official pages describe multiple access patterns, this recheck cannot safely assign one start-to-finish checkpoint sequence.

4. The allowed official sources do not publish one complete field package for the same exact route.
   - Forestry gives numeric `difficulty` and `permitNotes`, but not exact minutes or one checkpoint chain.
   - Maolin gives a time range and alternate distance, but not numeric difficulty or permit text.
   - The missing and conflicting fields are core route fields, so the record cannot be assembled without violating the no-inference rule.

5. This recheck specifically avoids mixing different entrances, alternate route presentations, or partial summaries.
   - The task rules forbid mixing `大津橋旁的產業道路` and `沙溪林道23.5K` into a synthetic route.
   - They also forbid using one page's time against another page's distance when the official boundaries are not clearly identical.

## Result

- `data/routes/catalog.json`: unchanged
- `data/routes/sources.json`: unchanged
- New report created: `.superpowers/sdd/task-8-single-weiliaoshan-recheck-report.md`
