# Task 8 Report — canonical `獨立山步道`

## Decision

Rejected. I did not modify `data/routes/catalog.json` or `data/routes/sources.json`.

## Official-source findings

### 1) Forestry trail API has a current standalone official entry

- URL: `https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail`
- Record:
  - `TRAILID`: `085`
  - `TR_CNAME`: `獨立山步道`
  - `TR_POSITION`: `嘉義縣竹崎鄉`
  - `TR_LENGTH`: `5.0公里`
  - `TR_LENGTH_NUM`: `5.000`
  - `TR_DIF_CLASS`: `1`
  - `TR_TOUR`: `半天`
  - `TR_permit`: `無`
  - `URL`: `https://recreation.forest.gov.tw/Trail/RT?tr_id=085`

### 2) The official route page publishes a different distance/time scope

- URL: `https://recreation.forest.gov.tw/Trail/RT?tr_id=085`
- Direct values on the page:
  - `步道全長約3.5公里`
  - `單程約2小時`
  - `嘉義縣竹崎鄉`
  - narrative states the trail is split into two different sections:
    - `從竹崎鄉緞繻村松腳經樟腦寮到紅南坑`
    - `另一段為嘉義分署於1997年開闢，從紅南坑到獨立山頂的環狀新建步道`

### 3) The same official page also publishes a segment-by-segment route that implies another scope

- URL: `https://recreation.forest.gov.tw/Trail/RT?tr_id=085`
- Direct segment list:
  - `樟腦寮車站 →(0.3k，10分鐘)→ 獨立山登山道叉路`
  - `→(0.4k，15分鐘)→ 第一迴旋鐵軌`
  - `→(0.4k，15分鐘)→ 第二迴旋鐵軌`
  - `→(0.1k，5分鐘)→ 第三迴旋鐵軌`
  - `→(0.1k，5分鐘)→ 獨立山頂`
  - `→(0.2k，10分鐘)→ 獨立山車站`
  - `→(0.2k，10分鐘)→ 與大巃頂步道之交叉點（四叉路口）`
  - `→(0.3k，15分鐘)→ 奉天岩`
  - `→(0.3k，15分鐘)→ 與大巃頂步道之交叉點（四叉路口）`
  - `→(0.8k，35分鐘)→ 獨立山登山道叉路`
  - `→(0.3k，15分鐘)→ 樟腦寮車站`
- Clear derivation from the published segments:
  - implied total distance: `3.4公里`
  - implied total duration: `150分鐘`

## Why this blocks catalog insertion

- `distanceKm` conflicts across the same official source set:
  - API: `5.0公里`
  - page narrative: `約3.5公里`
  - page segment list: `3.4公里`
- `durationMinutes` also conflicts:
  - API: `半天` only, not exact minutes
  - page narrative: `單程約2小時`
  - page segment list: `150分鐘`
- The page explicitly mixes multiple route scopes/sections, so I cannot tell which published range is the canonical schema target without:
  - converting `半天` into minutes,
  - choosing between one-way vs loop scope,
  - or stitching/splitting different published ranges.
- Your constraints forbid all of those.

## Schema fields that remain unsupported for safe insertion

- `distanceKm`
- `durationMinutes`
- exact canonical `checkpoints` scope tied to the chosen distance/time range

## Result

- No catalog change.
- No source registration change.
- Report created so the route can be revisited if a single official page is later normalized.
