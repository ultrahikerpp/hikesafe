# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 4 (Miaoli-Taichung cluster)

Reviewed: 2026-07-18
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: 10 mountains (035, 036, 038, 040, 041, 042, 043, 044, 045, 046), per
the parent task message.

**Result: 8 added, 2 rejected (both for active, live-confirmed trail closures).**

**Overlap check:** grepped `data/routes/catalog.json` (all records, including
nested `checkpoints[].name` fields) and `data/routes/hundred-peaks.json` for
all ten mountain names — zero matches for any of them. All ten required
fresh records (or a fresh reject decision); none was an existing-record
overlap.

**Difficulty mapping used (per POLICY.md §Difficulty mapping, same as
batches 1-3):** 低難度→1, 低-中難度→2, 中難度→3, 中-高難度→4, 高難度→5.

**Mismatched community bundles found and excluded (same-name-different-mountain
trap flagged in the task brief):**
- `data/routes/raw/hiker/036.json` describes 南投縣埔里鎮's unrelated 2017m
  關刀山 (埔里六秀), not this batch's #036 關刀山 (889m, 苗栗縣大湖鄉/三義鄉).
  Excluded entirely.
- `data/routes/raw/biji/042.json`'s `mountainTitle` is "觀音山" (bijiMountainId
  104, `managingPark: "北海岸及觀音山國家風景區"`) — this is the well-known
  Bali/Wugu 觀音山 in New Taipei, not this batch's #042 南觀音山 in Taichung's
  大坑 area. Excluded entirely; 042 was added using isports (official) data
  only, with no usable community route-fact source.
- `data/routes/raw/hiker/045.json` describes 南投縣埔里鎮's unrelated 1508m
  橫屏山 (埔里六秀), not this batch's #045 大橫屏山 (1206m, 臺中市太平區/南投縣
  國姓鄉). Excluded entirely — confirmed as a mismatch (rather than a real
  corroboration) because the biji bundle's own elevation range top (1206m)
  matches isports's stated peak elevation exactly, while the hiker bundle's
  1508m does not.

---

## 040 聚興山 (臺中市潭子區) — REJECTED (active closure, live-confirmed)

- isports (`data/routes/raw/isports/040.json`, PKNO=39) and both community
  bundles (hiker, biji) contain no closure language — all describe a
  pleasant, well-maintained 新田登山步道.
- However, this exact trail (新田登山步道) is separately covered by an
  official Taichung city tourism page not in the local bundle set:
  `https://travel.taichung.gov.tw/zh-tw/experience/hikingtrail/14`. A prior
  batch (`task-8-small100-central-e-report.md`, reviewed 2026-07-17) found
  an active storm-damage notice there and rejected on that basis.
- Per the parent task's explicit instruction not to skip safety checks just
  because the source-tier policy loosened, I WebFetched this page live
  today (2026-07-18) to check current status. It still displays: **"受丹娜斯
  颱風及0728西南氣流影響，部分路段仍有邊坡不穩與步道破損情形，提醒山友務必提高
  警覺，行前留意天氣狀況，並避免進入危險區域。"** — the closure/hazard notice
  is unchanged from yesterday's finding, one day later. Rejected.

## 041 頭嵙山 (臺中市北屯區、新社區) — REJECTED (active closure, live-confirmed)

- Per the parent task's specific flag: this mountain was previously ADDED
  then WITHDRAWN in `task-8-small100-central-b-report.md` (2026-07-17) after
  a reviewer found the cited Taichung Dakeng-trail-5 page carried an active
  post-typhoon closure notice.
- isports's own `climbWay` (`data/routes/raw/isports/041.json`, PKNO=40)
  offers two route options: option 1 traces Dakeng Trail #4 (中正露營區
  停車場→登山口→...→頭嵙山三角點, confirmed by the hiker bundle's own text:
  "4 號步道：全長約 2,700 公尺...到達中正露營區停車場之 4 號步道登山口"); option 2
  explicitly says "上五號步道" (uses Trail #5, the one already known closed).
  Neither isports nor the hiker/biji bundles mention any closure — bundles
  are static snapshots and isports is a general descriptive page, not an
  operational-status page, so their silence doesn't confirm the trail has
  reopened.
- I WebFetched both `https://travel.taichung.gov.tw/zh-tw/experience/hikingtrail/5`
  and `.../hikingtrail/4` live today. **Both currently display the same
  closure banner**: "因今年7月丹娜絲颱風及 0728 西南氣流帶來連日豪大雨，將進行
  災後復建工程。為避免發生危險，已封閉此登山步道，整修期間請民眾暫勿前往，造成
  不便，敬請見諒。" Since both of isports's two stated route options for
  頭嵙山 run through Dakeng Trail #4 or #5, and both are confirmed actively
  closed today, no safe route to this peak's summit currently exists via any
  source checked. Rejected — closure evidence still holds under the new
  policy exactly as it did under the old one.

---

## 035 火炎山 (苗栗縣苑裡鎮、三義鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/035.json`
  (PKNO=35). `climbWay` option 1: "台13線55.3公里→岔路直行→第六座山頭→火炎山
  三角點，約2小時登頂" (chosen over option 2's shorter, sparser 三義垃圾掩埋場
  one-way route). Checkpoints: 台13線55.3公里 → 岔路 → 第六座山頭 → 火炎山
  三角點.
- **Route facts (community):** biji trail id 387 "火炎山、南鞍古道O走"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=387) — chosen over
  the alternative id 1643 "北鞍古道O走" because the hiker bundle's own trip
  report explicitly describes descending via "南鞍步道" (south-saddle trail),
  matching this trail's name/direction, not the north-saddle alternative.
  `distanceText: "6.4公里"` → `distanceKm: 6.4`. `durationText: "所需時間 3
  小時"` → `durationMinutes: 180`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "379公尺"` →
  `elevationDifferenceM: 379`.
- **Closure check:** isports `noticeItem` only warns of loose pebble terrain
  — no closure language. Live re-fetch of PKNO=35 today: page loads,
  mountain matches (火炎山, 596m, 苗栗縣苑裡鎮/三義鄉), no closure notice.
- **Corroboration:** hiker bundle 035 independently confirms the O-loop
  route (~6.5km, matching mileage markers up to 6.4K), 南火炎山 sub-peak
  (251M), and the same 南鞍步道 descent. Not used numerically (no stated
  difficulty scale).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 036 關刀山 (苗栗縣大湖鄉、三義鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/036.json`
  (PKNO=36). `climbWay` option 1: "關刀山第一登山口(茶亭)→第二登山口(出關古道
  關聖段)→關刀山三角點，約30分鐘登頂" (chosen over option 2's single-trailhead
  聖衡宮 route for its richer waypoint chain, and because it names "出關古道
  關聖段" directly, matching the selected biji trail's own name). Checkpoints:
  關刀山第一登山口(茶亭) → 第二登山口(出關古道關聖段) → 關刀山三角點.
- **Route facts (community):** biji trail id 415 "出關古道：聖關段(關刀山
  步道)" (https://hiking.biji.co/index.php?q=trail&act=detail&id=415) —
  chosen over the alternative id 1866 "出關古道聖關段（RSA50）" per the
  tie-break rule (415's name contains "關刀山", 1866's does not).
  `distanceText: "3.5公里"` → `distanceKm: 3.5`. `durationText: "所需時間 1
  小時 30 分鐘"` → `durationMinutes: 90`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "194公尺"` →
  `elevationDifferenceM: 194`.
- **Mismatched hiker bundle, not used:** see note at top of report —
  `data/routes/raw/hiker/036.json` describes an unrelated 2017m 關刀山 in
  南投縣埔里鎮 (埔里六秀), not this mountain. Excluded entirely, including
  from corroboration. (This mountain was previously rejected under the old
  official-only policy in `task-8-small100-central-b-report.md` solely for
  lacking an official numeric difficulty figure — the tiered policy's
  community-difficulty allowance resolves that gap.)
- **Closure check:** isports `noticeItem` only recommends driving directly
  to the south-ridge trailhead — no closure language. Live re-fetch of
  PKNO=36 today: page loads, mountain matches (關刀山, 889m, 苗栗縣大湖鄉/
  三義鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 038 鐵砧山 (臺中市外埔區) — ADDED

- **Designation (official):** `data/routes/raw/isports/038.json`. Note: this
  bundle's own `url` field uses `PKNO=100`, not the `PKNO=37` a linear
  numbering might suggest — verified this is not a scraper bug by live
  WebFetch: the page at that exact URL loads and is explicitly labeled
  "NO.038 鐵砧山", 236m, 臺中市外埔區, matching this record precisely. Used
  as-is.
- **Checkpoints (community, hiker):** isports's own `climbWay` is a single
  terse line ("日光牧場大門→三角點，約5分鐘登頂") describing only the final
  segment assuming vehicular access to the pasture gate — inconsistent in
  scope with the fuller public-trailhead-to-summit route the selected biji
  distance/duration describe, so it was not used for checkpoints (to avoid
  pairing a 5-minute-segment checkpoint chain with a 60-minute/3.3km
  distance figure for a longer, different-scope walk). Instead, checkpoints
  are sourced from `data/routes/raw/hiker/038.json`'s trip report, which
  covers the complete walk matching the biji route's scope: 劍井 → 日光牧場
  大門 → 機砲堡 → 鐵砧山三角點 (order and place names taken directly from the
  bundle's timestamped narrative).
- **Route facts (community):** biji trail id 595 "鐵砧山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=595) — the only
  biji trail for this mountain. `distanceText: "3.3公里"` → `distanceKm:
  3.3`. `durationText: "所需時間 1 小時"` → `durationMinutes: 60`.
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "156公尺"` → `elevationDifferenceM: 156`.
- **Closure check:** isports `noticeItem` only warns of a steep cliff face
  on the north side — no closure language. Live re-fetch today: page loads,
  mountain matches, no closure notice. (This mountain was previously
  rejected under the old official-only policy in
  `task-8-small100-central-e-report.md` solely for lacking an official
  numeric difficulty figure — resolved by the tiered policy's community
  allowance, same as 036.)
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 042 南觀音山 (臺中市北屯區) — ADDED (official-only, partial data)

- **All fields (official):** `data/routes/raw/isports/042.json` (PKNO=41).
  `climbWay` option 2: "大坑橋登山口(玉佛寺步道)→南觀音山三角點，約20分鐘登頂"
  (chosen over option 3's bare "觀音小徑→南觀音山，約30分鐘登頂" for its named
  trailhead and because it names the trail itself, "玉佛寺步道", matching the
  intro paragraph's mention of the summit-top 玉佛寺 temple; option 1 is a
  driving direction, not a hiking route). Checkpoints: 大坑橋登山口(玉佛寺
  步道) → 南觀音山三角點. `routeName` set to "玉佛寺步道", taken verbatim from
  the official source's own parenthetical route name (official tier, not a
  fabricated label). `durationMinutes: 20` — a single stated value, not a
  range, taken directly.
- **No usable community source:** see note at top of report — the only
  biji bundle for this number (`data/routes/raw/biji/042.json`) is
  mismatched to the unrelated Bali/Wugu 觀音山 (New Taipei), confirmed by its
  `managingPark` field pointing to 北海岸及觀音山國家風景區. Excluded entirely.
  No hiker bundle exists for 042.
- **Nullable fields left null (POLICY.md §Nullable route-fact fields):**
  `distanceKm` and `difficulty` — isports states neither a distance figure
  nor a difficulty rating for any of its three route options, and no valid
  community source exists to fill the gap. `elevationDifferenceM` also left
  null (isports gives only a single elevation figure, 318m, no explicit
  difference/落差 value).
- **Closure check:** isports `noticeItem` only asks hikers not to bring meat
  near the summit temple — no closure language. Live re-fetch of PKNO=41
  today: page loads, mountain matches (南觀音山, 318m, 臺中市北屯區), no
  closure notice. (Note: this route, via 玉佛寺步道/大坑橋登山口, is a
  distinct official trail from the numbered Dakeng trails #4/#5 confirmed
  closed under 041 above — not affected by that closure.)
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 043 三汀山 (臺中市太平區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/043.json`
  (PKNO=42). `climbWay` (single option, rich chain): "一江橋堤防道路登山口→
  大潭仔→第一步道叉路→第三步道叉路→第五步道叉路→長青運動公園→枕木步道→老鼠崎
  步道叉路→三汀山望高寮，約2~2.5小時登頂". Checkpoints: 一江橋堤防道路登山口 →
  大潭仔 → 第一步道叉路 → 第三步道叉路 → 第五步道叉路 → 長青運動公園 → 枕木步道
  → 老鼠崎步道叉路 → 三汀山望高寮.
- **Route facts (community):** biji trail id 5 "咬人狗坑登山步道(三汀山)"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=5) — chosen over
  the alternative id 2046 "三進三出三汀山" (18.92km/4h50m, high difficulty — a
  repeated-ascent challenge route, not the direct summit route) since trail
  5's name contains the peak name directly and its round-trip distance
  (7.8km) is roughly double the ~3.9km one-way figure independently reported
  by a prior batch's secondary-source check. `distanceText: "7.8公里"` →
  `distanceKm: 7.8`. `durationText: "所需時間 3 小時"` → `durationMinutes:
  180`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "361公尺"` → `elevationDifferenceM: 361`
  (matches a prior batch's secondary-source finding of "落差361公尺" exactly).
- **Closure check:** isports `noticeItem` only notes the steepest section is
  near the start — no closure language. Live re-fetch of PKNO=42 today:
  page loads, mountain matches (三汀山, 480m, 臺中市太平區), no closure
  notice. (This mountain was previously rejected in
  `task-8-small100-central-b-report.md` because the official Taichung
  "attractions/intro" page template returned no server-rendered body text —
  resolved here by using isports, a different official source with full
  static text, for checkpoints/designation instead.)
- No hiker bundle exists for 043.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 044 暗影山 (臺中市太平區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/044.json`
  (PKNO=43). `climbWay` (single option): "登山口(進入1403號保安林地告示)→
  暗影山三角點，約20分鐘登頂". Checkpoints: 登山口(進入1403號保安林地告示) →
  暗影山三角點.
- **Route facts (community):** biji trail id 556 "暗影山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=556) — the only
  biji trail for this mountain, and its elevation range (900~997公尺)
  matches isports's stated 997m summit elevation exactly.
  `distanceText: "1.2公里"` → `distanceKm: 1.2`. `durationText: "所需時間 30
  分鐘"` → `durationMinutes: 30`. `difficultyText: "低難度"` → `difficulty:
  1`. `elevationDifferenceText: "97公尺"` → `elevationDifferenceM: 97`.
- **Closure check:** isports `noticeItem` only notes an alternate, steeper
  approach near a restaurant — no closure language. Live re-fetch of
  PKNO=43 today: page loads, mountain matches (暗影山/酒桶山, 997m, 臺中市
  太平區), no closure notice. (This mountain was previously rejected in
  `task-8-small100-central-e-report.md` for having no official route-fact
  source at all — resolved here by the tiered policy's community allowance
  for distance/duration/difficulty, with checkpoints still official.)
- No hiker bundle exists for 044.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 045 大橫屏山 (臺中市太平區、南投縣國姓鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/045.json`
  (PKNO=44). `climbWay` (single option, rich chain): "農投16農路第二柵欄(後角
  寮分195號電桿)→210號電桿→產業道路叉→登山口叉→1170峰→大橫屏山三角點，約3小時
  登頂". Checkpoints: 農投16農路第二柵欄(後角寮分195號電桿) → 210號電桿 →
  產業道路叉 → 登山口叉 → 1170峰 → 大橫屏山三角點.
- **Route facts (community):** biji trail id 774 "大橫屏山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=774) — the only
  biji trail for this exact mountain name, and its elevation range top
  (1206公尺) matches isports's stated summit elevation exactly, confirming
  this is the correct mountain (see the mismatched-hiker-bundle note above
  for the contrast case). `distanceText: "8.8公里"` → `distanceKm: 8.8`.
  `durationText: "所需時間 5 小時 10 分鐘"` → `durationMinutes: 310`.
  `difficultyText: "低-中難度"` → `difficulty: 2`. `elevationDifferenceText:
  "301公尺"` → `elevationDifferenceM: 301`.
- **Mismatched hiker bundle, not used:** see note at top of report —
  `data/routes/raw/hiker/045.json` describes an unrelated 1508m 橫屏山 in
  南投縣埔里鎮 (埔里六秀). Excluded entirely, including from corroboration.
  (This mountain was previously rejected in
  `task-8-small100-central-e-report.md` on the reasoning that its trail is
  civic-association-maintained rather than government-run — the tiered
  policy supersedes that reasoning by allowing a named community source for
  route facts directly, with the isports official page still anchoring the
  designation and checkpoints.)
- **Closure check:** isports `noticeItem` only warns of steep slopes and
  occasional collapsed sections — general terrain caution, not a
  closure/repair notice, and does not match the wording pattern used in
  040/041's confirmed active-closure notices above. Live re-fetch of
  PKNO=44 today: page loads, mountain matches (大橫屏山, 1206m, 臺中市太平區/
  南投縣國姓鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 046 阿罩霧山 (臺中市霧峰區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/046.json`
  (PKNO=45). `climbWay` (single option): "樟公廟停車場→阿罩霧山登山口(朝陽高枝
  43分3分4電桿)→阿罩霧山三角點，約30分鐘登頂". Checkpoints: 樟公廟停車場 →
  阿罩霧山登山口(朝陽高枝43分3分4電桿) → 阿罩霧山三角點.
- **Route facts (community):** biji trail id 568 "阿罩霧山、中心瓏步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=568) — the only
  biji trail for this mountain, and its elevation range top (249公尺)
  matches isports's stated summit elevation exactly. `distanceText: "7
  公里"` → `distanceKm: 7`. `durationText: "所需時間 2 小時"` →
  `durationMinutes: 120`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "171公尺"` → `elevationDifferenceM: 171`.
- **Closure check:** isports `noticeItem` only advises where to park given
  narrow roads — no closure language. Live re-fetch of PKNO=45 today: page
  loads, mountain matches (阿罩霧山, 249m, 臺中市霧峰區), no closure notice.
  (This mountain was previously rejected in
  `task-8-small100-central-b-report.md` for the same JS-rendered-page issue
  as 043 — resolved here by using isports instead.)
- **Corroboration:** hiker bundle 046 independently confirms elevation
  249m/250m, 二等三角點編號1136, and the same 樟公廟→阿罩霧山登山口 route. Not
  used numerically (no stated difficulty scale; biji already covers the
  numeric package).
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value. No
range values were encountered requiring the conservative-upper-bound rule in
this batch (all duration figures used were single stated values, not
ranges). `routeName` values were taken either from the selected biji trail's
own name (community tier) or, for 042 (no valid community source), directly
from the official isports source's own parenthetical route label — never
invented. No value was averaged, interpolated, or derived from distance/pace.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 92
Small hundred peaks: 50
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 42 (pre-batch baseline, confirmed via
batch 3's report) to 50 (+8, matching all eight additions in this batch;
040 and 041 remain unassigned, both correctly rejected for live-confirmed
active closures). `Catalog valid`, `Missing sources: 0`, `Duplicate slugs:
0`. Remaining warnings (suburban-route count, missing designations 047+) are
pre-existing and outside this batch's scope.

## Files changed

- `data/routes/catalog.json`: 8 new records appended (huoyan-mountain-trail,
  guandao-mountain-miaoli-trail, tiezhen-mountain-trail,
  nanguanyin-mountain-trail, santing-mountain-trail, anying-mountain-trail,
  dahengping-mountain-trail, azhaowu-mountain-trail), each with designations
  `taiwan_small_hundred_peak:035/036/038/042/043/044/045/046`.
- `data/routes/sources.json`: 15 new `(organization, url)` entries — 7
  教育部體育署 isports PKNO pages (PKNO=35 was already registered from a prior
  context) + 7 健行筆記 trail pages + 1 輝哥的天空 page.
- `.superpowers/sdd/task-8-tiered-batch-4-report.md`: this report (new
  file).
