# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 3 (Taoyuan-Hsinchu-Miaoli cluster)

Reviewed: 2026-07-18
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: 10 mountains (024, 025, 026, 027, 028, 029, 031, 032, 033, 034), per
the parent task message.

**Result: 10 added, 0 rejected.**

**Overlap check:** grepped `data/routes/catalog.json` (all records, including
nested `checkpoints[].name` fields) and `data/routes/hundred-peaks.json` for
all ten mountain names. One partial hit: "石門山" already exists in the
catalog as `shimen-mountain-hehuan` — but that is an unrelated ~3200m peak
near 合歡山 in 南投縣仁愛鄉 (part of the main hundred-peak 百岳 list, `kind:
"hundred_peak"`, `designations: []`), completely different from this batch's
#024 石門山, a 551m suburban hill in 桃園市龍潭區. Confirmed distinct via
elevation, region, and source (太魯閣國家公園 vs 教育部體育署). New record's
slug disambiguated as `shimen-mountain-longtan-trail`. "仙山" also had one
substring hit ("新仙山", an unrelated Yushan-system checkpoint name) — not a
real collision. All ten mountains in this batch are genuinely new records.

**Difficulty mapping used (per POLICY.md §Difficulty mapping, same as batch
1/2):** 低難度→1, 低-中難度→2, 中難度→3, 中-高難度→4, 高難度→5.

**Live closure re-check (POLICY.md §Deterministic-scrape workflow):**
WebFetched all 10 isports.sa.gov.tw PKNO pages live (not the bundle
snapshot) immediately before writing this batch. All 10 pages load
successfully, describe the expected mountain, and their 注意事項 sections
contain only navigation/terrain/weather/parking advisories — no closure,
storm-damage, or construction notices on any of the ten. None rejected on
this basis.

**Source-selection rule applied (same as batch 1/2):** `checkpoints` (and
`mountainName`/`region`/`designations`) are sourced verbatim from the
isports official `climbWay` text, stripping only navigation
instructions/segment-distance annotations that are not themselves place
names. Where a biji bundle exists, `routeName`, `distanceKm`,
`durationMinutes`, `difficulty`, and `elevationDifferenceM` are sourced from
one single biji trail chosen per the tie-break rule (name containing the
peak name preferred, most direct/matching-scope trail over multi-peak
traverses). No numeric field mixes two different named community routes, and
no numeric field mixes community data with official data for the same
field — **except** for the two mountains with no biji bundle at all (027,
028), where `durationMinutes` is sourced directly from isports's own single
stated climbWay time (single-source use, not a mix, since no community
figure exists to conflict with).

**輝哥的天空 (hiker) bundles:** present for 024, 029, 031, 032, 033, 034;
absent for 025, 026, 027, 028. Used only as corroborating context (elevation,
triangulation-point numbers, route landmarks) — never for numeric route-fact
fields, since hiker's own "難度X.X分" score has no stated scale/denominator
anywhere on the site (same reasoning as prior batches).

**Mismatched hiker bundle found:** `data/routes/raw/hiker/033.json`'s
`matchedLinkText` is "八仙山" and its body text describes an entirely
different, unrelated mountain — 八仙山 (2366m) in 台中縣谷關, part of the
谷關七雄 group — a scraper name-collision on the substring "仙山" (this
batch's #033 is 仙山, 967m, 苗栗縣獅潭鄉). Identical in kind to batch 1's
005/hiker and batch 2's 022/hiker mismatches. Not used at all for mountain
033's record.

---

## 024 石門山 (桃園市龍潭區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/024.json`
  (PKNO=24). `climbWay` option 1: "勞工育樂中心→觀音聖像→龍穴崗→景陽崗→
  石門山，約1小時登頂" (chosen over option 2's bare 5–10 minute direct
  south-trailhead route, since option 1's named waypoint chain gives
  meaningful safety checkpoints). Checkpoints: 勞工育樂中心 → 觀音聖像 →
  龍穴崗 → 景陽崗 → 石門山.
- **Route facts (community):** biji trail id 232 "桃園石門山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=232) — name
  contains the peak name and is the direct summit trail (the alternative,
  id 1804 "雙石縱走(石門山至石牛山)", is a 13.8km/9.5hr traverse combining
  this batch's #024 and #025, not used). `distanceText: "2公里"` →
  `distanceKm: 2`. `durationText: "所需時間 2 小時"` → `durationMinutes:
  120`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "226公尺"` → `elevationDifferenceM: 226`
  (consistent with the elevation range 325~551公尺).
- **Closure check:** isports `noticeItem` only warns the trail network is
  complex and dirt-surfaced — no closure language. Live re-fetch of PKNO=24
  today: page loads, mountain matches (石門山/小竹坑山, 551m, 桃園市龍潭區),
  no closure notice.
- **Corroboration:** hiker bundle 024 independently confirms elevation 551m,
  一等三角點, and describes the same 勞工育樂中心/北端登山口 area route. Not
  used numerically (no stated difficulty scale).
- **Disambiguation note:** an unrelated, much larger 石門山 (~3200m, 南投縣
  仁愛鄉, part of the 合歡群峰) already exists in the catalog as
  `shimen-mountain-hehuan`; this batch's record uses slug
  `shimen-mountain-longtan-trail` to avoid confusion.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 025 石牛山 (新竹縣關西鎮、桃園市復興區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/025.json`
  (PKNO=25). `climbWay` option 1: "石福宮登山口(右上)→戴宅→岩洞→石牛山，約
  1.5-2小時登頂" (chosen over option 2's shorter 錦山72號呂宅 route because
  option 1's "岩洞" waypoint matches the selected biji trail's own
  `surfaceText` mention of 岩壁/溪床 terrain). Checkpoints: 石福宮登山口 →
  戴宅 → 岩洞 → 石牛山.
- **Route facts (community):** biji trail id 580 "石牛山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=580) — the direct,
  dedicated trail for this mountain (the alternative, id 1804 "雙石縱走
  (石門山至石牛山)", is the same 13.8km cross-mountain traverse noted above,
  not used). `distanceText: "4公里"` → `distanceKm: 4`. `durationText:
  "所需時間 2 小時 30 分鐘"` → `durationMinutes: 150`. `difficultyText:
  "低-中難度"` → `difficulty: 2`. `elevationDifferenceText: "390公尺"` →
  `elevationDifferenceM: 390`.
- **Closure check:** isports `noticeItem` only warns of a rope-assisted rock
  scramble section in the creek valley — no closure language. Live re-fetch
  of PKNO=25 today: page loads, mountain matches (石牛山, 671m, 新竹縣關西鎮
  /桃園市復興區), no closure notice.
- No hiker bundle exists for 025.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 026 十八尖山 (新竹市) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/026.json`
  (PKNO=26). `climbWay` option 1: "東入口(博愛街5巷)→幸福亭→介壽亭→國父
  百年誕辰紀念亭→十八尖山主峰，約15分鐘登頂" (chosen over option 2's shorter
  寶山路145巷 route for its richer named-waypoint chain). Checkpoints: 東入口
  (博愛街5巷) → 幸福亭 → 介壽亭 → 國父百年誕辰紀念亭 → 十八尖山主峰.
- **Route facts (community):** biji trail id 234 "十八尖山步道" — the only
  biji trail for this mountain
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=234).
  `distanceText: "3.7公里"` → `distanceKm: 3.7`. `durationText: "所需時間 1
  小時 30 分鐘"` → `durationMinutes: 90`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "79公尺"` →
  `elevationDifferenceM: 79` (consistent with elevation range 50~129公尺).
- **Closure check:** isports `noticeItem` only warns of poor parking and
  recommends public transit — no closure language. Live re-fetch of PKNO=26
  today: page loads, mountain matches (十八尖山, 132m, 新竹市), no closure
  notice.
- No hiker bundle exists for 026.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 027 飛鳳山 (新竹縣芎林鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/027.json`
  (PKNO=27). `climbWay` (single option): "第一停車場→石壁潭山→觀日亭→飛鳳山
  基石，約1.5~2小時登頂". Checkpoints: 第一停車場 → 石壁潭山 → 觀日亭 →
  飛鳳山基石.
- **Route facts:** no biji or hiker bundle exists for this mountain.
  `durationMinutes` sourced from isports's own climbWay range "1.5~2小時" →
  conservative upper bound `120` (POLICY.md §Range values applies to any
  source tier, not just community). `distanceKm` and `difficulty`: no source
  publishes an exact value — left `null` per POLICY.md §Nullable route-fact
  fields (no estimation). `routeName` set to the generic label "飛鳳山步道"
  (official tier, matching this catalog's established convention for
  official-only records with no separately-named community trail, e.g.
  existing `dongmao-mountain-trail`/`tangmadan-mountain-trail` records).
- **Closure check:** isports `noticeItem` only warns of exposed roots/rocks
  and recommends slow descents — no closure language. Live re-fetch of
  PKNO=27 today: page loads, mountain matches (飛鳳山, 462m, 新竹縣芎林鄉),
  no closure notice.
- No hiker or biji bundle exists for 027.
- `elevationGainM`, `elevationDifferenceM`, `startLat/Lng`,
  `evacuationPoints`, `permitNotes`: null/[].

## 028 李棟山 (新竹縣尖石鄉、桃園市復興區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/028.json`
  (PKNO=28). `climbWay` (single option, exact value not a range): "李棟山莊→
  李棟山古堡，約80分鐘登頂". Checkpoints: 李棟山莊 → 李棟山古堡.
- **Route facts:** no biji or hiker bundle exists for this mountain.
  `durationMinutes: 80` sourced directly from isports's single stated value
  (not a range, so no upper-bound rule needed). `distanceKm` and
  `difficulty`: no source publishes an exact value — left `null`.
  `routeName` set to the generic label "李棟山步道" (official tier, same
  convention as 027).
- **Closure check:** isports `noticeItem` only warns of loose gravel and
  afternoon fog reducing visibility — no closure language. Live re-fetch of
  PKNO=28 today: page loads, mountain matches (李棟山/李崠山, 1914m, 新竹縣
  尖石鄉/桃園市復興區), no closure notice.
- No hiker or biji bundle exists for 028.
- `elevationGainM`, `elevationDifferenceM`, `startLat/Lng`,
  `evacuationPoints`, `permitNotes`: null/[].

## 029 獅頭山 (苗栗縣三灣鄉、南庄鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/029.json`
  (PKNO=29). `climbWay` option 1: "獅頭山停車場→道德門→觀日亭→獅山大石壁→
  望月亭→獅頭山三角點，約一個多小時登頂" (chosen over option 2's 10-minute
  望月亭-only segment, for its full named-waypoint chain matching the
  selected biji trail's scope). Checkpoints: 獅頭山停車場 → 道德門 → 觀日亭
  → 獅山大石壁 → 望月亭 → 獅頭山三角點.
- **Route facts (community):** biji trail id 793 "獅山古道" — the only biji
  trail for this mountain
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=793), matching the
  temple-route waypoints named in isports option 1. `distanceText: "4.9
  公里"` → `distanceKm: 4.9`. `durationText: "所需時間 2 小時 20 分鐘"` →
  `durationMinutes: 140`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "183公尺"` → `elevationDifferenceM: 183`.
- **Closure check:** isports `noticeItem` only describes the 獅頭/獅尾 route
  options and elevation gain — no closure language. Live re-fetch of PKNO=29
  today: page loads, mountain matches (獅頭山, 492m, 苗栗縣三灣鄉/南庄鄉), no
  closure notice.
- **Corroboration:** hiker bundle 029 independently confirms elevation 492m,
  三等三角點編號25, and describes the same 停車場→道德門→望月亭→獅頭山 route.
  Not used numerically (no stated difficulty scale).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 031 鵝公髻山 (新竹縣五峰鄉、苗栗縣南庄鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/031.json`
  (PKNO=31). `climbWay` option 2's first sentence: "第一登山口→林徑→三岔路→
  路中石→鵝公髻山，約2小時登頂" (chosen over option 1's 山上人家 shorter
  private-farm-access route and option 3's longer 金鵝橋 route, as
  option 2's 第一登山口 is the standard public trailhead matching both the
  selected biji trail's elevation-difference figure and the hiker bundle's
  independently-described route). Checkpoints: 第一登山口 → 林徑 → 三岔路 →
  路中石 → 鵝公髻山.
- **Route facts (community):** biji trail id 473 "鵝公髻山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=473) — the direct
  named trail (the alternative, id 1740 "五峰天際線", is a 28.5km/15hr
  multi-peak traverse, not used). `distanceText: "8公里"` → `distanceKm: 8`.
  `durationText: "所需時間 4 小時"` → `durationMinutes: 240`.
  `difficultyText: "低-中難度"` → `difficulty: 2`. `elevationDifferenceText:
  "719公尺"` → `elevationDifferenceM: 719` (consistent with the elevation
  range 860~1579公尺, matching a 第一登山口-origin ascent).
- **Closure check:** isports `noticeItem` only gives route-sequencing advice
  (which trailhead/spur to take) — no closure language. Live re-fetch of
  PKNO=31 today: page loads, mountain matches (鵝公髻山, 1579m, 新竹縣五峰鄉
  /苗栗縣南庄鄉), no closure notice.
- **Corroboration:** hiker bundle 031 independently confirms elevation
  1579m, 三等三角點編號6239, and describes the same 大隘社第一登山口→鵝公髻山
  route. Not used numerically (no stated difficulty scale).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 032 向天湖山 (苗栗縣南庄鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/032.json`
  (PKNO=32). `climbWay` (single option): "向天湖停車場→向天湖山/光天高山
  登山口→巨石→三角湖山叉路→向天湖山三角點，約1.5小時登頂" (the "/" in
  "向天湖山/光天高山登山口" is the source's own notation for a shared
  trailhead serving both peaks, preserved verbatim as a single waypoint
  name). Checkpoints: 向天湖停車場 → 向天湖山/光天高山登山口 → 巨石 → 三角湖
  山叉路 → 向天湖山三角點.
- **Route facts (community):** biji trail id 738 "南庄向天湖山步道" — the
  only biji trail for this mountain
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=738).
  `distanceText: "5公里"` → `distanceKm: 5`. `durationText: "所需時間 2 小時
  45 分鐘"` → `durationMinutes: 165`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "430公尺"` →
  `elevationDifferenceM: 430`.
- **Closure check:** isports `noticeItem` only advises a route sequence for
  connecting to 光天高山 — no closure language. Live re-fetch of PKNO=32
  today: page loads, mountain matches (向天湖山, 1225m, 苗栗縣南庄鄉), no
  closure notice.
- **Corroboration:** hiker bundle 032 independently confirms elevation
  1225m, 森林三角點, and describes the same 向天湖停車場→向天湖山 route
  (visiting both 向天湖山 and the adjacent, unrelated 光天高山 in an O-loop).
  Not used numerically (no stated difficulty scale).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 033 仙山 (苗栗縣獅潭鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/033.json`
  (PKNO=33). `climbWay` (single option): "靈洞宮停車場→協靈亭→仙山，約50分鐘
  登頂". Checkpoints: 靈洞宮停車場 → 協靈亭 → 仙山.
- **Route facts (community):** biji trail id 256 "仙山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=256) — name
  matches the peak directly and its distance/elevation profile matches a
  direct-summit route from the same 靈洞宮 area (the alternatives — id 398
  "神仙縱走(神桌山至仙山)" 12.5km/8hr, id 967 "八仙古道(八卦力至仙山)"
  2.9km with no url, and id 1194 "象神仙縱走" 13.7km with no url — are all
  longer traverses or lack a citable url, not used). `distanceText: "1.6
  公里"` → `distanceKm: 1.6`. `durationText: "所需時間 1 小時 30 分鐘"` →
  `durationMinutes: 90`. `difficultyText: "低-中難度"` → `difficulty: 2`.
  `elevationDifferenceText: "260公尺"` → `elevationDifferenceM: 260`
  (consistent with elevation range 707~967公尺).
- **Closure check:** isports `noticeItem` only warns of a rope-assisted
  steep section near the summit and advises against attempting the separate,
  long 神仙縱走 ridge route casually — no closure language, and this is not
  a warning about the record's own checkpoint route. Live re-fetch of
  PKNO=33 today: page loads, mountain matches (仙山, 967m, 苗栗縣獅潭鄉), no
  closure notice.
- **Mismatched hiker bundle, not used:** see note at top of report —
  `data/routes/raw/hiker/033.json` describes an unrelated 八仙山 (2366m,
  台中縣谷關), not this mountain. Excluded entirely, including from
  corroboration.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 034 加里山 (苗栗縣南庄鄉、泰安鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/034.json`
  (PKNO=34). `climbWay` option 1: "登山口→哈勘尼山步道岔路→風美溪→鐵道→
  小木屋→九號救援椿→加里山，約3-3.5小時登頂" (chosen over option 2's
  大坪林道 alternate trailhead route, since option 1's named waypoints —
  哈勘尼山步道岔路, 風美溪, 鐵道, 小木屋 — are independently corroborated in
  full sequence by the hiker bundle's own鹿場-trailhead trip report).
  Checkpoints: 登山口 → 哈勘尼山步道岔路 → 風美溪 → 鐵道 → 小木屋 → 九號救援
  椿 → 加里山.
- **Route facts (community):** biji trail id 249 "加里山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=249) — the direct
  named trail matching option 1's scope (the alternatives — id 712 "哈加
  縱走(哈堪尼山、加里山)" 11km/8h50m, a two-peak traverse, and id 1176
  "虎加縱走" 13km/10h with no url — are longer combined routes, not used).
  `distanceText: "12.5公里"` → `distanceKm: 12.5`. `durationText: "所需時間
  7 小時 30 分鐘"` → `durationMinutes: 450`. `difficultyText: "中難度"` →
  `difficulty: 3`. `elevationDifferenceText: "940公尺"` →
  `elevationDifferenceM: 940` (consistent with elevation range 1280~2220
  公尺).
- **Closure check:** isports `noticeItem` only recommends an overnight stay
  at the trailhead and solo-hiking caution for those unfamiliar with the
  route — no closure language. Live re-fetch of PKNO=34 today: page loads,
  mountain matches (加里山, 2220m, 苗栗縣南庄鄉/泰安鄉), no closure notice.
- **Corroboration:** hiker bundle 034 independently confirms elevation
  2220m, 一等三角點, and describes the identical 鹿場登山口→哈堪尼叉路口→
  風美溪→小木屋→加里山 route matching the selected official checkpoints.
  Not used numerically (no stated difficulty scale).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value.
Ranges were resolved to their conservative upper bound per POLICY.md
(applied to 027's official-only "1.5~2小時" → 120 minutes; no community
range values were encountered in this batch). No value was averaged,
interpolated, or derived from distance/pace. `routeName` for the two
official-only records (027, 028) uses the catalog's established
"{mountainName}步道" generic-label convention (see existing
`dongmao-mountain-trail`, `tangmadan-mountain-trail`,
`bojinjia-mountain-trail` records for precedent) rather than inventing a
specific named trail the source never states.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 84
Small hundred peaks: 42
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 32 (pre-batch baseline, confirmed via
batch 2's report) to 42 (+10, matching all ten additions in this batch).
`Catalog valid`, `Missing sources: 0`, `Duplicate slugs: 0`. Remaining
warnings (suburban-route count, missing designations 035+) are pre-existing
and outside this batch's scope.

## Files changed

- `data/routes/catalog.json`: 10 new records appended
  (shimen-mountain-longtan-trail, shiniu-mountain-trail,
  shibajian-mountain-trail, feifeng-mountain-trail, lidong-mountain-trail,
  shitou-mountain-trail, egongji-mountain-trail,
  xiangtianhu-mountain-trail, xian-mountain-trail, jiali-mountain-trail),
  each with designations `taiwan_small_hundred_peak:024/025/026/027/028/
  029/031/032/033/034`.
- `data/routes/sources.json`: 15 new `(organization, url)` entries — 7
  教育部體育署 isports PKNO pages (PKNO=27/31/34 were already registered
  from a prior context) + 8 健行筆記 trail pages.
- `.superpowers/sdd/task-8-tiered-batch-3-report.md`: this report (new
  file).
