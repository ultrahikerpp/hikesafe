# Task 8 single-route recheck: 筆架連峰

## Scope

Rechecked only canonical `筆架連峰` against the allowed official sources: 新北市政府、 新北市觀光旅遊局、石碇區公所、深坑區公所、農業部林業及自然保育署. No catalog records, Hundred Peak records, migrations, secrets, or unrelated files were touched.

## Decision

Rejected. Do not add or update a suburban route in `data/routes/catalog.json`.

## Official-source findings

### 1) 新北市觀光旅遊局：筆架連峰登山步道

URL: https://newtaipei.travel/zh-tw/attractions/detail/402599

Directly supported values:

- `routeName`: `筆架連峰登山步道`
- route description: route is at the 深坑區 / 石碇區 boundary
- `distanceKm`: `約 6.1 公里`
- difficulty text only: `荒野探險型`
- address field: `新北市石碇區石碇西街`
- open status text: `全年開放`

Why this is insufficient:

- No exact `durationMinutes`
- No numeric `difficulty` on the catalog's 0–6 scale
- No ordered `checkpoints`
- No direct `permitNotes`
- Region is not published as one exact route-field value: the body says 深坑區與石碇區交界, while the address field is only 石碇區
- The page also mentions `炙子頭山` as a commonly linked continuation, so it cannot be used to infer a stricter single-route checkpoint chain beyond the named canonical route

### 2) 新北市政府觀光旅遊局新聞稿：37 面手機可通訊標示牌

URL: https://www.ntpc.gov.tw/ch/home.jsp?dataserno=16ce7555835fca039f5752d5c68601c1&id=e8ca970cde5c00e1

Directly supported values:

- confirms `石碇區筆架山連峰` is one of the official hot rock-route targets
- confirms the city built `37 面` mobile-communication signs across `筆架山連峰`、`皇帝殿登山步道`、`獅仔頭山步道`
- confirms official GPX guidance exists for popular New Taipei hiking routes

Why this is insufficient:

- The `37 面` figure is shared across multiple routes, not a route-specific `筆架連峰` checkpoint list
- No exact `distanceKm`, `durationMinutes`, numeric `difficulty`, `region`, or `permitNotes`
- No route-specific ordered `checkpoints`

### 3) 石碇區公所：潭邊里

URL: https://www.shiding.ntpc.gov.tw/home.jsp?id=f06672ba2aadbd3c

Directly supported values:

- mentions `原始翠綠的筆架山` as one of the local scenic places

Why this is insufficient:

- Not an exact `筆架連峰` route page
- No route boundary, no `distanceKm`, no `durationMinutes`, no difficulty, no checkpoints, no permit notes

### 4) 石碇區公所：烏塗里

URL: https://www.shiding.ntpc.gov.tw/home.jsp?id=d807b8f840c41169

Directly supported values:

- mentions `筆架山` among local tourism spots

Why this is insufficient:

- Not an exact `筆架連峰` route page
- No route boundary, no `distanceKm`, no `durationMinutes`, no difficulty, no checkpoints, no permit notes

### 5) 農業部林業及自然保育署：山區手機可通訊點標示

URL: https://www.forest.gov.tw/0004548/0078318

Directly supported values:

- the Forestry Agency publishes the official communication-point dataset/PDF for mountain routes

Why this is insufficient for this canonical route:

- The current official page does not itself publish a coherent single `筆架連峰` route record with exact route fields
- Even if communication-point rows can identify sign locations, they are not a complete route definition and do not directly supply exact `durationMinutes`, numeric `difficulty`, `region`, or `permitNotes`

## Rejection reasons

`筆架連峰` still fails the catalog bar for an exact single-route suburban record from allowed official sources:

1. No allowed official source directly publishes an exact `durationMinutes`.
2. No allowed official source directly publishes the catalog's numeric `difficulty`.
3. No allowed official source directly publishes one ordered checkpoint chain for the exact canonical route.
4. The available sources mix broad area description, safety signage, and adjacent/linked hiking context, but do not define one strict route record with complete field coverage.
5. Per task constraints, no half-day conversion, no single-trip doubling, no mixed branch/entrance synthesis, and no inference from shared GPX/signage context is acceptable here.

## Result

- `data/routes/catalog.json`: unchanged
- `data/routes/sources.json`: unchanged
- New report created: `.superpowers/sdd/task-8-single-bijialian-recheck-report.md`
