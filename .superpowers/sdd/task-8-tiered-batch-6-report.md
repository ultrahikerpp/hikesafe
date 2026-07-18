# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 6 (Chiayi-Tainan-Kaohsiung cluster)

Reviewed: 2026-07-18
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: 10 mountains (060, 061, 062, 064, 065, 066, 067, 068, 069, 070), per
the parent task message.

**Result: 9 added, 1 rejected (064 崁頭山 — confirmed active closure).**

**Context — these ten were previously rejected under the old official-only
policy.** Per `.superpowers/sdd/progress.md` entries 99/100 (South F / South
G), 崁頭山 and 竹子尖山 were specifically flagged as "active-closure catches";
the rest were rejected for insufficient official-only data. This batch
re-researched all ten using the tiered-source bundles plus a live re-check of
every closure question, per the task brief's explicit instruction not to
skip verification just because the sourcing policy loosened.

**Overlap check:** grepped `data/routes/catalog.json` (including nested
`checkpoints[].name`) and `data/routes/hundred-peaks.json`/`sources.json`
for all ten mountain names plus known alt-names (小林山 for 066, 松濤 for
068). One name collision found and confirmed **not** an overlap: the
existing record `guanziling-dadongshan-trail` (designation `:063`,
臺南市白河區, elevation-difference 471m, checkpoints ending in "大棟山三角點")
is a *different* mountain that happens to share the trail-name "大凍山步道" —
its actual summit is 大棟山 (per progress.md entry 96's prior
disambiguation), not this batch's #060 大凍山 (奮起湖/嘉義縣阿里山鄉, 1976m).
No merge; #060 got a fresh record. No other overlaps found; none of the ten
target numbers were previously designated.

**Mismatched community bundle found and excluded:** `data/routes/raw/hiker/060.json`
(輝哥的天空) describes **關仔嶺大凍山** (台南市白河區, 1241m, small-hundred-peak
#063 by the author's own numbering) — the same unrelated mountain as the
overlap check above, not this batch's #060 (奮起湖大凍山, 1976m). Excluded
entirely, including from corroboration. `data/routes/raw/biji/060.json` is
correctly matched (elevation range top 1976公尺 matches isports exactly).

**Difficulty mapping used (per POLICY.md §Difficulty mapping):** 低難度→1,
低-中難度→2, 中難度→3, 中-高難度→4, 高難度→5.

**No hiker bundle exists for:** 068 (藤枝山), 070 (刣牛湖山).

---

## 060 大凍山 (嘉義縣阿里山鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/060.json`
  (PKNO=59). `climbWay` option 1 (chosen — simpler two-landmark chain,
  matches biji's generic trail name without a stated side): "多林登山口(北)：
  樹石盟→石階步道岔路→大凍山，約1-1.5小時登頂". Checkpoints: 多林登山口(北) →
  樹石盟 → 石階步道岔路 → 大凍山 (no "三角點" suffix — isports's own `intro`
  states "大凍山...無基點", i.e. no triangulation point at the summit).
- **Route facts (community):** biji trail id 309 "奮起湖大凍山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=309) — elevation
  range top (1976公尺) matches isports's stated summit elevation exactly.
  `distanceText: "3.8公里"` → `distanceKm: 3.8`. `durationText: "所需時間 2
  小時 5 分鐘"` → `durationMinutes: 125`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "336公尺"` →
  `elevationDifferenceM: 336`.
- **Mismatched hiker bundle:** see top-of-report note — excluded entirely.
- **Closure check:** isports `noticeItem` only recommends a viewing-order
  suggestion for the loop trail — no closure language. Live re-fetch of
  PKNO=59 today: page loads, mountain matches (大凍山, 1976m, 嘉義縣阿里山鄉),
  no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 061 大湖尖山 (嘉義縣番路鄉、竹崎鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/061.json`
  (PKNO=60). `climbWay` (single option): "產道涼亭→尖山步道起點→涼亭（指標800m）→
  涼亭（指標400m）→大湖尖山，約1小時登頂". Checkpoints: 產道涼亭 → 尖山步道起點 →
  涼亭（指標800m） → 涼亭（指標400m） → 大湖尖山.
- **Route facts (community):** biji trail id 792 "大湖尖山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=792) — elevation
  range top (1313公尺) is close to isports's 1316m summit figure (3m
  discrepancy, both official/community sources for this peak use slightly
  different rounding — 1313~1316m consistently point to the same summit).
  `distanceText: "2.9公里"` → `distanceKm: 2.9`. `durationText: "所需時間 2
  小時 40 分鐘"` → `durationMinutes: 160`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "400公尺"` →
  `elevationDifferenceM: 400`.
- **Route-identity corroboration:** `data/routes/raw/hiker/061.json`
  explicitly states "小百岳 #061" with elevation "1,313M" — confirmed
  correct match (combined write-up also covering the separate, adjacent
  三寶山, not part of this record). Its "天雲山" O-type loop extension is a
  separate excursion beyond 大湖尖山's own summit, not used here.
- **Closure check:** isports `noticeItem` only recommends starting from the
  west-ridge trailhead — no closure language. Live re-fetch of PKNO=60
  today: page loads, mountain matches (大湖尖山, 1316m, 嘉義縣番路鄉/竹崎鄉), no
  closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 062 紅毛埤山 (嘉義市) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/062.json`
  (PKNO=61). `climbWay` option 2 (chosen over option 1's driving-only "由嘉義
  市大雅路直接開車進入紅毛埤巷→紅毛埤山三角點，約3分鐘登頂" for being an actual
  hiking route): "濟福宮→蘭潭步道登山口→筍寮→新樂園→小公園映像桃園→都界79樁→紅毛埤山
  叉路→紅毛埤山三角點，約1小時登頂". Checkpoints: 濟福宮 → 蘭潭步道登山口 → 筍寮 →
  新樂園 → 小公園映像桃園 → 都界79樁 → 紅毛埤山叉路 → 紅毛埤山三角點.
- **Route facts (community):** biji trail id 307 "蘭潭後山步道、紅毛埤山"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=307) — name
  directly matches, elevation range top (150公尺) matches isports's stated
  elevation exactly. `distanceText: "4.5公里"` → `distanceKm: 4.5`.
  `durationText: "所需時間 1 小時 20 分鐘"` → `durationMinutes: 80`.
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "70公尺"` → `elevationDifferenceM: 70`.
- **Route-identity corroboration:** `data/routes/raw/hiker/062.json`
  explicitly states "小百岳＃062號", elevation 150公尺, 二等三角點1096號 —
  confirmed correct match.
- **Boardwalk-damage investigation (flagged concern):** the hiker bundle's
  trip log (dated up to 115/01/27 = 2026-01-27) mentions a ~120m boardwalk
  section damaged by "113年颱風" (2024) with hikers using a self-made bypass,
  and notes repairs "began late 114" (~end of 2025). Live WebSearch found an
  official 嘉義市政府 announcement
  (https://www.chiayi.gov.tw/News_Content.aspx?n=455&s=911950) confirming a
  **separate, more severe** closure: Typhoon Danas (丹娜絲) on 2025-07-07
  caused mass tree-fall around 蘭潭, closing the loop road and back-mountain
  trail entirely; the back-mountain trail's main/support lines were
  confirmed reopened 2025-08-15, with only two specific sub-sections still
  under active construction as of that announcement — a bridge segment
  (1K+200~300M) and a "好漢坡" (Haohan slope) optimization project. Neither
  of those two segments falls on this record's chosen checkpoint chain (好漢
  坡 is only used in trip reports as an alternate quick descent to 鎮德宮, not
  part of the ascent route used here). Live re-fetch of isports PKNO=61
  today shows no closure language. Treated as open, with the boardwalk/
  bridge caveat noted here for transparency — this is the most marginal ADD
  in the batch.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 064 崁頭山 (臺南市東山區) — REJECTED (confirmed active closure)

- isports `data/routes/raw/isports/064.json` (PKNO=63) and the live re-fetch
  of that page show **no** closure language — the bundle and live page look
  identical to a normal, open small-hundred-peak listing (climbWay: "孚佑宮
  右側登山口→情人石小公園→崁頭山三角點，約30分鐘登頂"; only caution is about rain/
  slipperiness at 情人石). The hiker bundle (trip dated 113/03/19 = 2024) and
  biji trail 319 both describe a normal completed hike.
- **However**, isports (教育部體育署) is not the trail's managing authority.
  The actual managing authority is 農業部林業及自然保育署 via
  台灣山林悠遊網, whose **live trail-status page**
  (https://recreation.forest.gov.tw/Trail/RT?tr_id=109) currently shows:
  **"【暫停開放】2025/01/23 - 2026/12/31"** with reason "崁頭山步道全線整修工程中，
  暫停開放". The originating notice
  (https://recreation.forest.gov.tw/News/News?id=20240311005) explains the
  closure was extended past its original 2024-04-08~2025-01-31 repair window
  because of a 2025-01-21 earthquake that caused fresh trail collapse
  ("崁頭山步道因114年1月21日地震影響，步道土石崩塌辦理修繕中，全線暫停開放"), with the
  closure now running through the end of 2026 with no reopening date given.
- This matches and confirms the prior South F rejection
  (`.superpowers/sdd/progress.md` entry 99) — the closure has not been
  lifted; if anything it has been extended by a subsequent earthquake.
  **REJECTED — do not add while `tr_id=109` remains in `【暫停開放】` status.**
  isports's own page is stale on this point and should not be relied on
  alone for closure determination; this is the reason POLICY.md's closure
  check must extend to the actual managing authority, not just the
  designation source.

## 065 三腳南山 (嘉義縣大埔鄉、臺南市南化區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/065.json`
  (PKNO=64). `climbWay` (single option): "跳跳農場停車場→梅園步道→登山口→南稜西稜
  叉路口→太師椅→三腳南山，約2.5~3小時登頂". Checkpoints: 跳跳農場停車場 → 梅園步道 →
  登山口 → 南稜西稜叉路口 → 太師椅 → 三腳南山.
- **Route facts (community):** biji trail id 780 "三腳南山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=780) — elevation
  range top (1087公尺) is close to isports's 1186m summit figure (both
  sources' own peak-elevation values disagree by ~100m across the whole
  batch's isports/biji pairs for this mountain specifically — isports states
  1186m, the hiker log independently states 1187M, biji's own trail range
  top states 1087公尺; treated as the same summit given exact name match and
  no alternative candidate peak exists at this designation number).
  `distanceText: "5.8公里"` → `distanceKm: 5.8`. `durationText: "所需時間 4
  小時 20 分鐘"` → `durationMinutes: 260`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "637公尺"` →
  `elevationDifferenceM: 637`.
- **Route-identity corroboration:** `data/routes/raw/hiker/065.json`'s most
  recent trip (115/02/12 = 2026-02-12) follows exactly this 跳跳農場→太師椅→
  三腳南山 route, states summit elevation 1187M and total ascent ~600M,
  consistent with biji's 637m figure.
- **South-ridge closure investigation (flagged concern):** both isports's
  own `intro` ("昔日由三腳南山到竹仔尖山，是台南地區有名的縱走路線之一，但如今此路段已
  不通") and a live WebSearch confirm the **south-ridge** connector to 竹子尖山
  is impassable ("南稜路徑因天災損毀，無路徑、無布條，極易迷路，請勿冒險"). This is a
  *different* route than the one used here — the checkpoint chain above
  passes through "南稜西稜叉路口" (the junction) but continues via 太師椅 on the
  **west ridge**, matching both isports's climbWay and the hiker's actual
  2026 trip route. The closed south-ridge traverse-to-竹子尖山 spur is beyond
  this record's summit checkpoint and is not part of the ascent.
- **Closure check (main route):** isports `noticeItem` is a general rain/
  thorny-vegetation/rope-section caution — no closure language. Live
  re-fetch of PKNO=64 today: page loads, mountain matches (三腳南山, 1186m,
  嘉義縣大埔鄉/臺南市南化區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 066 西阿里關山 (臺南市南化區、高雄市甲仙區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/066.json`
  (PKNO=65). `climbWay` (single option): "出火仔叉路→五叉路口→茅山南峰登山口→展望點
  崩坍處→西阿里關山三角點，約1小時登頂". Checkpoints: 出火仔叉路 → 五叉路口 → 茅山南峰
  登山口 → 展望點崩坍處 → 西阿里關山三角點 (the "展望點崩坍處" waypoint name is taken
  verbatim from the official source — it names a known collapsed viewpoint
  *along* the currently-used route, not a route closure; see below).
- **Route facts (community):** biji trail id 781 "西阿里關山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=781) — the sole
  trail listed for this mountain's biji mountain-id, name matches exactly.
  `distanceText: "7公里"` → `distanceKm: 7`. `durationText: "所需時間 2 小時"` →
  `durationMinutes: 120`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "202公尺"` → `elevationDifferenceM: 202`. Note:
  biji's own elevation-range top (935公尺) is 38m short of isports's 973m
  summit figure — likely the tracked GPS log ending just short of the true
  high point — but the exact name match and being the only trail for this
  mountain-id make it the correct source; not excluded.
- **88-flood (2009) historical-closure investigation (this was one of the
  overlap audit's flagged same-name false-positive cases per progress.md
  entry 96, though that concerned an unrelated *existing-record* mismatch,
  not this mountain's own status):** isports's own `environment` text states
  the *original* 甲仙-side approach "88風災後已坍方不通，現一般都改由台南南化區進入"
  — but this describes a **17-year-old** historical reroute, not a current
  closure: isports's own climbWay (used for checkpoints above) already *is*
  the 南化-side route. The hiker bundle (`data/routes/raw/hiker/066.json`,
  most recent trip 113/05/08 = 2024) independently confirms both approaches
  are usable today: "原登山步道係由甲仙起登...因88風災導致該路坍方一時，現已又重新
  修好" (the original Jiaxian-side route has since been repaired again),
  though this trip still chose the 南化 approach for other reasons (shorter
  driving distance from the party's origin). A live WebSearch for current
  2026 closure news on this trail found none.
- **Closure check:** isports `noticeItem` only cautions about loose soil
  near the collapsed viewpoint — no closure language. Live re-fetch of
  PKNO=65 today: page loads, mountain matches (西阿里關山/小林山, 973m, 臺南市
  南化區/高雄市甲仙區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 067 竹子尖山 (臺南市楠西區、南化區) — ADDED (re-verified after prior active-closure rejection)

- **Designation/checkpoints (official):** `data/routes/raw/isports/067.json`
  (PKNO=66). `climbWay` (single option): "二層坪停車場→觀音寺（經觀音步道）→稜線→竹子
  尖山三角點，約1小時登頂". Checkpoints: 二層坪停車場 → 觀音寺（經觀音步道） → 稜線 →
  竹子尖山三角點.
- **Route facts (community):** biji trail id 816 "竹子尖山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=816) — elevation
  range top (1110公尺) matches isports's stated summit elevation exactly.
  `distanceText: "4公里"` → `distanceKm: 4`. `durationText: "所需時間 2 小時"` →
  `durationMinutes: 120`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "470公尺"` → `elevationDifferenceM: 470`.
- **Route-identity corroboration:** `data/routes/raw/hiker/067.json`'s most
  recent trip (115/01/23 = 2026-01-23) follows exactly the 觀音步道 approach
  used here and reaches "登頂竹子尖山" at the summit's weather-station-adjacent
  triangulation point, consistent with isports's ~1hr figure (actual ascent
  ~09:08 to 09:52, and this instance also detours to 一線天/獵鷹尖ロ beyond the
  main route, praised as "現已架設有繩索、鋼條及木板梯，免除攀爬的危險" — not used
  numerically, that side trip is beyond this record's scope).
- **Active-closure re-investigation (this mountain was one of two explicit
  "active-closure catches" named in the prior South F rejection,
  progress.md entry 99 — task brief specifically flagged it for
  re-verification):** isports's own live page (re-fetched today, PKNO=66)
  and its bundle show no closure language, only a moss/slipperiness caution
  for 梅龍步道 (a *different* trail from the 觀音步道 used in this record's
  checkpoints). A live WebSearch initially surfaced an ambiguous secondary
  source claiming 梅龍步道 was typhoon-damaged and 觀音步道 "仍封閉中" — but
  fetching the actual managing authority's page directly
  (https://www.siraya-nsa.gov.tw/zh-tw/attractions/detail/26, 西拉雅國家風景區
  管理處) shows both 觀音步道 and 梅龍步道 listed as normal, operational trails
  with no closure notice. A further check of the authority's own 2026 plum-
  blossom-season page
  (https://www.siraya-nsa.gov.tw/zh-tw/event/calendardetail/14318, dated
  January 2026 — within this year) explicitly lists current trail status:
  **"觀音步道(步道部分路段整修中請注意安全)"** — partial-section maintenance with a
  caution advisory, not a closure. This is a materially different signal
  from 064 崁頭山's confirmed full-trail `【暫停開放】` status from the same
  general search sweep, and is corroborated by the hiker bundle's completed
  2026-01-23 hike over the same route. **Treated as open — the prior
  rejection's closure basis does not hold up under today's live
  verification from the actual managing authority.**
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 068 藤枝山 (高雄市桃源區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/068.json`
  (PKNO=67). `climbWay` (single option): "登山口→途中墾殖區、竹林、原始林交替上場→藤枝
  山三角點，約20∼30分鐘登頂". Checkpoints: 登山口 → 途中墾殖區、竹林、原始林交替上場 →
  藤枝山三角點 (middle waypoint is a descriptive terrain phrase taken verbatim
  from the official source, per established practice for isports climbWay
  chains that don't name a specific landmark at that step).
- **Route facts (community):** biji trail id 1104 "藤枝山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=1104) — the sole
  trail for this mountain-id, elevation range top (1564公尺) closely matches
  isports's 1565m summit figure. `distanceText: "1.2公里"` →
  `distanceKm: 1.2`. `durationText: "所需時間 25 分鐘"` → `durationMinutes: 25`
  (a single stated value, within isports's own "約20∼30分鐘" range — no range
  resolution needed since community gives an exact figure).
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "85公尺"` → `elevationDifferenceM: 85`. No hiker bundle exists for 068.
- **Closure check:** isports `noticeItem` only describes the three
  available trailhead options along the forest road — no closure language.
  `climbSeason` notes "颱風季節須注意林道是否暢通" (a general seasonal-caution
  reminder, not a stated current closure). Live re-fetch of PKNO=67 today:
  page loads, mountain matches (藤枝山, 1565m, 高雄市桃源區), no closure
  notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 069 白雲山 (高雄市甲仙區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/069.json`
  (PKNO=68). `climbWay` option 1 (chosen over option 2's 4WD-only "白雲山
  登山口(四驅車直上電桿186右50)→白雲山三角點，30分鐘登頂" for being the walking route
  matched by both community bundles): "台20線64.7K登山口→土地公廟叉路口→白雲山登山口
  →白雲山，約1.5小時登頂". Checkpoints: 台20線64.7K登山口 → 土地公廟叉路口 → 白雲山
  登山口 → 白雲山.
- **Route facts (community):** biji trail id 799 "白雲山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=799) — elevation
  range top (1044公尺) matches isports's stated summit elevation exactly.
  `distanceText: "5公里"` → `distanceKm: 5`. `durationText: "所需時間 2 小時 30
  分鐘"` → `durationMinutes: 150`. `difficultyText: "低難度"` → `difficulty:
  1`. `elevationDifferenceText: "419公尺"` → `elevationDifferenceM: 419`.
- **Route-identity corroboration:** `data/routes/raw/hiker/069.json`'s most
  recent trip (114/02/02 = 2026-02-02, i.e. within the last 6 months of this
  review) states "小百岳 #069", summit elevation 1044M, and a ~59-minute
  ascent (09:39 trailhead to 10:05 summit at "H1045m") — consistent with
  isports's ~1.5hr full-route figure once the road-walk from 64.7K to the
  actual trailhead is included.
- **Road-collapse investigation (flagged concern — isports's own official
  route text explicitly routes hikers "經崩壁", i.e. past a collapsed
  section):** both isports's `noticeItem` ("循產道步行至主稜叉路，再左轉產道經崩壁至
  白雲山西南稜步道入口，此為正確路線") and the hiker bundle ("從台20線64.5K處到登山口
  的水泥產業道路有部份坍方破損，僅容具四輪傳動高底盤車上至登山口") describe the same
  known partial road-collapse between the highway and the true trailhead —
  but both sources describe it as **currently passable** on foot/motorcycle/
  4WD, not blocked, and isports publishes this as its official recommended
  route rather than a historical footnote. A live WebSearch corroborates:
  the collapsed ~0.7-1K road segment is "now passable" (可通行) and the only
  2026 disruption found for this corridor is scheduled slope-protection
  road construction on 南橫公路 (Feb 25 – Aug 10, 2026) with two-way traffic
  control (5-min passage every 15 min) — a driving-delay issue, not a trail
  or road closure. Live re-fetch of PKNO=68 today: page loads, mountain
  matches (白雲山, 1044m, 高雄市甲仙區), same conditional-access note, no
  closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 070 刣牛湖山 (臺南市南化區、高雄市杉林區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/070.json`
  (PKNO=69). `climbWay` (single option): "NCC監測站→接烏山步道→廢棄貨櫃屋→曾文溪水源
  保護區界樁→刣牛湖山三角點，30分鐘登頂". Checkpoints: NCC監測站 → 接烏山步道 → 廢棄
  貨櫃屋 → 曾文溪水源保護區界樁 → 刣牛湖山三角點.
- **Route facts (community):** biji has two trails for this mountain-id;
  chose trail 1695 "刣牛湖山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=1695) over trail
  549 "烏山、刣牛湖山登山步道" — trail 1695 is the direct single-peak ascent
  (elevation range top 798公尺 matches isports's summit elevation exactly,
  duration 2hr matches isports's short 30-min-to-summit figure once
  round-trip and approach are included), while trail 549 is the full
  12km 烏山步道 multi-peak縱走 traverse (13km, 8hr, elevation range starting
  from 141m — a much longer route covering many peaks, excluded per the
  task's rule to prefer the most direct single-peak ascent).
  `distanceText: "4.8公里"` → `distanceKm: 4.8`. `durationText: "所需時間 2
  小時"` → `durationMinutes: 120`. `difficultyText: "低難度"` → `difficulty:
  1`. `elevationDifferenceText: "98公尺"` → `elevationDifferenceM: 98`. No
  hiker bundle exists for 070.
- **Closure check:** isports `noticeItem` only warns about a short loose-
  gravel ridge section and multiple junctions — no closure language. Live
  re-fetch of PKNO=69 today: page loads, mountain matches (刣牛湖山, 798m,
  臺南市南化區/高雄市杉林區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value. No
range-value resolution was needed for any of the nine additions — every
duration/distance/difficulty figure used was a single stated community
value, not a range (the only ranges encountered, isports's own climbWay
minute estimates, were treated as corroboration only, consistent with
batches 4-5's established official-checkpoints/community-route-facts
pairing practice — not stored directly in `durationMinutes`). No value was
averaged, interpolated, or derived from distance/pace.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 111
Small hundred peaks: 69
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 60 (pre-batch baseline, batch 5's
report) to 69 (+9, all nine additions; #064 崁頭山 correctly still absent
after the confirmed-closure rejection). `Catalog valid`, `Missing sources:
0`, `Duplicate slugs: 0`. Remaining warnings (suburban-route count, missing
designations for other numbers) are pre-existing and outside this batch's
scope. (Suburban route count also moved 102→111 as a side effect of these
nine records all being `kind: "suburban"`, matching the existing pattern
where non-hundred-peak small-hundred-peak trails are classified suburban —
same convention used in batches 1-5.)

## Files changed

- `data/routes/catalog.json`: 9 new records appended
  (dadongshan-mountain-fenqihu-trail, dahujianshan-mountain-trail,
  hongmaopishan-mountain-trail, sanjiaonanshan-mountain-trail,
  xialiguanshan-mountain-trail, zhuzijianshan-mountain-trail,
  tengzhishan-mountain-trail, baiyunshan-mountain-jiaxian-trail,
  tainiuhushan-mountain-trail), each with designations
  `taiwan_small_hundred_peak:060/061/062/065/066/067/068/069/070`. The 060
  slug carries a `-fenqihu-trail` disambiguator since an unrelated 大凍山
  (a different mountain also confusingly named via its trail, designation
  #063, 臺南市白河區) already exists as `guanziling-dadongshan-trail`; 069's
  slug carries a `-jiaxian-trail` disambiguator since "白雲山" is a common
  Taiwan mountain name.
- `data/routes/sources.json`: 18 new `(organization, url)` entries — 9
  教育部體育署 isports PKNO pages + 9 健行筆記 trail pages.
- `.superpowers/sdd/task-8-tiered-batch-6-report.md`: this report (new
  file).
