# Task 8 Report — Reject single-route add for 四大天王山步道

## Decision

Reject adding a suburban route for `四大天王山步道`.

## Official evidence checked

### 1. 農業部林業及自然保育署

- URL: `https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail`
- Direct values:
  - Official trail index contains exact entries such as `瑞太古道`, `特富野古道`, `福山步道`, `里美避難步道`, `龍麟山步道`.
  - No exact entry for `四大天王山步道`.
  - No exact entry for `水社寮`.
  - No exact entry exposing `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, or `permitNotes` for `四大天王山步道`.
- Gap:
  - The allowed primary forestry source does not publish a canonical single-route record for the requested name.

### 2. 交通部觀光署阿里山國家風景區管理處

- URL: `https://www.ali-nsa.net/zh-tw/attractions/list/all-regions?page=1&sortby=location&location=15`
- Direct values:
  - Official `千年蝙蝠洞` location page lists separate nearby records under 仁壽, including:
    - `千年蝙蝠洞`
    - `青年嶺步道`
    - `雲潭步道-雲潭瀑布`
    - `圓潭生態園區`
    - `竹坑溪步道`
    - `瑞太古道`
    - `野薑花溪步道`
  - No exact record titled `四大天王山步道`.
- Gap:
  - The official scenic-area catalog breaks this area into other named attractions/trails, not an exact single-route record for the requested canonical name.

- URL: `https://www.ali-nsa.net/zh-tw/attractions/detail/213`
- Direct values:
  - Title: `圓潭生態園區`
  - Region shown on page: `仁壽`
  - Description: park-scale scope with `環山步道` and `無障礙步道`
  - Address: `嘉義縣竹崎鄉仁壽村交力坪86之1號`
  - Open time and phone are provided for the park page.
- Gap:
  - This page is for a broader park destination, not the exact requested route.
  - It does not publish the requested route name or an exact checkpoint list/schema scope for `四大天王山步道`.

- URL: `https://www.ali-nsa.net/zh-tw/attractions/detail/216`
- Direct values:
  - Title: `千年蝙蝠洞`
  - Description: destination reached from `青年嶺步道`
  - Access note: `由166縣道78.8K處的青年嶺步道出發前往，單程約1公里`
  - Page type includes `步道`, but the exact subject is still `千年蝙蝠洞`.
- Gap:
  - This is another nearby attraction page with its own access description, not an exact `四大天王山步道` record.

## Missing schema fields for an exact add

No allowed official exact single-route source directly supports all required fields together for `四大天王山步道`, especially:

- `distanceKm`
- `durationMinutes`
- `difficulty`
- `region`
- `checkpoints`
- `permitNotes`

## Rejection reasons

1. No allowed official source publishes an exact canonical single-route page titled `四大天王山步道`.
2. The forestry primary source has no exact route entry, so there is no official distance/duration/difficulty baseline to import without inference.
3. The scenic-area official source only exposes nearby attractions and differently scoped trail/destination pages; using them would require stitching multiple places or inferring route scope.
4. Per task constraints, I cannot:
   - derive minutes from `半天`
   - double a one-way distance
   - combine four mountains or adjacent attractions into one route
   - fill schema fields from mixed-scope pages

## Catalog impact

- `data/routes/catalog.json`: unchanged
- Route rejected pending an allowed official exact single-route source
