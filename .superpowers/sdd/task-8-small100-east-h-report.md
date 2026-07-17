# Task 8 batch report: Small Hundred Peak designations — Hualien/Taitung/Matsu cluster H

Reviewed at: 2026-07-18
Reviewer: Claude (subagent), Task 8 batch "east-h"

## Summary

All ten mountains were researched. **0 added, 10 rejected.** This is the final
batch of genuinely never-attempted Small Hundred Peak mountains in the
project. No mountain had a single official government/national-park/forestry
source publishing all schema-required fields (especially the required
non-null `durationMinutes` as a single exact figure, and a numeric
`difficulty`) for one coherent, unambiguous route.

Five mountains (086, 091, 092, 095, 096) have **no official government
source of any kind** publishing route facts — only hiking blogs, YouTube
videos, and community trail logs cover them. Two mountains (090 月眉山, 098
雲台山) have genuinely good official sources (農業部林業及自然保育署 for
090; 交通部觀光署馬祖國家風景區管理處 for 098) but both publish duration
only as a range ("3~4小時" and "30 至 50 分鐘" respectively), which the
project's established precedent (see 078 棚集山, south-g batch) treats as
disqualifying — the brief forbids deriving/averaging an exact minutes value
from a range. One mountain (088 初音山) has an official 花蓮縣吉安鄉公所
page but it describes two different trailhead options with only approximate
duration language ("2小時左右", "30至40分鐘") and no numeric difficulty or
ordered checkpoint list. Two mountains (094 太麻里山, 097 紅頭山) have
official township pages that describe only the general leisure area /
island geography, not the specific summit trail's distance, duration,
difficulty, or checkpoints.

Both outlying-island peaks (097 紅頭山 on Lanyu, 098 雲台山 on Matsu) were
verified per the brief's guidance: 097 has no dedicated official trail
database coverage at all (only the 蘭嶼鄉公所 general island-geography
page); 098 does have an official National Scenic Area attraction page but
it is a viewpoint/attraction writeup, not a structured trail-database entry,
and is missing distance and an exact duration.

**Overlap check:** grepped `data/routes/catalog.json` (all 154 records,
covering every nested `checkpoints[].name` entry too) and
`data/routes/hundred-peaks.json` (the 100 traditional Hundred Peaks, a flat
list of 100 name strings) for all ten official mountain names plus known
alternate-name spellings (初英山, 空巴尾山, 甘那壁山, 達悟山, 煙台山, 雲臺山,
米棧山) — zero matches anywhere, top-level or nested. All ten are genuinely
new, unclaimed candidates; none required merging into an existing record.

Baseline before this batch: `npm run routes:verify` reported `Small hundred
peaks: 12`. Since 0 mountains were added, this count is unchanged after this
batch (see Verify section).

---

## 086 卡拉寶山 (花蓮縣秀林鄉) — REJECTED

**Designation source:** 教育部體育署 i運動資訊平台,
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=85
(designation evidence only, per brief — not used for route facts.)

**Sources checked:**
- `recreation.forest.gov.tw` — searched the site's own search endpoint
  (`/Search?keyword=卡拉寶山`) directly; zero relevant results. No dedicated
  trail entry exists.
- 內政部國家公園署太魯閣國家公園管理處
  (https://www.taroko.gov.tw/zh-tw/Tourism/TrailDetail?id=38) — this URL
  was suggested by search results as potentially covering this trail (the
  mountain sits near the Central Cross-Island Highway inside/adjacent to
  Taroko NP territory), but the live page currently returns "內政部國家公園署
  網站　　系統維護中" (system under maintenance) — no content retrievable.
  Checked the Wayback Machine for a cached snapshot; the closest available
  capture (2021-04-17) itself fails to render ("This snapshot cannot be
  displayed due to an internal error"), and even if it had rendered, a
  5-year-old snapshot of an unrelated generic trail-ID URL would not be a
  reliable current source for a live safety catalog. No usable content.
- 花蓮縣秀林鄉公所 — site-restricted search (`site:xiulin.gov.tw 卡拉寶山`)
  returned zero relevant hits; no dedicated page found.
- All published route data (0.7 km one-way from 碧綠神木 trailhead on
  Highway 8 at 127.6K, ~65 min round trip, 2190–2429 m elevation) comes
  exclusively from hiking blogs (vocus.cc, hiking.biji.co, pixnet, 歐都納,
  中時新聞網) — none official.

**Reason for rejection:** No official government/national-park/forestry
source of any kind was found publishing route facts (distance, duration,
difficulty, or checkpoints) for this mountain. The one plausible official
source (Taroko NP) is currently down for system maintenance with no usable
cached version.

**Closure check:** No official source exists to check. The unofficial
sources reviewed did not mention a closure (informational only, not relied
upon for the decision).

---

## 088 初音山 (花蓮縣吉安鄉/秀林鄉界) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=87

**Sources checked:**
- `recreation.forest.gov.tw` — site search returned zero relevant results.
  No dedicated trail entry.
- 花蓮縣吉安鄉公所全球資訊網, official attraction page
  (https://www.ji-an.gov.tw/attraction/S83pmDqLVeRs) — fetched and read in
  full. States, quoted verbatim: "攀登初音山，由白雲步道2.2公里處三岔路口
  起算，約行走4.2公里、2小時左右可到達山頂，亦可車行產業道路直達華林園
  登山口，30至40分鐘可登頂，惟產業道路狹窄濕滑，行車請注意安全。" This
  describes **two different, non-equivalent routes** to the summit (a hike
  from a fork point on a separate trail — 白雲步道 — 4.2 km taking "about 2
  hours", vs. driving to a different trailhead — 華林園 — for a 30–40 minute
  hike) without designating either as canonical, and both durations are
  qualified as approximate ("左右" / a range) rather than exact. No total
  official route distance is stated for either option starting from an
  actual trailhead (the 4.2 km figure starts mid-trail at a junction, not
  from a trailhead). No numeric difficulty rating anywhere on the page.
  Opening hours stated as "戶外空間：24小時開放" (no permit gate).
- 花蓮縣秀林鄉公所 — no dedicated page found via site-restricted search.

**Reason for rejection:** `durationMinutes` (required, non-nullable) has no
single exact official value — only two different approximate figures for
two different, non-equivalent routes ("2小時左右" and "30至40分鐘").
`difficulty` (required, non-nullable) has no official numeric value.
`distanceKm` has no single official total-route figure (the only stated
distance, 4.2 km, begins at an internal junction of a different trail, not
at a trailhead). `checkpoints` also fails — no ordered same-start/same-end
sequence is published, only prose describing two alternative access options.

**Closure check:** Read the full official 吉安鄉公所 page text; states the
outdoor area is "24小時開放" (open 24 hours) with only a standing seasonal
caution about leeches/wasps/snakes — not a closure/repair/storm-damage
notice. Confirmed not closed.

---

## 090 月眉山 (花蓮縣壽豐鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=89

**Sources checked:**
- `recreation.forest.gov.tw`, official trail page
  (https://recreation.forest.gov.tw/Trail/RT?typ=3&tr_id=152) — fetched
  and read the full page (raw HTML parsed, not just the summary table).
  This is by far the most complete official source found in this batch:
  步道全長 3 km, 海拔高度 400–614 m, 高度落差 214 m, 難度等級 "難度 1"
  (numeric, on the site's own 0–6 步道分級 scale), 入山申請 否, 管轄單位
  花蓮分署, two named trailheads (北側登山口 via 台11線6.5K, 南側登山口 via
  193縣道/花38-1鄉道). However, the only duration figure on the entire page
  is 建議時間: **"3~4小時"** — a range, not a single exact minutes value.
  (A separate, generic "所需時間" column exists but only states the
  qualitative difficulty-tier band "約半天至1天", not a route-specific
  figure.) Checkpoints are also not published as a single ordered
  same-start/same-end list — the page presents the trail as two independent
  trailheads (North/South) connected end-to-end, not one canonical route
  with intermediate ordered waypoints.
  **Closure status, quoted verbatim from the live page: "全線開放"** (fully
  open), dated 2026/07/17 weather-panel timestamp, current as of this
  review (2026-07-18). Confirmed NOT closed.

**Reason for rejection:** `durationMinutes` (required, non-nullable) has no
single exact official value — only the "3~4小時" range, and the brief
explicitly forbids averaging or estimating a value from a range (same
disqualifying pattern as 078 棚集山 in the south-g batch, and 084 鵲子山's
trail-existence problem does not apply here, but the range problem does).
`checkpoints` also fails — no official ordered same-start/same-end sequence,
only two alternative trailhead descriptions. This is unfortunate since
distance (3 km), elevation range/difference (400–614 m / 214 m), difficulty
(1), and permit status (none required) are all cleanly and officially
published — but the missing exact duration and ordered checkpoint list are
each independently disqualifying per the schema's non-negotiable
requirements.

**Closure check:** Explicitly checked; page states "全線開放" (fully open).
Not closed. (Not the rejection reason — the missing exact duration and
checkpoint ordering are.)

---

## 091 八里灣山 (花蓮縣豐濱鄉/瑞穗鄉界) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=90

**Sources checked:**
- `recreation.forest.gov.tw` — site search returned zero relevant results.
  No dedicated trail entry.
- 花蓮縣豐濱鄉公所, 花蓮縣瑞穗鄉公所 — site-restricted searches
  (`site:fongbin.gov.tw OR site:ruisui.gov.tw 八里灣山`) returned zero
  relevant hits; no dedicated page found on either township's site.
- 花東縱谷國家風景區管理處 (erv-nsa.gov.tw) — site-restricted search
  returned zero hits for this mountain name. The NSA's own promotional
  "花蓮絕美步道暨小百岳推廣活動" event page
  (https://www.erv-nsa.gov.tw/zh-tw/event/news/6229, read in full) lists
  八里灣山 by name as one of "花蓮小百岳" (7 Hualien Small Hundred Peaks)
  eligible for a hiking-passport promotional activity, but this is a
  promotional listing only — it contains no distance, duration, difficulty,
  or checkpoint data for any of the 7 named mountains beyond the two (月眉山,
  鯉魚山) that separately have their own dedicated official trail pages.
- All published route data (single trailhead via 攔沙壩 off 花51鄉道, ~5.2 km
  one-way, ~7hr25min round trip, 64–924 m elevation) comes exclusively from
  hiking blogs (vocus.cc, hiking.biji.co, etc.) — none official.

**Reason for rejection:** No official government/NSA/forestry source
publishes route facts for this mountain; only a bare name-mention inside an
unrelated official promotional event page, and otherwise unofficial
hiking-blog data only.

**Closure check:** No official source with route facts exists to check.
The unofficial sources reviewed noted storm-related fallen trees in the
area in recent years but current passability, not a formal closure —
informational only, not relied upon for the decision (the rejection is for
missing official route facts, independent of any closure question).

---

## 092 萬人山 (花蓮縣富里鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=91

**Sources checked:**
- `recreation.forest.gov.tw` — site search returned zero relevant results.
  No dedicated trail entry.
- 花蓮縣富里鄉公所 — checked the official attraction listing page
  (https://www.fuli.gov.tw/News_Photo.aspx?n=1428&sms=10974, fetched via
  curl since it WAF-blocks the browse tool's request) in full; it lists
  attractions including 六十石山, 羅山遊憩區, and 東里鐵馬驛站, but contains
  **no entry for 萬人山 at all**. A targeted search for the mountain name
  specifically on the fuli.gov.tw domain confirmed no dedicated page exists.
- 花東縱谷國家風景區管理處 promotional event page (see 091 above) names
  萬人山 as one of the 7 Hualien Small Hundred Peaks but provides no route
  facts.
- All published route data (parking at 六十石山20號, ~20 min to summit via
  a short spur, 886 m elevation, 2nd-class triangulation point 1202) comes
  exclusively from hiking blogs, 歐都納's mountain database, and
  健行筆記 — none official.

**Reason for rejection:** No official government/NSA/forestry source
publishes route facts (distance, duration, difficulty, or checkpoints) for
this mountain; the township office's own attraction listing does not even
mention it by name.

**Closure check:** No official source with route facts exists to check.

---

## 094 太麻里山 (臺東縣太麻里鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=93

**Sources checked:**
- `recreation.forest.gov.tw` — site search returned zero relevant results.
  No dedicated trail entry.
- 東部海岸國家風景區管理處 (eastcoast-nsa.gov.tw) — site-restricted search
  returned zero hits for this mountain.
- 台東觀光旅遊網 (tour.taitung.gov.tw), official page
  https://tour.taitung.gov.tw/zh-tw/attraction/details/345 — the page is a
  JavaScript-rendered SPA; the server-rendered `og:description` meta tag
  (readable via curl) is purely promotional prose about the golden-needle
  flower season and views, with no distance/duration/difficulty data. A
  live-render attempt via the browse tool was blocked by the site's WAF
  ("Web Page Blocked! ... Attack ID: 20000051") for both this URL and the
  096 巴塱衛山 URL below; no Wayback Machine snapshot is available for
  either (`archive.org/wayback/available` returned an empty
  `archived_snapshots` object for 巴塱衛山's URL).
- 臺東縣太麻里鄉公所全球資訊網, official pages
  (https://www.taimali.gov.tw/home/index.php/2020-04-23-04-32-60.html and
  the 景點介紹 index) — fetched and read in full. Both describe "金針山
  休閒農業區" as a general 462-hectare leisure agricultural area (elevation
  up to 1,450 m, flower season, homestay count, farm products) — this is
  the surrounding leisure area, not the specific small-hundred-peak summit
  trail (the actual triangulation point is at 雙乳峰/曙光亭, reached via
  Jialun industrial road per hiking-blog accounts). Neither page publishes
  any distance, duration, difficulty, or checkpoint data for a summit trail.

**Reason for rejection:** No official source publishes route facts (any of
distance, duration, difficulty, or checkpoints) for a route that actually
reaches 太麻里山's triangulation-point summit — only general leisure-area
descriptions of the surrounding 金針山 area.

**Closure check:** Read the full official 太麻里鄉公所 pages found; no
closed/repair/storm-damage language present. The tour.taitung.gov.tw page
could not be read due to the WAF block, so its text could not be checked —
noted as a gap, but moot since the rejection is independently required by
the missing route-fact fields.

---

## 095 加奈美山 (臺東縣大武鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=94

**Sources checked:**
- `recreation.forest.gov.tw` — site search returned zero relevant results.
  No dedicated trail entry.
- 臺東縣大武鄉公所 — searched both the `dawu.gov.tw` domain and the
  township's actual current domain (`lbcg.tw`, confirmed via search as
  "Dawu Township Office - Official Website"); zero relevant hits on either
  domain for this mountain name.
- 農業部臺東區農業改良場 (ttdares.gov.tw) — checked
  https://www.ttdares.gov.tw/theme_data.php?theme=attractions&id=9 (a
  government agricultural-extension-station site, confirmed via footer
  attribution); this page covers 巴塱衛山 (096, see below) only, no separate
  entry found for 加奈美山.
- All published route data (2.5 km one-way from 加津林道 trailhead, first-
  class triangulation point, ~2.5 km from the Pacific coast) comes
  exclusively from hiking blogs, YouTube videos, and 歐都納's mountain
  database — none official.

**Reason for rejection:** No official government source of any kind
publishes route facts (distance, duration, difficulty, or checkpoints) for
this mountain.

**Closure check:** No official source exists to check.

---

## 096 巴塱衛山 (臺東縣大武鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=95

**Sources checked:**
- `recreation.forest.gov.tw` — site search returned zero relevant results.
  No dedicated trail entry.
- 台東觀光旅遊網 (tour.taitung.gov.tw), official page
  https://tour.taitung.gov.tw/zh-tw/attraction/details/1559 — same
  situation as 094 above: server-rendered meta description is promotional
  prose only (elevation ~325 m, two summit pavilions "忘憂亭"/"解愁亭", views
  of Green Island and Lanyu on clear days), no distance/duration/difficulty
  data; live browse attempt WAF-blocked; no Wayback snapshot available.
- 農業部臺東區農業改良場 (ttdares.gov.tw), page
  https://www.ttdares.gov.tw/theme_data.php?theme=attractions&id=9 —
  confirmed as an official government agricultural-extension-station site
  (footer: "版權所有2017 ttdares All Rights Reserved - 農業部臺東區農業改良場").
  Content is minimal: names the location (Dawu Township), describes it as
  "台灣小百岳之一" with the two summit pavilions, but is otherwise a
  promotional entry for the neighboring 山豬窟休閒農業區, not a trail-data
  sheet. No distance, elevation gain, duration, difficulty, or checkpoint
  data.
- 臺東縣大武鄉公所 (`lbcg.tw`) — zero relevant hits via site-restricted
  search.

**Reason for rejection:** No official source with retrievable route facts
(distance, duration, difficulty, checkpoints) was found for this mountain —
only elevation and general summit-facility descriptions.

**Closure check:** Read the full ttdares.gov.tw page text; no
closed/repair/storm-damage language present. The tour.taitung.gov.tw page
could not be read due to the WAF block.

---

## 097 紅頭山 (臺東縣蘭嶼鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=96

**Note on outlying-island coverage:** As flagged in the brief, this mountain
is on Lanyu (蘭嶼/Orchid Island). Verified explicitly: `recreation.forest.gov.tw`
(the mainland-Taiwan-style Forestry Bureau trail database) has **no
coverage of Lanyu at all** — site search returned zero relevant results,
consistent with the brief's expectation that this database may not extend
to outlying islands.

**Sources checked:**
- `recreation.forest.gov.tw` — confirmed no coverage (see above).
- 臺東縣蘭嶼鄉公所 (lanyu.gov.tw) — site-restricted search
  (`site:lanyu.gov.tw 紅頭山`) found several official pages describing 紅頭山
  as Lanyu's highest point (~548 m) and its role in Tao/Yami creation
  mythology and cultural taboos, but **no dedicated trail/route page** with
  distance, duration, difficulty, or checkpoint data. The township's
  "生態之旅" and "印象蘭嶼" sections cover the mountain as a cultural/scenic
  landmark, not as a maintained hiking route.
- 東部海岸國家風景區管理處 (which administers some Lanyu-area recreation
  sites) — no site-restricted hits found for this mountain.
- All published route data (椰油國小登山口, 2.4 km one-way, ~4 hr round trip,
  24–552 m elevation) comes exclusively from hiking blogs (hiking.biji.co,
  vocus.cc, pixnet, dadlanyu.com) — none official.

**Reason for rejection:** No official government source publishes route
facts (distance, duration, difficulty, or checkpoints) for a maintained
route to this mountain — only cultural/geographic description. This
confirms the brief's caution against assuming mainland-Taiwan-style
Forestry Bureau trail database coverage exists for this outlying-island peak.

**Closure check:** No official source with route facts exists to check.

---

## 098 雲台山 (連江縣南竿鄉, Matsu) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=97

**Note on outlying-island coverage:** As flagged in the brief, this mountain
is on Matsu (連江縣/Lienchiang County). `recreation.forest.gov.tw` has no
coverage (consistent with all other mountains in this batch). Unlike 097
above, Matsu's own National Scenic Area administration **does** publish a
dedicated official attraction page for this specific mountain — confirming
the brief's suggestion to check 馬祖國家風景區管理處 directly.

**Sources checked:**
- 交通部觀光署馬祖國家風景區管理處 (matsu-nsa.gov.tw), official attraction
  page https://www.matsu-nsa.gov.tw/zh-TW/attractions/1482 (also verified
  via the English-language mirror at
  https://www.matsu-nsa.gov.tw/en-US/attractions/1482 — content matches).
  Fetched and read the full page. States: elevation 248 m (Nangan's highest
  peak), 建議停留時間 (recommended visit duration) **"建議安排 30 至 50 分鐘"**
  — a range, not a single exact minutes value. No distance (km) is stated
  anywhere on the page. No numeric difficulty rating. No ordered
  same-start/same-end checkpoint list — access is described only generally
  as "位於南竿中央山區，沿主要道路可抵達步道入口" (located in Nangan's
  central highlands; trail access available via major roads), with a single
  trailhead location (Central Avenue/Jinsha Road intersection per earlier
  search results) but no ordered waypoint sequence to the summit.
  Note the older canonical URL found via search
  (`Attraction-Content.aspx?a=2746&l=1`) is now a dead link that silently
  redirects to the site homepage — the working current URL is the
  `/attractions/1482` path above.
  **Closure check, explicit:** the page itself states the site is open
  ("全天開放" per the Nangan Visitor Center info block) with only standing
  weather/safety tips (windy summit, slippery steps after rain — not a
  closure). Separately, the Matsu NSA homepage's news ticker (checked the
  same day) shows an active closure notice — quoted verbatim: "南竿大漢及
  鐵堡據點暫停開放公告" (Notice of Temporary Closure of Nangan Dahan
  Stronghold and Iron Fort) — but this closure applies to **a different,
  unrelated site** (大漢據點/鐵堡, a separate military fortification
  attraction on Nangan), not to 雲台山/軍情館. Confirmed by name and by the
  distinct attraction IDs that this closure does not apply to the mountain
  in question.

**Reason for rejection:** `distanceKm` (required) has no official value
anywhere on the page. `durationMinutes` (required, non-nullable) has no
single exact official value — only the "30 至 50 分鐘" range, the same
disqualifying pattern as 090 月眉山 above and 078 棚集山 in the prior
south-g batch. `difficulty` (required, non-nullable) has no official
numeric value. `checkpoints` also fails — no ordered same-start/same-end
waypoint sequence is published, only a single trailhead location and a
general "summit" endpoint.

**Closure check:** Explicitly checked; 雲台山/軍情館 itself is open ("全天
開放"). The nearby, unrelated 大漢據點/鐵堡 closure notice does NOT apply to
this mountain — confirmed by distinct attraction names/IDs. Not closed.
(Not the rejection reason — the missing distance, exact duration, numeric
difficulty, and ordered checkpoints are.)

---

## Verify

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog invalid
Hundred peaks: 100
Suburban routes: 54
Small hundred peaks: 12
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks: 12` is unchanged from the pre-batch baseline (also
12), consistent with 0 mountains added this batch. `Missing sources: 0` and
`Duplicate slugs: 0` confirm no partial/broken edits were made — no catalog
or sources file changes were made in this batch at all, since every
candidate was rejected. `Catalog invalid` is expected/pre-existing per the
brief (100 traditional Hundred Peaks are complete, but Suburban routes and
Small Hundred Peaks remain below target counts — unrelated to this batch).

## Files changed

None in `data/routes/catalog.json` or `data/routes/sources.json` — zero
additions this batch. Only this report file was added.
