# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 1 (north Keelung/Taipei cluster)

Reviewed: 2026-07-18
Policy: `data/routes/POLICY.md` (tiered-source policy, commit `86542c5`)

Scope: 10 mountains (003, 004, 005, 006, 007, 008, 009, 010, 012, 013), per
the parent task message. All ten were previously rejected in
`.superpowers/sdd/task-8-small100-north-a-report.md` and
`.superpowers/sdd/task-8-single-jiantan-report.md` under the old
official-only policy, exclusively for missing `durationMinutes` and/or
numeric `difficulty` — no official government source in Taiwan publishes a
0-6 trail-class number or an exact (non-range) duration for any of these ten
urban/suburban peaks. The new tiered policy unblocks them via
健行筆記 (biji) community-tier data for the route-fact fields.

**Result: 10 added, 0 rejected.**

**Overlap check:** grepped `data/routes/catalog.json` (all records + nested
`checkpoints[].name`) and `data/routes/hundred-peaks.json` for all ten
mountain names — zero matches. All ten are genuinely new records, not
overlapping any existing catalog entry.

**Difficulty mapping used (stated once here per POLICY.md §Difficulty
mapping, applies to every mountain below):** 健行筆記's difficultyText is a
5-tier text scale on this catalog's mountains, mapped 1:1 onto the schema's
0-6 official 步道分級 integer as follows (0 and 6 reserved, unused since
biji's practical range for suburban day-hikes never reaches "barrier-free"
or "extreme technical" tiers): 低難度→1, 低-中難度→2, 中難度→3,
中-高難度→4, 高難度→5.

**Live closure re-check (POLICY.md §Deterministic-scrape workflow):**
WebFetched all 10 isports.sa.gov.tw PKNO pages live (not the bundle
snapshot) immediately before writing this batch. All 10 pages load
successfully, describe the expected mountain, and their 注意事項 sections
contain only seasonal/weather/footing advisories — no closure, storm-damage,
or construction notices on any of the ten. None rejected on this basis.

**Source-selection rule applied uniformly:** for each mountain, `checkpoints`
(and `mountainName`/`region`/`designations`) are sourced from the isports
official `climbWay` text (tier `official`); `distanceKm`, `durationMinutes`,
`difficulty`, and `elevationDifferenceM` (when available) are sourced from
one single biji trail chosen per the brief's tie-break rule — name containing
the peak name preferred, else shortest/most direct (tier `community`). No
numeric field mixes two different named routes' distance/duration figures.
`elevationGainM`, `startLat`/`startLng`, `evacuationPoints`, and
`permitNotes` are left `null`/`[]` on every record — no source (official or
community) published cumulative ascent, coordinates, evacuation points, or
permit requirements for any of the ten.

**輝哥的天空 (hiker) bundles:** read for all mountains where present
(003–007, 010, 012, 013; 008 and 009 have no hiker bundle). Used only as
corroborating context (e.g. confirming summit elevation, trailhead names) —
never for numeric fields, since hiker's own "難度X.X分" score has no stated
scale/denominator anywhere on the site (unlike biji's named 低/中/高 tiers),
so POLICY's "scale and mapping must be stated explicitly" bar is not met.
Note: `data/routes/raw/hiker/005.json` is a mismatched scrape — its
`matchedLinkText` and body text are about 小觀音山群峰 (a different,
unrelated Datun-range peak cluster near Yangmingshan, not 觀音山 in 八里),
so it was not used at all for mountain 005.

---

## 003 大武崙山 (基隆市中山區、安樂區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/003.json`
  (https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=3).
  `climbWay` names 情人湖 as a trailhead area and `intro`/`environment`
  name 大武崙砲台 as the route's midpoint landmark before the summit
  triangulation point. Checkpoints: 情人湖 → 大武崙砲台 → 大武崙山三角點.
- **Route facts (community):** biji trail id 404 "情人湖、大武崙砲台、
  大武崙山步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=404)
  — the only biji trail whose name explicitly covers all three named
  landmarks matching the official checkpoint chain. `distanceText: "3公里"`
  → `distanceKm: 3`. `durationText: "所需時間 1 小時"` → `durationMinutes:
  60` (single stated value, not a range). `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "119公尺"` →
  `elevationDifferenceM: 119`.
- **Closure check:** isports bundle `noticeItem` only advises against winter
  monsoon/plum-rain-season visits and summer sun exposure — no closure
  language. Live re-fetch of PKNO=3 today confirms the same, page loads,
  mountain matches, no closure/damage/construction notice found.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: no
  source publishes these — left null/[].

## 004 槓子寮山 (基隆市信義區、中正區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/004.json`
  (PKNO=4). `climbWay` route 2 names 海洋大學 as the 龍崗步道 trailhead;
  `intro`/`environment` name 槓子寮砲台 as the route's landmark en route to
  the summit. Checkpoints: 海洋大學(龍崗步道登山口) → 槓子寮砲台 →
  槓子寮山三角點.
- **Route facts (community):** biji trail id 402 "槓子寮砲台、槓子寮山
  步道(龍崗步道)" (https://hiking.biji.co/index.php?q=trail&act=detail&id=402)
  — the only biji trail for this mountain, and its name matches the official
  龍崗步道 route via 海洋大學 exactly. `distanceText: "3.5公里"` →
  `distanceKm: 3.5`. `durationText: "所需時間 2 小時"` → `durationMinutes:
  120`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "148公尺"` → `elevationDifferenceM: 148`.
- **Closure check:** isports `noticeItem` only warns of bees/snakes in
  summer/autumn and a damp, steep final approach — no closure language.
  Live re-fetch of PKNO=4 today: page loads, mountain matches, no closure
  notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 005 觀音山 (新北市八里區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/005.json`
  (PKNO=5). `climbWay` option 1: "由凌雲禪寺旁進入，走硬漢嶺步道登觀音山".
  Checkpoints: 凌雲禪寺 → 硬漢嶺(觀音山三角點).
- **Route facts (community):** biji mountain bundle 005, trail id 108
  "硬漢嶺步道(觀音山)" — the only biji trail whose name explicitly names
  both 硬漢嶺 and 觀音山, matching the official route exactly (name-match
  tie-break rule). This trail's own detail-page URL is `null` in the bundle
  (biji has not published a dedicated sub-page for this trail id), so the
  citing URL used is the mountain-level biji page
  (https://hiking.biji.co/index.php?q=mountain&act=famous-detail&category=2&id=104),
  which lists this trail's stats. `distanceText: "3.2公里"` →
  `distanceKm: 3.2`. `durationText: "所需時間 1 小時 20 分鐘"` →
  `durationMinutes: 80`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText` is `null` for this specific trail entry (unlike
  the bundle's other, different trails 82/83 which do have elevation data
  for their own different routes) — `elevationDifferenceM` left `null`
  rather than borrowing another trail's figure.
- **Closure check:** isports `noticeItem` is generic pre-hike stretching/
  hydration advice — no closure language. Live re-fetch of PKNO=5 today:
  page loads, mountain matches (觀音山, 616m, 八里區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].
- **Note on mismatched hiker bundle:** `data/routes/raw/hiker/005.json`'s
  `matchedLinkText` is "小觀音山群峰" and its body text describes an entirely
  different mountain cluster (Datun volcanic group near Yangmingshan,
  mentioning 七星山/#002 in the text) — not 觀音山 in 八里 (616m, #005). This
  is a scraper name-collision (both mountains share the "觀音山" substring).
  Not used for this record at all.

## 006 基隆山 (新北市瑞芳區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/006.json`
  (PKNO=6). `climbWay`/`trafficInfo` describe the 隔頂 trailhead (九份山城
  above) and a summit observation deck 觀濤坪. Checkpoints:
  基隆山登山口(隔頂) → 基隆山(觀濤坪).
- **Route facts (community):** biji trail id 399 "基隆山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=399) — the only
  biji trail named directly after this mountain (the second biji trail,
  id 600 "雷霆峰步道(基隆山東峰、黃金一稜)", is a different peak — 基隆山東峰
  — with a stated 中難度, not this record's summit). `distanceText:
  "2.4公里"` → `distanceKm: 2.4`. `durationText: "所需時間 1 小時 10 分鐘"`
  → `durationMinutes: 70`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "267公尺"` → `elevationDifferenceM: 267`.
- **Closure check:** isports `noticeItem` only describes the strong winter
  monsoon in the area — no closure language. Live re-fetch of PKNO=6 today:
  page loads, mountain matches (基隆山, 588m, 瑞芳區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 007 紅淡山 (基隆市仁愛區、信義區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/007.json`
  (PKNO=7). `climbWay` option 1 gives a full named waypoint chain: "北側
  劉銘傳路登山口：銘傳國中→幸福亭→好漢坡→紫薇亭→梅花亭→紅淡山". Checkpoints:
  銘傳國中 → 幸福亭 → 好漢坡 → 紫薇亭 → 梅花亭 → 紅淡山 (6 ordered points,
  all named in the official source text, no synthesis needed).
- **Route facts (community):** biji trail id 477 "紅淡山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=477) — the only
  biji trail named directly after this mountain (a second trail, id 892
  "猴雞縱走", is a 21.5km multi-mountain traverse, not this route).
  `distanceText: "3公里"` → `distanceKm: 3`. `durationText: "所需時間 1 小時
  55 分鐘"` → `durationMinutes: 115`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "180公尺"` →
  `elevationDifferenceM: 180`.
- **Closure check:** isports `noticeItem` only advises checking weather in
  winter monsoon season — no closure language. Live re-fetch of PKNO=7
  today: page loads, mountain matches (紅淡山, 210m), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 008 大崙頭山 (臺北市士林區、內湖區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/008.json`
  (PKNO=8). `climbWay` option 2: "中社區登山口：產業道路→大崙尾山→大崙頭山，
  約1小時登頂" — this matches the scope of the chosen biji trail below (a
  combined 大崙頭/大崙尾 traverse), unlike option 1's bare 10-minute直登
  dash from a different (碧山) trailhead. Checkpoints: 中社區登山口 →
  大崙尾山 → 大崙頭山.
- **Route facts (community):** biji trail id 35 "大崙頭尾山親山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=35) — the only
  biji trail for this mountain with full numeric data (the other two, ids
  943/1500, are 26.2km/15.7km long-distance traverses, clearly not this
  route). **Caveat, stated explicitly:** this trail's name and stats
  (5.4km, 2hr) describe a combined 大崙頭山＋大崙尾山 loop, not a route
  isolated to 大崙頭山's own summit alone — it was chosen per the brief's
  tie-break rule (name contains the peak name; it is also the shortest
  option available) since no biji trail exists that summits 大崙頭山 in
  isolation. `distanceText: "5.4公里"` → `distanceKm: 5.4`. `durationText:
  "所需時間 2 小時"` → `durationMinutes: 120`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "75公尺"` →
  `elevationDifferenceM: 75`.
- **Closure check:** isports `noticeItem` is generic trail-surface/hydration
  advice — no closure language. Live re-fetch of PKNO=8 today: page loads,
  mountain matches (大崙頭山, 478m), no closure notice.
- No hiker bundle exists for 008 (not scraped by that source).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 009 劍潭山 (臺北市中山區、士林區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/009.json`
  (PKNO=9). `climbWay` option 1: "中山北路四段公車劍潭站登山口→大忠宮→
  基石處，約30分鐘登頂". Checkpoints: 劍潭站登山口 → 大忠宮 → 基石處(劍潭山).
- **Route facts (community):** biji trail id 34 "劍潭山親山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=34) — the only
  biji trail named directly after this mountain (ids 943/1469/1500 are all
  long multi-peak traverses, not this route). `distanceText: "4.2公里"` →
  `distanceKm: 4.2`. `durationText: "所需時間 1 小時"` → `durationMinutes:
  60`. `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "180公尺"` → `elevationDifferenceM: 180`.
- **Closure check:** isports `noticeItem` only notes difficult parking near
  Jiantan Station at dusk — no closure language. Live re-fetch of PKNO=9
  today: page loads, mountain matches (劍潭山, 153m), no closure notice.
  (This mountain was previously checked in
  `.superpowers/sdd/task-8-single-jiantan-report.md` using a different
  official source — 臺北市政府工務局大地工程處's PDF trail table — which
  gave duration but no numeric difficulty; that rejection stands as
  historical record, but this batch uses the isports+biji tiered-source
  combination instead, which supplies the missing difficulty via biji.)
- No hiker bundle exists for 009 (not scraped by that source).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 010 五分山 (新北市瑞芳區、平溪區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/010.json`
  (PKNO=10). `climbWay` option 2: "新平溪煤礦博物園區→嶺頭福德宮→五分山
  西峰瞭望亭→五分山，約2小時登頂" — matches the scope of the chosen biji
  trail (the longer scenic route, not the 10-minute drive-up-to-radar-
  station shortcut in option 1). Checkpoints: 新平溪煤礦博物園區 →
  嶺頭福德宮 → 五分山西峰瞭望亭 → 五分山.
- **Route facts (community):** biji trail id 115 "五分山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=115) — the only
  biji trail named directly after this mountain (id 929 "五四縱走" is a
  20.1km traverse to 四分尾山, not this route). `distanceText: "6.8公里"` →
  `distanceKm: 6.8`. `durationText: "所需時間 3 小時 40 分鐘"` →
  `durationMinutes: 220`. `difficultyText: "低-中難度"` → `difficulty: 2`
  (per the stated mapping above). `elevationDifferenceText: "520公尺"` →
  `elevationDifferenceM: 520`.
- **Closure check:** isports `noticeItem` only gives seasonal
  sun-protection/wind advice — no closure language. Live re-fetch of
  PKNO=10 today: page loads, mountain matches (五分山, 757m), no closure
  notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 012 大尖山 (新北市汐止區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/012.json`
  (PKNO=12). `climbWay`: "天秀宮(新台五路轉勤進路至天秀宮) →大尖山，約30分鐘
  登頂". Checkpoints: 天秀宮 → 大尖山.
- **Route facts (community):** biji trail id 139 "大尖山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=139) — the only
  biji trail named directly after this mountain (ids 929/961/1030/1501 are
  all longer multi-peak traverses). `distanceText: "2.6公里"` →
  `distanceKm: 2.6`. `durationText: "所需時間 45 分鐘"` → `durationMinutes:
  45`. `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "260公尺"` → `elevationDifferenceM: 260`.
- **Closure check:** isports `noticeItem` only notes crowding at 天秀宮 on
  weekends/dusk and suggests alternate quieter approaches — not a closure.
  Live re-fetch of PKNO=12 today: page loads, mountain matches (大尖山,
  460m, 汐止區), no closure notice.
- **Corroboration:** hiker bundle 012 (covers 姜子寮山＆大尖山) independently
  states 大尖山's elevation as "H459m" (matches isports's 460m within normal
  rounding) and describes the same 天道清修院/天秀宮 approach reaching the
  涼亭/三角點 summit in ~13 minutes — consistent with, though not used
  numerically in place of, the biji trail's stats.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 013 南港山 (臺北市信義區、南港區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/013.json`
  (PKNO=13). `climbWay` option 1: "虎山忠義山登山口→經虎山步道接四獸山步道→
  九五峰→南港山，約1小時登頂". Checkpoints: 虎山忠義山登山口 → 九五峰 →
  南港山 (the intermediate "經虎山步道接四獸山步道" clause names trail
  systems, not waypoints, so it is omitted from the ordered checkpoint list).
- **Route facts (community):** biji trail id 78 "南港山縱走親山步道(拇指山、
  南港山、象山、九五峰)" (https://hiking.biji.co/index.php?q=trail&act=detail&id=78)
  — chosen over the only alternative (id 1470, an 11km/5.5hr Taipei Grand
  Traverse segment) as the shorter, more direct option per the brief's
  tie-break rule, and its name explicitly includes 南港山. **Caveat, stated
  explicitly:** like 008 above, this trail's stats (6.3km, 3hr) describe a
  4-peak traverse (拇指山、南港山、象山、九五峰), not a route isolated to
  南港山's own trig point alone — no biji trail exists that summits 南港山
  in isolation from its neighboring peaks. `distanceText: "6.3公里"` →
  `distanceKm: 6.3`. `durationText: "所需時間 3 小時"` → `durationMinutes:
  180`. `difficultyText: "低-中難度"` → `difficulty: 2`. `elevationDifferenceText:
  "348公尺"` → `elevationDifferenceM: 348`.
- **Closure check:** isports `noticeItem` only warns of many trailheads/
  route options requiring attention to signage, and that 拇指山 is bare rock
  requiring care — not a closure. Live re-fetch of PKNO=13 today: page
  loads, mountain matches (南港山, 375m), no closure notice.
- **Corroboration:** hiker bundle 013 (covers 大崙頭山/土庫岳/南港山/獅仔頭山)
  independently states 南港山's elevation as 374m (matches isports's 375m
  within normal rounding) and its own triangulation point number (#695).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value.
Where a source gave a range (none did in this batch — all ten biji
`durationText` values were single stated figures, not ranges), the
conservative-upper-bound rule would apply; it was not needed here. No value
was averaged, interpolated, or derived from distance/pace.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 64
Small hundred peaks: 22
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 12 (pre-batch baseline, confirmed in
`task-8-small100-east-h-report.md`) to 22 (+10, matching all ten additions
in this batch). `Catalog valid`, `Missing sources: 0`, `Duplicate slugs: 0`.
Remaining warnings (suburban-route count, missing designations 014+) are
pre-existing and outside this batch's scope.

## Files changed

- `data/routes/catalog.json`: 10 new records appended (dawulun-mountain-trail,
  gangziliao-mountain-trail, guanyin-mountain-trail, jilong-mountain-trail,
  hongdan-mountain-trail, daluntou-mountain-trail, jiantan-mountain-trail,
  wufen-mountain-trail, dajian-mountain-xizhi-trail, nangang-mountain-trail),
  each with designations `taiwan_small_hundred_peak:003/004/005/006/007/
  008/009/010/012/013`.
- `data/routes/sources.json`: 20 new `(organization, url)` entries — 10
  教育部體育署 isports PKNO pages + 10 健行筆記 trail/mountain pages.
- `.superpowers/sdd/task-8-tiered-batch-1-report.md`: this report (new file).
