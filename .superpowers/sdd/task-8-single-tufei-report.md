# Task 8 Report — canonical `土匪山步道`

## Decision

Rejected. I did not modify `data/routes/catalog.json` or `data/routes/sources.json`.

## Official-source findings

### 1) Forestry's current official trail registry does not expose an exact `土匪山步道` route record

- URL: `https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail`
- Direct finding:
  - current registry contains no record whose `TR_CNAME` is `土匪山步道`
  - therefore there is no exact official route record from Forestry that directly supplies:
    - `distanceKm`
    - `durationMinutes`
    - `difficulty`
    - `region`
    - `checkpoints`
    - `permitNotes`

### 2) The Alishan National Scenic Area sources already registered in this repo are not an exact `土匪山步道` route page

- URL: `https://www.ali-nsa.net/zh-tw/attractions/list/all-regions?page=1&sortby=location&location=15`
- Direct finding:
  - this is a regional attraction listing page, not a single canonical route page for `土匪山步道`

- URL: `https://www.ali-nsa.net/zh-tw/attractions/detail/213`
- Direct values:
  - title: `圓潭生態園區`
  - location label: `仁壽`
  - page type: attraction detail, not `土匪山步道`

- URL: `https://www.ali-nsa.net/zh-tw/attractions/detail/216`
- Direct values:
  - title: `千年蝙蝠洞`
  - location label: `瑞里`
  - nearby official attractions shown on page: `青年嶺步道`, `燕子崖`, `源興宮`, `綠色隧道`
  - page type: attraction detail, not `土匪山步道`

## Why this blocks catalog insertion

- I found no exact official page whose canonical subject is `土匪山步道`.
- The current Forestry official registry does not publish a standalone `土匪山步道` record.
- The other official URLs already registered in `data/routes/sources.json` cover nearby attractions/area browsing only, not one exact route with one exact boundary.
- Under your constraints, I cannot:
  - infer that `土匪山步道` is an alias of another official route,
  - reuse values from a nearby attraction page,
  - or stitch multiple official pages into one synthetic route scope.

## Schema fields still unsupported for safe insertion

- exact canonical `routeName`
- exact canonical `region`
- `distanceKm`
- `durationMinutes`
- `difficulty`
- exact canonical `checkpoints`
- `permitNotes`
- any other route-boundary-dependent fields

## Result

- No catalog change.
- No source-registry change.
- Report added because current official sources are insufficient to support one exact canonical suburban route record for `土匪山步道`.
