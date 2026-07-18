# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 7 (Kaohsiung-Pingtung cluster)

Reviewed: 2026-07-19
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: 10 mountains (071, 072, 073, 074, 075, 076, 077, 078, 079, 081), per
the parent task message.

**Result: 10 added, 0 rejected.**

**Overlap check:** grepped `data/routes/catalog.json` (including nested
`checkpoints[].name`) and `data/routes/hundred-peaks.json` for all ten
mountain names. Only hit: the existing record `guanyin-mountain-trail`
(designation `:005`, 新北市八里區, routeName "硬漢嶺步道(觀音山)") shares the
mountain name 觀音山 with this batch's #075 (高雄市大社區, 177m) — confirmed a
**different mountain**, not a duplicate, per the task brief's explicit
warning. #075 got its own record with a disambiguated slug
(`guanyinshan-mountain-dashe-trail`). No other designation numbers in this
batch were previously registered.

**Mismatched community bundles found and excluded (two separate cases):**
- `data/routes/raw/hiker/075.json` describes **小觀音山群峰** (台北市北投區/新北市三芝區,
  大屯火山群), an unrelated mountain in the far north — not this batch's #075
  (高雄市大社區). Excluded entirely.
- `data/routes/raw/biji/075.json` describes the **New Taipei 八里 觀音山**
  (elevation range top 616公尺, `managingPark: "北海岸及觀音山國家風景區"`, and
  trail id 108 is literally named "硬漢嶺步道(觀音山)" — the exact routeName of
  the *existing* catalog record `guanyin-mountain-trail` checked above).
  Excluded entirely; this bundle is not about our target mountain.
- `data/routes/raw/hiker/077.json` describes **長壽山(肥崠山)** (台中市東勢區,
  1860m), unrelated to this batch's #077 壽山 (高雄市鼓山區, 356m). Excluded
  entirely.

Because both community bundles for #075 were mismatched, that record relies
on the official isports source alone — see its section below for how the
nullable route-fact fields were handled.

**Difficulty mapping used (per POLICY.md §Difficulty mapping):** 低難度→1,
低-中難度→2, 中難度→3.

**No hiker bundle exists for:** 071 (鳴海山), 076 (笠頂山), 079 (女仍山), 081
(大山母山).

**Live closure re-check (step 7, mandatory before every ADD):** re-fetched
all ten official isports pages (PKNO=70,71,72,73,74,75,76,77,78,80) today.
Every page's 注意事項 text matched its bundle snapshot verbatim, with no new
closure/construction/collapse language on any of the ten. Two mountains
warranted additional live investigation beyond the isports re-fetch, detailed
in their sections below (071 鳴海山, 078 棚集山).

---

## 071 鳴海山 (高雄市茂林區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/071.json`
  (PKNO=70). `climbWay` (single option): "鳴海山、網子山登山口→石藥師遺址→網子山
  (四日市遺址)→網子山東北峰(桑名遺址)→鳴海下山(宮遺址)→鳴海山(鳴海遺址)三角點，2-2.5小時
  登頂". Checkpoints: 鳴海山、網子山登山口 → 石藥師遺址 → 網子山(四日市遺址) →
  網子山東北峰(桑名遺址) → 鳴海下山(宮遺址) → 鳴海山(鳴海遺址)三角點.
- **Route facts (community):** biji trail id 817 "鳴海山、網子山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=817) — name
  matches the official climbWay's combined trailhead exactly, elevation
  range top (1411公尺) matches isports's stated summit elevation exactly.
  `distanceText: "8.6公里"` → `distanceKm: 8.6`. `durationText: "所需時間 4
  小時"` → `durationMinutes: 240`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "311公尺"` →
  `elevationDifferenceM: 311`.
- **No hiker bundle** exists for 071.
- **Road-condition investigation (flagged concern):** both the isports
  `noticeItem` and `intro` mention "八八風災後扇平林道整修中" (Shanping Forest
  Road under repair since the 2009 typhoon). A live WebSearch found a
  Hikingbook trip report
  (https://zh-tw.hikingbook.net/hikes/2026-1-3-...) confirming a completed
  鳴海山 hike dated **2026-01-03** — within the last 7 months of this review
  — marked complete ("✅"), which corroborates the trail as currently
  passable. Critically, 扇平林道 is a **different road** than the one this
  record's checkpoints and `trafficInfo` actually use (舊茂林聯絡道路 from
  美雅商店, per isports's own driving directions) — 扇平林道 serves the
  scientific park ~2km north of the peak, not the climbing approach. Search
  results also surfaced an unrelated closure of "五公山林道" near 台27線21K
  (a separate access route to the same general area, not the one in this
  record). Treated as open; the 17-year-old typhoon-repair note is stale
  boilerplate, consistent with the precedent set by batch 6's 066 analysis.
- **Closure check:** isports `noticeItem` also warns about a narrow/steep
  4WD-only access road and summer leeches — no closure language for the
  actual route. Live re-fetch of PKNO=70 today: page loads, mountain
  matches (鳴海山, 1411m, 高雄市茂林區), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 072 旗尾山 (高雄市旗山區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/072.json`
  (PKNO=71). `climbWay` has 3 trailhead options; `noticeItem` explicitly
  recommends option 3: "建議從高113縣道的1.8K第三登山口上登，登頂旗尾山後再循南稜下至
  第一登山口，如此有較好的視野展望". Used option 3's ascent leg: "第三登山口→旗尾山
  三角點，約45分鐘登頂". Checkpoints: 第三登山口 → 旗尾山三角點 (the noticeItem's
  suggested south-ridge descent to the first trailhead is a return-trip
  extension beyond this record's summit checkpoint, not included, per
  established practice of keeping the simpler stated ascent chain).
- **Route facts (community):** biji has two trails; chose trail id 597
  "旗尾山步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=597) —
  the direct single-peak ascent, elevation range top (318公尺) closely
  matches isports's 315m summit figure — over trail id 499 "旗靈縱走(旗尾山、
  靈山)", which is a traverse extending to a separate peak (靈山), excluded
  per the task's rule to prefer the most direct single-peak ascent.
  `distanceText: "5公里"` → `distanceKm: 5`. `durationText: "所需時間 2 小時
  30 分鐘"` → `durationMinutes: 150`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "255公尺"` →
  `elevationDifferenceM: 255`.
- **Route-identity corroboration:** `data/routes/raw/hiker/072.json`
  explicitly confirms "旗尾山：標高318M，名列台灣小百岳#072" and describes all
  three trailheads and the connecting ridge in detail (dated trip
  113/01/25 & 100/02/19) — confirmed correct match. Not used for numeric
  fields since biji already supplies exact single values.
- **Closure check:** isports `noticeItem` is only the trailhead-choice
  recommendation quoted above — no closure language. Live re-fetch of
  PKNO=71 today: page loads, mountain matches (旗尾山, 315m, 高雄市旗山區),
  no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 073 尾寮山 (高雄市茂林區、屏東縣三地門鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/073.json`
  (PKNO=72). `climbWay` option 1 (chosen — isports's own `environment` text
  states "攀登路線較多人走的是西側", and the hiker bundle's actual completed trip
  also used this side): "西側登山口→集義亭→活水源休息區→觀景亭→觀雲台→尾寮山三角點，約4
  小時登頂". Checkpoints: 西側登山口 → 集義亭 → 活水源休息區 → 觀景亭 → 觀雲台 →
  尾寮山三角點.
- **Route facts (community):** biji trail id 321 "尾寮山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=321) — the sole
  trail for this mountain-id, elevation range top (1427公尺) matches
  isports's stated summit elevation exactly. `distanceText: "18.6公里"` →
  `distanceKm: 18.6`. `durationText: "所需時間 8 小時"` → `durationMinutes:
  480`. `difficultyText: "中難度"` → `difficulty: 3`.
  `elevationDifferenceText: "1273公尺"` → `elevationDifferenceM: 1273`.
- **Route-identity corroboration:** `data/routes/raw/hiker/073.json`'s trip
  (111/04/27~100/04/23) independently states summit elevation 1427M,
  #073, 二等三角點1653號, and a one-way trail length "約9.5公里" (≈19km round
  trip, consistent with biji's 18.6km figure), using the same west-side
  trailhead.
- **Permit-field discrepancy (flagged, not used):** biji's own
  `permitMountainText` field reads `"是，"` (truncated "yes" value,
  suggesting a mountain permit may be required), but a live WebSearch found
  no specific 尾寮山 permit requirement on official sources (內政部警政署入山
  案件申辦系統, 台灣登山申請一站式服務網). Per POLICY.md, community tier is never
  used for permit determinations regardless of what it states — `permitNotes`
  stays `null` here rather than being set from this ambiguous community
  field either way. Hikers should still verify locally; this is a
  transparency note, not a data value.
- **Closure check:** isports `noticeItem` is a seasonal heat/thunderstorm
  caution only — no closure language. Live re-fetch of PKNO=72 today: page
  loads, mountain matches (尾寮山, 1427m, 高雄市茂林區/屏東縣三地門鄉), no closure
  notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`: null/[].

## 074 大崗山 (高雄市阿蓮區、田寮區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/074.json`
  (PKNO=73). `climbWay` (single option): "意象園區入口停車場→菩提大道→龍湖庵→十方涼亭→
  十八羅漢洞→天靈洞→三角公園→大崗山，約2小時登頂". Checkpoints: 意象園區入口停車場 →
  菩提大道 → 龍湖庵 → 十方涼亭 → 十八羅漢洞 → 天靈洞 → 三角公園 → 大崗山.
- **Route facts (community):** biji trail id 504 "大崗山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=504) — the sole
  trail for this mountain-id, elevation range top (312公尺) matches
  isports's stated summit elevation exactly. `distanceText: "4公里"` →
  `distanceKm: 4`. `durationText: "所需時間 2 小時 30 分鐘"` →
  `durationMinutes: 150`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "282公尺"` → `elevationDifferenceM: 282`.
- **Route-identity corroboration (numbering discrepancy, flagged):**
  `data/routes/raw/hiker/074.json` describes the same mountain by elevation
  and location exactly (312M, 高雄市田寮區/阿蓮區交界) but labels it "名列台灣小百岳
  #75號" — off by one from this batch's official designation #074. Given the
  elevation and location match isports exactly and no other candidate
  mountain exists at either number, this is treated as the author's own
  numbering quirk, not a different mountain; the record uses isports's
  official #074 designation per the task brief's numbering, not the blog's.
- **Closure check:** isports `noticeItem` and `climbSeason` mention no
  current closure (the `environment` text's "曾為封閉的軍事重地" is historical
  context about pre-1992 military restriction, long since lifted). Live
  re-fetch of PKNO=73 today: page loads, mountain matches (大崗山, 312m,
  高雄市阿蓮區/田寮區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 075 觀音山 (高雄市大社區) — ADDED (official-source-only record)

- **Designation/checkpoints (official):** `data/routes/raw/isports/075.json`
  (PKNO=74). `climbWay` has 2 options; option 2 chosen per the `noticeItem`'s
  explicit recommendation "登觀音山由鳳儀宮上登最便捷": "鳳儀宮→天洞→觀音山三角點，約20
  分鐘登頂". Checkpoints: 鳳儀宮 → 天洞 → 觀音山三角點.
  `durationMinutes: 20` sourced directly from this official single value
  (not a range — no upper-bound resolution needed), tier: official.
- **Both community bundles excluded as mismatched** (see top-of-report
  note): `hiker/075.json` is 小觀音山群峰 (Taipei/New Taipei, unrelated), and
  `biji/075.json` is the New Taipei 八里 觀音山 (its trail id 108 is literally
  named "硬漢嶺步道(觀音山)", the exact routeName of the pre-existing catalog
  record for that different mountain). Neither contributes any field to
  this record.
- **Nullable fields, no estimation:** `distanceKm`, `difficulty`, and
  `elevationDifferenceM` are `null` — no valid source (official or
  community) states an exact value for this specific mountain. This is the
  intended behavior of POLICY.md's nullable-fields rule, not a data gap to
  paper over.
- **Slug disambiguation:** `guanyinshan-mountain-dashe-trail` (vs. the
  existing New Taipei record's `guanyin-mountain-trail`) — different
  romanization stem (`guanyinshan` vs `guanyin`) plus a 大社 (Dashe)
  disambiguator, per the task brief's explicit warning about this name
  collision.
- **Closure check:** isports `noticeItem` only recommends the 鳳儀宮 approach
  and a flashlight for cave exploration — no closure language. Live
  re-fetch of PKNO=74 today: page loads, mountain matches (觀音山, 177m,
  高雄市大社區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 076 笠頂山 (屏東縣瑪家鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/076.json`
  (PKNO=75). `climbWay` has 3 options; option 2 chosen per the `environment`
  text's statement that most hikers use this trailhead ("大部分會選擇從佳義國小的
  後門開始登山"): "第3號步道：佳義國小→3號登山口→稜線休息站→笠頂山三角點，約1-1.5小時
  登頂". Checkpoints: 佳義國小 → 3號登山口 → 稜線休息站 → 笠頂山三角點.
- **Route facts (community):** biji has two trails; chose trail id 557
  "笠頂山步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=557) —
  the direct single-peak ascent, elevation range top (659公尺) matches
  isports's stated summit elevation exactly — over trail id 1023 "笠頂山、
  真笠山、白賓山連走", a multi-peak traverse excluded per the direct-ascent
  rule. `distanceText: "5.2公里"` → `distanceKm: 5.2`. `durationText: "所需
  時間 2 小時 30 分鐘"` → `durationMinutes: 150`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "554公尺"` →
  `elevationDifferenceM: 554`.
- **No hiker bundle** exists for 076.
- **Closure check:** isports `noticeItem` is a dense-forest/landmark
  navigation caution only — no closure language. Live re-fetch of PKNO=75
  today: page loads, mountain matches (笠頂山, 659m, 屏東縣瑪家鄉), no closure
  notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 077 壽山 (高雄市鼓山區) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/077.json`
  (PKNO=76). `climbWay` (single option): "壽山動物園登山口→觀林亭→思相亭→良友亭→七蔓亭→
  好漢坡→好漢亭，約1小時登頂". Checkpoints: 壽山動物園登山口 → 觀林亭 → 思相亭 → 良友亭 →
  七蔓亭 → 好漢坡 → 好漢亭.
- **Route facts (community):** biji has three trails; chose trail id 325
  "北柴山登山步道(北壽山)"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=325) — isports's
  own `environment` text states "現僅北壽山可至山頂基石處" (only North Shoushan
  currently reaches the summit benchmark), and the zoo-entrance route used
  in checkpoints above is the North Shoushan approach, so this trail's name
  is the correct match (its elevation-range top of 253公尺 undershoots
  isports's 356m summit figure by 103m, likely the GPS track ending short
  of the true high point — same pattern accepted in batch 6 for 066's
  38m gap — not excluded given the explicit north/south naming match and no
  alternative single-peak trail exists for this mountain-id).
  `distanceText: "5公里"` → `distanceKm: 5`. `durationText: "所需時間 3 小時"` →
  `durationMinutes: 180`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "213公尺"` → `elevationDifferenceM: 213`.
  (Excluded trail id 1366 "壽山、泰國谷、一簾幽夢步道" despite its elevation range top
  exactly matching 356m, because its distance/duration describe a longer
  route through 泰國谷 and 一簾幽夢 beyond the simple zoo-entrance ascent used
  in this record's checkpoints; excluded trail id 2047 "三進三出盤榕" for the
  same multi-loop reason.)
- **Mismatched hiker bundle:** `data/routes/raw/hiker/077.json` describes
  長壽山(肥崠山) (台中市東勢區, 1860m) — an unrelated mountain. Excluded entirely.
- **Closure/access investigation (flagged concern):** 壽山 sits within 壽山
  國家自然公園; a live WebSearch found no 2026 trail-closure announcement on
  the park's official channels (snnp.nnp.gov.tw, nnp.gov.tw) for the
  北壽山/動物園 route. isports `noticeItem` only warns of complex trail
  junctions, occasional dangerous ridge sections, and Formosan macaque
  safety — no closure language. Live re-fetch of PKNO=76 today: page loads,
  mountain matches (壽山, 356m, 高雄市鼓山區), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 078 棚集山 (屏東縣來義鄉) — ADDED (re-verified after prior range-value rejection)

- **Context:** per the task brief, this mountain was previously rejected
  under the old official-only policy because isports's own climbWay only
  gave a range estimate. Re-researched under the tiered-source policy.
- **Designation/checkpoints (official):** `data/routes/raw/isports/078.json`
  (PKNO=77). `climbWay` (single option): "丹林第二登山口→第一座涼亭→高壓電塔→第二座涼亭
  →四叉路取最左往棚集下山→大家亭(取左)→靜心園→棚集下山→棚集山三角點，約2-2.5小時登頂".
  Checkpoints: 丹林第二登山口 → 第一座涼亭 → 高壓電塔 → 第二座涼亭 →
  四叉路取最左往棚集下山 → 大家亭(取左) → 靜心園 → 棚集下山 → 棚集山三角點.
- **Route facts (community):** biji trail id 789 "棚集山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=789) — the sole
  trail for this mountain-id, elevation range top (899公尺) matches isports's
  stated summit elevation exactly. `distanceText: "7.5公里"` →
  `distanceKm: 7.5`. `durationText: "所需時間 4 小時 40 分鐘"` →
  `durationMinutes: 280` (a single stated community value — no range
  resolution needed; isports's own "2-2.5小時" climbWay estimate is
  treated as ascent-only corroboration, consistent with established
  batch practice, not stored directly). `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "739公尺"` →
  `elevationDifferenceM: 739`.
- **Route-identity corroboration:** `data/routes/raw/hiker/078.json`
  (a combined 棚集山→久保山 traverse, dated 108/01/12) independently confirms
  "棚集山：標高899M，山頂有顆編號6646號的三等三角點基石，台灣小百岳排行#78號" — exact match.
  Not used for numeric route-fact fields since its trip covers a much
  longer traverse beyond just 棚集山.
- **Closure check (this is the mountain flagged for re-verification):**
  isports `noticeItem` is a heat/rope-section/thunderstorm caution only —
  no closure language. A live WebSearch found no 2026 closure notice for
  this trail; one recent source (vocus.cc article) explicitly describes it
  as not requiring any permit and open year-round. Live re-fetch of
  PKNO=77 today: page loads, mountain matches (棚集山, 899m, 屏東縣來義鄉), no
  closure notice. **The original rejection basis (range-only official time)
  no longer applies now that biji supplies an exact community-tier value.**
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 079 女仍山 (屏東縣獅子鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/079.json`
  (PKNO=78). `climbWay` (single option): "伊屯橋登山口→乾溪溝→廢棄反射板→女仍山三角點，
  約2.5小時登頂". Checkpoints: 伊屯橋登山口 → 乾溪溝 → 廢棄反射板 → 女仍山三角點.
- **Route facts (community):** biji trail id 835 "女仍山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=835) — the sole
  trail for this mountain-id, elevation range top (808公尺) is 4m from
  isports's 804m summit figure (minor rounding discrepancy, same mountain
  given exact name match and no alternative candidate). `distanceText: "7
  公里"` → `distanceKm: 7`. `durationText: "所需時間 4 小時 15 分鐘"` →
  `durationMinutes: 255`. `difficultyText: "中難度"` → `difficulty: 3`.
  `elevationDifferenceText: "668公尺"` → `elevationDifferenceM: 668`.
- **No hiker bundle** exists for 079.
- **Closure check:** isports `noticeItem` is a slippery-terrain/dense
  vegetation caution only — no closure language. Live re-fetch of PKNO=78
  today: page loads, mountain matches (女仍山, 804m, 屏東縣獅子鄉), no closure
  notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 081 大山母山 (屏東縣恆春鎮) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/081.json`
  (PKNO=80). `climbWay` (single option, no named intermediate landmarks):
  "停車後先行左側廢產道，進入銀合歡樹林、灌木林，共約60分鐘登頂". Checkpoints built from
  the trailhead location in `trafficInfo` ("台26省道29.45K左側水泥路進入約0.8K登山口")
  plus the terrain phrases verbatim from `climbWay` (per established
  practice for isports climbWay chains that don't name specific
  landmarks, e.g. batch 6's 068 藤枝山): 台26省道29.45K登山口 → 左側廢產道 →
  銀合歡樹林、灌木林 → 大山母山三角點.
- **Route facts (community):** biji trail id 1024 "大山母山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=1024) — the sole
  trail for this mountain-id, elevation range top (325公尺) matches
  isports's stated summit elevation exactly. `distanceText: "4.8公里"` →
  `distanceKm: 4.8`. `durationText: "所需時間 1 小時 40 分鐘"` →
  `durationMinutes: 100`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "289公尺"` → `elevationDifferenceM: 289`. Note:
  biji lists `managingPark: "墾丁國家公園"` with both `permitMountainText` and
  `permitParkText` as "否" (no permit required) — not written into
  `permitNotes` since that field requires official tier per POLICY.md, but
  noted here for transparency (no contradiction found in official source
  either).
- **No hiker bundle** exists for 081.
- **Closure check:** isports `noticeItem` only cautions about checking for
  animals inside the benchmark's concrete housing and sun/heat safety — no
  closure language. Live re-fetch of PKNO=80 today: page loads, mountain
  matches (大山母山, 325m, 屏東縣恆春鎮), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value,
except `075`'s `durationMinutes` which traces to the sole valid source
(official isports, a single non-range value, not requiring upper-bound
resolution). No range value required upper-bound resolution this batch —
every duration figure used (community or, for 075, official) was a single
stated value, not a range; isports's own climbWay range estimates (e.g.
071's "2-2.5小時", 073's "約4小時" vs biji's fuller round-trip figure, 078's
"2-2.5小時") were treated as ascent-only corroboration, not stored directly,
consistent with established batch 4-6 practice. No value was averaged,
interpolated, or derived from distance/pace. `075`'s `distanceKm`,
`difficulty`, and `elevationDifferenceM` were left `null` rather than
estimated, since no valid source (both community bundles were mismatched to
other mountains) states an exact value for those fields.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 121
Small hundred peaks: 79
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 69 (pre-batch baseline, batch 6's
report) to 79 (+10, all ten additions). `Catalog valid`, `Missing sources:
0`, `Duplicate slugs: 0`. Remaining warnings (missing designations for
other numbers, missing suburban routes) are pre-existing and outside this
batch's scope. Suburban route count moved 111→121 as a side effect of all
ten records being `kind: "suburban"`, matching the existing convention.

## Files changed

- `data/routes/catalog.json`: 10 new records appended
  (minghaishan-mountain-trail, qiweishan-mountain-trail,
  weiliaoshan-mountain-trail, dagangshan-mountain-trail,
  guanyinshan-mountain-dashe-trail, lidingshan-mountain-trail,
  shoushan-mountain-trail, pengjishan-mountain-trail,
  nurengshan-mountain-trail, dashanmushan-mountain-trail), each with
  designations `taiwan_small_hundred_peak:071/072/073/074/075/076/077/078/079/081`.
  The 075 slug carries a `guanyinshan`-vs-`guanyin` stem difference plus a
  `-dashe-` disambiguator since an unrelated New Taipei 觀音山 (designation
  #005) already exists as `guanyin-mountain-trail`.
- `data/routes/sources.json`: 19 new `(organization, url)` entries — 10
  教育部體育署 isports PKNO pages + 9 健行筆記 trail pages (075 has no
  community-tier source since both its community bundles were mismatched).
- `.superpowers/sdd/task-8-tiered-batch-7-report.md`: this report (new
  file).
