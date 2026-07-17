# Task 8 batch report: Small Hundred Peak designations — North cluster A

Reviewed: 2026-07-17

Scope: 10 mountains (001, 002, 003, 004, 005, 006, 007, 008, 010, 013) per
`.superpowers/sdd/task-8-small100-north-a-brief.md`.

Result: 2 designations added (001, 002 — both attached to existing
overlapping catalog records, no new records created), 8 mountains rejected.

---

## 001 大屯山 — ADDED (designation added to existing overlapping record)

`data/routes/catalog.json` already contains a suburban record `datun-main-peak-trail`
(mountainName `大屯山主峰`, routeName `大屯主峰連峰步道`), added by a prior batch on
2026-07-16, sourced from 陽明山國家公園管理處
(https://www.ymsnp.gov.tw/ch/sglarticle/trail-classification). Its checkpoint
sequence (大屯鞍部登山口 → 大屯主峰 → 大屯南峰 → 大屯西峰 → 面天坪 → 清天宮登山口)
summits 大屯主峰, which is the true peak of 大屯山 (the mountain named in
`data/routes/small-hundred-peaks.json` #001). `data/routes/suburban-routes.json`
also lists `大屯山主峰` verbatim as one of the 100 required suburban route names,
confirming this is the intended single record for this mountain, not a
separate route.

Per the parent plan's Task 8 Step 1 ("Compare small-hundred-peaks.json with
hundred-peaks.json and suburban-routes.json... select one slug and one
record, then add the designation instead of duplicating the record") and the
brief's own overlap-handling instruction, I added the designation to this
existing record rather than creating a duplicate. This is explicitly allowed
by the brief's constraint: "Keep existing catalog records and slugs untouched
except where you are adding a designation to an existing overlapping record."

Change made:
- `designations`: `[]` → `["taiwan_small_hundred_peak:001"]`
- Added a new `sourceReferences` entry citing 教育部體育署 (designation
  evidence, matching the established project pattern seen elsewhere in the
  catalog, e.g. `dulan-mountain`, `jiangziliao-mountain`):
  ```json
  {
    "organization": "教育部體育署",
    "url": "https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=1",
    "fields": ["designations"]
  }
  ```
  Verified this URL is `data/routes/small-hundred-peaks.json`'s #001 source
  (mountainName 大屯山, counties 臺北市/新北市) — matches.
- Bumped `sourceVersion`/`reviewedAt` on the record to `2026-07-17` to reflect
  this review.
- Added `{"organization": "教育部體育署", "url": ".../PKNO=1"}` to
  `data/routes/sources.json` (was not previously present; PKNO=11/22/27 were,
  but not PKNO=1).

No other field on the existing record was touched.

---

## 002 七星山 — ADDED (designation added to existing overlapping record)

Same situation as 001. `data/routes/catalog.json` already contains suburban
record `qixing-main-east-trail` (mountainName `七星山主峰東峰`, routeName
`七星主峰－東峰步道（小油坑至冷水坑）`), added 2026-07-16, sourced from
陽明山國家公園管理處. Checkpoints (小油坑登山口 → 七星主峰 → 七星東峰 →
冷水坑登山口) summit 七星主峰, the true peak of 七星山 (#002 in
small-hundred-peaks.json). `suburban-routes.json` lists `七星山主峰東峰`
verbatim.

Change made:
- `designations`: `[]` → `["taiwan_small_hundred_peak:002"]`
- Added `sourceReferences` entry:
  ```json
  {
    "organization": "教育部體育署",
    "url": "https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=2",
    "fields": ["designations"]
  }
  ```
  Verified against small-hundred-peaks.json #002 (mountainName 七星山, county
  臺北市) — matches.
- Bumped `sourceVersion`/`reviewedAt` to `2026-07-17`.
- Added `{"organization": "教育部體育署", "url": ".../PKNO=2"}` to
  `data/routes/sources.json`.

---

## 003 大武崙山 — REJECTED

Checked:
- https://www.northguan-nsa.gov.tw/user/article.aspx?Lang=1&SNo=04005324
  (情人湖公園, 北海岸及觀音山國家風景區管理處): publishes 環湖步道 (~1,400m)
  and 環山步道 (~1,600m) around 情人湖, near 大武崙山's slope, but never names
  a route reaching 大武崙山's own summit or 大武崙砲台, and gives no duration
  or difficulty for either trail.
- https://www.northguan-nsa.gov.tw/user/article.aspx?Lang=1&SNo=04005325
  (大武崙砲台, same agency): states summit elevation "標高為231公尺" and gives
  driving directions plus a short "約3分鐘" final approach from a fork, but no
  full named-trailhead-to-summit distance, no total duration, no difficulty.
- `recreation.forest.gov.tw` trail database (117 entries, fetched via
  `mis/api/BasicInfo/Trail`): no entry for 大武崙山.
- No dedicated 基隆市政府/travel.klcg.gov.tw "登山步道" template page exists
  for 大武崙山 (unlike 紅淡山/槓子寮山, checked below).

Missing required fields: no official source publishes a single coherent
route (one trailhead to the summit) with `distanceKm`, `durationMinutes`, and
`difficulty` all stated. `durationMinutes` and `difficulty` have no official
value anywhere. Rejected.

---

## 004 槓子寮山 — REJECTED

Checked:
- https://travel.klcg.gov.tw/TourContent.aspx?n=7839&s=714 (龍崗步道,
  基隆市文化觀光局 official structured trail page — the same template used
  for the existing `jiangziliao-mountain` catalog record). Publishes:
  `步道類型：第 0 級` (explicit numeric difficulty = 0), `步道長度(公尺)：2250`,
  `海拔高度(公尺)：153`, `是否為環型步道：是`, `是否有入山/入園管制：否`.
  Verified by requesting a full verbatim extraction of the page (not just a
  field-by-field query) to rule out a missed field — no `步行時間`/duration
  figure appears anywhere on the page (contrast with the sibling page for
  #011 姜子寮山 on the same template, which does publish "約120分鐘").
- https://tour.klcg.gov.tw/zh-hant/attractions/5421055/ (older CMS,
  基隆旅遊網): general historical/ecological description of 龍崗步道 and
  槓子寮砲台, no distance/duration/difficulty figures.

Missing required field: `durationMinutes` (required, cannot be null) has no
official value. Rejected despite having good distance/elevation/difficulty
data, per the brief's "reject rather than guess" instruction — no estimating
duration from distance.

---

## 005 觀音山 — REJECTED

Checked:
- https://www.northguan-nsa.gov.tw/user/article.aspx?Lang=1&SNo=04002861
  (硬漢嶺步道, 交通部觀光署北海岸及觀音山國家風景區管理處— official NSA
  page). Publishes: `坡度較陡，屬於二級坡，單程距離約1563公尺...緩步慢行需要
  至少60分鐘，才能抵達步道頂端硬漢嶺，因此被分類為「鍛鍊級」步道`, plus a full
  checkpoint sequence with segment times (硬漢嶺登山步道口 →[25min]→ 雙亭 →[5min]→
  水利署洪水預報中繼站 →[25min]→ 觀景台 →[5min]→ 硬漢嶺; segments sum to the
  stated 60 minutes) and summit elevation 616m.
- Searched specifically for a numeric difficulty legend on
  northguan-nsa.gov.tw (悠遊級/健行級/挑戰級/鍛鍊級 definitions) and for a
  documented 1:1 mapping to a 0-6 scale. None found. The page states a slope
  classification ("二級坡") and a text tier ("鍛鍊級"), but neither is an
  explicit statement of the schema's difficulty integer, and I found no
  official document equating this NSA's slope/tier vocabulary to the 0-6
  scale used elsewhere in this catalog (that scale comes from
  recreation.forest.gov.tw's own trail-class field and the National Park
  system's "國家公園步道系統分級", neither of which this NSA site uses).

Missing required field: `difficulty` (required, cannot be null, integer 0-6)
has no officially stated numeric value and no documented 1:1 tier mapping.
Rejected, even though distance/duration/checkpoints were all solidly
sourced — per the brief, do not invent a tier-to-number mapping without an
official source stating the equivalence.

---

## 006 基隆山 — REJECTED

Checked:
- https://newtaipei.travel/zh-tw/attractions/detail/112882 (基隆山步道,
  新北市政府觀光旅遊局 — official). Publishes: `難易度等級：親山休閒型(多為
  水泥石材等人工不透水鋪面及高強度使用設施為主，坡度陡多以階梯型式供登山者
  使用之類型)` and `路線全長約 0.89 公里`. No duration figure anywhere on the
  page (checked raw HTML directly, not just an AI summary).
- Confirmed via recreation.forest.gov.tw's trail database and via
  danlantrail.necoast-nsa.gov.tw / necoast-nsa.gov.tw search: no dedicated
  official trail-detail page for 基隆山 exists on either domain (基隆山 is
  only mentioned as a scenery reference point from other trails, e.g.
  南子吝步道).
- The `雞籠山步道` entry at recreation.forest.gov.tw (`Trail/RT?tr_id=108`)
  is a different mountain entirely (臺南市白河區, elevation 878-889m) —
  confirmed a false-positive match on the name, not our 基隆山 in 新北市瑞芳區.

Missing required fields: `durationMinutes` (no official value anywhere) and
`difficulty` (only a text tier "親山休閒型" with no numeric mapping). Rejected.

---

## 007 紅淡山 — REJECTED

Checked:
- https://travel.klcg.gov.tw/TourContent.aspx?n=7839&s=715 (紅淡山步道,
  基隆市文化觀光局 official structured page, same template as #004 and the
  existing #011 姜子寮山 record). Publishes: `步道類型：第 0 級` (explicit
  numeric difficulty = 0), `步道長度(公尺)：3000`, `海拔高度(公尺)：208`,
  `是否有入山/入園管制：否`. Full verbatim extraction confirmed no
  `步行時間`/duration field is present on this page.
- https://www.klra.klcg.gov.tw/tw/klra/913-97487.html (基隆市仁愛區公所,
  official district office page): describes 寶明寺/南天宮 as the two
  trailheads but states no distance, duration, difficulty, or ordered
  checkpoint sequence.

Missing required field: `durationMinutes` has no official value on any
government page found. (Multiple hiking blogs quote a detailed
南天宮→...→寶明寺 segment-timed route, but blogs are not official sources per
the brief's constraints.) Rejected — same failure mode as #004.

---

## 008 大崙頭山 — REJECTED

Checked:
- https://www.geo.gov.taipei/ (臺北市政府工務局大地工程處) news/FAQ pages:
  confirm 大崙頭山 is one of Taipei's five official 親山步道 mountain systems
  (五指山系) and describe forest-management history (830m boardwalk installed
  2000, 6 platforms added 2006, a 3-story tree pavilion in 2016), but no page
  found publishes distance/duration/difficulty for a specific route to the
  summit.
- https://gisweb.gov.taipei/release/picture/2-10/臺北大縱走導覽手冊.pdf
  (official 臺北市政府工務局大地工程處 130-page PDF handbook for the "臺北
  大縱走"). This does describe reaching 大崙頭山: "叉路距離大崙頭山頂僅650
  公尺...沿步道走大約10分鐘即可抵達。大崙頭山海拔478公尺，是內湖區的最高峰
  ...登頂後從大崙頭山北面步道下山，大約20～30分鐘，即可抵達碧山路。" This
  gives elevation (478m) and a short spur distance/time, but: (a) it is an
  optional side-trip off the official Grand Traverse route, not the
  standard/named route ("標準的臺北大縱走第四段的路線，並不會前往...山頂"),
  (b) the ascent/descent times are asymmetric and not tied to one clearly
  named, independently-locatable trailhead, and (c) no numeric difficulty is
  stated anywhere for this spur or for 大崙頭山北面步道 generally.
- The FAQ confirms hiking-trail pamphlets for the five systems exist but are
  only distributed physically/on request, with no downloadable per-trail data
  found online.

Missing required fields: `difficulty` (no numeric value published anywhere)
and a single coherent official checkpoint sequence with one consistent
duration figure. Rejected.

---

## 010 五分山 — REJECTED

Checked:
- https://newtaipei.travel/zh-tw/attractions/detail/402587 (五分山步道,
  新北市政府觀光旅遊局 — official). Publishes `難易度等級：親山休閒型` and
  `路線全長約 3.6 公里`. No duration stated (checked raw HTML directly).
- https://danlantrail.necoast-nsa.gov.tw/Trails-Content.aspx?a=2911&l=1&listid=2867&fromCnt=0
  (五分山步道, 淡蘭國家綠道主題網站 — copyright held by 交通部觀光署東北角
  及宜蘭海岸國家風景區管理處, an official NSA authority). Publishes
  structured fields: `路徑長度 1.50 km`, `海拔高度 最高 530 m / 最低 224 m`,
  `爬升高度 總上升 307 m / 總下降 51 m`, `難易度 勇腳級` (with a
  `level-star star-2` CSS class, not a stated number), start `嶺頭土地公`,
  end `新平溪煤礦博物園區`, and prose confirming the route passes the summit
  radar station: "步道終點是中央氣象署的「五分山氣象雷達站」...中後段一路
  爬至山頂約需2小時" (~120 minutes stated in prose).
- Searched specifically for an official 淡蘭古道 legend defining
  悠遊級/健腳級/勇腳級/山友級 as explicit numbers; found only star-icon counts
  used inconsistently across different trail pages/blog reposts, no official
  page stating "勇腳級 = level N" on a 0-6 (or any other) integer scale.

Missing required field: `difficulty` — the only value available is a text
tier plus an unlabeled CSS star-count, neither of which is an official
numeric statement or a documented 1:1 mapping to 0-6. (`durationMinutes`
~120 and `elevationGainM` 307 were otherwise usable from this same source.)
Rejected per the brief's caution against inventing a tier mapping.

---

## 013 南港山 — REJECTED

Checked:
- https://www.travel.taipei/zh-tw/attraction/details/561 (南港山縱走親山步道,
  official 臺北旅遊網): blocked — the domain returns HTTP 403 to both direct
  fetch and the WebFetch tool (Cloudflare bot-challenge), including the
  English-language mirror and the PDF handbook link
  (https://www.travel.taipei/file/3620/). No official structured data could
  be retrieved from this source.
- https://gisweb.gov.taipei/release/picture/2-10/臺北大縱走導覽手冊.pdf
  (official 大地工程處 PDF, successfully fetched directly). Describes the
  南港山系 segment (臺北大縱走第六段) in detail: it names 九五峰 (375m, "為
  南港山系的最高點") as a distinct peak from the 南港山 triangulation point
  itself ("九五峰往西的步道約20～30公尺處，有一顆南港山三等三角點"), and gives
  a cumulative distance axis for the whole ~10km segment, but never isolates
  a single duration or difficulty figure specifically for reaching the 南港山
  trig point (as opposed to the whole multi-peak traverse or the 九五峰
  high point), and states no numeric difficulty for any sub-section.
- geo.gov.taipei FAQ confirms 南港山系 pamphlets exist for physical pickup
  only; no downloadable per-trail dataset found.

Missing required fields: no single official source (or officially
cross-referenced set) gives one coherent route's `distanceKm`,
`durationMinutes`, and numeric `difficulty` specifically for reaching the
南港山 summit/trig point, as distinct from the much longer multi-peak
traverse. Rejected.

---

## Verification

```
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm run routes:verify
```

```
Catalog invalid
Hundred peaks: 100
Suburban routes: 54
Small hundred peaks: 5
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 3 to 5 (+2, matching the two
designations added: 001, 002). `Missing sources: 0` and `Duplicate slugs: 0`
confirm the edits are internally consistent. The overall `Catalog invalid`
result is expected and pre-existing — it comes from suburban-route and
small-hundred-peak gaps entirely outside this batch's 10-mountain scope
(remaining designations 003-010/012-100 not covered here, and the
suburban-route quota of 100, currently at 54, tracked by other batches of
this same multi-session project).

## Files changed

- `data/routes/catalog.json`: added `taiwan_small_hundred_peak:001` to
  `datun-main-peak-trail` and `taiwan_small_hundred_peak:002` to
  `qixing-main-east-trail`, each with one added `sourceReferences` entry.
- `data/routes/sources.json`: added 2 new `教育部體育署` (isports.sa.gov.tw)
  entries for PKNO=1 and PKNO=2.
