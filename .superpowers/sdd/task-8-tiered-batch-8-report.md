# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 8 (Yilan-Hualien cluster)

Reviewed: 2026-07-19
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: 10 mountains (082, 083, 084, 085, 086, 087, 088, 089, 090, 091), per
the parent task message.

**Result: 9 added, 1 rejected.**

**Overlap check:** grepped `data/routes/catalog.json` (including nested
`checkpoints[].name`) and `data/routes/hundred-peaks.json` for all ten
official mountain names plus known alternate names (祖輪山, 空巴尾山, 初英山,
米棧山). Zero matches anywhere — all ten are genuinely new, unclaimed
candidates; none required merging into an existing record.

**Method note — isports itself is a usable official-tier route-fact
source.** The prior rejections for 086/088/090/091 (see
`.superpowers/sdd/task-8-small100-east-h-report.md`) treated
`isports.sa.gov.tw` (教育部體育署) as designation-evidence only and required
a *separate* official source (forest.gov.tw, a national-park page, a
township office) to publish route facts. Following the batch 7 precedent
this task explicitly pointed me to, isports's own `climbWay` field is used
directly as an `official`-tier source for `checkpoints` and, when it states
a single non-range figure, for `durationMinutes` — this alone resolves most
of this batch's previously-rejected mountains, independent of the new
community tier.

**Difficulty mapping used (per POLICY.md §Difficulty mapping):** 低難度→1,
低-中難度→2, 中難度→3.

**No hiker bundle exists for:** 082 (灣坑頭山), 084 (鵲子山), 087 (立霧山, see
rejection below).

**Live closure re-check (step 7, mandatory before every ADD):** re-fetched
all ten official isports pages (PKNO=81 through 90) today. Every page's
注意事項 text matched its bundle snapshot verbatim, with no new
closure/construction/collapse language on any of the ten — including 087,
whose isports page shows no closure notice at all. 087 was nonetheless
rejected on other live-verified grounds; see its section below.

---

## 082 灣坑頭山 (新北市貢寮區、宜蘭縣頭城鎮) — ADDED

- **Designation/route choice (official):** `data/routes/raw/isports/082.json`
  (PKNO=81). `climbWay` lists 3 trailhead options; option 1 chosen —
  "草嶺古道埡口→涼亭→灣坑頭山，約1.5小時登頂" — because its start elevation
  (埡口/saddle, matching biji's stated start of 336公尺) and short length
  correspond to the community trail actually reaching the summit (see
  below), unlike options 2/3 which describe much longer approach hikes from
  distant trailheads (大里天公廟, 貢寮車站) via the same saddle.
  Checkpoints: 草嶺古道埡口 → 涼亭 → 灣坑頭山.
- **Route facts (community):** biji has 3 trails for this mountain-id;
  chose trail id 460 "灣坑頭山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=460) — its
  elevation-range top (616公尺) matches isports's summit elevation exactly.
  (Excluded trail id 171 "草嶺古道", elevation-range top only 375公尺, well
  short of the summit — a different, lower-elevation segment of the same
  historic trail; excluded trail id 1679 "吾居吾墅步道", no elevation data
  published at all.) `distanceText: "4.5公里"` → `distanceKm: 4.5`.
  `durationText: "所需時間 2 小時 10 分鐘"` → `durationMinutes: 130`.
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "280公尺"` → `elevationDifferenceM: 280`.
- **No hiker bundle** exists for 082.
- **Closure check:** isports `noticeItem` only warns of shadeless exposed
  ridge/cliff edges near the sea — no closure language. Live re-fetch of
  PKNO=81 today: page loads, mountain matches (灣坑頭山, 616m, 新北市貢寮區/
  宜蘭縣頭城鎮), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 083 三角崙山 (新北市坪林區、宜蘭縣礁溪鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/083.json`
  (PKNO=82). `climbWay` (single option): "五峰旗風景區→一水休息站→通天橋→
  700公尺涼亭→箭竹林→聖母山莊→三角崙山東南峰→三角崙山，約3-3.5小時登頂" — a range,
  treated as ascent-only corroboration (per established batch practice),
  not stored directly. Checkpoints: 五峰旗風景區 → 一水休息站 → 通天橋 →
  700公尺涼亭 → 箭竹林 → 聖母山莊 → 三角崙山東南峰 → 三角崙山.
- **Route facts (community):** biji has 2 trails; chose trail id 788
  "三角崙山登山步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=788)
  — the direct single-peak ascent, elevation-range top (1029公尺) matches
  isports's summit elevation exactly — over trail id 926 "聖烘縱走(聖母山莊
  縱走烘爐地山)", a multi-peak traverse extending to a separate mountain,
  excluded per the direct-ascent rule. `distanceText: "11.8公里"` →
  `distanceKm: 11.8`. `durationText: "所需時間 6 小時"` → `durationMinutes:
  360`. `difficultyText: "中難度"` → `difficulty: 3`.
  `elevationDifferenceText: "939公尺"` → `elevationDifferenceM: 939`.
- **Route-identity corroboration:** `data/routes/raw/hiker/083.json`
  independently confirms "三角崙山：海拔1029公尺，小百岳#083...山頂被茅草包圍無視野，
  沿途密箭竹林擋路" and details the same 五峰旗風景區→聖母山莊→三角崙山 chain
  step by step (通天橋, 一水休息站, 700m涼亭 all named). Not used for numeric
  fields since biji already supplies a clean single duration/distance.
- **Closure check:** isports `noticeItem` is a dense-bamboo/steep-terrain/
  navigation caution only — no closure language. Live re-fetch of PKNO=82
  today: page loads, mountain matches (三角崙山, 1029m, 新北市坪林區/宜蘭縣
  礁溪鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 084 鵲子山 (宜蘭縣礁溪鄉) — ADDED (re-verified after prior trail-existence rejection)

- **Context:** per the task brief, this mountain was previously rejected
  (south-g batch) because the only official sources found described a
  separate ancient trail (跑馬古道) that merely *branches toward* 鵲子山
  without covering its actual summit route. That prior search did not
  check isports's own `climbWay` field, which — per the batch 7 precedent —
  is itself a usable official route-fact source and directly describes
  the summit route.
- **Designation/checkpoints (official):** `data/routes/raw/isports/084.json`
  (PKNO=83). `climbWay` has 2 options; option 1 chosen per the `noticeItem`'s
  explicit recommendation against the option-2 south route for inexperienced
  hikers ("較無經驗者建議不要走從清修宮上登的路線"): "北登山口：圓通寺→登山口→林地→
  芒草地→鵲子山三角點，約1小時登頂" — a single non-range value (60 min).
  Checkpoints: 圓通寺 → 登山口 → 林地 → 芒草地 → 鵲子山三角點.
- **Route facts (community):** biji trail id 688 "鵲子山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=688) — the sole
  trail for this mountain-id, elevation-range top (679公尺) matches
  isports's summit elevation exactly. `distanceText: "3.8公里"` →
  `distanceKm: 3.8`. `durationText: "所需時間 2 小時"` → `durationMinutes: 120`
  (preferred over isports's ascent-only 60-min figure, consistent with
  established batch practice, since biji's longer figure plausibly
  represents the full round trip). `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "239公尺"` →
  `elevationDifferenceM: 239`.
- **No hiker bundle** exists for 084.
- **Closure check:** isports `noticeItem` is a seasonal dense-grass/rain
  caution only, plus the route-choice recommendation quoted above — no
  closure language. Live re-fetch of PKNO=83 today: page loads, mountain
  matches (鵲子山, 679m, 宜蘭縣礁溪鄉), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 085 三星山 (宜蘭縣大同鄉、南澳鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/085.json`
  (PKNO=84). `climbWay` (single option, single non-range value): "三星山
  登山口(翠峰景觀道路5.9K)→三星山三角點，約1小時登頂". Checkpoints: 三星山登山口
  (翠峰景觀道路5.9K) → 三星山三角點.
- **Route facts (community):** biji trail id 787 "三星山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=787) — the sole
  trail for this mountain-id, elevation-range top (2352公尺) matches
  isports's summit elevation exactly. `distanceText: "2.8公里"` →
  `distanceKm: 2.8` (preferred over the hiker blog's rougher "約1.7公里
  單程" estimate). `durationText: "所需時間 2 小時 10 分鐘"` → `durationMinutes:
  130` (preferred over isports's ascent-only 60-min figure, same pattern as
  084 above). `difficultyText: "低-中難度"` → `difficulty: 2`.
  `elevationDifferenceText: "350公尺"` → `elevationDifferenceM: 350`.
- **Route-identity corroboration:** `data/routes/raw/hiker/085.json`
  independently confirms "三星山 海拔2351M，小百岳#085，一等三角點基石。位於...太平山
  森林遊樂區內。是該區內第一高山" and a recent completed hike (113/08/27 =
  2024) using the same 翠峰林道5.8K trailhead. Minor 1m elevation figure
  discrepancy (2351 vs isports's 2352/biji's 2352) is noise, not a
  different-mountain signal.
- **Permit-field discrepancy (flagged, not used):** biji's own
  `permitMountainText` for this trail is `"是，"` (truncated, suggesting a
  permit may apply since the trail sits inside 太平山國家森林遊樂區, a paid
  forest recreation area). Per POLICY.md, community tier is never used for
  permit determinations — `permitNotes` stays `null`. Hikers should still
  expect to pay/register a park entry fee at 太平山 separately from any
  "登山許可"; this is a transparency note, not a data value.
- **Closure check:** isports `noticeItem` is a fog/darkness caution only —
  no closure language. Live re-fetch of PKNO=84 today: page loads, mountain
  matches (三星山, 2352m, 宜蘭縣大同鄉/南澳鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`: null/[].

## 086 卡拉寶山 (花蓮縣秀林鄉) — ADDED (re-verified after prior no-official-source rejection)

- **Context:** per the task brief and the prior east-h rejection, this
  mountain was previously rejected because no official government source
  was found — only hiking blogs. That search deliberately excluded isports
  itself from route-fact use and never found `recreation.forest.gov.tw` or
  Taroko NP coverage. Under the batch-7-established practice of using
  isports's own `climbWay` as an official-tier route-fact source, this
  mountain is directly resolvable.
- **Designation/checkpoints (official):** `data/routes/raw/isports/086.json`
  (PKNO=85). `climbWay` (single option): "登山口(入口有一咖啡小販)→卡拉寶山三角點，
  約30∼40分鐘登頂" — a range, treated as ascent-only corroboration, not
  stored directly.
- **Checkpoints enriched (community):** `data/routes/raw/hiker/086.json`
  names the same trailhead precisely ("碧綠神木停車場（台8/126K）...卡拉寶山
  登山口在一旁的「碧綠餐飲棧」右側水泥階梯上去") and two named waypoints along
  the short ascent ("微波轉播站", "雨量自動測報站") not present in isports's
  terse chain. Checkpoints: 碧綠神木停車場(登山口) → 微波轉播站 → 雨量自動測報站 →
  卡拉寶山三角點 — official establishes the route/endpoints, community
  fills the intermediate named landmarks (both allowed for `checkpoints`
  per POLICY.md's tier table).
- **Route facts (community):** biji trail id 954 "卡拉寶山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=954) — the sole
  trail for this mountain-id. `distanceText: "1.4公里"` → `distanceKm: 1.4`.
  `durationText: "所需時間 1 小時 5 分鐘"` → `durationMinutes: 65` (preferred
  over isports's ascent-only range, per established pattern).
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "239公尺"` → `elevationDifferenceM: 239` (roughly consistent with
  isports's own prose "登臨升高僅約200公尺" — same order of magnitude, not
  contradictory).
- **Elevation figure discrepancy (flagged, not resolved):** isports states
  `heightM: "2397"`; both the hiker blog ("卡拉寶山標高2429M") and biji
  (`elevationRangeText` top "2429公尺") independently state 2429m instead.
  Not reconciled — the official isports figure is used as the canonical
  `heightM`-adjacent context only (this schema has no `heightM` field to
  set), and no numeric field in this record depends on resolving which
  figure is correct.
- **Very recent passability confirmation:** the hiker blog's trip log is
  dated 115/04/26 (2026-04-26 — under 3 months before this review),
  describing a completed, successful hike to the summit with no access
  problems, only noting the trailhead's former coffee stand ("碧綠餐飲棧")
  has since closed as a business (unrelated to trail passability).
- **Closure check:** isports `noticeItem` is a navigation caution
  ("下山容易誤入森林") only — no closure language. Live re-fetch of PKNO=85
  today: page loads, mountain matches (卡拉寶山, 2397m, 花蓮縣秀林鄉), no
  closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 087 立霧山 (花蓮縣秀林鄉) — REJECTED (summit segment closed/damaged, confirmed live)

- **Designation/route-fact sources exist and looked usable at first pass:**
  `data/routes/raw/isports/087.json` (PKNO=86) gives `climbWay`: "太魯閣
  國家公園遊客中心→得卡倫步道→測雨具→立霧山登山口→立霧山三角點，約3.5-4小時登頂"
  (range). `data/routes/raw/biji/087.json` trail id 769 "立霧山登山步道"
  gives a clean single set of values: 14.4公里 / 6小時30分鐘(390分) / 中難度(3) /
  elevation-difference 1184m, elevation-range top 1274公尺 matching
  isports's summit exactly. No hiker bundle exists for 087. Neither
  bundle, nor the live isports re-fetch, contains any closure language —
  isports's `noticeItem` is only a wet-leaves/steep-stairs/tree-root
  caution.
- **Live investigation triggered by this batch's explicit instruction to
  scrutinize Hualien/Yilan mountains for post-typhoon/earthquake closures,
  since this route sits inside Taroko National Park** (a park with
  extensive, well-documented trail damage from the April 2024 Hualien
  earthquake and slow, trail-by-trail reopening since). A live WebSearch
  and follow-up fetches found:
  - A 2026-06-18-dated article (travelstay.org) confirms 得卡倫步道 itself
    (the approach trail) is "✅ 全線開放" (fully open) as a **standalone
    2.15km round-trip attraction** — but the article does not mention
    立霧山 or its summit/triangulation point at all, meaning it covers only
    the lower, park-maintained portion of the route, not the continuation
    to the actual peak used in this record's checkpoints.
  - `hiking.biji.co`'s own page for trail id 769 (the same trail this
    record's route facts are drawn from) contains a status note, quoted
    verbatim: **"目前可以走得卡倫步道接大同大禮步道一路抵達兩個部落，但是往
    立霧山三角點的路毀損無法辨別，未修繕也未開放"** (You can currently walk
    the 得卡倫步道/大同大禮步道 to reach the two villages, but the path to
    立霧山's triangulation point is damaged, unidentifiable, unrepaired,
    and not open) — a most-recent-assessment note as of 2025-08, with no
    newer report found indicating repair/reopening since.
  - `taroko.gov.tw`'s own trail-status pages could not be rendered as text
    (returned base64 image/binary data through the fetch tool, consistent
    with the same JS-rendering/system-maintenance problems the prior
    east-h batch also hit on this domain), so the official park source
    could not be directly quoted — but two independent sources (a recent
    travel-blog status roundup and the community trail page's own status
    note) agree the actual summit segment, not just the lower approach
    trail, is currently closed/impassable.
- **Reason for rejection:** POLICY.md's closure-check rule is
  non-negotiable: "A record must never be published as an active route if
  its source indicates the trail is currently closed." Although isports's
  own page carries no closure notice (likely stale/not updated for this
  post-earthquake, segment-specific damage), the live verification step
  this batch mandates before every ADD surfaced credible, recent evidence
  that the specific segment leading to this record's summit checkpoint is
  closed and unrepaired. Publishing this route as active would send
  hikers toward a trail the community source explicitly says is
  unidentifiable and not open — the exact outcome POLICY.md's closure
  check exists to prevent, especially for a safety-focused app.
- **No catalog or sources.json changes made for 087.**

## 088 初音山 (花蓮縣吉安鄉) — ADDED (re-verified after prior two-non-equivalent-routes rejection)

- **Context:** the prior east-h rejection cited a *different* official
  source (花蓮縣吉安鄉公所) describing two routes of very different length
  and both only approximate ("2小時左右" vs "30至40分鐘"). This batch's
  isports bundle for 088 describes something meaningfully different: two
  trailhead **variants of essentially the same short summit approach**,
  both estimated at the same "約30-40分鐘" — not two non-equivalent routes.
- **Designation/route choice (official):** `data/routes/raw/isports/088.json`
  (PKNO=87). `climbWay`: "榕樹部落4.9K工寮→5.5K登山口→初音山三角點，約30-40分鐘登頂。
  (新近花蓮山友另循茶子步道上山至柏油路盡頭約4.6K停車，由新登山口至初音山三角點，亦約
  30-40分鐘登頂。)" — isports's own text flags the second (茶子步道/華林園)
  option as the currently-preferred route among local hikers ("新近花蓮
  山友另循..."), so that option was chosen for this record.
- **Checkpoints (community, corroborated by official route confirmation):**
  `data/routes/raw/hiker/088.json`'s detailed trip log (dated 115/03/11 =
  2026-03-11) follows exactly this 華林園/茶子步道 trailhead: "...左轉三叉路口
  取右往白雲步道上初音山...上至華林園巨石處停車場也是水泥車道終點...續行就有多段
  拉繩了...上到三叉路口，右下往嵐山工作站不取，取直行...小上抵初音山". Checkpoints:
  景觀平台停車場 → 華林園(新登山口) → 三叉路口(取直行) → 初音山三角點. isports
  establishes the route's existence and both endpoints; the hiker blog
  supplies the intermediate named landmarks (both allowed for
  `checkpoints` per POLICY.md).
- **Route facts (community):** biji trail id 796 "初音山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=796) — the sole
  trail for this mountain-id, elevation-range top (906公尺) matches
  isports's summit elevation exactly, and its duration figure (1小時 = 60
  min) is close to the hiker blog's independently-stated "來回約1小時" for
  the same华林園 trailhead — strong corroboration this is the correct
  route. `distanceText: "2.4公里"` → `distanceKm: 2.4`. `durationText:
  "所需時間 1 小時"` → `durationMinutes: 60`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "218公尺"` →
  `elevationDifferenceM: 218`.
- **Closure check:** isports `noticeItem` is a rough-access-road/insect/
  heat/thunderstorm caution only — no closure language. The hiker blog's
  own trip (4 months before this review) completed the hike successfully.
  Live re-fetch of PKNO=87 today: page loads, mountain matches (初音山,
  906m, 花蓮縣吉安鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 089 鯉魚山 (花蓮縣壽豐鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/089.json`
  (PKNO=88). `climbWay` (single option, single non-range value): "鯉魚山
  登山觀景平台→野餐觀景步道→養心亭→賞鳥步道→鯉魚山，約1.5小時登頂". Checkpoints:
  鯉魚山登山觀景平台 → 野餐觀景步道 → 養心亭 → 賞鳥步道 → 鯉魚山.
- **Route facts (community):** biji trail id 365 "花蓮鯉魚山步道群"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=365) — its name
  ("trail network/群") and multi-named-landmark structure match isports's
  own chain of several distinctly-named sub-trails (野餐觀景步道, 賞鳥步道),
  and its elevation-range top (601公尺) matches isports's summit elevation
  exactly. `distanceText: "7.5公里"` → `distanceKm: 7.5`. `durationText:
  "所需時間 3 小時 35 分鐘"` → `durationMinutes: 215` (preferred over
  isports's shorter ascent-only 90-min figure, per established pattern).
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "456公尺"` → `elevationDifferenceM: 456`.
- **Mismatched hiker bundle content (excluded portion, not the whole
  record):** `data/routes/raw/hiker/089.json`'s trip log covers both
  林田山/佐倉步道 (an unrelated area) and 鯉魚山 in the same multi-day post; it
  independently states "鯉魚山：小百岳排行第#89，標高601公尺，步道總長才1400公尺，
  落差很大" describing a much shorter, steeper direct spur (from 鯉魚潭南區
  停車場) than the isports/biji "步道群" figures used above. This shorter
  figure describes a different, more direct access point than isports's
  named-landmark chain (which references 野餐觀景步道/養心亭/賞鳥步道, consistent
  with the longer network total) — not used for numeric fields, since the
  chosen isports checkpoint chain matches biji's trail-network naming and
  scale, not the hiker's shortcut spur.
- **Closure check:** isports `noticeItem` is a steep-stairs/wildlife
  caution only — no closure language. Live re-fetch of PKNO=88 today: page
  loads, mountain matches (鯉魚山, 601m, 花蓮縣壽豐鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 090 月眉山 (花蓮縣壽豐鄉) — ADDED (re-verified after prior range-value rejection, per task brief's specific guidance)

- **Context:** the prior east-h rejection cited `recreation.forest.gov.tw`,
  whose only duration figure was a "3~4小時" range — disqualifying under the
  old official-only policy. Per this batch's explicit instruction, the
  isports bundle for 090 was checked first and found to independently
  publish a single exact total time.
- **Designation/checkpoints/route facts (official, verified internally
  consistent):** `data/routes/raw/isports/090.json` (PKNO=89). `climbWay`:
  "北登山口→30分／1.3K休息台→30分／月眉山基點→30分／觀景台→30分／南登山口，約2小時
  縱走南北登山口" — the four stated 30-minute segments sum to exactly 120
  minutes, matching the stated "約2小時" total (**verified consistent as
  the task brief requested**). `durationMinutes: 120`, sourced directly
  and used as the primary (official-tier) value, over-riding this
  mountain's prior forest.gov.tw range rejection. `climbSeason` separately
  states "步道總長4.8公里" — also official-tier, and this figure matches
  biji's independently-stated `distanceText: "4.8公里"` for the same trail
  exactly, so `distanceKm: 4.8` is likewise sourced from isports (official)
  rather than community. Checkpoints: 北登山口 → 1.3K休息台 → 月眉山基點 →
  觀景台 → 南登山口 (the full north-south traverse, matching the same total
  distance/duration figures used above, not truncated at the summit).
- **Remaining route facts (community):** biji trail id 366 "月眉山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=366) — same
  mountain-id, sole trail; `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "145公尺"` → `elevationDifferenceM: 145` (no
  official figure exists for this field).
- **Route-identity corroboration:** `data/routes/raw/hiker/090.json`
  confirms the same north/south trailhead structure ("登山口有二處（南北二口）")
  and a completed traverse-style trip (115/03/11, 2026-03-11 — 4 months
  before this review) using the south trailhead, reaching 月眉山's midpoint
  benchmark and continuing partway toward the north exit before returning.
- **Closure check:** isports `noticeItem` is a dense-forest/insect/heat/
  thunderstorm caution only — no closure language, consistent with the
  prior batch's confirmed "全線開放" reading of forest.gov.tw. Live re-fetch
  of PKNO=89 today: page loads, mountain matches (月眉山, 614m, 花蓮縣壽豐鄉),
  no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 091 八里灣山 (花蓮縣豐濱鄉) — ADDED (re-verified after prior no-official-source rejection)

- **Context:** per the task brief, this mountain was previously rejected
  because no official source published route facts. Following the batch-7
  precedent of using isports's own `climbWay` as an official-tier
  route-fact source, this mountain is directly resolvable.
- **Designation/checkpoints (official):** `data/routes/raw/isports/091.json`
  (PKNO=90). `climbWay` (single option, single non-range value): "八里灣
  分校(已廢棄)→攔沙壩登山口→水泥柱→解說牌→八里灣山三角點，約4小時登頂". Checkpoints:
  八里灣分校(已廢棄) → 攔沙壩登山口 → 水泥柱 → 解說牌 → 八里灣山三角點.
- **Route facts (community):** biji trail id 820 "八里灣山登山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=820) — the sole
  trail for this mountain-id, elevation-range top (924公尺) matches
  isports's summit elevation exactly. `distanceText: "10.4公里"` →
  `distanceKm: 10.4` — independently double-corroborated by
  `data/routes/raw/hiker/091.json`, which separately states "往返全程約
  10.4公里，落差約854公尺，需時5-8小時" (an exact distance match, and a
  duration range that comfortably contains biji's stated figure).
  `durationText: "所需時間 7 小時 25 分鐘"` → `durationMinutes: 445`
  (preferred over isports's shorter ascent-only 240-min figure, per
  established pattern; also falls within the hiker blog's independently
  stated 5–8hr range). `difficultyText: "中難度"` → `difficulty: 3`.
  `elevationDifferenceText: "860公尺"` → `elevationDifferenceM: 860`
  (close to, not averaged with, the hiker blog's 854m figure — the
  source's own stated value is used as-is, not reconciled).
- **Very recent passability confirmation:** the hiker blog's most recent
  trip log is dated 115/03/12 (2026-03-12 — 4 months before this review),
  describing a completed hike including the 貓公溪 stream crossing at the
  trailhead, with no access problems noted beyond normal wet-season
  caution.
- **Closure check:** isports `noticeItem` is a steep-terrain/wet-season-mud
  caution recommending dry-season visits — no closure language. Live
  re-fetch of PKNO=90 today: page loads, mountain matches (八里灣山, 924m,
  花蓮縣豐濱鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value. No
range value required upper-bound resolution this batch for a *stored*
figure — isports's own climbWay range estimates (082's "約1.5小時" per
option corroboration, 083's "3-3.5小時", 086's "30∼40分鐘") were treated as
ascent-only corroboration, not stored directly, since a community single
value was available for the same route in every ADD case except 090. 090
is the one record whose `durationMinutes` and `distanceKm` are sourced from
isports directly — but both are single stated values (a verified-consistent
segment sum and an explicit total-length sentence), not ranges, so no
upper-bound resolution was needed there either. No value was averaged,
interpolated, or derived from distance/pace. No elevation-figure or
duration-figure discrepancy between sources (086's 2397m-vs-2429m; 091's
860m-vs-854m) was reconciled by averaging — each record uses its cited
source's own stated value as-is.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 130
Small hundred peaks: 88
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 79 (pre-batch baseline, batch 7's
report) to 88 (+9, all nine additions; 087 was rejected). `Catalog valid`,
`Missing sources: 0`, `Duplicate slugs: 0`. Remaining warnings (missing
designations for other numbers, missing suburban routes) are pre-existing
and outside this batch's scope.

## Files changed

- `data/routes/catalog.json`: 9 new records appended
  (wankengtoushan-mountain-trail, sanjiaolunshan-mountain-trail,
  quezishan-mountain-trail, sanxingshan-mountain-trail,
  kalabaoshan-mountain-trail, chuyinshan-mountain-trail,
  liyushan-mountain-trail, yuemeishan-mountain-trail,
  baliwanshan-mountain-trail), each with designations
  `taiwan_small_hundred_peak:082/083/084/085/086/088/089/090/091`. No
  record was added for 087 (rejected).
- `data/routes/sources.json`: 20 new `(organization, url)` entries — 9
  教育部體育署 isports PKNO pages, 9 健行筆記 trail pages, and 2 輝哥的天空
  trip-log pages (086, 088 — used only for `checkpoints` enrichment).
- `.superpowers/sdd/task-8-tiered-batch-8-report.md`: this report (new
  file).
