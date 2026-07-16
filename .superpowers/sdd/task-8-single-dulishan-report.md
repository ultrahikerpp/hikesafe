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

### 2) The official route page itself exposes multiple official top-level values

- URL: `https://recreation.forest.gov.tw/Trail/RT?tr_id=085`
- Official values shown on the same page:
  - page top-level summary: `步道全長 5 公里`
  - page top-level summary: `建議時間 半天`
  - body copy: `步道全長約3.5公里`
  - body copy: `單程約2小時`
  - location: `嘉義縣竹崎鄉`
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
  - segment-sum distance: `3.4公里`
  - segment-sum duration: `150分鐘`

## Why this blocks catalog insertion

- The official route page for `tr_id=085` already conflicts with itself on exact scope:
  - page top-level summary: `5 公里` and `半天`
  - page body narrative: `約3.5公里` and `單程約2小時`
  - page segment list sum: `3.4公里` and `150分鐘`
- The API repeats one of those page-level scopes (`5.0公里`, `半天`) rather than resolving the discrepancy.
- Because the same official page contains multiple incompatible distance/time/checkpoint boundaries, I cannot safely determine which scope the catalog should encode as the exact canonical trail:
  - one-way narrative scope,
  - segment-listed loop scope,
  - or page/API top-level summary scope.
- Your constraints forbid choosing among those incompatible official values.

## Schema fields that remain unsupported for safe insertion

- `distanceKm`
- `durationMinutes`
- exact canonical `checkpoints` boundary tied to a chosen official scope

## Result

- No catalog change.
- No source registration change.
- Report updated to record that the official page itself contains conflicting values, so the route can be revisited only if Forestry later normalizes `tr_id=085` to one exact scope.
