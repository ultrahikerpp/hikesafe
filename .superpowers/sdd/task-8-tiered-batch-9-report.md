# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 9 (final batch — outlying islands + east Taiwan)

Reviewed: 2026-07-19
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: the final 8 unresolved small-hundred-peak mountains (092, 094, 095,
096, 097, 098, 099, 100), per the parent task message.

**Result: 8 added, 0 rejected.**

**Overlap check:** grepped `data/routes/catalog.json` and
`data/routes/hundred-peaks.json` for all eight official mountain names
(萬人山, 太麻里山, 加奈美山, 巴塱衛山, 紅頭山, 雲台山, 太武山, 蛇頭山) and their
designation strings (`taiwan_small_hundred_peak:092/094/095/096/097/098/
099/100`). Zero matches anywhere before this batch's edits — all eight are
genuinely new, unclaimed candidates.

**Method note — isports itself is a usable official-tier route-fact
source.** Per the batch 7/8 precedent this task explicitly pointed me to,
`isports.sa.gov.tw`'s own `climbWay` field is used directly as an
`official`-tier source for `checkpoints` and, when it states a single
non-range figure, for `durationMinutes`. All six of the mainland-Taiwan/
east-coast mountains in this batch (092, 094, 095, 096, 097) and one of the
four outlying islands (098) were previously rejected in
`.superpowers/sdd/task-8-small100-east-h-report.md` purely because that
earlier pass never used isports's own text this way — it treated isports as
designation-evidence only. Re-checking each mountain's isports bundle
resolved every one of them.

**Difficulty mapping used (per POLICY.md §Difficulty mapping):** 低難度→1,
低-中難度→2.

**No hiker bundle exists for:** 092 (萬人山), 094 (太麻里山), 097 (紅頭山) —
confirmed missing per the task brief; isports+biji sufficed for all three.

**Live closure re-check (mandatory before every ADD):** re-fetched all
eight official isports pages (PKNO=91, 93, 94, 95, 96, 97, 98, 99) today.
Every page's 注意事項 text matched its bundle snapshot verbatim, with no
closure/storm-damage/maintenance language on any of the eight. Full detail
per-mountain below.

---

## 092 萬人山 (花蓮縣富里鄉) — ADDED (re-verified after prior no-official-source rejection)

- **Context:** the prior east-h rejection found isports's designation page
  but rejected because no *separate* official source published route
  facts, and the township office's own attraction listing didn't even
  mention the mountain. Following the batch-7/8 precedent, isports's own
  `climbWay` field resolves this directly.
- **Designation/checkpoints (official):** `data/routes/raw/isports/092.json`
  (PKNO=91). `climbWay` (single option, single non-range value): "萬人山(車停
  六十石山20號門牌前院)→登山口→萬人山三角點，約20分鐘登頂。". Checkpoints:
  萬人山(六十石山20號門牌前院) → 登山口 → 萬人山三角點.
- **Route facts (community):** biji has one trail for this mountain-id,
  trail id 361 "萬人山、六十石山步道群"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=361).
  `distanceText: "6公里"` → `distanceKm: 6`. `durationText: "所需時間 1 小時
  40 分鐘"` → `durationMinutes: 100` (preferred over isports's ascent-only
  20-min figure, per established pattern). `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "170公尺"` →
  `elevationDifferenceM: 170`.
- **Elevation-range discrepancy (flagged, not reconciled):** biji's
  `elevationRangeText` top is 964公尺, while isports's `heightM` for 萬人山
  itself is 886. The biji trail is explicitly named as a "步道群" (trail
  network) covering both 萬人山 and neighbouring 六十石山's park area, so its
  range plausibly extends to a higher point elsewhere in the shared network
  — same pattern as 089's previously-accepted "trail network" entry. Not
  reconciled; each source's own stated value is used as-is.
- **No hiker bundle** exists for 092.
- **Closure check:** isports `noticeItem` is a narrow-road/dense-grass
  caution only ("忘憂亭左下至萬人山登山口前產業道路窄小曲折不好會車" /
  "萬人山登頂前有一小段芒草區，小心防止割傷") — no closure language. Live
  re-fetch of PKNO=91 today: page loads, mountain matches (萬人山, 886m,
  花蓮縣富里鄉), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 094 太麻里山 (臺東縣金峰鄉) — ADDED (re-verified after prior no-official-source rejection; region corrected)

- **Context:** the prior east-h rejection found only general leisure-area
  descriptions (金針山休閒農業區) with no route-specific facts. isports's own
  `climbWay` field, not checked in that pass, directly resolves this.
- **Region correction:** the task brief labelled this mountain "臺東縣太麻里鄉"
  (a common colloquial label, since the 金針山 tourist area's mailing address
  is in 太麻里鄉), but isports's own `location` field states **"臺東縣金峰鄉"**,
  confirmed on live re-fetch and independently corroborated by Wikipedia
  ("太麻里山是臺灣臺東縣金峰鄉嘉蘭村的一座山...雖然金峰鄉境內金針農場的戶籍地址都是
  太麻里鄉，所以一般都稱太麻里金針山，不會講金峰鄉"). `region` is set to the
  official source's own stated value, 臺東縣金峰鄉.
- **Designation/route choice (official):** `data/routes/raw/isports/094.json`
  (PKNO=93). `climbWay` has 2 options: (1) "太麻里山的登山入口處(雙乳峰)→千禧亭→
  太麻里山三角點，約5分鐘登頂" (a short spur from the 雙乳峰 saddle trailhead);
  (2) "秀峰亭→忘憂亭→晨曦亭→曙光亭→雙乳峰→千禧亭→太麻里山，約1.5小時登頂" (the
  fuller ascent from 秀峰亭). Option 2 chosen — its distance/duration scale
  matches biji's longer trail (see below), and its checkpoint chain covers
  the same final segment as option 1 plus additional named landmarks.
  Checkpoints: 秀峰亭 → 忘憂亭 → 晨曦亭 → 曙光亭 → 雙乳峰 → 千禧亭 → 太麻里山.
- **Route facts (community):** biji has 2 trails; chose trail id 340
  "太麻里金針山木馬步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=340)
  — its elevation-range top (1340公尺) matches isports's summit elevation
  exactly (over trail id 2037, a shorter "漫遊縱谷" variant whose range top is
  only 1269公尺). `distanceText: "7公里"` → `distanceKm: 7`. `durationText:
  "所需時間 2 小時 30 分鐘"` → `durationMinutes: 150` (preferred over isports's
  ascent-only 90-min figure for option 2, per established pattern).
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "190公尺"` → `elevationDifferenceM: 190`.
- **No hiker bundle** exists for 094.
- **Closure check:** isports `noticeItem` is a fork-in-road navigation
  caution only ("小車可直接開到19K雙乳峰鞍部登山口，唯中途叉路多，請多留意指標")
  — no closure language. Live re-fetch of PKNO=93 today: page loads,
  mountain matches (太麻里山, 1340m, 臺東縣金峰鄉), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 095 加奈美山 (臺東縣大武鄉) — ADDED (re-verified after prior no-official-source rejection)

- **Context:** the prior east-h rejection found no official source at all
  (checked 大武鄉公所, 農業部臺東區農業改良場) — isports itself was never
  checked as a route-fact source in that pass.
- **Designation/checkpoints (official):** `data/routes/raw/isports/095.json`
  (PKNO=94). `climbWay` (single option, single non-range value): "勝林山與
  加奈美山產道叉路口→鐵皮屋→加奈美山三角點，約50分鐘登頂。". Checkpoints: 勝林山與
  加奈美山產道岔路口 → 鐵皮屋 → 加奈美山三角點.
- **Route facts (community):** biji has one trail for this mountain-id,
  trail id 819 "加奈美山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=819).
  `distanceText: "5公里"` → `distanceKm: 5`. `durationText: "所需時間 1 小時 30
  分鐘"` → `durationMinutes: 90` (preferred over isports's ascent-only 50-min
  figure, per established pattern). `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "70公尺"` →
  `elevationDifferenceM: 70`.
- **Route-identity and currency corroboration (not used for numeric
  fields):** `data/routes/raw/hiker/095.json`'s trip log (dated 113/12/31,
  2024-12-31) walks the identical route this record uses — starting from
  the 加津林道/勝林山 fork, down 2km to the "鐵皮工寮" (matching isports's "鐵皮
  屋" checkpoint), then up to "登頂加奈美山，立有一顆一等三角點基石". Separately,
  isports's own `environment` field states explicitly that the *old* routes
  via 富南林道/富山林道 "如今林道崩壞久無人跡" (now collapsed and long unused) and
  that today's route goes via 加津林道→勝林山→加奈美山 instead — i.e. the
  official text itself confirms the route this record uses is the current,
  non-deprecated one, and the old, now-impassable routes are a different,
  unrelated path not used here.
- **Adjacent-peak caution (not this mountain):** both the isports
  `environment` text and the hiker blog independently warn that the nearby
  勝林山 (passed at the fork, not summited) is a military-restricted area
  ("屬軍事管制區/禁止進入"). This record's checkpoints only reach the
  fork/junction near 勝林山, never its summit, so this restriction does not
  apply to the route added here.
- **Closure check:** isports `noticeItem` is a navigation/landmark caution
  only — no closure language. Live re-fetch of PKNO=94 today: page loads,
  mountain matches (加奈美山, 780m, 臺東縣大武鄉), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 096 巴塱衛山 (臺東縣大武鄉) — ADDED (re-verified after prior no-official-source rejection)

- **Context:** the prior east-h rejection found only elevation/facility
  descriptions (ttdares.gov.tw) with no distance/duration/checkpoint data.
- **Designation/checkpoints (official):** `data/routes/raw/isports/096.json`
  (PKNO=95). `climbWay`: "巴塱衛山停車場→巴塱衛山三角點，可開車直達三角點旁。" — no
  duration stated (drive-up mountain). Checkpoints: 巴塱衛山停車場 → 巴塱衛山
  三角點.
- **Route facts (community):** biji has one trail for this mountain-id,
  trail id 798 "巴塱衛山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=798) — elevation-
  range top (325公尺) matches isports's summit elevation exactly, confirming
  this is a very short walk from a drive-up parking area, consistent with
  isports's own "可開車直達" description. `distanceText: "0.1公里"` →
  `distanceKm: 0.1`. `durationText: "所需時間 2 分鐘"` → `durationMinutes: 2`
  (the only duration figure available, since isports states none).
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "297公尺"` → `elevationDifferenceM: 297`.
- **Route-identity corroboration:** `data/routes/raw/hiker/096.json`'s trip
  log (dated 113/12/31, 2024-12-31) confirms the same parking-to-summit
  structure: "09:19...宮前水泥小產業道路左上即為巴塑衛山登山口...09:41 抵巴塱衛山
  山頂，有一戶農家。山頂建有觀景亭二座...觀景台下的草皮上有顆三角點".
- **Closure check:** isports `noticeItem` is a road-navigation caution only
  — no closure language. Live re-fetch of PKNO=95 today: page loads,
  mountain matches (巴塱衛山, 325m, 臺東縣大武鄉), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 097 紅頭山 (臺東縣蘭嶼鄉, Lanyu/Orchid Island) — ADDED (re-verified after prior no-official-source rejection)

- **Context:** the prior east-h rejection confirmed `recreation.forest.gov.tw`
  has no Lanyu coverage, and 蘭嶼鄉公所/東部海岸國家風景區管理處 only publish
  cultural/scenic description, not a trail-data page — but that pass never
  checked isports's own `climbWay` field as a route-fact source.
- **Designation/checkpoints (official):** `data/routes/raw/isports/097.json`
  (PKNO=96). `climbWay` (single option, single non-range value): "椰油國小側
  椰油幹線59號電線桿旁登山口→循山間小徑上登→稜線鞍部→紅頭山三角點，約2小時登頂。".
  Checkpoints: 椰油國小側椰油幹線59號電線桿旁登山口 → 稜線鞍部 → 紅頭山三角點
  ("循山間小徑上登" is a directional connector, not a landmark, and is
  omitted from the checkpoint list per established convention).
- **Route facts (community):** biji has one trail for this mountain-id,
  trail id 822 "紅頭山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=822) — elevation-
  range top (552公尺) matches isports's summit elevation exactly.
  `distanceText: "4.8公里"` → `distanceKm: 4.8`. `durationText: "所需時間 4
  小時"` → `durationMinutes: 240` (preferred over isports's ascent-only
  120-min figure, per established pattern). `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "528公尺"` →
  `elevationDifferenceM: 528`.
- **No hiker bundle** exists for 097.
- **Outlying-island scrutiny:** confirmed (per the prior rejection report)
  that `recreation.forest.gov.tw` has zero Lanyu coverage. A live WebSearch
  for recent closure/collapse news specific to this trail
  ("紅頭山 蘭嶼 登山步道 封閉 OR 坍方 2025 2026") returned no results
  indicating any closure — absence of negative evidence, not definitive
  proof, but no source (bundle or live) surfaced any access restriction.
- **Closure check:** isports `noticeItem` is a navigation-skill caution
  only ("須有十足定位能力及攀爬能力") — no closure language. Live re-fetch of
  PKNO=96 today: page loads, mountain matches (紅頭山, 552m, 臺東縣蘭嶼鄉),
  notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 098 雲台山 (連江縣南竿鄉, Matsu/Nangan) — ADDED (re-verified after prior nullable-fields rejection; resolved by new tiered policy + isports climbWay)

- **Context:** the prior east-h rejection was made entirely under the OLD
  policy, which required non-null `distanceKm`/`durationMinutes`/
  `difficulty`/ordered `checkpoints` from an official source. The Matsu NSA
  attraction page (matsu-nsa.gov.tw/zh-TW/attractions/1482) only published a
  duration *range* ("建議安排 30 至 50 分鐘") and no distance/checkpoint
  chain, which disqualified the mountain under that stricter regime. Under
  the current tiered POLICY, `distanceKm`/`durationMinutes`/`difficulty` are
  nullable and community tier may supply exact values — and isports's own
  `climbWay` field, not checked in the prior pass, independently supplies a
  usable official checkpoint chain and single-value duration.
- **Designation/checkpoints (official):** `data/routes/raw/isports/098.json`
  (PKNO=97). `climbWay` has 2 options: (1) "可騎車直達雲台山" (no chain); (2)
  "中央、津沙路交叉口→雲台山，約15分鐘登頂" — a 2-point chain with a single
  non-range duration. Option 2 chosen (it is the only option with a real
  checkpoint sequence). Checkpoints: 中央、津沙路交叉口 → 雲台山.
- **Route facts (community):** biji has one trail for this mountain-id,
  trail id 827 "雲台山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=827) — elevation-
  range top (248公尺) matches isports's summit elevation exactly.
  `distanceText: "0.8公里"` → `distanceKm: 0.8`. `durationText: "所需時間 30
  分鐘"` → `durationMinutes: 30` (preferred over isports's ascent-only
  15-min figure, per established pattern). `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "38公尺"` →
  `elevationDifferenceM: 38`.
- **Access note (not a closure, flagged for transparency):**
  `data/routes/raw/hiker/098.json` notes the 軍情館 building at the summit
  ("只限台灣百姓參觀，不開放給陸客進入") is restricted to Taiwanese citizens only
  — a nationality-based visitor policy for one building, not a general
  trail closure. Not used to block the ADD; not a `permitNotes` value since
  it's community-sourced and not a permit/registration requirement.
- **Closure check (per the prior rejection's specific concern,
  re-verified):** the prior report separately found the Matsu NSA
  homepage's news ticker showing "南竿大漢及鐵堡據點暫停開放公告" and confirmed
  by name/ID that this closure does **not** apply to 雲台山/軍情館, a
  distinct, unrelated attraction. Live re-fetch of the Matsu NSA attraction
  page (matsu-nsa.gov.tw/zh-TW/attractions/1482) today confirms: "全天開放"
  (open all day), no closure/damage/maintenance language for 雲台山 itself.
  Live re-fetch of isports PKNO=97 today: page loads, mountain matches
  (雲台山, 248m, 連江縣南竿鄉); `environment` field additionally states the
  mountain "自民國88年馬祖成為第六處國家風景區開放觀光...雲台山也對外開放" (opened to
  public tourism since 1999) — no closure language.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 099 太武山 (金門縣金湖鎮, Kinmen) — ADDED (official-tier only; true triangulation summit excluded as inaccessible)

- **Designation/checkpoints (official):** `data/routes/raw/isports/099.json`
  (PKNO=98). `climbWay` (single option, single non-range value): "太武山公墓
  停車場→玉章路牌坊→思源亭→倒影塔→毋忘在莒石碑，約1小時登頂。". Checkpoints: 太武山
  公墓停車場 → 玉章路牌坊 → 思源亭 → 倒影塔 → 毋忘在莒石碑. `durationMinutes: 60`,
  sourced directly from this single stated value (official tier).
- **True-summit inaccessibility (not a closure of the route added here):**
  isports's own `intro` field states explicitly: "「毋忘在莒」勒石在太武山頂
  西南側250公尺峰下，**不能登頂**，只能造訪山腰的海印寺" — i.e. the government's
  own page states the true 253m triangulation summit cannot be reached, and
  the officially recommended climb terminates at the 毋忘在莒 memorial rock on
  a lower sub-peak instead. This is not a trail closure — isports's own
  `climbWay`, the route this record uses, never claims to reach the true
  triangulation point in the first place; it is the officially designated
  route to the accepted small-hundred-peak "summit" (毋忘在莒石碑).
  `data/routes/raw/hiker/099.json`'s detailed trip log independently
  confirms this exact structure: the hiker walked 公墓停車場→玉章路牌樓→劉玉章
  將軍紀念像圓環及思源亭→...→『勿忘在莒』大勒石 (matching this record's checkpoint
  chain almost point-for-point), then continued past to 元碑, where the true
  triangulation point sits — and *explicitly chose not to go up* to it:
  "元碑上方的三角點已列軍事管制區並設有蛇籠阻絕，還是不上為妙，原路回程" (the
  triangulation point above 元碑 is still designated a military-restricted
  zone with barbed-wire obstacles — best not to go up). Because this
  record's checkpoints stop at 毋忘在莒石碑 (matching isports's own route) and
  never proceed to the restricted true summit, this restriction does not
  affect the route added here.
- **Route facts (community) — not used, elevation mismatch:** biji has 2
  trails for this mountain-id (蔡厝古道, distance 3.5km/105min/低/低-difference
  215m, elevation-range top 229m; 太武山大縱走, distance 6.1km/180min/低,
  elevation-range top 228m). Neither trail's elevation-range top (228–229m)
  matches the ~250m sub-peak this record's route (via 玉章路→毋忘在莒石碑)
  actually reaches — both appear to be different named trails on Taiwushan's
  broader network (a historic salt-trading path and a ridge traverse) that
  do not cover the specific 玉章路 route used here. Per POLICY's "no
  estimation" rule, neither trail's distance/duration/difficulty is applied
  to this record; `distanceKm`, `difficulty`, and `elevationDifferenceM`
  are left `null`.
- **Official National Park source checked but not used (unverifiable
  live):** a WebSearch surfaced 金門國家公園管理處's dedicated trail page
  (kmnp.gov.tw/ch/roadinfo/trail-information/7, "太武山區玉章路登山步道"), whose
  search-result summary cites a total length of 3.6km. However, direct
  WebFetch and curl attempts on both the modern URL and the legacy
  `KMNP_Content.aspx` mirror returned only JS-shell/base64-image content
  with no readable trail text (the same rendering failure batch 8 hit on
  taroko.gov.tw for mountain 087). Since this figure could not be
  independently verified against the primary source's own text — and since
  it is unclear whether 3.6km covers the same 公墓→毋忘在莒 segment used here
  or the longer full route continuing to 海印寺 — it is not used for
  `distanceKm`, consistent with POLICY's prohibition on estimating or
  backfilling nullable fields from unverified secondary summaries.
- **Closure check:** isports `noticeItem` is a motorcycle-safety/flight-delay
  caution only — no closure language. A live WebSearch
  ("太武山 玉章路 毋忘在莒 步道 封閉 OR 整修 2026") returned no results
  indicating closure or repair of this specific trail; the one 2026-dated
  news hit for "太武山毋忘在莒" (chinatimes.com, 2026-04-13) is a historical
  retrospective about the 1953 stone-carving process, unrelated to current
  trail access. Live re-fetch of isports PKNO=98 today: page loads,
  mountain matches (太武山, 253m, 金門縣金湖鎮), notice text unchanged, no
  mention of military-restricted areas affecting the 玉章路 route itself.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 100 蛇頭山 (澎湖縣馬公市, Penghu) — ADDED

- **Designation/route choice (official):** `data/routes/raw/isports/100.json`
  (PKNO=99). `climbWay`: "可騎車直達澎湖國家風景區蛇頭山標示點。" — no named
  waypoint chain, just confirms motorbike/vehicle access directly to the
  marker point.
- **Checkpoints enriched (community):** `data/routes/raw/hiker/100.json`'s
  trip log (dated 114/06/24, 2025-06-24 — one month before this review)
  names concrete landmarks along the short walk from parking to the
  triangulation point: "13:49 機車...直達蛇頭山大勒石停車場，參觀荷蘭人登陸紀念碑、
  日艦沉船慰靈碑、法國海軍紀念碑及後續走蛇頭山基石，取荷蘭城堡遺址後方的小路進去到
  最後一座碉堡，於碉堡右側高點可看到...基石". Checkpoints: 蛇頭山停車場 → 荷蘭城堡
  遺址 → 蛇頭山三角點 — official establishes the drive-up/parking access
  point and endpoint concept, community fills the intermediate named
  landmark (both allowed for `checkpoints` per POLICY.md).
- **Route facts (community):** biji has one trail for this mountain-id,
  trail id 825 "蛇頭山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=825) — elevation-
  range top (20公尺) matches isports's summit elevation exactly, and its
  `managingPark` field ("澎湖國家風景區") matches isports's own designation
  text. `distanceText: "1公里"` → `distanceKm: 1`. `durationText: "所需時間
  20 分鐘"` → `durationMinutes: 20` (the only duration figure available,
  since isports states none beyond "可騎車直達"). `difficultyText: "低難度"`
  → `difficulty: 1`. `elevationDifferenceText: "11公尺"` →
  `elevationDifferenceM: 11`.
- **Very recent maintenance/passability confirmation:** the hiker blog's
  trip log (2025-06-24, one month before this review) explicitly notes
  "114年再訪/國家公園已除草至步道終點" (the national park has cleared/mowed
  grass all the way to the trail's end on this most recent visit) — a
  positive, current maintenance signal, not a closure concern.
- **Closure check:** isports `noticeItem` is a motorcycle-safety caution
  only — no closure language. Live re-fetch of PKNO=99 today: page loads,
  mountain matches (蛇頭山, 20m, 澎湖縣馬公市), notice text unchanged.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value. No
range value required upper-bound resolution for a *stored* figure this
batch — isports's own climbWay range corroboration was not present in this
batch (every isports climbWay figure used was a single non-range value:
092's 20min, 094's 90min for option 2, 095's 50min, 097's 120min, 098's
15min, 099's 60min); the two mountains with no isports duration at all
(096, 100) used biji's single stated duration instead. Where no source
published a matching figure for the exact route used — 099's `distanceKm`,
`difficulty`, and `elevationDifferenceM` — the field was left `null` rather
than estimated, including declining to use a Kinmen National Park search-
summary figure (3.6km) that could not be independently verified against
the primary source's own text (page was JS-rendered/unreadable via both
WebFetch and curl). No elevation-figure discrepancy (092's 886m-vs-964m
biji-network mismatch) was reconciled by averaging — each record uses its
cited source's own stated value as-is.

## Live closure re-check

Re-fetched all eight official isports pages (PKNO=91, 93, 94, 95, 96, 97,
98, 99) live today. Every page's 注意事項 text matched its bundle snapshot
verbatim — no new closure/storm-damage/maintenance/access-restriction
language found on any of the eight. Additionally, for the outlying islands:
098's cited Matsu NSA attraction page was re-fetched live and confirmed
"全天開放" with no closure text; 097 (Lanyu) and 099 (Kinmen) were checked
via live WebSearch for recent closure/collapse news specific to their
respective trails, with no results found indicating any current
restriction.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 138
Small hundred peaks: 96
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 88 (pre-batch baseline, batch 8's
report) to 96 (+8, all eight additions). `Catalog valid`, `Missing sources:
0`, `Duplicate slugs: 0`. The remaining warning lists designations
040, 041, 064, 087 as missing — all four were rejected in prior batches
(087 in batch 8 for confirmed trail damage; 040/041/064 in earlier
south-g/central-e/east-h batches) and are outside this batch's scope, which
covered only the specific 8 mountains listed in the task brief.

## Files changed

- `data/routes/catalog.json`: 8 new records appended
  (wanrenshan-mountain-trail, taimalishan-mountain-trail,
  jianaimeishan-mountain-trail, balangweishan-mountain-trail,
  hongtoushan-mountain-trail, yuntaishan-mountain-trail,
  taiwushan-mountain-trail, shetoushan-mountain-trail), each with
  designations `taiwan_small_hundred_peak:092/094/095/096/097/098/099/100`.
- `data/routes/sources.json`: 16 new `(organization, url)` entries — 8
  教育部體育署 isports PKNO pages, 7 健行筆記 trail pages, and 1 輝哥的天空
  trip-log page (100 — used only for `checkpoints` enrichment).
- `.superpowers/sdd/task-8-tiered-batch-9-report.md`: this report (new
  file).
