# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 2 (Taipei basin/Taoyuan-Hsinchu cluster)

Reviewed: 2026-07-18
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: 10 mountains (014, 015, 016, 017, 018, 019, 020, 021, 022, 023), per
the parent task message. This is a from-scratch re-run of the batch (the
prior attempt on the same scope failed mid-session with no commits or
changes left behind).

**Result: 10 added, 0 rejected.**

**Overlap check:** grepped `data/routes/catalog.json` (all records, including
nested `checkpoints[].name`/`evacuationPoints[].name`) and
`data/routes/hundred-peaks.json`/`small-hundred-peaks.json` for all ten
mountain names. One partial hit: "大棟山" appears in an existing record
(`guanziling-dadongshan-trail`, small hundred peak #063) as an intermediate
checkpoint name — but that record is a **different, unrelated 大棟山** in
嘉義縣/臺南市 (PKNO=62 on isports), not this batch's #015 大棟山 in
新北市樹林區/桃園市龜山區 (PKNO=15). Confirmed no genuine overlap for any of
the ten; all ten are new records.

**Difficulty mapping used (per POLICY.md §Difficulty mapping, same as batch
1):** 低難度→1, 低-中難度→2, 中難度→3, 中-高難度→4, 高難度→5.

**Live closure re-check (POLICY.md §Deterministic-scrape workflow):**
WebFetched all 10 isports.sa.gov.tw PKNO pages live (not the bundle
snapshot) immediately before writing this batch. All 10 pages load
successfully, describe the expected mountain, and their 注意事項 sections
contain only navigation/terrain/weather advisories — no closure,
storm-damage, or construction notices on any of the ten. None rejected on
this basis.

**Source-selection rule applied uniformly:** for each mountain, `checkpoints`
(and `mountainName`/`region`/`designations`) are sourced verbatim from the
isports official `climbWay` text (tier `official`), stripping only
navigation instructions/distance annotations that are not themselves place
names (e.g. "／1.3K", "(取右往金面山)", "經"). `routeName`, `distanceKm`,
`durationMinutes`, `difficulty`, and `elevationDifferenceM` (when available)
are sourced from one single biji trail chosen per the tie-break rule — name
containing the peak name preferred, else the trail whose scope matches the
official climbWay route most closely (tier `community`). No numeric field
mixes two different named community routes' figures, and no numeric field
mixes community data with the official source's own duration figures even
when isports states one (matches batch 1's approach of always taking
distance/duration/difficulty from a single cited community trail once one is
used, to avoid inconsistent partial-route scope).

**輝哥的天空 (hiker) bundles:** present for 015, 017, 018, 020, 022, 023;
absent for 014, 016, 019, 021. Used only as corroborating context (elevation,
triangulation-point numbers, landmark names) — never for numeric route-fact
fields, since hiker's own "難度X.X分" score has no stated scale/denominator
anywhere on the site (same reasoning as batch 1).

**Mismatched hiker bundle found:** `data/routes/raw/hiker/022.json`'s
`matchedLinkText` is "南東眼山" and its body text describes 三眼縱走
(北/中央/南東眼山), an unrelated mountain cluster in 南投縣埔里鎮 — a
different, unrelated peak group from this batch's #022 東眼山 (三峽/復興,
1212m). This is a scraper name-collision (both share the "東眼山" substring),
identical in kind to batch 1's 005/hiker mismatch. Not used at all for
mountain 022's record.

---

## 014 土庫丘 (臺北市南港區、新北市深坑區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/014.json`
  (PKNO=14). `climbWay` option 2: "舊莊街二段122巷登山口→產業道路→南深路91巷
  底→椿萱農場→土庫岳，約1.5小時登頂" (chosen over option 1's 30-minute
  望高寮土雞城 route as it matches the scope/duration of the selected biji
  trail below far more closely; "產業道路" is a road-type descriptor, not a
  waypoint, so omitted). Checkpoints: 舊莊街二段122巷登山口 → 南深路91巷底 →
  椿萱農場 → 土庫岳. Note: the official designation name in
  `small-hundred-peaks.json` is "土庫丘", but the isports/biji body text
  consistently calls the peak "土庫岳" — `mountainName` is set to "土庫丘" to
  match the designation record; checkpoint/route text preserves the sources'
  own "土庫岳" wording verbatim.
- **Route facts (community):** biji trail id 81 "更寮古道(土庫岳)"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=81) — the only
  usable biji trail (the other, id 1501, is a 27.9km multi-mountain
  skyline-trail segment). Its name contains the peak name ("土庫岳"),
  satisfying the tie-break rule. `distanceText: "3公里"` → `distanceKm: 3`.
  `durationText: "所需時間 1 小時 50 分鐘"` → `durationMinutes: 110`.
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "344公尺"` → `elevationDifferenceM: 344`.
- **Closure check:** isports `noticeItem` only warns of many intersecting
  trails/branch paths — no closure language. Live re-fetch of PKNO=14 today:
  page loads, mountain matches, no closure notice.
- No hiker bundle exists for 014.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: no
  source publishes these — left null/[].

## 015 大棟山 (新北市樹林區、桃園市龜山區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/015.json`
  (PKNO=15). `climbWay` option 2: "樹林火車站→大安路312巷登山口→樹林山→
  大同山→青龍嶺→大棟山，約2~2.5小時登頂" (chosen over option 1's bare
  "德和街17巷沿產業道路直達山頂" paved drive-up, since option 2's named
  waypoint chain matches the selected biji trail's named landmarks).
  Checkpoints: 樹林火車站 → 大安路312巷登山口 → 樹林山 → 大同山 → 青龍嶺 →
  大棟山 (6 ordered points).
- **Route facts (community):** biji trail id 212 "樹林大棟山、青龍嶺、大同山
  步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=212) — name
  contains the peak name and explicitly names the same waypoints (青龍嶺,
  大同山) as the chosen official route (the other named trail with a URL,
  id 1498, is a 29.7km skyline-trail segment; ids 2073/2170 have no url and
  were not used). `distanceText: "9.5公里"` → `distanceKm: 9.5`.
  `durationText: "所需時間 4 小時"` → `durationMinutes: 240` (single stated
  value from biji, used per the batch-1 pattern of not mixing isports's own
  "2~2.5小時" partial-route estimate with the community trail's full-loop
  figure). `difficultyText: "低-中難度"` → `difficulty: 2`.
  `elevationDifferenceText: "380公尺"` → `elevationDifferenceM: 380`.
- **Closure check:** isports `noticeItem` only warns of unclear trail
  markers near 青龍嶺/山佳車站 — no closure language. Live re-fetch of
  PKNO=15 today: page loads, mountain matches (大棟山, 405m, 樹林區/龜山區),
  no closure notice.
- **Corroboration:** hiker bundle 015 independently confirms elevation 405m,
  一等三角點, and describes the same 南寮福德宮→大同山→青龍嶺→大棟山 route
  (their own "難度1.2分" not used — no stated scale). Not used numerically.
- **Note on same-named different mountain:** an unrelated 大棟山 in
  嘉義縣/臺南市 (PKNO=62, small hundred peak #063) is already in the catalog
  as `guanziling-dadongshan-trail`; this batch's record
  (`dadong-mountain-shulin-trail`, slug disambiguated with "-shulin-") is a
  distinct mountain, confirmed via county/location text.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 016 南勢角山 (新北市新店區、中和區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/016.json`
  (PKNO=16). `climbWay`: "福德宮停車場→福德宮→南勢角山三角點，約30分鐘登頂"
  (single named-waypoint chain, used verbatim). Checkpoints: 福德宮停車場 →
  福德宮 → 南勢角山三角點.
- **Route facts (community):** biji trail id 105 "烘爐地登山步道(南勢角山)"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=105) — the most
  direct biji trail, name contains the peak name and matches the isports
  route's 烘爐地/福德宮 area (the other named trails — 圓通寺線 9.5km/4hr,
  南勢角山、文筆山步道, 中和登山觀光步道, 環台北天際線 — are all longer
  traverses to other destinations, not this direct summit route).
  `distanceText: "4公里"` → `distanceKm: 4`. `durationText: "所需時間 2
  小時"` → `durationMinutes: 120`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "255公尺"` →
  `elevationDifferenceM: 255`.
- **Closure check:** isports `noticeItem` only warns the trail surface is
  muddy/slippery after rain — no closure language. Live re-fetch of PKNO=16
  today: page loads, mountain matches (南勢角山/烘爐地山, 302m), no closure
  notice.
- No hiker bundle exists for 016.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 017 二格山 (臺北市文山區、新北市石碇區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/017.json`
  (PKNO=17). `climbWay`: "北宜公路栳寮站／1.3K→第一登山口／0.3K→第二登山口／
  0.6K→第三登山口／0.45K→二格山，第三登山口上登約10分鐘登頂" (segment
  distances after "／" stripped as annotations, not place names).
  Checkpoints: 北宜公路栳寮站 → 第一登山口 → 第二登山口 → 第三登山口 →
  二格山 (5 ordered points).
- **Route facts (community):** biji trail id 1927 "二格山登山步道(栳寮線)" —
  chosen over trail id 135 "二格山登山步道(草湳線)" (a different trailhead,
  草湳, not matching the official route) because its name explicitly names
  "栳寮線", matching the isports route's 栳寮站 starting point exactly (trail
  id 960, 環台北天際線第一段, an 18.3km traverse, was also not used). Trail
  1927's own detail-page `url` is `null` in the bundle, so — following the
  batch-1 precedent for mountain 005 — the citing URL used is the
  mountain-level biji page
  (https://hiking.biji.co/index.php?q=mountain&act=famous-detail&category=2&id=116).
  `distanceText: "5.3公里"` → `distanceKm: 5.3`. `durationText: "所需時間 1
  小時 30 分鐘"` → `durationMinutes: 90`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText` is `null` for this trail entry
  — `elevationDifferenceM` left `null` rather than borrowing trail 135's
  different figure (296公尺).
- **Closure check:** isports `noticeItem` only recommends GPS due to
  multiple trailheads and steep ridge terrain — no closure language. Live
  re-fetch of PKNO=17 today: page loads, mountain matches (二格山, 678m),
  no closure notice.
- **Corroboration:** hiker bundle 017 (a multi-day 筆架連峰/二格山/皇帝殿
  trip) independently confirms elevation 678m, 三等三角點編號3-701, and
  "登頂前有220階的石板階，三角點位於山頂涼亭左側圍牆內" — consistent context,
  not used numerically (no stated difficulty scale).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 018 天上山 (新北市土城區、三峽區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/018.json`
  (PKNO=18). `climbWay`: "承天路桐花公園→天上山，約30分鐘登頂" (used
  verbatim). Checkpoints: 承天路桐花公園 → 天上山.
- **Route facts (community):** biji trail id 104 "天上山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=104) — the only
  direct-summit biji trail with a name matching the peak (the alternatives —
  id 970 環台北天際線第十段 23km traverse; ids 1122/2076 with no url — were
  not used). `distanceText: "5.6公里"` → `distanceKm: 5.6`. `durationText:
  "所需時間 2 小時 10 分鐘"` → `durationMinutes: 130`. `difficultyText:
  "低難度"` → `difficulty: 1`. `elevationDifferenceText: "379公尺"` →
  `elevationDifferenceM: 379`.
- **Closure check:** isports `noticeItem` only advises careful direction-
  finding due to many trail options — no closure language. Live re-fetch of
  PKNO=18 today: page loads, mountain matches (天上山/內坡山, 430m), no
  closure notice.
- **Corroboration:** hiker bundle 018 (a combined "金面山及天上山" article)
  independently confirms elevation 432m (close to isports's 430m) and
  describes a 承天禪寺→桐花公園→甘露公園→天上山→望月亭 route through the same
  area; also separately corroborates mountain 021's data (see below). Not
  used numerically (no stated difficulty scale).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 019 鳶山 (新北市三峽區、鶯歌區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/019.json`
  (PKNO=19). `climbWay`: "光復紀念鐘→鳶山，約10分鐘登頂" (used verbatim).
  Checkpoints: 光復紀念鐘 → 鳶山.
- **Route facts (community):** biji trail id 89 "鳶山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=89) — the generic,
  most direct named trail for this mountain, chosen over trail id 1704
  "鳶山彩壁、福德坑山步道" (a side route to a different sub-feature/peak,
  4km/2hr) and id 2075 微笑山線 (no url). `distanceText: "8公里"` →
  `distanceKm: 8`. `durationText: "所需時間 3 小時"` → `durationMinutes:
  180`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "270公尺"` → `elevationDifferenceM: 270`.
- **Closure check:** isports `noticeItem` only warns of exposure risk on the
  bare summit rock (photography/night shots) — no closure language. Live
  re-fetch of PKNO=19 today: page loads, mountain matches (鳶山, 321m), no
  closure notice.
- No hiker bundle exists for 019.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 020 獅仔頭山 (新北市新店區、三峽區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/020.json`
  (PKNO=20). `climbWay` gives a full 11-point named waypoint chain: "獅頭
  登山口→觀獅坪→崖梯→大樟樹→最高點→叉路口／取左→金毛杜鵑林→防蕃古碑→石寮
  (隘寮)遺址→古井→戰壕遺址→獅仔頭山一等三角點" ("叉路口／取左" is a
  navigation instruction, not a place name, so omitted). Checkpoints: 獅頭
  登山口 → 觀獅坪 → 崖梯 → 大樟樹 → 最高點 → 金毛杜鵑林 → 防蕃古碑 → 石寮
  (隘寮)遺址 → 古井 → 戰壕遺址 → 獅仔頭山一等三角點 (11 ordered points, all
  named in the official source text).
- **Route facts (community):** biji trail id 185 "獅仔頭山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=185) — the only
  biji trail for this mountain, name matches directly. `distanceText: "5.5
  公里"` → `distanceKm: 5.5`. `durationText: "所需時間 2 小時 30 分鐘"` →
  `durationMinutes: 150` (isports's own "約35~40分鐘登頂" figure describes
  only the final approach segment near the summit per the source text
  structure and is not mixed in, per the batch-1 pattern of using a single
  community trail's full-route figure). `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "238公尺"` →
  `elevationDifferenceM: 238`.
- **Closure check:** isports `noticeItem` only describes the trail network
  between 獅頭/獅尾 as complex but interconnected — no closure language.
  Live re-fetch of PKNO=20 today: page loads, mountain matches (獅仔頭山,
  858m), no closure notice.
- **Corroboration:** hiker bundle 020 (covers 大崙頭山/土庫岳/南港山/
  獅仔頭山) independently confirms elevation 858m, 一等三角點, and "登山口有
  二：一為獅頭一為獅尾...途中經三處垂宜懸梯，要小心通過" — consistent with
  the official route's ladder/climb sections. Not used numerically.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 021 金面山 (桃園市大溪區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/021.json`
  (PKNO=21). `climbWay`: "阮家山莊土雞城第三登山口→竹林→上稜(取右往金面山)→
  攀岩稜→岔路取左往金面山→金面山" (parenthetical/appended navigation
  instructions "(取右往金面山)" and "岔路取左往" stripped, keeping the named
  terrain features). Checkpoints: 阮家山莊土雞城第三登山口 → 竹林 → 上稜 →
  攀岩稜 → 金面山 (5 ordered points).
- **Route facts (community):** biji trail id 783 "桃園金面山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=783) — the only
  biji trail for this mountain, name matches directly. `distanceText: "5.8
  公里"` → `distanceKm: 5.8`. `durationText: "所需時間 4 小時 30 分鐘"` →
  `durationMinutes: 270`. `difficultyText: "低-中難度"` → `difficulty: 2`.
  `elevationDifferenceText: "402公尺"` → `elevationDifferenceM: 402`.
- **Closure check:** isports `noticeItem` only warns of steep, muddy,
  slippery terrain in the raw forest/bamboo sections — no closure language.
  Live re-fetch of PKNO=21 today: page loads, mountain matches (金面山/鳥嘴
  山, 667m), no closure notice.
- **Corroboration:** no dedicated hiker bundle exists for 021, but the
  combined "金面山及天上山" hiker article stored at
  `data/routes/raw/hiker/018.json` covers this mountain too, independently
  confirming elevation 667m, 二等三角點編號1056, and describing the same
  攀岩、繩索、樹根攀爬 exposed-ridge terrain matching isports's 攀岩稜
  waypoint — consistent context, not used numerically.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 022 東眼山 (新北市三峽區、桃園市復興區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/022.json`
  (PKNO=22). `climbWay` option 1: "東眼山遊客中心→木炭窯→東眼山三角點，約1
  小時登頂" (chosen over option 2's 志繼山→東眼山森林步道 route, which
  matches a much longer 18.1km O-loop traverse to 拉卡山 in biji rather than
  a direct summit route). Checkpoints: 東眼山遊客中心 → 木炭窯 → 東眼山
  三角點.
- **Route facts (community):** biji trail id 228 "東眼山自導式步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=228) — a
  self-guided interpretive trail starting from the visitor center, matching
  option 1's scope and named landmarks exactly (the alternative, id 1166
  "志繼山、東眼山、拉卡山O型", is an 18.1km/7.5hr multi-peak loop, not this
  direct route). `distanceText: "3.5公里"` → `distanceKm: 3.5`.
  `durationText: "所需時間 2 小時"` → `durationMinutes: 120`.
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "292公尺"` → `elevationDifferenceM: 292`.
- **Closure check:** isports `noticeItem` only advises confirming direction
  due to many trail junctions (boardwalk trail) — no closure language. Live
  re-fetch of PKNO=22 today: page loads, mountain matches (東眼山, 1212m),
  no closure notice.
- **Mismatched hiker bundle, not used:** see note at top of report — 
  `data/routes/raw/hiker/022.json` describes an unrelated 南投縣埔里鎮
  三眼縱走 (北/中央/南東眼山), not this mountain.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

## 023 溪洲山 (桃園市大溪區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/023.json`
  (PKNO=23). `climbWay` option 1: "溪洲山福山巖登山口→經時鐘尾→溪洲山，約1.5
  小時登頂" (chosen because its name matches the selected biji trail exactly;
  "經" ["via"] stripped, keeping the place name 時鐘尾). Checkpoints: 溪洲山
  福山巖登山口 → 時鐘尾 → 溪洲山.
- **Route facts (community):** biji trail id 598 "溪洲山步道(福山巖登山
  步道)" (https://hiking.biji.co/index.php?q=trail&act=detail&id=598) — the
  only biji trail for this mountain, name explicitly matches option 1's
  福山巖登山步道. `distanceText: "7.9公里"` → `distanceKm: 7.9`.
  `durationText: "所需時間 3 小時 10 分鐘"` → `durationMinutes: 190`.
  `difficultyText: "低-中難度"` → `difficulty: 2`. `elevationDifferenceText:
  "432公尺"` → `elevationDifferenceM: 432`.
- **Closure check:** isports `noticeItem` only warns of many trailheads/
  junctions on dirt-path terrain — no closure language. Live re-fetch of
  PKNO=23 today: page loads, mountain matches (溪洲山, 577m), no closure
  notice.
- **Corroboration:** hiker bundle 023 independently confirms elevation 578m
  (close to isports's 577m) and 三等三角點編號6296, and describes the
  *alternate* official route (option 2, from 坪林收費站/溪洲公園 through
  運動休閒廣場、微風廣場、竹林四叉路口、"520我愛妳"看台、大高壓電塔、殖產局
  三角補點 to 溪洲山) — consistent with option 2's named waypoints, though
  this record uses option 1 to match the cited biji trail's own named route.
  Not used numerically.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`: null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value. Where
a source gave only a duration range (isports's own climbWay text in a few
cases, e.g. 015's "2~2.5小時" or 022's "1.5-2小時"), that range was not used
at all — those fields were sourced instead from the single cited community
trail's own single stated duration figure, per the batch-1 pattern of never
mixing official and community numeric figures for the same field. No value
was averaged, interpolated, or derived from distance/pace.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 74
Small hundred peaks: 32
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 22 (pre-batch baseline, confirmed via
batch 1's report) to 32 (+10, matching all ten additions in this batch).
`Catalog valid`, `Missing sources: 0`, `Duplicate slugs: 0`. Remaining
warnings (suburban-route count, missing designations 024+) are pre-existing
and outside this batch's scope.

## Files changed

- `data/routes/catalog.json`: 10 new records appended (tuku-hill-trail,
  dadong-mountain-shulin-trail, nanshijiao-mountain-trail,
  erge-mountain-trail, tianshang-mountain-trail, yuan-mountain-trail,
  shizitou-mountain-trail, jinmian-mountain-trail, dongyan-mountain-trail,
  xizhou-mountain-trail), each with designations `taiwan_small_hundred_peak:
  014/015/016/017/018/019/020/021/022/023`.
- `data/routes/sources.json`: 19 new `(organization, url)` entries — 9
  教育部體育署 isports PKNO pages (PKNO=22 was already registered from a
  prior batch) + 10 健行筆記 trail/mountain pages.
- `.superpowers/sdd/task-8-tiered-batch-2-report.md`: this report (new file).
