# Task 8 batch report: Small Hundred Peak designations — Tainan/Kaohsiung/Pingtung/Yilan cluster G

Reviewed at: 2026-07-18
Reviewer: Claude (subagent), Task 8 batch "south-g"

## Summary

All nine mountains were researched. **0 added, 9 rejected.** No mountain had a
single official government/national-park/forestry source publishing all
schema-required fields (especially the required non-null `durationMinutes`
and the required numeric `difficulty`) for one coherent, unambiguous route.
Several mountains (069, 070, 071, 079, 084) have no dedicated official
source at all — only hiking blogs and community trail logs cover them. One
mountain (076 笠頂山) has an active official closure notice on one of its
four numbered trails, discovered by reading full page text, not just a data
table — noted below even though it was not the sole blocker. One mountain
(081 大山母山) has a genuine official Kenting National Park source with
distance and approximate duration, but no numeric difficulty anywhere and
two different, non-canonical trailhead/route combinations.

**Overlap check:** grepped `data/routes/catalog.json` (all 154 records,
`json.dumps` of every record including every nested `checkpoints[].name`
entry) for all nine mountain names plus short-form variants (大山母,
山母山) — zero matches anywhere in the file, top-level or nested. Also
confirmed none of the nine appear in `data/routes/hundred-peaks.json` (the
100 traditional Hundred Peaks — that file is a flat list of 100 name
strings; a substring search found no hits for any of the nine names). All
nine are genuinely new, unclaimed candidates; none required merging into an
existing record.

Baseline before this batch: `npm run routes:verify` reported `Small hundred
peaks: 12`. Since 0 mountains were added, this count is unchanged after this
batch (see Verify section).

---

## 069 白雲山 (高雄市甲仙區/六龜區) — REJECTED

**Designation source:** 教育部體育署 i運動資訊平台,
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=68
(designation evidence only, per brief — not used for route facts.)

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found under this mountain
  name (site-restricted search returned only unrelated trails).
- 高雄市六龜區公所「步道尋幽」page
  (https://liouguei.kcg.gov.tw/cp.aspx?n=5CBEB256DB38F0B4&s=E80B242040C8E9C3)
  — lists four trails (浦來溪頭社戰道、美崙山步道、楓荔林步道、寶來屋脊);
  白雲山 is not mentioned at all.
- 高雄市甲仙區公所 (jiasian.kcg.gov.tw) — checked both the「觀光導覽」page
  and a news article found via site-restricted search; neither mentions
  白雲山. The 觀光導覽 page covers only local produce (芋頭、梅子、竹筍).
- 茂林國家風景區管理處 (maolin-nsa.gov.tw) — attraction listing checked;
  no entry for 白雲山.
- All route data available (two trailheads at 台20線64.5K and 65.2K,
  ~1.5hr ascent, low difficulty) comes exclusively from hiking blogs
  (impoca.com, hiking.biji.co, pixnet.net, mobile01) — none official.

**Reason for rejection:** No official government/national-park/forestry
source of any kind was found publishing route facts (distance, duration,
difficulty, or checkpoints) for this mountain. Every required field would
have to come from unofficial hiking blogs, which the project's sourcing
rules do not permit.

**Closure check:** No official source exists to check; no closure was
mentioned in the unofficial sources reviewed (informational only, not
relied upon for the decision).

---

## 070 刣牛湖山 (臺南市/高雄市) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=69

**Sources checked:**
- `recreation.forest.gov.tw` — the only related hit is 龍麟山步道
  (https://recreation.forest.gov.tw/Trail/RT?tr_id=180), an official page
  with complete data (2.3 km loop, 240–530 m, ~3.5 hr, difficulty level 2)
  — but its own text states 刣牛湖山 is reached only via a separate,
  longer, unofficial ridge traverse ("烏山縱走") that merely uses 龍麟山步道
  as its southern endpoint; 龍麟山步道 itself does not pass through
  刣牛湖山. Also note this page currently states an active closure:
  "龍麟山步道自1.7K至2.4K多處崩塌，即日起暫停開放" (informational — not the
  blocking reason here since this trail doesn't reach the target mountain
  anyway).
- 臺南市龍崎區公所, 高雄市內門區公所, 高雄市甲仙區公所 — searched for any
  official page; none found covering 刣牛湖山.
- 臺南市政府觀光旅遊局 (twtainan.net) and 高雄旅遊網 (khh.travel) —
  site-restricted searches returned no page for this mountain.
- All published route data (starting from 金光山財神廟/紫竹寺, ~2.4 km,
  798 m elevation) comes exclusively from hiking blogs (健行筆記, vocus,
  pixnet, impoca, 旅聯網, 歐都納) — none official.

**Reason for rejection:** No official source publishes route facts for a
route that actually reaches 刣牛湖山's summit. The one official trail
record found in the area (龍麟山步道) is a geographically distinct route
that does not pass through this mountain.

**Closure check:** No official source covering this mountain's actual
route exists to check for closure. (The unrelated 龍麟山步道's closure
notice was read in full but does not apply to this mountain.)

---

## 071 鳴海山 (高雄市茂林區) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=70

**Sources checked:**
- `recreation.forest.gov.tw` — no dedicated trail entry; the only mention
  found is inside 藤枝國家森林遊樂區-related historical-trail prose
  describing the Japanese-era 六龜警備道 waypoint sequence
  "扇平-鳴海-真我-茂林-多納" — a historical place-name reference, not a
  published route record.
- 茂林國家風景區管理處 (maolin-nsa.gov.tw) — checked the attraction listing
  and site-restricted searches; the NSA's published trail set (小長城步道,
  姿沙里沙里步道, 龍頭山遊憩區, 茂林谷/羅木斯溪步道, 尾寮山登山步道, 涼山
  遊憩區, 藤枝國家森林遊樂區, 寶來花賞溫泉公園) does not include 鳴海山.
- 高雄旅遊網 (khh.travel) — site-restricted search found no page.
- All published route data (single-登山口 via 舊茂林聯絡道路, ~4.3 km
  one-way, 1100–1411 m elevation, ~4 hr round trip) comes exclusively from
  hiking blogs (vocus, hiking.biji.co, atunas, pixnet, 鯊小去旅行) — none
  official.

**Reason for rejection:** No official government/NSA/forestry source
publishes route facts for this mountain; only a historical waypoint mention
inside unrelated official prose, and otherwise unofficial hiking-blog data
only.

**Closure check:** No official source exists to check.

---

## 072 旗尾山 (高雄市旗山區) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=71

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 高雄市旗山區公所 official page
  (https://cishan88.kcg.gov.tw/cp.aspx?n=79E80EEAF3415115) — states
  elevation 318 m, describes three numbered trailheads on 竹寮巷 (trail 1
  and 2 are steep rock-ridge scrambles, trail 3 is ~900+ stone steps), and
  states "約40分鐘" to reach the main pavilion from either trailhead, plus
  "單程約為3小時" for the separate, longer ridge-traverse route to 靈山
  (a different peak, near Meinong). No exact total distance for any
  numbered trail, no numeric difficulty rating, and no ordered same-start/
  same-end checkpoint list is published.
- 高雄旅遊網 (khh.travel), official page
  https://khh.travel/zh-tw/attractions/detail/1241/ — live fetch returned
  HTTP 403 (WAF-blocked); retrieved via the Wayback Machine snapshot dated
  2025-04-07 instead. Confirms elevation 318 m and the same three-trail
  qualitative description (trails 1/2 "難度較高"; trail 3 "900多階石梯"),
  with no exact distance, no numeric difficulty, and no exact duration for
  the summit route itself — only the ~3-hour figure for the unrelated
  "旗靈縱走" (旗尾山→靈山) traverse.

**Reason for rejection:** `distanceKm` (required) has no official exact
value — the two official sources describe three separate, alternative
trailheads/trails without designating one canonical route or its length.
`difficulty` (required, non-nullable) has no official numeric value on
either source (only qualitative "難度較高"/stone-step descriptions).
`durationMinutes` for the actual summit climb (as opposed to the unrelated
longer ridge traverse to a different peak) is not stated anywhere
official. `checkpoints` also fails — no ordered same-start/same-end
sequence is published, only a description of three independent trailhead
options.

**Closure check:** Read full text of both official pages; no
closed/repair/storm-damage language found on either. Confirmed not closed.

---

## 076 笠頂山 (屏東縣瑪家鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=75

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 屏東縣瑪家鄉公所 (pthg.gov.tw/townmjt) — fetched the township homepage
  (raw HTML, 69,690 bytes) and its news detail page. Found an **active
  official closure notice**, quoted verbatim from the news listing (dated
  115-06-30, i.e. 2026-06-30, Republic-of-China calendar):
  > 【公告周知】為辦理「114年屏東縣瑪家鄉佳義村笠頂山步道景觀改善規劃設計
  > 及工程案」，封閉第四號登山步道施工區段，特此公告。
  Translation: to carry out a landscape-improvement design/construction
  project on the 笠頂山 trail in Jiayi Village, Trail No. 4's construction
  section is closed, effective as announced 2026-06-30 — no end date
  given (open-ended construction), and this predates today's review date
  (2026-07-18), so the closure is currently active. This closure covers
  one of the mountain's four numbered trails (an alternate detour map was
  provided for that section), not the entire mountain.
  Neither this page nor any other official page found publishes distance,
  duration, or a numeric difficulty rating for any of the four trails.
- Web search for 瑪家鄉公所 + 里程/分鐘/難度 confirms the only numeric
  route data (1號步道 0.8km/30min, 3號步道 3.2km/2hr, "4顆半星" difficulty
  out of 5) comes exclusively from unofficial hiking blogs (impoca,
  hiking.biji.co, pixnet, sam shiue blogspot) — none official.

**Reason for rejection:** `durationMinutes` and `difficulty` (both
required, non-nullable) have no official numeric source for any of the
four trails — only unofficial blog figures exist. This alone blocks
addition. Separately and independently, one of the four trails (Trail No.
4) has an active, undated-end official closure as of this review, which
would in any case require excluding that specific trail from any added
route.

**Closure check:** Explicitly checked and found an active closure on Trail
No. 4 (quoted above) — confirmed via the official township office's own
2026-06-30 announcement. Not the sole rejection reason, but independently
disqualifying for any record that would include that trail.

---

## 078 棚集山 (屏東縣來義鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=77

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 屏東縣來義鄉公所 official page
  (https://www.pthg.gov.tw/laiyi/cp.aspx?n=01CDCCEC1175F236) — states
  elevation 899 m, total loop distance "全長約7.5公里", duration "全程需
  4~5小時" (a 4-to-5-hour **range**, not a single exact figure), and
  difficulty only as the qualitative phrase "爬山難易度適中" (moderate),
  with no numeric scale defined anywhere on the page. Checkpoints are
  described only as unordered trail-section prose (flat early section,
  streamside views, later rope-climbing section, view of 小琉球), not an
  ordered same-start/same-end list. The page does include a safety
  caution — "天候不佳、步道濕滑時，請勿行走" (do not hike in bad weather
  or when the trail is wet) — but this is a standing precaution, not an
  active closure notice; the page states no current suspension.

**Reason for rejection:** `durationMinutes` (required, non-nullable) has
no single official exact value — only a "4~5小時" range, and the brief
explicitly forbids averaging or guessing a value from a range.
`difficulty` (required, non-nullable) has no official numeric value —
only the qualitative "適中" with no defined scale. `checkpoints` also
fails — the page provides prose trail-section description, not an ordered
official list.

**Closure check:** Read full page text; found only a standing
weather-based caution, not an active closure/repair/storm-damage notice.
Confirmed not currently closed.

---

## 079 女仍山 (屏東縣獅子鄉/牡丹鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=78

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found (site-restricted
  search returned unrelated trails only).
- 農業部林業及自然保育署屏東分署 (pingtung.forest.gov.tw) trail-status
  page (https://pingtung.forest.gov.tw/0000721/0074640) — fetched and
  checked; this official open/closed status listing covers 六義山步道,
  雙溪樹木園步道, 靈山步道, 浸水營步道西段, 里龍山步道, 石門山步道, 高士佛
  步道, and 北大武山步道, but does **not** mention 女仍山 at all.
- 雙流國家森林遊樂區 (the nearby official forest recreation area) — its
  page lists its own four internal trails (瀑布線, 白榕線, 帽子山線, etc.);
  女仍山 is a separate, unrelated peak not among them.
- Community sources describe 女仍山 as informally "規劃為國家登山步道"
  around 2001, but no accessible official government page publishes actual
  distance/duration/difficulty/checkpoint data — every numeric figure
  found (3.5 km one-way, 140–804 m elevation) comes from hiking blogs and
  a UDN news travel article, not a government/NSA/forestry primary source.

**Reason for rejection:** No official source with retrievable route facts
was found, despite this trail having a former "national trail" planning
designation. No official page states distance, duration, difficulty, or
an ordered checkpoint list.

**Closure check:** No official source exists to check; no closure
mentioned in the unofficial sources reviewed (informational only).

---

## 081 大山母山 (屏東縣恆春鎮) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=80

**Sources checked:**
- `recreation.forest.gov.tw` — no dedicated trail entry (only appears in
  unrelated hiker-review mentions on other trail pages).
- 內政部國家公園署墾丁國家公園管理處 official page, two mirrors checked:
  https://www.ktnp.gov.tw/cp.aspx?n=8157691CA2AA32F8 (shows fields marked
  "待補充" / to-be-supplied for distance/duration/difficulty) and its full
  content mirror https://www.taiwan.nps.gov.tw (redirects to
  http://www.taiwan.nps.gov.tw/home/zh-tw/topic/18814.html, fetched raw,
  updated 2025-05-19). The full mirror states, quoted verbatim:
  > 大山母山一共有 2 個出入口。由赤牛嶺步道口至大山母山三角點,全長 4.9
  > 公里;由南灣步道口至大山母山三角點,全長 1.8 公里。時程依照原路折返,
  > 或是不同步道口進出,將有所不同,例如(路線A)赤牛嶺-大山母山三角點-南灣,
  > 約5小時。(路線B)南灣-大山母山三角點-南灣,約3小時。
  The page names two interpretive waypoints (解說樁 at 1K+795 and 4K+180,
  measured from the 赤牛嶺 side) but no numeric difficulty rating anywhere,
  and no permit statement, evacuation points, or GPS coordinates.

**Reason for rejection:** `difficulty` (required, non-nullable) has no
official numeric value anywhere on either official mirror of this page —
this alone is disqualifying. Independently: the official source itself
describes **two different named routes** (Route A: 赤牛嶺↔南灣 via summit,
~5 hr, using a 4.9 km one-way leg plus a 1.8 km one-way leg; Route B:
南灣↔南灣 round trip via summit, ~3 hr, 1.8 km one-way) without designating
one as canonical, mirroring the exact "multiple trailheads, no single
canonical route" problem that blocked 053 鳳凰山 in the prior south-f
batch. The two named interpretive waypoints are stated as distance markers
from the 赤牛嶺 side only, so they do not cleanly map onto Route B's
南灣-based checkpoints either — there is no single official ordered
same-start/same-end checkpoint sequence. Duration for both named routes is
also only a rounded "約X小時" approximation, not an exact minutes figure.

**Closure check:** Read the full official page text (both mirrors); no
closed/repair/storm-damage language found. Confirmed not closed. (Not the
rejection reason — the missing difficulty and dual-route ambiguity are.)

---

## 084 鵲子山 (宜蘭縣礁溪鄉) — REJECTED

**Designation source:**
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=83

**Sources checked:**
- `recreation.forest.gov.tw` official page for 礁溪跑馬古道
  (https://recreation.forest.gov.tw/Trail/RT?tr_id=007) — complete
  official data for the ancient trail itself (5 km, 250–419 m, difficulty
  level 2, no closure), but its own hiker-notes section states 鵲子山 is
  reached only via an **optional side spur** off a 2K junction point
  ("跑馬古道南登山口＞...＞2K岔路口左轉山徑＞鵲子山登山口") — this spur has
  no distance, duration, difficulty, or checkpoint data published anywhere
  on the page; 跑馬古道 itself does not pass through or terminate at
  鵲子山.
- 淡蘭國家綠道主題網站 (交通部觀光署東北角及宜蘭海岸國家風景區管理處),
  official page for 跑馬古道
  (https://danlantrail.necoast-nsa.gov.tw/Trails-Content.aspx?a=2948) —
  states distance 9.20 km, elevation gain 530 m, difficulty "山友級"; no
  mention of 鵲子山 anywhere in the page, and no duration figure at all.
- 宜蘭縣礁溪鄉公所 (jiaosi.e-land.gov.tw) — the specific 跑馬古道 subpage
  found via search returned HTTP 404 when fetched directly; site-restricted
  searches of the domain found no page dedicated to 鵲子山.

**Reason for rejection:** No official source publishes route facts (any of
distance, duration, difficulty, or checkpoints) for a route that actually
reaches 鵲子山's summit — only for the separate 跑馬古道 that it branches
off from. Using 跑馬古道's own data would misrepresent a different route
(one that does not reach this mountain) as this mountain's route, which
the brief and this project's established practice (see the 051 松柏坑山
precedent from the south-f batch) both rule out.

**Closure check:** Read full text of both official 跑馬古道 pages found;
no closed/repair/storm-damage language on either. Confirmed not closed.

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
