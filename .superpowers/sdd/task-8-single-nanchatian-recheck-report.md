# Task 8 single-route recheck: 南插天山

Review date: 2026-07-16
Canonical name: `南插天山`

## Scope

Rechecked only canonical `南插天山` against the allowed official sources: 桃園市政府、林業及自然保育署. No catalog records, Hundred Peak records, migrations, secrets, or unrelated files were touched.

## Decision

Rejected. Do not add or update a suburban route in `data/routes/catalog.json`.

## Official URLs checked

- https://www.forest.gov.tw/0010111
- https://hsinchu.forest.gov.tw/0000881
- https://wrb.tycg.gov.tw/News_Content.aspx?n=10827&s=1063068

## Direct official values

### 1) 農業部林業及自然保育署：進入福巴越嶺古道及北插﹙赫威神木﹚、南插天山、北大武山步道需申請嗎？

Source: https://www.forest.gov.tw/0010111

Directly supported values:

- canonical route target named on the page: `南插天山`
- `permitNotes`: route is inside `插天山自然保留區`
- permit requirement text: `未經申請核准，不得任意進入`

Why this is insufficient:

- No exact `routeName` page for one canonical start/end trail
- No `distanceKm`
- No `durationMinutes`
- No numeric `difficulty`
- No `region` field value for one route record
- No ordered `checkpoints`

### 2) 林業及自然保育署新竹分署：插天山自然保留區

Source: https://hsinchu.forest.gov.tw/0000881

Directly supported values:

- reserve geography text places the protected area in `大溪事業區` and `烏來事業區`
- managing organization: `林業及自然保育署新竹分署`
- reserve description text: `插天山海拔高低差異巨大(海拔高300~2129公尺)`
- reserve ecology text: `臺灣水青岡` is concentrated `鹿背山至魯佩山一帶`

Why this is insufficient:

- This is a reserve overview, not a `南插天山` route page
- No exact single-route `distanceKm`
- No exact single-route `durationMinutes`
- No route-specific numeric `difficulty`
- No ordered route `checkpoints`
- No exact route `region` string for the catalog record

### 3) 桃園市政府水務局：桃市府以手作的溫度，留下部落齊心的回憶

Source: https://wrb.tycg.gov.tw/News_Content.aspx?n=10827&s=1063068

Directly supported values:

- nearby official geography: `桃園市復興區泰雅族的雪霧鬧部落`
- surrounding mountains include `魯培山、南插天山、拉拉山、夫婦山`
- separate historic path text: `此路徑長約6公里`

Why this is insufficient:

- The published `長約6公里` belongs to a `雪霧鬧` historic creek-side path, not a canonical `南插天山` summit route
- The page does not publish one exact `南插天山` route boundary
- No exact `durationMinutes`
- No numeric `difficulty`
- No ordered `checkpoints`
- No route-specific `permitNotes`

## Rejection reasons

`南插天山` still fails the catalog bar for an exact single-route suburban record from allowed official sources:

1. No allowed official source directly publishes one exact canonical `南插天山` route page.
   - Forestry FAQ page only confirms permit control.
   - Hsinchu branch reserve page describes the protected area as a whole.
   - Taoyuan Water Resources Bureau page describes nearby `雪霧鬧` geography and a different historic path.

2. `distanceKm` is not directly supported for the canonical route.
   - No checked official page publishes an exact total distance for `南插天山`.
   - The only numeric distance found in allowed sources is `長約6公里` on the Snow Wunao historic-path article, which is a different route and cannot be mixed into `南插天山`.

3. `durationMinutes` is not directly supported.
   - None of the checked allowed official pages publishes an exact hiking duration in minutes for `南插天山`.
   - Under the task rules, no estimate or conversion is allowed.

4. `difficulty` is not directly supported.
   - None of the checked allowed official pages publishes a numeric difficulty or a route page that can be mapped safely to the catalog scale.

5. `checkpoints` and route boundary are not directly supported.
   - None of the checked allowed official pages publishes one ordered canonical start/end checkpoint chain for `南插天山`.
   - The Taoyuan Water Resources Bureau page describes a different local path in the same broader mountain area; per task rules it cannot be merged with `南插天山`.

6. `region` and `permitNotes` cannot rescue the record on their own.
   - Permit control is directly supported by Forestry.
   - Broader geographic context is directly supported by Forestry and Taoyuan official pages.
   - But the record still lacks the required exact route distance, duration, difficulty, and checkpoint boundary for one coherent canonical route.

## Result

- `data/routes/catalog.json`: unchanged
- `data/routes/sources.json`: unchanged
- New report created: `.superpowers/sdd/task-8-single-nanchatian-recheck-report.md`
