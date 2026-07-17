# Task 8 batch report: Small Hundred Peak designations — Central cluster E

Reviewed: 2026-07-17

Scope: 10 mountains (025, 028, 032, 038, 040, 044, 045, 047, 048, 050) per
`.superpowers/sdd/task-8-small100-central-e-brief.md`.

Result: **0 designations added, 10 mountains rejected.**

## Pre-research checks (done before any per-mountain research)

1. **Forestry trail database sweep.** Downloaded the full
   `recreation.forest.gov.tw` trail CSV
   (`https://recreation.forest.gov.tw/mis/api/BasicInfo/TrailNoEntranceArray?format=csv`,
   251 rows) and grepped `TR_CNAME`/`GUIDE_CONTENT` for all ten mountain
   names plus known alternate spellings (石牛, 李崠/李棟, 向天湖, 鐵砧, 聚興,
   暗影, 橫屏, 九份二, 橫山, 集集). Zero matches for any of the ten — none of
   these peaks has a `recreation.forest.gov.tw/Trail/RT?tr_id=` page. This
   was cross-confirmed with `WebSearch site:recreation.forest.gov.tw` for
   each mountain, same result. This is unlike most prior successful batches
   in this project, which relied heavily on this database.
2. **Overlap check** against `data/routes/hundred-peaks.json` (the 100
   traditional peaks — none of the ten names appear) and
   `data/routes/catalog.json`, searching the full serialized JSON of every
   record (not just `mountainName`/`routeName`, but also `checkpoints[].name`
   and every other string field) for all ten names plus alternate spellings
   (李崠, 向天湖, 光天高山, 酒桶山 [an alt name for 暗影山], 橫屏山, 橫嶺山).
   Only one incidental hit: `hengling-mountain-trail` (橫嶺山步道) contains
   "橫嶺山", a **different**, already-catalogued mountain, not our target
   048 橫山 — confirmed distinct (橫嶺山 is on Daxueshan Forest Road in
   Taichung; 橫山/048 is the Bagua-range peak near Nantou/Shetou). No genuine
   overlap found for any of the ten. All ten required fresh research.
3. **Slug collision check**: not applicable — no records were added.

---

## 025 石牛山 — REJECTED

Checked:
- https://travel.hsinchu.gov.tw/Attraction/Content/7RApPkG1Pe64 (新竹縣旅遊網,
  official 新竹縣政府交通旅遊處 tourism page, fetched raw). Publishes:
  "長度：4公里", "難度：中-高", "路面狀況：產業道路、土石山徑、溪床、岩壁、水泥橋",
  登山入口 at 石福宮 (306新竹縣關西鎮錦山里), contact "03-5873180(關西鎮公所)",
  "全年開放". No duration figure anywhere on the page. Difficulty is a
  qualitative label ("中-高") with no documented numeric tier-mapping
  anywhere on the site (checked; no legend found). The two named "routes"
  (左線/右線) are described narratively, not as an ordered checkpoint
  sequence with named waypoints.
- Full raw-text extraction of the same page (re-fetched with a
  verbatim-text prompt) confirmed no duration, no checkpoints, no elevation
  gain figure — only distance and a qualitative difficulty label.
- Checked HPA (衛生福利部國民健康署) 社區健走步道 index — no entry for 石牛山
  (only 鐵砧山, see 038 below, exists for this region in that database).
- Closure check: the page notes a 2024 earthquake split the summit boulder
  ("山頂的巨石已經裂成兩半") — this is a cosmetic/landmark note, not a
  closure or hazard warning; the page states the trail is open year-round.
  No closure found.

Missing required fields: `durationMinutes` (no official figure at all,
required and cannot be null) and `difficulty` (only a qualitative "中-高"
label with no official numeric or 1:1-mappable tier scheme). Also no
official ordered `checkpoints` sequence. Rejected.

---

## 028 李棟山 (李崠山) — REJECTED

Checked:
- Web search for an official 尖石鄉公所 (Jianshi Township Office) trail page:
  found only a general township-office contact page and news items about a
  different trail (老鷹溪瀑布步道) planned by the township; no dedicated
  official 李棟山/李崠山 route page with distance/duration/checkpoints.
- https://nchdb.boch.gov.tw/assets/overview/monument/20060724000012 (國家
  文化資產網, 文化部文化資產局 official heritage-registry page for "尖石
  TAPUNG古堡（李崠隘勇監督所）", a registered 縣定古蹟). This documents the
  fort's heritage status and history but is a cultural-monument record, not
  a trail-fact page — no distance/duration/difficulty/checkpoints.
- The trailhead (李棟山莊) is private property charging a ~NT$20 cleaning
  fee per multiple secondary sources — not itself disqualifying, but no
  government agency (forestry, county, or township) publishes the route's
  distance/duration/difficulty as an official structured record; all
  concrete figures found (e.g. "從李棟山莊到山頂約1.5公里") trace to hiking
  blogs (健行筆記, 痞客邦, Threads posts), not official sources.
- isports.sa.gov.tw PKNO=28 confirms designation only (per brief rule #4),
  not usable for route facts.
- Closure check: no closure notice found on any official page (note: 李棟山莊
  itself burned down in a 2018 fire per secondary sources and no longer
  offers lodging, but this does not affect trail access to the summit per
  the same sources — moot anyway since no addable record exists).

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` all lack any official government source. Rejected.

---

## 032 向天湖山 — REJECTED

Checked:
- https://www.trimt-nsa.gov.tw/zh-tw/attraction/1/ (向天湖, 參山國家風景區
  管理處 official page). Publishes cultural/geographic narrative only:
  "苗栗縣南庄鄉東河村之西北角加里山塊的北端...海拔738公尺", 賽夏族矮靈祭
  background, facilities list ("賽夏文物館、祭場、湖畔咖啡館、停車場、公廁、
  環湖道路"). No distance/duration/difficulty/checkpoint data for the
  **山** (summit) trail specifically — only the lake/village area.
- https://www.nanchuang.gov.tw/News_Content.aspx?n=3415&s=133227 (南庄鄉
  公所 official page for 向天湖). Same result: narrative and cultural
  content only, no route-fact fields.
- Searched for a dedicated 參山國家風景區管理處 structured trail-data page
  for 向天湖山 specifically (the agency does have such pages for some
  trails, per a prior batch's finding for 獅山古道) — none found; only the
  general attraction overview page above exists for this location.
- All concrete segment-by-segment distance/time figures found (e.g.
  "向天湖山步道全長單程2.5公里，往返約2小時45分鐘", detailed waypoint
  breakdown with 15/25/10/15/25-minute segments) trace to hiking blogs
  (taiwanhuma.com, taiwanoutdoors.com, 健行筆記, 痞客邦) — not official.
- Closure check: no closure notice found on either official page checked
  (note: secondary sources mention the trail is muddy/slippery after rain
  and not recommended in wet weather, but this is standard hiking advice,
  not a closure).

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` all lack any official government source specific to the 向天湖山
summit trail. Rejected.

---

## 038 鐵砧山 — REJECTED

Checked:
- https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=556&pid=816 (衛生福利部
  國民健康署 官方「社區健走步道」— 臺中市大甲區鐵砧山步道, official page,
  fetched raw HTML directly). Publishes three named routes:
  "1.大甲鐵砧山地標→ 成功路→ 收費亭→中正公園（太陽門）。2.大甲鐵砧山地標→佛光山
  妙法寺→永信運動公園→中正公園（太陽門）。3.大甲鐵砧山地標→收費亭→劍井→國姓廟→
  國軍忠烈祠→永信運動公園→中正公園（太陽門）為階梯步道。" and for route 1:
  "健走公里數：大甲鐵砧山地標成功路 收費亭→中正公園，單程約2.5公里，約30分鐘。"
  This gives an official distance (2.5km one-way) AND duration (~30 min
  one-way) AND an ordered checkpoint sequence for route 1 — a genuinely
  strong partial result. No closure/hazard notice anywhere on the page
  (last updated 2026/03/26, before the July 2026 typhoon season affecting
  Taichung trails — see 040 below — so this predates any storm damage that
  may since have occurred; no evidence either way of a current closure was
  found, but also no evidence contradicting one, so I checked further).
- https://www.scenic.taichung.gov.tw/833856/Nodelist and
  https://www.scenic.taichung.gov.tw/833821/833829/833831/863408 (臺中市
  風景區管理所 official pages for 大甲鐵砧山風景特定區). No route
  distance/duration/difficulty data — only facility/contact information.
- https://travel.taichung.gov.tw/zh-tw/experience/hikingtrail (臺中觀光
  旅遊網 official structured hiking-trail hub — same template successfully
  used by a prior batch for the Dakeng trail network, confirmed to carry a
  documented three-tier difficulty scheme 親子級/休閒級/健腳級). Fetched the
  complete list of all 19 trails on this hub (Dakeng trails 1–11 plus 3-1,
  5-1, 9-1, plus 新田登山步道, 環山獵人登山步道, 雪山坑環線步道, 雙崎部落埋伏坪
  步道, 知高圳登山步道) — 鐵砧山 is **not** among them, so this hub's
  difficulty-tier scheme cannot be applied to it.
- No numeric or tier-based difficulty rating for 鐵砧山's trail found on any
  official source checked.

Missing required field: `difficulty` (required, cannot be null, integer
0-6) has no officially stated numeric value or 1:1-mappable tier on any
official page found, despite `distanceKm`, `durationMinutes`, and
`checkpoints` all being solidly sourced from the official HPA page.
Rejected on this basis alone (precedent: a prior batch in this project
rejected 036 關刀山 for the identical reason — solid distance/duration/
checkpoints but no official difficulty figure).

---

## 040 聚興山 (新田登山步道) — REJECTED (active closure/hazard notice)

Checked:
- https://travel.taichung.gov.tw/zh-tw/experience/hikingtrail/14 (新田登山
  步道, 臺中市政府觀光旅遊局／臺中觀光旅遊網 official structured page,
  fetched raw). This page is otherwise an excellent official source:
  "路線長度 2.9公里", "運動時間 2 小時", "海拔高度 279~500 公尺", "難度
  休閒級", checkpoints 新田登山步道停車場 → 1063階木棧階梯 → 賞鷹平台 →
  觀景台 → 聚興山(山頂/三角點) → environmental loop back to parking. Calorie
  figure "773.3大卡" also published (not a schema field, ignored).
- **However**, the same official page carries an active hazard/closure
  notice: **"受丹娜斯颱風及0728西南氣流影響，部分路段仍有邊坡不穩與步道破損
  情形"** ("Due to Typhoon Danas and the 0728 southwest-monsoon system,
  some sections still have unstable slopes and trail damage"). The linked
  https://travel.taichung.gov.tw/zh-tw/attractions/intro/791 page's own
  title literally reads **"新田登山步道(部分路段封閉)"** ("New Tian Hiking
  Trail — partial section closed").
- This is precisely the safety trap flagged in the brief: an official
  source with otherwise complete, schema-ready data, but which itself
  states the trail is currently damaged/closed. Per the brief's
  non-negotiable safety rule, this mountain is rejected outright rather
  than added, regardless of how complete the rest of the data is.
- (Cross-reference: a sibling batch in this project — `task-8-small100-central-b-report.md`
  — independently found and had to withdraw a different Taichung Dakeng
  record, `dakeng-trail-5-toukeshan`, for the *same* Typhoon Danas / 0728
  closure event affecting `travel.taichung.gov.tw` hiking-trail pages more
  broadly. This confirms the closure is a real, currently-active,
  cross-referenced condition as of this review date, not a one-off
  page-specific glitch.)

Rejected due to an active official closure/hazard notice, quoted above
verbatim. Not added despite otherwise-complete official data.

---

## 044 暗影山 — REJECTED

Checked:
- `site:travel.taichung.gov.tw 暗影山` and `site:recreation.forest.gov.tw
  暗影山` — no results. 暗影山 is **not** among the 19 trails on
  `travel.taichung.gov.tw/zh-tw/experience/hikingtrail` (the hub checked in
  full for 038/040 above), so the Taichung hiking-trail difficulty-tier
  scheme cannot be applied here either.
- HPA (衛生福利部國民健康署) 社區健走步道 database: no entry (`site:hpa.gov.tw`
  search across all ten mountain names returned zero results except the
  038 鐵砧山 page already covered).
- No dedicated 臺中市風景區管理所 or 太平區公所/新社區公所 page found with
  route-fact data.
- isports.sa.gov.tw PKNO=43 is designation evidence only (confirms
  elevation 997m and Small Hundred Peak #44 status), not usable for route
  facts per the brief's rule #4.
- All concrete distance/duration figures found (e.g. "往返2.5小時，往返
  距離9公里，高度落差331公尺" or the shorter "北稜線路徑長度約0.6公里") trace
  to hiking blogs (健行筆記, udn旅遊, 痞客邦) and disagree with each other
  depending on which trailhead/route is used — not official, and internally
  inconsistent, reinforcing that no single official route is documented.

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` all lack any official government source. Rejected.

---

## 045 大橫屏山 — REJECTED

Checked:
- `site:travel.taichung.gov.tw 大橫屏山` and `site:recreation.forest.gov.tw
  大橫屏山` — no results (only the unrelated official 橫嶺山步道 page,
  `recreation.forest.gov.tw/Trail/RT?tr_id=048`, on Daxueshan Forest Road —
  confirmed a different, already-catalogued mountain, not this one).
- Searched for 國姓鄉公所 (Guoxing Township Office, 南投縣) and 太平區公所
  (臺中市) official pages — none found with route-fact data. Secondary
  sources (news article "修建國姓大橫屏山登山步道 帶動觀光發展") state the
  trail was built and is maintained by **community/civic associations**
  (猴洞坑生態保育協會, 大旗社區發展協會) with local funding support after the
  1999 earthquake, not by a government agency directly — this does not
  meet the brief's "official government/national-park/forestry source"
  bar even where those articles mention rough figures ("單程約1公里" for the
  easiest option, or "17公里" for a challenge route) since the underlying
  organization is not a government body.
- isports.sa.gov.tw PKNO=44 is designation evidence only, not usable for
  route facts.
- No HPA, NSA, or county/city official page found for this peak at all.

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` all lack any official government source (only a
community-association-maintained trail with unofficial figures exists).
Rejected.

---

## 047 九份二山 — REJECTED

Checked:
- https://travel.nantou.gov.tw/attractions/jiufen-ershan-earthquake-memorial-park/
  (九份二山地震紀念園區, 南投縣政府 official 南投旅遊網 page, fetched raw).
  This page covers a related but **distinct** site — the 921-earthquake
  memorial park at 544南投縣國姓鄉南港村長石巷, preserving landslide/collapsed-
  building remnants — not the small-hundred-peak summit trail itself
  (which secondary sources place at the 中寮鄉和興村/國姓鄉南港村 boundary,
  elevation ~1174m). Publishes only opening hours (24hr) and narrative
  history; no distance/duration/difficulty/checkpoint data for any hiking
  route.
- No official page found specifically for the 九份二山 summit trail
  (distinct from the memorial park) on 南投縣政府, 中寮鄉公所, or 國姓鄉公所
  domains.
- isports.sa.gov.tw PKNO=46 is designation evidence only.
- All concrete route figures found (e.g. "路徑長度約1.7公里，步行時間約2小時，
  難度為低") trace to hiking blogs and aggregator summaries, not official
  sources.
- Closure check: no closure notice found on the official memorial-park
  page (moot, since it isn't the actual summit-trail page in any case).

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` for the actual summit trail all lack any official government
source (the one official page found covers a related but different site).
Rejected.

---

## 048 橫山 (南投／彰化交界, 八卦山脈) — REJECTED

Checked:
- https://www.trimt-nsa.gov.tw/zh-tw/attraction/19/ (猴探井天空之橋, 參山
  國家風景區管理處 official page) — this is the adjacent, well-documented
  official attraction (a 204m suspension sky-bridge), but it is a
  **different** feature from 橫山's own summit trail/觀日步道, and its page
  does not cover the summit route.
- https://travel.nantou.gov.tw/attractions/houtanjing-scenic-area/ (猴探井
  遊憩區, 南投縣政府 official page) — covers the recreation area generally,
  not 橫山's own trail distance/duration/checkpoints.
- Searched 草屯鎮公所 and 南投縣政府觀光處 directly for an official 橫山步道
  or 觀日步道 page — none found.
- Note: secondary sources describe 猴探井步道 (a related but distinct trail
  connecting to this area) as currently having a partially closed/rotted
  wooden-stair section ("木階梯腐朽已經無法通行") — this is a different named
  trail from 橫山's own summit route, so it isn't a direct closure-check
  finding for 橫山 itself, but it's noted here for completeness since it's
  in the same immediate area; moot regardless since no addable official
  source for 橫山 was found.
- isports.sa.gov.tw PKNO=47 is designation evidence only.
- All concrete figures found (e.g. "全長僅一公里多", "單程僅需20分鐘") trace to
  hiking blogs, not official sources, and are themselves vague/approximate
  even there.

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` all lack any official government source for 橫山's own summit
trail. Rejected.

---

## 050 集集大山 — REJECTED

Checked:
- `https://www.sunmoonlake.gov.tw/zh-tw/attractions/detail/218` (集集大山,
  交通部觀光署日月潭國家風景區管理處 — the official National Scenic Area
  flagged as the priority source for this peak per the brief). This exact
  URL, though it appears in current Google search results and is linked
  from `travel.nantou.gov.tw`, **currently returns HTTP 404** ("您所瀏覽的
  網頁不存在" / "THE RESOURCE CANNOT BE FOUND") when fetched live (confirmed
  via both WebFetch and a direct `curl` with a browser user-agent — a real
  404 from the server, not a JS-rendering artifact). I recovered the last
  archived version via the Wayback Machine (snapshot of the live page,
  updated 更新日期 2025-04-30) to see what it *used* to publish: "景點介紹：
  位於集集、中寮、水里三鄉鎮交界處，海拔1,392公尺，為日月潭以西最高峰...適合
  登山活動，沿途景致宜人" and "景點資訊：開放時間 09:00~17:00，連絡電話
  +886-49-2762034，聯絡地址 南投縣集集鎮集集大山" — even in its archived
  form, this NSA page never published distance/duration/difficulty/
  checkpoint data, only a narrative description and opening hours. Since
  the live URL is now gone (404), it cannot be cited as a current source in
  any case.
- https://travel.nantou.gov.tw/attractions/jiji-great-mountain/ (集集大山,
  南投縣政府 official 南投旅遊網 page, fetched raw). Publishes: "位於南投縣
  集集、水里與中寮等三鄉鎮交接處", "海拔高度達1,392公尺", address
  "552台灣南投縣集集鎮集集大山". No distance/duration/difficulty/checkpoint
  data — narrative and photo-gallery content only.
- Per the brief's note, verified the National Scenic Area does border 050
  but does not (based on both the archived NSA page and the live county
  page) publish the specific route-fact data this schema requires — the
  brief's own caveat "though the peak itself may be managed by a different
  authority — verify, don't assume" applies: neither authority checked
  publishes route facts.
- All concrete route figures found (distance "1.8公里" for 車埕步道, duration
  "約1小時50分鐘", elevation "1069至1392公尺，高度落差約323公尺") trace to
  hiking blogs (健行筆記, LINE TODAY reposts, vocus), not official sources.
- isports.sa.gov.tw PKNO=49 is designation evidence only.
- Closure check: no closure notice found on either official page (the NSA
  page is gone entirely, so this is largely moot for that source; the
  county page has no operational-status text at all).

Missing required fields: `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` all lack any official government source (both the NSA and
county tourism pages are narrative-only, and the NSA's specific page URL
is no longer live). Rejected.

---

## Summary table

| # | mountainName | Decision | Primary blocking reason |
|---|---|---|---|
| 025 | 石牛山 | Rejected | No official `durationMinutes`; difficulty only qualitative |
| 028 | 李棟山 | Rejected | No official route-fact source at all (private trailhead) |
| 032 | 向天湖山 | Rejected | No official route-fact source for the summit trail |
| 038 | 鐵砧山 | Rejected | Distance/duration/checkpoints official (HPA), but no official `difficulty` |
| 040 | 聚興山 | Rejected | **Active closure/storm-damage notice** on the otherwise-complete official source |
| 044 | 暗影山 | Rejected | No official route-fact source at all |
| 045 | 大橫屏山 | Rejected | Trail maintained by civic associations, not a government agency |
| 047 | 九份二山 | Rejected | Only an official page for a different, related site (earthquake park) |
| 048 | 橫山 | Rejected | No official route-fact source for the summit trail |
| 050 | 集集大山 | Rejected | Official NSA page is 404; both official pages found are narrative-only |

No changes were made to `data/routes/catalog.json` or `data/routes/sources.json`
in this batch.

## Verify

```
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm run routes:verify
```

```
Catalog invalid
Hundred peaks: 100
Suburban routes: 54
Small hundred peaks: 12
Missing sources: 0
Duplicate slugs: 0
```

Unchanged from the pre-batch baseline (`Small hundred peaks: 12`,
`Suburban routes: 54`, `Missing sources: 0`, `Duplicate slugs: 0`) — expected,
since zero records were added or modified this batch. `Catalog invalid` /
the missing-designations and missing-suburban-routes lists remain unchanged
and are out of this batch's scope.
