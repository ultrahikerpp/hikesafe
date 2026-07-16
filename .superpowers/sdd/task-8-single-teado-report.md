# Task 8 Report — canonical `茶之道步道`

## Decision

Rejected. I did not modify `data/routes/catalog.json` or `data/routes/sources.json`.

## Official-source findings

### 1) The official Alishan attraction page is for the route group, not the single canonical route

- URL: `https://www.ali-nsa.net/zh-tw/attractions/detail/252`
- Page title: `石棹步道群`
- Update date shown on page: `2026-01-12`
- Official values directly shown on that page:
  - location: `石棹`
  - address: `嘉義縣竹崎鄉`
  - entrance guidance: `入口處位於阿里山台十八線公路63.5K處。`
  - group composition: `步道群由茶、霧、雲、霞、櫻、愛之道，共六條步道所組成`
  - direct route lengths published inside the same group page:
    - `霧之道（原石棹步道，長880m）`
    - `茶之道（長1030m）`
    - `雲之道（原杉林步道，長700m）`
    - `霞之道（長530m）`
    - `櫻之道（長990m）`
    - `愛之道（長662m）`

### 2) I found an official standalone page for another member of the same group, but not for 茶之道

- Group page linked nearby standalone route:
  - URL: `https://www.ali-nsa.net/zh-tw/attractions/detail/513`
  - Page title: `石棹步道群-櫻之道`
- This confirms the official site can publish a single-route page when it chooses to.
- I did not find an official standalone page titled `茶之道步道` or `石棹步道群-茶之道` during this check.

## Why this blocks catalog insertion

- Your rule requires an exact canonical official page for the single route.
- The only official page I found that directly names `茶之道` is the group page `石棹步道群`, which mixes six routes on one page.
- That group page directly supports only a subset of schema values for `茶之道`:
  - route name can be inferred from the listed member route name `茶之道`
  - region can be inferred only at the group level as `嘉義縣竹崎鄉`
  - one published route length exists: `1030m`
- The same group page does not directly provide single-route values for:
  - `durationMinutes`
  - `difficulty`
  - `checkpoints`
  - `permitNotes`
- Because the evidence is attached to the group scope rather than an exact single-route official page, adding a suburban route entry would require choosing unsupported boundaries for the canonical route record.

## Schema fields that remain unsupported for safe insertion

- exact canonical single-route page
- `durationMinutes`
- `difficulty`
- `checkpoints`
- `permitNotes`

## Result

- No catalog change.
- No source registration change.
- Report added so the route can be revisited only if an official standalone `茶之道` page is published or another allowed official source publishes the missing single-route fields directly.
