# Task 8 batch report: Small Hundred Peak designations — tiered-source batch 5 (Nantou-Chiayi cluster)

Reviewed: 2026-07-18
Policy: `data/routes/POLICY.md` (tiered-source policy)

Scope: 10 mountains (047, 048, 049, 050, 051, 052, 053, 054, 056, 057), per
the parent task message.

**Result: 10 added, 0 rejected.**

**Overlap check:** grepped `data/routes/catalog.json` (all records, including
nested `checkpoints[].name` fields) and `data/routes/hundred-peaks.json` for
all ten mountain names. Nine had zero matches. The tenth, 大尖山 (#056),
matched an *unrelated* existing record: `dajian-mountain-xizhi-trail`
(designation `taiwan_small_hundred_peak:012`, 459m, 新北市汐止區). That is a
different mountain that happens to share the common name "大尖山" — Taiwan has
several. Confirmed no overlap with this batch's #056 (1305m, 嘉義縣梅山鄉/
雲林縣古坑鄉, aka 雲嘉大尖山) and created a fresh record with a disambiguating
slug rather than touching the existing one.

**Difficulty mapping used (per POLICY.md §Difficulty mapping, same as
batches 1-4):** 低難度→1, 低-中難度→2, 中難度→3, 中-高難度→4, 高難度→5.

**Mismatched community bundles found and excluded (same-name-different-mountain
trap flagged in the task brief — a new case, not one of the four previously
known):**
- `data/routes/raw/hiker/056.json` (`matchedLinkText: "汐止大尖山"`) and
  `data/routes/raw/biji/056.json` (`bijiMountainTitle: "汐止大尖山"`,
  `bijiMountainId: 111`, elevation range 200~460公尺) both describe the
  **New Taipei Xizhi 大尖山** (459m, designation #012, the same mountain as
  the pre-existing `dajian-mountain-xizhi-trail` record) — not this batch's
  #056 雲嘉大尖山 (1305m, 嘉義縣梅山鄉/雲林縣古坑鄉). Both excluded entirely,
  including from corroboration. Record 056 was added official-only (isports
  data only), same pattern as batch 4's 042.

---

## 047 九份二山 (南投縣中寮鄉、國姓鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/047.json`
  (PKNO=46). `climbWay` (single option): "步道導覽圖登山口→九份二山三角點，約30
  分鐘登頂". Checkpoints: 步道導覽圖登山口 → 九份二山三角點.
- **Route facts (community):** biji trail id 567 "九份二山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=567) — the only
  biji trail for this mountain, and its elevation range top (1174公尺)
  matches isports's stated summit elevation exactly. `distanceText: "3.4
  公里"` → `distanceKm: 3.4`. `durationText: "所需時間 1 小時 50 分鐘"` →
  `durationMinutes: 110`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "335公尺"` → `elevationDifferenceM: 335`. No
  hiker bundle exists for 047.
- **921-earthquake-zone safety check (task-flagged concern):** this mountain
  is the well-known 921 epicenter site (isports's own `intro`/`environment`
  describe the 1999 landslide and the 國家地震紀念園區 memorial park built on
  the collapse scars). isports `noticeItem` contains only a driving-caution
  note ("小車可直抵登山口，惟山路陡峭彎曲，行車當心"), no closure/instability
  language for the hiking trail itself. Live re-fetch of PKNO=46 today
  confirms: page loads, mountain matches (九份二山, 1174m, 南投縣中寮鄉/
  國姓鄉), still no closure notice. WebSearch for `九份二山 登山步道 封閉 2026`
  turned up no closure reports; results include a hiking-log review dated
  2024-02-28 and current trail-guide articles describing it as an actively
  visited, maintained trail. Treated as open — the earthquake damage is
  historical/scenic-attraction content, not an active hazard notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 048 橫山 (南投縣名間鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/048.json`
  (PKNO=47). `climbWay` (single option): "橫山步道口(139乙縣道)→橫山三角點，
  約20分鐘登頂". Checkpoints: 橫山步道口(139乙縣道) → 橫山三角點.
- **Route facts (community):** biji trail id 432 "橫山觀日步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=432) — the only
  biji trail for this mountain, elevation range top (443公尺) matches
  isports's stated summit elevation exactly. `distanceText: "7.5公里"` →
  `distanceKm: 7.5`. `durationText: "所需時間 2 小時 30 分鐘"` →
  `durationMinutes: 150`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "333公尺"` → `elevationDifferenceM: 333`.
- **Mismatched-bundle check (verified, not excluded):** `data/routes/raw/hiker/048.json`
  is a combined write-up covering both 松柏坑山 and 橫山 in one trip (they sit
  ~10km apart on the same road). Its own text explicitly labels this "小百岳
  #048" at "標高443M...位於彰化縣社頭鄉清水岩森林遊憩區" — elevation and
  designation number match this mountain exactly (the 彰化縣社頭鄉 mention
  describes the Changhua-side trailhead approach; isports's own `counties`
  field for this designation is 南投縣 only, matching the record's `region`).
  Confirmed correct match; not used numerically (no explicit distance/duration
  scale stated in the narrative), but corroborates the identity and ~15-minute
  summit approach consistent with isports's 20-minute figure.
- **Closure check:** isports `noticeItem` only mentions old trails and tea/
  fruit orchards, family-friendly framing — no closure language. Live
  re-fetch of PKNO=47 today: page loads, mountain matches (橫山, 443m, 南投縣
  名間鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 049 貓囒山 (南投縣魚池鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/049.json`
  (PKNO=48). `climbWay` (single option, rich chain): "貓囒山步道口→木造宿舍區→
  茶葉改良場→日月潭氣象站→貓囒山大石處，約1小時登頂". Checkpoints: 貓囒山步道口 →
  木造宿舍區 → 茶葉改良場 → 日月潭氣象站 → 貓囒山大石處 (endpoint name taken
  verbatim — the summit itself is occupied by the weather station, so
  isports's own route ends at the adjacent "大石處" landmark, not a
  triangulation point).
- **Route facts (community):** biji has two trails for this mountain id;
  chose trail 448 "貓囒山步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=448)
  over the alternative id 555 "魚池尖登山步道" — 448's name contains the
  target peak name directly and its elevation range top (1020公尺) closely
  matches isports's 1016m summit figure, while 555's range (685~815公尺)
  clearly describes a different, lower peak ("魚池尖", not 貓囒山). `distanceText:
  "5.4公里"` → `distanceKm: 5.4`. `durationText: "所需時間 2 小時"` →
  `durationMinutes: 120`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "250公尺"` → `elevationDifferenceM: 250`. No
  hiker bundle exists for 049.
- **Closure check:** isports `noticeItem` states "紅茶試驗所管制進入時，可從新井
  技師碑亭旁的步道登頂" — this is an access-restriction note for one facility
  section (紅茶試驗所) with an explicit official-source-provided alternate
  route around it, not a trail closure. Not treated as blocking. Live
  re-fetch of PKNO=48 today: page loads, mountain matches (貓囒山, 1016m,
  南投縣魚池鄉), same conditional-access note, no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 050 集集大山 (南投縣中寮鄉、集集鎮) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/050.json`
  (PKNO=49). `climbWay` option 2 (chosen over option 1's driving-only "開車
  直上山頂電視轉播站→集集大山三角點，約2分鐘登頂" for being an actual hiking
  route): "孟宗竹林區停車場→車埕步道入口(產道終點)→電塔(明潭-中寮010)→大山巷
  產道→右轉階梯捷徑→電視轉播站→集集大山，約1小時登頂". Checkpoints: 孟宗竹林區
  停車場 → 車埕步道入口(產道終點) → 電塔(明潭-中寮010) → 大山巷產道 → 右轉階梯
  捷徑 → 電視轉播站 → 集集大山.
- **Route facts (community):** biji trail id 576 "集集大山、車埕步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=576) — name
  directly matches option 2's "車埕步道" waypoint, elevation range top
  (1392公尺) matches isports's stated summit elevation exactly. `distanceText:
  "3.6公里"` → `distanceKm: 3.6`. `durationText: "所需時間 1 小時 50 分鐘"` →
  `durationMinutes: 110`. `difficultyText: "低難度"` → `difficulty: 1`.
  `elevationDifferenceText: "323公尺"` → `elevationDifferenceM: 323`.
- **Mismatched-bundle check (verified, not excluded):** `data/routes/raw/hiker/050.json`
  explicitly names "集集大山" and "小百岳#50", elevation 1392m — confirmed
  correct match. It describes a *different* route (the 14.44km vehicle-
  accessible summit road from 大坪巷, walkable round trip ~9-10 hours) from
  biji's shorter 車埕步道 foot trail. Not used numerically to avoid mixing
  route scope (per batch 4's established practice with 038); its rockfall
  caution ("雨季在最後路段會有落石") applies only to that separate vehicle-road
  route, not the 車埕步道 used here.
- **921-earthquake-zone / geological-stability check (task-flagged concern):**
  isports `noticeItem` only recommends visiting nearby attractions (集集車站,
  明新書院) — no instability/closure language. Live re-fetch of PKNO=49
  today: page loads, mountain matches (集集大山, 1392m, 南投縣中寮鄉/集集鎮), no
  closure notice. WebSearch for `集集大山 步道 封閉 坍方 2026` returned no
  closure reports — only current trail-guide articles and a recent
  (undated-but-current) hiking blog post describing the 車埕步道 as an active,
  walkable route. Treated as open.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 051 松柏坑山 (彰化縣二水鄉、南投縣名間鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/051.json`
  (PKNO=50). `climbWay` option 2 (chosen over option 1's driving-only "開車至
  埔中社區活動中心→松柏坑山三角點，約3分鐘登頂" for its richer named-landmark
  chain): "豐柏廣場→觀山亭(第1涼亭)→賞猿台(第3涼亭)→第4涼亭→松柏嶺受天宮→松柏坑
  山三角點，約1小時30分鐘登頂". Checkpoints: 豐柏廣場 → 觀山亭(第1涼亭) → 賞猿台
  (第3涼亭) → 第4涼亭 → 松柏嶺受天宮 → 松柏坑山三角點.
- **Route facts (community):** biji trail id 607 "松柏坑山、田園茶香賞茶步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=607) — the only
  biji trail for this mountain and its name directly contains "松柏坑山".
  `distanceText: "3.4公里"` → `distanceKm: 3.4`. `durationText: "所需時間 45
  分鐘"` → `durationMinutes: 45`. `difficultyText: "低難度"` → `difficulty:
  1`. `elevationDifferenceText: "20公尺"` → `elevationDifferenceM: 20`.
  Note: isports's own duration for the chosen checkpoint chain (90 min) is
  longer than biji's named-trail figure (45 min) — same
  official-checkpoints/community-route-facts pairing precedent used in
  batch 4's #036 (isports climbWay durations describe a specific route
  variant/segment; the named community trail is treated as the more complete
  published route-fact package for a peak this minor, elevation difference
  only 20m per biji, i.e. essentially a flat plateau walk).
- **Mismatched-bundle check (verified, not excluded):** `data/routes/raw/hiker/051.json`
  does not exist as a separate file — 051's mention is embedded in
  `data/routes/raw/hiker/048.json`'s combined write-up, which explicitly
  labels this "小百岳 #051 號...標高431M...位於彰化縣二水鄉惠民村與南投縣名間鄉
  埔中村交界處" — elevation and designation number match exactly. Not used
  numerically (no stated duration/distance scale; only a personal 0-point
  "難度" narrative for the very short factory-adjacent approach), but
  corroborates the mountain identity and notes the triangulation stone has
  been physically relocated to a tea-factory forecourt over time — consistent
  with isports's own two-option ambiguity about the exact final approach.
- **Closure check:** isports `noticeItem` only warns of a cliff-edge photo
  spot — no closure language. Live re-fetch of PKNO=50 today: page loads,
  mountain matches (松柏坑山, 431m, 彰化縣二水鄉/南投縣名間鄉), no closure
  notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 052 後尖山 (南投縣水里鄉、魚池鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/052.json`
  (PKNO=51). `climbWay` option 1 (chosen over option 2's 塘湖路 route and
  option 3's longer 逐鹿古道/雨社山 traverse — option 1 matches the hiker
  bundle's own confirmed trip route): "頭社佛堂登山口：頭社佛堂停車場→涼亭→急陡坡
  公告牌→後尖山，約50分鐘登頂". Checkpoints: 頭社佛堂停車場 → 涼亭 → 急陡坡公告牌
  → 後尖山.
- **Route facts (community):** biji trail id 573 "後尖山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=573) — elevation
  range top (1008公尺) matches isports's summit elevation exactly.
  `distanceText: "2.4公里"` → `distanceKm: 2.4`. `durationText: "所需時間 1
  小時 30 分鐘"` → `durationMinutes: 90`. `difficultyText: "低難度"` →
  `difficulty: 1`. `elevationDifferenceText: "328公尺"` →
  `elevationDifferenceM: 328`.
- **Route-identity corroboration:** `data/routes/raw/hiker/052.json`'s
  timestamped trip log follows exactly this 頭社佛堂 route ("10:30 佛堂(第二
  停車場)...順柏油產業道路起登...11:10 登頂後尖山" — ~40 min actual ascent,
  close to isports's 50-min figure) and independently states the one-way
  trail length as "全長約1.1K", doubling to ≈2.2km round trip, closely
  matching biji's 2.4km figure. **Explicitly excluded from this record:** the
  same hiker report also visits an adjacent, separate excursion — 頭社水庫
  「大舌滿溪生態步道」— and notes "唯目前水庫整修中，暫停開放" for that trail. This
  closure applies only to the water-reservoir nature trail (a different
  trailhead on 台21線68.2K, unrelated to 後尖山's summit trail via 投62線/
  頭社佛堂) and does not affect the 後尖山 record added here.
- **Closure check:** isports `noticeItem` is a general steepness/slipperiness
  caution — no closure language. Live re-fetch of PKNO=51 today: page loads,
  mountain matches (後尖山, 1008m, 南投縣水里鄉/魚池鄉), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 053 鳳凰山 (南投縣鹿谷鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/053.json`
  (PKNO=52). `climbWay` option 1 (chosen over option 2's shorter 隆田產業道路
  50-60min route — option 1 matches the hiker bundle's confirmed trip via
  溪頭/北嶺步道): "溪頭露營區→土地公叉路→稜線岔路涼亭→鳳凰山三角點，約3小時登頂".
  Checkpoints: 溪頭露營區 → 土地公叉路 → 稜線岔路涼亭 → 鳳凰山三角點.
- **Route facts (community):** biji trail id 695 "溪頭鳳凰山步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=695) — name
  directly references 溪頭 and 鳳凰山, matching this route. `distanceText: "8
  公里"` → `distanceKm: 8`. `durationText: "所需時間 6 小時 10 分鐘"` →
  `durationMinutes: 370`. `difficultyText: "低-中難度"` → `difficulty: 2`.
  `elevationDifferenceText: "666公尺"` → `elevationDifferenceM: 666`.
- **Route-identity corroboration:** `data/routes/raw/hiker/053.json`'s
  timestamped trip log ("08:20 出停車場...11:23 鳳凰山就到了...14:36 下回登山口")
  totals ~6h16m in the field, closely matching biji's 6小時10分 figure, and
  independently states "登山步道往返約9公里，爬升700M" — both figures close to
  biji's 8km/666m. **Explicitly excluded from consideration as a closure:**
  the hiker log's "路徑不明，請勿通行" warning applies to a further side-spur
  extension toward 圓山坑田底/鳳凰鳥園 *beyond* the summit, encountered only
  after already reaching 鳳凰山's triangulation point — it does not affect
  the main ascent route recorded here.
- **Closure check:** isports `noticeItem` is a general step-looseness/
  rainy-season caution — no closure language. Live re-fetch of PKNO=52
  today: page loads, mountain matches (鳳凰山, 1698m, 南投縣鹿谷鄉, near
  Xitou), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 054 金柑樹山 (南投縣信義鄉、竹山鎮) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/054.json`
  (PKNO=53). `climbWay` (single option): "留龍頭→忘憂森林→金柑樹山西北峰→金柑樹山
  三角點，約2.5-3小時登頂". Checkpoints: 留龍頭 → 忘憂森林 → 金柑樹山西北峰 → 金柑
  樹山三角點.
- **Route facts (community):** biji trail id 582 "金柑樹山、忘憂森林步道"
  (https://hiking.biji.co/index.php?q=trail&act=detail&id=582) — name
  matches isports's route exactly (both name 忘憂森林 as a waypoint),
  elevation range top (2091公尺) matches isports's summit elevation exactly.
  `distanceText: "9.4公里"` → `distanceKm: 9.4`. `durationText: "所需時間 4
  小時 10 分鐘"` → `durationMinutes: 250`. `difficultyText: "低-中難度"` →
  `difficulty: 2`. `elevationDifferenceText: "371公尺"` →
  `elevationDifferenceM: 371`.
- **Route-identity corroboration:** `data/routes/raw/hiker/054.json`'s
  timestamped trip log starts at "08:30 留龍頭登山口" and reaches "10:54...
  抵金柑樹山" (~2h24m one-way ascent, consistent with isports's 2.5-3hr
  ascent-only figure), then completes the full 忘憂森林 loop back to the
  trailhead by "12:55" (~4h25m total in the field), closely matching biji's
  4小時10分 round-trip figure. isports's stated range describes the one-way
  ascent leg; biji's figure covers the complete loop — consistent, not
  conflicting, values.
- **Closure check:** isports `noticeItem` is a general fog/route-complexity
  caution ("寬稜山徑分歧複雜，且午後常見濃霧") — no closure language. Live
  re-fetch of PKNO=53 today: page loads, mountain matches (金柑樹山, 2091m,
  南投縣信義鄉/竹山鎮), no closure notice.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 056 大尖山 (嘉義縣梅山鄉、雲林縣古坑鄉) — ADDED (official-only, partial data)

- **All fields (official):** `data/routes/raw/isports/056.json` (PKNO=55).
  `climbWay` option 1 (chosen — matches `noticeItem`'s own recommendation,
  "建議由10-5號步道上雲嘉大尖山"): "華山教育農園10-5步道口→六角涼亭→大尖山三角點，
  約1.5-2小時登頂". Checkpoints: 華山教育農園10-5步道口 → 六角涼亭 → 大尖山三角點.
  `routeName` set to "10-5號步道", taken verbatim from the official source's
  own trail-number terminology in `noticeItem` (official tier, not
  fabricated). `durationMinutes: 120` — isports states a range ("約1.5-2
  小時"); per POLICY.md §Range values, stored as the conservative upper
  bound (2小時 = 120分鐘), official tier.
- **No usable community source:** both community bundles for this number are
  mismatched to the unrelated New Taipei Xizhi 大尖山 (see note at top of
  report). Excluded entirely.
- **Nullable fields left null (POLICY.md §Nullable route-fact fields):**
  `distanceKm` and `difficulty` — isports states neither a distance figure
  nor a difficulty rating for any of its three route options, and no valid
  community source exists to fill the gap. `elevationDifferenceM` also left
  null (isports gives only a single elevation figure, 1305m, no explicit
  elevation-difference/落差 value).
- **Typhoon/closure check (task-flagged Chiayi/Yunlin storm-damage concern):**
  isports `noticeItem` only recommends a specific ascent/descent loop
  (10-5號步道 up, 二尖山/龜仔頭 down) — no closure language. Live re-fetch of
  PKNO=55 today: page loads, mountain matches (大尖山/雲嘉大尖山, 1305m,
  嘉義縣梅山鄉/雲林縣古坑鄉), no closure notice. Investigated further given
  the task's specific typhoon-damage flag for this region: found that 農業部
  林業及自然保育署嘉義分署 issued a preemptive closure of "阿里山國家森林遊樂區、
  眠月線、臺灣一葉蘭自然保留區及自然步道" effective 2026-07-10 08:00 ahead of
  Typhoon Bawi (巴威颱風) — but (a) that announcement does not name 大尖山,
  梨子腳山, 二尖山, or any Meishan/Gukeng-township trail specifically; (b) it
  is a different managing authority than the one that actually covers this
  trail corridor — 交通部觀光署阿里山國家風景區 (Alishan National Scenic Area),
  confirmed via `data/routes/raw/biji/052...` — wait, via the adjacent 二尖山
  page at `https://www.ali-nsa.net/zh-tw/attractions/detail/206` (二尖山 is
  大尖山's sub-peak, reached via the same 華山10-5 trailhead), which shows
  "每日開放" (open daily) with no closure/damage notice, last updated
  2026-01-27; (c) Typhoon Bawi's land warning has been fully lifted (per news
  search) and comparable regions (e.g. Yilan's Taipingshan forest recreation
  area) had already reopened by 2026-07-13, five days before this review.
  Given all of this, treated as currently open — no closure evidence for
  this specific trail, and the one blanket precautionary notice found is
  storm-specific, from a non-managing authority, and stale by over a week.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

## 057 梨子腳山 (嘉義縣梅山鄉) — ADDED

- **Designation/checkpoints (official):** `data/routes/raw/isports/057.json`
  (PKNO=56). `climbWay` (single option): "三元宮→四岔路口(登山口)→石階小徑→梨子
  腳山三角點，約0.5-1小時登頂". Checkpoints: 三元宮 → 四岔路口(登山口) → 石階小徑 →
  梨子腳山三角點.
- **Route facts (community):** biji has four trails for this mountain id;
  chose trail 583 "梨子腳山步道" (https://hiking.biji.co/index.php?q=trail&act=detail&id=583)
  — the only single-peak direct-summit trail (name contains the mountain
  name exactly), elevation range top (1176公尺) matches isports's summit
  elevation exactly. The other three (id 1167 "雲嘉五連峰縱走", id 1168 "雲嘉
  七連峰縱走", id 1845 "雲嘉十三連峰") are multi-peak traverse routes (15.7km
  to 29.4km) — excluded per the task's route-selection rule to prefer the
  most direct single-peak ascent. `distanceText: "2公里"` → `distanceKm: 2`.
  `durationText: "所需時間 1 小時 5 分鐘"` → `durationMinutes: 65`.
  `difficultyText: "低難度"` → `difficulty: 1`. `elevationDifferenceText:
  "190公尺"` → `elevationDifferenceM: 190`. No hiker bundle exists for 057.
- **Typhoon/closure check (task-flagged concern, same regional check as
  056):** isports `noticeItem` only gives a parking tip — no closure
  language. Live re-fetch of PKNO=56 today: page loads, mountain matches
  (梨子腳山, 1176m, 嘉義縣梅山鄉), no closure notice. The same Chiayi-branch
  typhoon-precaution notice investigated for 056 above does not name this
  mountain either, and biji's own `managingPark` field for trail 583 is
  "阿里山國家風景區" (a different, non-forestry managing authority) — same
  reasoning applies: no closure evidence for this specific trail as of
  today, and the one blanket notice found is stale (Typhoon Bawi's warning
  fully lifted, 8 days prior to this review) and issued by a non-managing
  body.
- `elevationGainM`, `startLat/Lng`, `evacuationPoints`, `permitNotes`:
  null/[].

---

## No estimation / no fabrication

Every numeric field traces to exactly one cited source's stated value. One
range value was resolved via the conservative-upper-bound rule (056's
isports duration, "約1.5-2小時" → 120分鐘, official tier); all other duration
figures used were single stated values from their source, not ranges.
`routeName` values were taken either from the selected biji trail's own name
(community tier) or, for 056 (no valid community source), directly from the
official isports source's own route-numbering terminology in `noticeItem` —
never invented. No value was averaged, interpolated, or derived from
distance/pace.

## Verification

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog valid
Hundred peaks: 100
Suburban routes: 102
Small hundred peaks: 60
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 50 (pre-batch baseline, confirmed via
batch 4's report) to 60 (+10, matching all ten additions in this batch, zero
rejections). `Catalog valid`, `Missing sources: 0`, `Duplicate slugs: 0`.
Remaining warnings (suburban-route count, missing designations 059+) are
pre-existing and outside this batch's scope.

## Files changed

- `data/routes/catalog.json`: 10 new records appended
  (jiufenershan-mountain-trail, hengshan-mountain-trail,
  maolan-mountain-trail, jijida-mountain-trail, songbaikeng-mountain-trail,
  houjian-mountain-trail, fenghuang-mountain-lugu-trail,
  jinganshu-mountain-trail, dajian-mountain-yunjia-trail,
  lizijiao-mountain-trail), each with designations
  `taiwan_small_hundred_peak:047/048/049/050/051/052/053/054/056/057`. The
  056 slug carries a `-yunjia-trail` disambiguator since an unrelated 大尖山
  (#012, New Taipei Xizhi) already exists as `dajian-mountain-xizhi-trail`;
  053's slug carries a `-lugu-trail` disambiguator for the same
  common-name-collision-avoidance reason (Nantou 鹿谷鄉, near Xitou).
- `data/routes/sources.json`: 19 new `(organization, url)` entries — 10
  教育部體育署 isports PKNO pages + 9 健行筆記 trail pages.
- `.superpowers/sdd/task-8-tiered-batch-5-report.md`: this report (new
  file).
