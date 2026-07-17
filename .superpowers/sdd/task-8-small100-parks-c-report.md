# Task 8 batch report: Small Hundred Peak designations — National Park / Scenic Area cluster C

Reviewed: 2026-07-17

Scope: 10 mountains (068, 074, 077, 082, 083, 085, 087, 089, 099, 100) per
`.superpowers/sdd/task-8-small100-parks-c-brief.md`.

Result: 0 designations added, 10 mountains rejected.

This cluster was chosen on the theory that National Park / National Scenic
Area / Forestry Recreation Area management meant a higher hit rate for
complete official trail records. In practice this batch ran into two
structural problems that make it an unusually clean 0/10, both documented
in detail below so a future re-check knows exactly what was tried:

1. **Two currently-active closures were caught before anything was added**
   (068 藤枝山's whole recreation area, and 083 三角崙山's access trail
   聖母登山步道). This is exactly the safety check the brief asked for.
2. **The 內政部國家公園署 web platform (kmnp.gov.tw, taroko.gov.tw,
   snnp.nnp.gov.tw) renders entirely client-side.** Plain `curl`/`WebFetch`
   only return an empty SPA shell (confirmed byte-for-byte identical
   ~202KB shells across all three domains, or a raw "系統維護中" banner for
   taroko.gov.tw's `zh-tw` section — that whole section of the site was
   under maintenance for my entire research window today). I escalated to
   the `/browse` headless-Chromium skill to render these pages directly
   (see 077, 087, 099 below) rather than rely on third-party paraphrase.
   Even fully rendered, the official pages for 077 and 099 do not publish
   an exact distance/duration for a single summit-reaching route; taroko's
   own equivalent pages were unreachable (site down), so 087 relies on a
   still-official but coarser PDF table instead.

Every rejection below is a genuine "no official source covers all
required fields for one coherent route," not a tooling shortcut — each
mountain had at least one directly-read official page, and most had two or
three from different authorities.

---

## 068 藤枝山 — REJECTED (active closure)

Checked:
- https://recreation.forest.gov.tw/Forest/RA?typ_id=0600001 (藤枝國家森林遊樂區, 農業部林業及自然保育署 official recreation-area page, fetched directly)
- https://recreation.forest.gov.tw/News/News?id=20240807001 (official reopening notice)
- https://recreation.forest.gov.tw/Trail/RT?tr_id=129 (藤枝國家森林遊樂區步道群 trail-detail page — returned HTTP 500 on every attempt, could not be read)

**Closure notice found (verbatim, read on the recreation-area page itself,
not just the data table):**

> 藤枝國家森林遊樂區配合聯外道路復建工程，將延長休園，開園期程另行公告。

The page's own visitor calendar marks dates at least through October 2026
as "整修聯外道路,休園" (closed for access-road repair). This is the exact
scenario the brief's safety check exists for: an official source stating
the site is currently not open to the public. Rejected outright without
evaluating any other field — a closed recreation area cannot be published
as an active route regardless of what data might otherwise be available.

---

## 074 大崗山 — REJECTED

Checked:
- https://alian.kcg.gov.tw/cp.aspx?n=5791BF9822CD0FD0 (阿蓮區公所-大崗山, official district-office page, fetched raw HTML — 885KB, grepped for all 公里/公尺/分鐘/小時 occurrences: zero hits)
- https://alian.kcg.gov.tw/cp.aspx?n=FC73C38D12A5F849 (阿蓮區公所-大崗山風景區, same result: zero numeric trail figures)
- https://khh.travel/zh-tw/attractions/detail/144/ (高雄旅遊網 official tourism page) — live fetch blocked (HTTP 403 to both WebFetch and curl with a browser user-agent). Read via an archive.org snapshot instead (`web.archive.org/web/20251105140435/...`) to independently verify the actual page text rather than trust a search-engine summary. The archived page states only the summit elevation (312m) and general history ("曾為封閉的軍事重鎮" — a *historical* military-restriction reference, not a current closure), plus one unrelated 30-minute estimate for a side cave feature (盤龍峽谷一線天). It publishes **no** distance, duration, difficulty, or checkpoint list for a hiking route, and explicitly flags one cave-access path as "並非已規劃完善的健行步道" (not a properly planned hiking trail).
- No official 大崗山風景區 PDF map/leaflet was found from 高雄市政府 or 阿蓮/田寮/燕巢/岡山 district offices.

Third-party sources (健行筆記, vocus blogs) give "全程約4公里...2小時30分鐘"
but this number traces to hiking blogs, not the official khh.travel page
itself (confirmed by direct inspection of the archived page — it isn't
there), and even the closest official mention is qualified "約" (approximate).

Missing required fields: `distanceKm` (no exact official figure),
`durationMinutes` (no official figure at all), `difficulty` (not stated
numerically anywhere official), `checkpoints` (no official ordered list).
Rejected.

---

## 077 壽山 — REJECTED

Checked:
- https://snnp.nnp.gov.tw/trail/index.html and .../map.html?showContent=trailListContent
  (壽山國家自然公園's own official "壽山步道漫遊系統"). This site is a
  client-side rendered SPA — plain fetch returns an empty shell, so I used
  `/browse` (headless Chromium) to render it directly and read the actual
  trail list. The official 步道介紹 list is:
  - 壽山(短程步道) 龍泉寺-龍門亭
  - 壽山(短程步道) 南壽山登山口-觀林亭
  - 壽山(短程步道) 北壽山登山口-鳳凰亭
  - 壽山(中程步道) 南壽山登山口-七蔓
  - 壽山(中程步道) 龍泉寺-小坪頂
  - 壽山(中程步道) 龍泉寺-雅座
  - 壽山(長程步道) 龍泉寺-北壽山登山口
- https://khh.travel/zh-tw/attractions/detail/1231/ (柴山登山步道, official
  高雄旅遊網 page, read via archive.org snapshot since the live domain
  blocks non-browser fetches). Gives exact segment lengths matching the
  above pairs (1000m / 1080m / 2360m / 3140m / 3400m / 4020m / 6160m) and a
  vague whole-park estimate ("認真走大概一整天...輕鬆走大概2～3小時" — not
  attributable to any single one of the 7 segments).

**Why this doesn't clear the bar:** every one of the 7 official named
segments runs between a trailhead and a named pavilion (龍門亭, 觀林亭,
鳳凰亭, 七蔓, 小坪頂, 雅座) — none is labelled as reaching 壽山's actual
summit/triangulation point, and none of the official pages names a
"壽山主峰" or "三角點" endpoint anywhere. This is a network of point-to-point
pavilion walks, not one coherent same-start/same-end route to the peak the
small-hundred-peak designation refers to. There is also no numeric
`difficulty` published for any segment (the SNNP site's legend only
distinguishes 短/中/長程 — short/medium/long — which the project's prior
batches have not treated as a 1:1 mappable numeric-difficulty scheme), and
no exact per-segment duration in minutes.

Missing required fields: a route confirmed to reach the actual summit,
`difficulty`, `durationMinutes`. Rejected.

---

## 082 灣坑頭山 — REJECTED

Checked:
- https://www.necoast-nsa.gov.tw/Attraction-Content.aspx?a=269&l=1 (桃源谷,
  official 東北角暨宜蘭海岸國家風景區管理處 page). Publishes three named
  access lines with approximate one-way distances only: 內寮線 ~2km, 草嶺線
  ~4.5km, 大溪線 ~5km. No exact duration, no difficulty, no checkpoint list,
  and **no mention of 灣坑頭山 anywhere on the page.**
- https://www.necoast-nsa.gov.tw/Attraction-Content.aspx?a=268&l=1 (草嶺古道,
  same official NSA site). States "全長8.5公里" and lists landmarks in order
  (跌死馬橋, 仙跡岩, 雄鎮蠻煙摩碣, 虎字碑, 埡口處), ending at the mountain
  pass (埡口), not at 灣坑頭山's summit.
- https://danlantrail.necoast-nsa.gov.tw/Trails-Content.aspx?a=2900&l=1&listid=2862&fromCnt=0
  (草嶺古道, official 淡蘭國家綠道 sub-site — a structured trail-detail
  template). Gives a different total, "6.20 km", with elevation gain "320m"
  and a family-friendly difficulty tier, ending at 大里天公廟, again via the
  same 埡口觀景亭 pass point — not the summit.

**Why this doesn't clear the bar:** both official NSA sources for the
草嶺古道/桃源谷 system stop at the mountain pass (埡口). Reaching 灣坑頭山's
actual triangulation point (616m, 二等三角點1181) requires an additional
spur beyond the pass that neither official page documents with its own
distance, duration, or checkpoint data — it's a well-known unofficial
side-trip in hiking blogs, not something the NSA's own pages describe as
part of either named route. The two official pages also disagree with each
other on the base route's total distance (6.20km vs 8.5km), which is
itself a sign these aren't being treated as one single canonical route by
the agency.

Missing required fields: no official route reaches the summit at all, so
`distanceKm`/`durationMinutes`/`checkpoints` for the actual designated peak
are all unsupported. Rejected.

---

## 083 三角崙山 — REJECTED (active closure on the only access route + no official summit route)

Checked:
- https://recreation.forest.gov.tw/Trail/RT?tr_id=009 (聖母登山步道, 農業部
  林業及自然保育署 official trail-database page for the standard approach to
  三角崙山).

**Closure notice found (verbatim, read on the trail's own detail page, not
just the data table):**

> 【暫停開放】2026/06/10 - 2026/11/10 配合宜蘭縣政府(03-9251000)聖母登山步道
> 聯外道路0.6k和2.1k道路邊坡坍陷施工，於115/06/10起步道暫停開放，預計至
> 115/11/10結束。

Today's review date (2026-07-17) falls squarely inside this closure window.
This is the second active-closure catch in this batch, and on its own is
enough to reject — regardless of what other fields the page might supply.

For completeness: even setting the closure aside, this trail explicitly
does **not** reach 三角崙山's summit. The page's own description calls it
"前往蘭陽五岳之一的三角崙山之中繼站" (an intermediate waypoint station on
the way to 三角崙山), and its full itinerary
(通天橋→500公尺路標→箭竹林→聖母山莊→觀景平臺→通天橋, 65 minutes round trip)
terminates at 聖母山莊/觀景平臺, not the peak. No other official source for
the final stretch to the actual summit was found. Rejected on both grounds.

---

## 085 三星山 — REJECTED

Checked:
- `recreation.forest.gov.tw`'s bulk trail-database API
  (`mis/api/BasicInfo/Trail`, all 117 official national-trail entries) —
  searched by name and by position (宜蘭縣大同鄉/三星鄉): no entry named
  三星山 exists. The nearest entries are 望洋山步道 (tr_id=021, a
  neighbouring peak) and several other 太平山-area trails (茂興懷舊步道,
  見晴懷古步道, 鳩之澤自然步道, 台灣山毛櫸步道, 翠峰湖環山步道) — none is
  三星山 itself.
- https://tps.forest.gov.tw/TPSWeb/wSite/lp?ctNode=299&mp=1 (太平山國家森林
  遊樂區入口網's own "全部景點" attractions list, the recreation area's own
  authoritative trail listing). Enumerated every linked attraction/trail
  node on the page (見晴懷古步道, 太平山莊, 蹦蹦車, 茂興懷舊步道, 檜木原始林
  步道, 鐵杉林自然步道, 望洋山步道, 翠峰湖環山步道, 台灣山毛櫸步道, 翠峰景觀
  道路, 翠峰山屋, etc.) — **三星山 is not among them.**
- https://tps.forest.gov.tw/TPSWeb/wSite/np?ctNode=295&mp=1&idPath=215_221_295
  (翠峰景觀道路 detail page, the scenic road that passes nearest to 三星山).
  This is a 16.8km vehicle road description, not a hiking-trail record, and
  does not treat 三星山 as a named destination with its own distance/
  duration/checkpoints.

Multiple hiking blogs (健行筆記, pixnet, vocus) consistently describe an
unofficial trailhead at "平元林道5.8K" with a 1.4km/70-minute ascent, but
none of this traces to a 太平山國家森林遊樂區, 農業部林業及自然保育署, or
宜蘭分署 page — it is not published by any government/forestry source I
could find, despite being a well-documented and apparently maintained
trail in practice. Rejected for lack of an official structured source, not
for lack of a real trail.

---

## 087 立霧山 — REJECTED

Checked:
- https://recreation.forest.gov.tw/Files/News/File/20211007003_file_太魯閣國家公園步道系統分級結果.pdf
  (太魯閣國家公園步道系統分級表, official — hosted on the Forestry Bureau's
  site but is the National Park's own trail-grading table). Row 21: 立霧山
  — 行程 "太魯閣台地→砂卡礑林道→立霧山→太魯閣台地", 里程 **38.4公里**, 天數
  **2**, 難度等級 **3**, 困難地形 "無", 注意事項 "注意氣候及溫度變化".
- https://www.nlma.gov.tw/filesys/file/EMMA/a1120424-4.pdf (表4、國家(自然)
  公園步道系統分級表 — a newer, consolidated cross-park version of the same
  official table, from 內政部國家公園署 via 國土管理署). Row 77 (太管處):
  identical route text and 38.4公里/2天/難度3 — independently confirms the
  Taroko PDF's figures via a second official document.
- https://www.taroko.gov.tw/zh-tw/Tourism/TrailDetail?id=34 and `id=33`
  (太魯閣國家公園 official trail-detail pages, the only place a
  route-specific exact-minutes figure might live). **Unreachable during
  this entire research window**: every request to `taroko.gov.tw/zh-tw/*`
  — via curl, WebFetch, and a full headless-Chromium render via `/browse`
  — returned only "內政部國家公園署網站　　系統維護中" (system under
  maintenance), confirmed on the bare `zh-tw` root as well, not just the
  trail page. This is a live site outage, not a data gap I chose not to
  pursue.

**Why this doesn't clear the bar:** the one accessible official source
(cross-verified on two separate government PDFs) classifies 立霧山 as part
of a 2-day, 38.4km backcountry route via 砂卡礑林道 — the same route type as
41.4km 千里眼山 next to it in the same table, not a single-day suburban
hike. It gives only a day-count ("2"), never exact minutes, and only 3
named points (太魯閣台地, 砂卡礑林道, 立霧山) — not an ordered checkpoint
list in the sense this schema requires. `durationMinutes` is a required,
non-nullable field; "2 days" cannot be converted to an exact minutes value
without estimating, which the brief explicitly forbids.

Missing required field: `durationMinutes` (no official exact figure
published anywhere I could reach); `checkpoints` also thinner than
required. Rejected.

---

## 089 鯉魚山 — REJECTED

(Confirmed this is the 花蓮縣壽豐鄉 601m 鯉魚山 — the small-hundred-peak
list's own source page, isports.sa.gov.tw PKNO=88, states "花蓮縣壽豐鄉" —
not the unrelated same-named 鯉魚山 in 臺東市, tr_id=147, which is a
different, lower peak with its own separate official page.)

Checked:
- https://recreation.forest.gov.tw/Trail/RT?tr_id=156 (鯉魚山步道群, 農業部
  林業及自然保育署 official trail-database page,花蓮分署). States
  `TR_LENGTH_NUM: 10.04公里` for the **entire 6-trail network combined**
  (健身/賞鳥/野趣/登山/遠眺/野餐觀景), elevation range 140–601m, `TR_DIF_CLASS: 1`,
  duration `一天` (whole-network, not one route). The page's own itinerary
  text (行程一, labelled "「登山步道」(主步道)") gives an exact
  same-start/same-end loop with per-segment minute figures:
  潭南停車場→(15分)→步道入口→(8分)→養心亭→(18分)→岔路→(25分)→石梯口→(12分)
  →主稜→(10分)→觀景台（海拔601公尺，小百岳三角點）→(5分)→飛行傘場地→(5分)
  →轉播站岔路→(18分)→出口階梯起點→(18分)→途中觀景台→(25分)→出口→(10分)
  →潭南停車場, summing to **169 minutes** — this part is solid and does
  reach the actual summit/triangulation point.
- https://hualien.forest.gov.tw/0000797 and https://www.forest.gov.tw/0000358
  (same agency's two other official mirrors of this trail's page) — checked
  specifically for a per-trail distance breakdown. Both confirm: **no
  individual distance is published for any of the 6 named sub-trails**,
  including the "登山步道" that the 169-minute loop above is built from —
  only the 10.04km whole-network total exists as an official number.

**Why this doesn't clear the bar:** I have an exact, official, same-start/
same-end checkpoint sequence and duration (169 min) for the actual
summit-reaching loop, but no official page states this specific loop's
distance — only the unrelated 6-trail-network total (10.04km) is published,
which is not the same measurement and would misrepresent the route if used
as `distanceKm`. Per the brief's "do not guess, average, or derive"
constraint, I would have to either wrongly attribute the whole-network
total to one loop, or estimate distance from the minute figures — both
forbidden. This is the one rejection in the batch that came closest to a
successful addition; only `distanceKm` is missing.

Missing required field: `distanceKm` for the specific route. Rejected.

---

## 099 太武山 — REJECTED

Checked:
- https://www.nlma.gov.tw/filesys/file/EMMA/a1120424-4.pdf (表4、國家(自然)
  公園步道系統分級表, official 內政部國家公園署/國土管理署 consolidated
  table). Row 144 (金管處): 太武山登山步道 — 行程 "太武山玉章路入口→太武山
  海印寺→太武山屏東文康中心", 里程 **3.4公里**, 天數 **<0.5**, 難度分級 **1**.
- https://www.kmnp.gov.tw/ch/roadinfo/trail-information/7 (太武山區玉章路
  登山步道, 金門國家公園管理處's own official trail page). This is a
  client-side rendered SPA — `curl`/`WebFetch` only return an empty shell
  (confirmed 202,551 bytes, byte-identical to the shell returned for every
  other page on this platform, i.e. genuinely empty of trail data, not a
  fetch failure). I rendered it directly with `/browse` (headless Chromium)
  to read the real content rather than guess. The rendered page gives a
  full narrative of the route's landmarks (玉章路牌樓, 劉玉章銅像, 倒影塔,
  鄭成功觀兵奕棋處, 毋忘在莒, 石門關, 海印寺) and notes waypoints appear
  "每隔200-800公尺" — but **states no exact total distance and no exact
  duration anywhere in the rendered text.**
- https://kinmen.travel/zh-tw/travel/attraction/499 (太武山風景區, 金門縣
  政府觀光處's official tourism page, fetched directly). States only the
  253m summit elevation and general history — no distance/duration/
  difficulty/checkpoint data.

A third-party blog gives a full segment-by-segment breakdown (太武山公墓
停車場→...→屏東文康中心, summing to 115 minutes over 4.1km) that reads like
it could be sourced from an official page, but I could not find it on
kmnp.gov.tw's own rendered content or any other official source I could
reach, so I am not treating it as officially confirmed.

**Why this doesn't clear the bar:** the one number I can attribute to an
official source (3.4km, difficulty 1) comes with only a day-bucket
duration ("<0.5天"), never exact minutes, and the national park's own
detail page — read directly after rendering its JavaScript — simply does
not publish a distance or duration figure at all despite being the most
specific, single-route-focused official page available.

Missing required field: `durationMinutes` (no official exact figure
published). Rejected.

---

## 100 蛇頭山 — REJECTED

Checked:
- https://www.penghu-nsa.gov.tw/TravelInformationSceneryDetailC001200.aspx?Cond=f42df043-8065-4c8c-9d15-4f5dc963b9f9
  and https://www.penghu-nsa.gov.tw/ScenicSpotDetail.aspx?Cond=f42df043-8065-4c8c-9d15-4f5dc963b9f9
  (蛇頭山, official 澎湖國家風景區管理處 pages, fetched directly). Publish
  location, 24-hour access, and historical/cultural narrative (法軍陣亡
  將士紀念碑, 日本松島艦慰靈碑, 1622年荷蘭城堡遺址) but **no distance,
  duration, difficulty, checkpoint list, or coordinates for a hiking
  route anywhere on either page.**
- https://www.penghu-nsa.gov.tw/ActivitiesDetailC001210.aspx?Cond=1e23feb2-7702-433a-8f8e-2a1aabd93e21
  (official news article celebrating 蛇頭山 as Taiwan's 100th small hundred
  peak) — designation-context only, no route data, consistent with the
  brief's guidance that designation announcements aren't route-fact
  evidence.

No closure or hazard notice was found on any checked page (explicitly
looked for one, given this is a tiny, fully paved/boardwalked recreation
area with no reason to expect one, and none was present).

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`,
`checkpoints` — none published anywhere official. Rejected.

---

## Overlap check (brief's Step 1)

Searched `data/routes/catalog.json` and `data/routes/hundred-peaks.json`
for all 10 mountain names (藤枝, 大崗山, 壽山, 灣坑頭, 三角崙, 三星山, 立霧山,
鯉魚山, 太武山, 蛇頭山) and common alternate spellings before researching
each. No matches in either file — none of these 10 mountains, under any
name, already exist in the catalog. All research above was for genuinely
new candidate records, not overlap additions.

## Tooling note for future batches in this cluster type

Sites on the 內政部國家公園署 unified platform (`kmnp.gov.tw`, `taroko.gov.tw`,
`snnp.nnp.gov.tw`, and likely other national-park-managed domains) render
entirely client-side and return an empty ~202KB SPA shell to `curl`/
`WebFetch`. The `/browse` skill (headless Chromium) can render them
directly and was used successfully for `kmnp.gov.tw` and `snnp.nnp.gov.tw`
in this batch. `taroko.gov.tw`'s `zh-tw` section was additionally down for
maintenance ("系統維護中") for this entire research session — worth a
re-check on a future pass since that blocked independent verification of
立霧山's exact-minutes figure beyond the coarser official PDF table.

Separately, `khh.travel` (高雄旅遊網, 高雄市政府觀光局) blocks non-browser
`curl`/`WebFetch` requests with HTTP 403; its content was still
independently verified via `archive.org` snapshots rather than trusted
from search-engine summaries alone.

## Verify

```
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm run routes:verify
```

```
Catalog invalid
Hundred peaks: 100
Suburban routes: 54
Small hundred peaks: 7
Missing sources: 0
Duplicate slugs: 0
```

Unchanged from HEAD (af5871e) — zero mountains were added this batch, so
`data/routes/catalog.json` and `data/routes/sources.json` are untouched.
`Catalog invalid` / missing-designations / missing-suburban-route lists are
expected and out of this batch's scope.
