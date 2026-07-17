# Task 8 batch report: Small Hundred Peak designations — Central cluster B

Reviewed: 2026-07-17

Scope: 10 mountains (026, 029, 036, 037, 039, 041, 042, 043, 046, 049) per
`.superpowers/sdd/task-8-small100-central-b-brief.md`.

Result: 3 designations added, 7 mountains rejected.

- 037 馬拉邦山 — designation added to a **pre-existing** overlapping catalog
  record (`malabang-mountain-hiking-trail`) that this batch discovered was
  already in the catalog under the alternate spelling 馬那邦山 (not caught by
  an initial substring search for "馬拉邦山" — see note under 037 below).
- 039 稍來山 — designation added to the existing `yuanzui-shaolai-xiaoxueshan-national-trail`
  record (a 3-peak traverse that already lists 稍來山 as an official
  checkpoint).
- 041 頭嵙山 — new record added (`dakeng-trail-5-toukeshan`), sourced from
  Taichung's official Dakeng trail-network map and trail-detail page.
- No new records were created for 037/039 — both were overlap situations.
  Only 041 is a genuinely new catalog entry.

---

## Important correction made mid-batch (overlap-check miss)

My first pass searched `data/routes/catalog.json` for the string "馬拉邦山"
(the spelling used in `data/routes/small-hundred-peaks.json` #037) and found
no match, so I initially built a **new** record for 馬拉邦山 sourced from
`recreation.forest.gov.tw/Trail/RT?tr_id=047`. Before finalizing, a
`sources.json` dedupe check showed `tr_id=047` was already present, which led
me to discover an existing record `malabang-mountain-hiking-trail`
(mountainName "馬那邦山登山步道", added 2026-07-14 by a prior batch) using the
alternate official spelling 馬那邦山 (那, not 拉) — both spellings are used
interchangeably for the same peak on the official forest.gov.tw page itself
("馬拉邦古道...馬那邦山秋夏多雨..."). I removed my duplicate new record and
instead added the designation to the existing record, per the brief's overlap
rule. Flagging this so the controller is aware the "first-attempt, no prior
work" framing in the brief was not quite accurate for 037 — a prior batch had
already fully populated this route under an alternate spelling, just without
the small-hundred-peak designation attached.

---

## 026 十八尖山 — REJECTED

Checked:
- https://tourism.hccg.gov.tw/chtravel/app/travel/view?id=25&serno=d2b006d0-08b3-48ea-a921-051f36d1e795&module=travel
  (新竹市觀光旅遊網, official 新竹市政府 tourism page — fetched raw HTML
  directly, not a summary). Publishes only narrative text: "整個步行路程約
  七、八公里，最高處為131.79公尺" (approx. 7-8km, a range, not exact) and
  "海拔131.79公尺" (summit elevation, official). No duration figure, no
  numeric difficulty, no ordered checkpoint list anywhere on the page.
- Searched specifically for a 新竹市工務處/公園路燈管理所 structured trail-data
  page (the agency that actually manages the park) — none found via web
  search; only the tourism-narrative page above exists.
- Third-party sources (健行筆記, travel blogs) give conflicting numbers
  ("3.7公里/79公尺落差", "1小時30分鐘", "20分鐘登頂" depending on entrance) —
  none of these are official-source figures and they disagree with each
  other, which itself argues against picking one.

Missing required fields: `distanceKm` (only an approximate range is
officially published), `durationMinutes` (no official exact figure), and
`difficulty` (not stated numerically anywhere official). Rejected.

---

## 029 獅頭山 — REJECTED

Checked:
- https://www.trimt-nsa.gov.tw/zh-tw/attraction/47/ (獅山古道, 參山國家風景區
  管理處 official attraction page). Raw HTML contains no distance/duration/
  difficulty/checkpoint fields at all (narrative-only; confirmed by direct
  grep of the raw HTML body, not just an AI summary).
- https://www.trimt-nsa.gov.tw/zh-tw/trail/55/ — same agency's *structured*
  trail-data page for 獅山古道(第二級). This page embeds a Next.js
  `__NEXT_DATA__` JSON blob with real fields: `length: 4.39`,
  `sport_time_min/max: 157`, `difficulty: 1`, `rank: 2`,
  `highest_altitude: 450`, `lowest_altitude: 150`,
  `departure_name: "124縣道頭份至南庄22Km處"`,
  `destination_name: "獅山牌樓登山口"`. This is real structured data (verified
  directly in the page's embedded JSON, not AI-summarized) — but neither
  endpoint name is 獅頭山's own triangulation-point summit, and the JSON has
  no checkpoint/waypoint array at all (only two named endpoints, both
  trailhead-type locations, not the peak).
- Checked 7 neighboring official trail pages on the same site
  (`/zh-tw/trail/54,56,57,58,59,60,61/`: 六寮古道, 藤坪步道, 水濂橋及水濂洞
  步道, 銅鏡山林步道, 十二寮步道, 峨眉湖環湖步道-至真段, 峨眉湖環湖步道) —
  none of their departure/destination names reference 獅頭山's summit or
  三角點 either; they cover the surrounding trail network (遊客中心, 峨眉湖,
  十二寮, 銅鏡村) but not the peak itself.
- 獅頭山's actual triangulation point (492m, 3rd-class trig #25 per non-
  official hiking sites) is reached via a spur off the ancient trail
  network, per a summarized reading of the 獅山古道 page — but no official
  page documents this spur as its own route with distance/duration/
  checkpoints.

Missing required fields: `checkpoints` (no official ordered waypoint
sequence reaching the actual summit exists — the two structured trail pages
checked give only trailhead-to-trailhead endpoints, not a route to 獅頭山's
peak) and consequently unclear `distanceKm`/`durationMinutes` for the actual
summit ascent. Rejected.

---

## 036 關刀山 — REJECTED

Checked:
- https://miaolitravel.net/Article.aspx?sNo=04004519 (關刀山步道, 苗栗縣政府
  文化觀光局 official structured page — fetched raw HTML). Publishes:
  "1.所在地：三義鄉、大湖鄉交界 2.起迄：苗56線~關刀山三角點 3.步道長：1.2公里，
  步行時間：單程約45分鐘 4.步道路徑：勝興車站-大草排-叉路廣場-登山口（西南側、
  東南側）-關刀山三角點". This gives distance (1.2km), duration (45 min,
  qualified "約" but a single stated figure, not a range), and an ordered
  checkpoint sequence explicitly reaching 關刀山三角點. No numeric difficulty
  anywhere on the page.
- https://www.sanyi.gov.tw/News_Content.aspx?n=3559&s=135112 (三義鄉公所
  official page): narrative only (elevation 889m, history), no distance/
  duration/difficulty/checkpoints.
- `recreation.forest.gov.tw`'s 117-trail database: no entry for 關刀山
  (confirmed via the bulk `mis/api/BasicInfo/Trail` endpoint and a text
  search of all `TR_CNAME`/`GUIDE_CONTENT` fields).
- isports.sa.gov.tw's own PKNO=36 page is designation evidence per the
  brief's rule #4, not usable for route facts — not used for any field here.

Missing required field: `difficulty` (required, cannot be null, integer
0-6) has no officially stated numeric value on either official page found,
and no official 1:1 tier-to-number mapping exists for these pages (they use
no tier vocabulary at all, just an unrated narrative). Rejected despite
having solid distance/duration/checkpoint data.

---

## 037 馬拉邦山 — ADDED (designation added to a pre-existing overlapping record)

`data/routes/catalog.json` already contains suburban record
`malabang-mountain-hiking-trail` (mountainName/routeName "馬那邦山登山步道",
region 苗栗縣大湖鄉、泰安鄉), added by a prior batch on 2026-07-14, sourced
from `recreation.forest.gov.tw/Trail/RT?tr_id=047`. Its checkpoint sequence
(天然湖登山口（南線）→ 馬那邦山岔路口 → 馬那邦山三角點、徐慶榮紀念碑 → 馬那邦山
岔路口 → 石門遺址 → 日軍軍營遺址 → 古戰場紀念碑 → 上湖／珠湖岔路口 → 上湖登山口)
explicitly summits 馬那邦山三角點, the true peak of 馬拉邦山 (小百岳#037 — the
two spellings 馬拉邦/馬那邦 are used interchangeably for the same peak on the
official forest.gov.tw page itself). All other fields (distanceKm 4.3,
elevationDifferenceM 606, durationMinutes 155, difficulty 2) were already
present and independently re-verified against the live page during this
batch (raw HTML of `Trail/RT?tr_id=047` contains the itinerary text
"天然湖登山口（南線） → （2.2公里，55分鐘）→ 馬那邦山岔路口 → （0.1公里，10分鐘）
→ 馬那邦山三角點、徐慶榮紀念碑 → ... → 上湖登山口", "海拔高度 800 ~ 1,406 公尺",
"高度落差 606 公尺", matching the existing record).

Change made:
- `designations`: `[]` → `["taiwan_small_hundred_peak:037"]`
- Added a new `sourceReferences` entry citing 教育部體育署 (designation
  evidence, matching the project's established pattern):
  ```json
  {
    "organization": "教育部體育署",
    "url": "https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=37",
    "fields": ["designations"]
  }
  ```
  Verified this URL is `data/routes/small-hundred-peaks.json`'s #037 source
  (mountainName 馬拉邦山, county 苗栗縣) — matches.
- Bumped `sourceVersion`/`reviewedAt` on the record to `2026-07-17`.
- Added `{"organization": "教育部體育署", "url": ".../PKNO=37"}` to
  `data/routes/sources.json` (not previously present; `tr_id=047` was
  already present from the prior batch, deduped/skipped).

No other field on the existing record was touched. No new catalog record was
created.

---

## 039 稍來山 — ADDED (designation added to existing overlapping record)

`data/routes/catalog.json` already contains suburban record
`yuanzui-shaolai-xiaoxueshan-national-trail` (mountainName/routeName
"鳶嘴稍來小雪山國家步道", region 臺中市和平區, added 2026-07-14, sourced from
`recreation.forest.gov.tw/Trail/RT?tr_id=060`). Its 8-point checkpoint
sequence already names 稍來山 explicitly as checkpoint #3 of 8 (鳶嘴山登山口/
大雪山林道27K → 鳶嘴山 → 稍來山 → 大雪山林道35.1K收費站 → 船型山 → 瞭望台 →
鞍馬山 → 小雪山旅遊資訊站停車場/大雪山林道49K), alongside two other named
peaks (鳶嘴山, 船型山) that follow the same "peak name as its own checkpoint"
pattern, confirming 稍來山 is treated as a genuine summit waypoint on this
official trail, not a passing scenery mention. `recreation.forest.gov.tw`'s
117-trail database has no separate dedicated "稍來山" trail entry distinct
from this one, so this traverse is the only official route covering the
peak.

I did not search this route out fresh — it surfaced immediately from the
overlap check required by the brief's Step 1 (search catalog.json for the
mountain name before researching). Per the brief's own guidance that a
"passing mention...inside an unrelated report" should be treated as noise
but an actual catalog record is not noise, I treated this as a genuine
overlap and added the designation rather than researching a duplicate route.

Change made:
- `designations`: `[]` → `["taiwan_small_hundred_peak:039"]`
- Added a new `sourceReferences` entry citing 教育部體育署:
  ```json
  {
    "organization": "教育部體育署",
    "url": "https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=38",
    "fields": ["designations"]
  }
  ```
  Verified against `small-hundred-peaks.json` #039 (mountainName 稍來山,
  county 臺中市) — matches.
- Bumped `sourceVersion`/`reviewedAt` to `2026-07-17`.
- Added `{"organization": "教育部體育署", "url": ".../PKNO=38"}` to
  `data/routes/sources.json`.

No other field on the existing record was touched. No new catalog record was
created.

---

## 041 頭嵙山 — ADDED (new record: `dakeng-trail-5-toukeshan`)

頭嵙山 and 南觀音山 both sit inside Taichung's Dakeng (大坑) numbered-trail
system, per the brief's specific instruction to check whether an existing
official source treats one of the numbered trails (#1-#10) as the summit
route. No existing catalog record covered any Dakeng trail (checked for
"大坑"/"頭嵙山"/"南觀音山" substrings in `catalog.json` — no hits), so this
required fresh research, not an overlap add.

Sources checked and cross-verified against each other:
- https://travel.taichung.gov.tw/zh-tw/experience/hikingtrail/5 (大坑5號登山
  步道, 臺中市政府觀光旅遊局 official structured page, raw HTML — same
  template used for all 14 Dakeng numbered-trail pages, fetched and parsed
  directly for ids 1-19 to build a full picture of the trail network).
  Publishes: "所在區域 北屯區、新社區", "難度 休閒級", "路線長度 1.4公里",
  "運動時間 1-2 小時" (a range), "海拔高度 595~859 公尺", and route
  description "大坑5號步道呈南北縱向，全長1.4公里，海拔介於595至859公尺之間，
  串聯起1至4號步道。沿山稜而行，**經二嵙山及頭嵙山**...". 859m matches 頭嵙山's
  known summit elevation exactly, and the text explicitly names 頭嵙山 as
  being passed along this trail. 起點：斜頭巷，終點：民政里.
- https://www.scenic.taichung.gov.tw/media/921858/大坑登山步道總導覽圖.pdf
  (大坑登山步道總導覽圖, 臺中市風景區管理所/觀光旅遊局 official PDF map,
  downloaded and read at 400dpi to resolve the per-trail stat table
  precisely). Explicitly plots a POI labeled "小百岳三角點（頭嵙山）" positioned
  at trail 5's terminus near 頭嵙亭, and its per-trail table gives an EXACT
  single duration for every trail (not a range): "5號登山步道 ▲90分 1.4km
  ★★" — 1.4km matches the hikingtrail page exactly, 90 minutes falls inside
  the hikingtrail page's "1-2小時" range (consistent, just more precise), and
  ★★ matches the map's own legend "休閒級步道 ★★" against the hikingtrail
  page's text tier "休閒級" (also consistent). Because these two official,
  same-agency sources agree on distance and difficulty-tier and the PDF
  gives an exact minute figure consistent with the hikingtrail page's range,
  I used the PDF's exact 90-minute figure for `durationMinutes` rather than
  treating the hikingtrail page's range as blocking.
- Cross-checked internal consistency across all 14 Dakeng trail entries: the
  map's star-rating legend (健腳級 ★★★, 休閒級 ★★, 親子級 ★, read at high
  resolution after an initial low-resolution misread) matches every
  individual trail's text-tier label on `travel.taichung.gov.tw` *except*
  one (see 042 below) — this gave confidence trail 5's data is reliable.

Difficulty mapping used: the PDF map explicitly encodes each trail's
difficulty tier as a star count in its own printed legend (健腳級步道=★★★,
休閒級步道=★★, 親子級步道=★), and every other trail's star count matched its
independently-published text tier. I used trail 5's star count (★★,
休閒級) directly as `difficulty: 2`, citing the map as the mapping source.

`elevationGainM`/`elevationDifferenceM`: neither page states an explicit
"高度落差" or "爬升" figure (only the 595~859m range), so per the brief's
"never derive" constraint both are left `null` rather than computed from the
range.

Checkpoints (official, ordered, matching the stated route text exactly):
```json
[
  {"name": "斜頭巷登山口", "order": 1},
  {"name": "二嵙山", "order": 2},
  {"name": "頭嵙山（小百岳三角點）", "order": 3},
  {"name": "民政里", "order": 4}
]
```

No coordinates published on either page (both null, allowed). No permit
statement published on either page (`permitNotes: null`). No evacuation
points published (`evacuationPoints: []`).

Full JSON inserted (slug `dakeng-trail-5-toukeshan`):
```json
{
  "slug": "dakeng-trail-5-toukeshan",
  "mountainName": "頭嵙山",
  "routeName": "大坑5號登山步道",
  "region": "臺中市北屯區、新社區",
  "kind": "suburban",
  "startLat": null,
  "startLng": null,
  "distanceKm": 1.4,
  "designations": ["taiwan_small_hundred_peak:041"],
  "elevationGainM": null,
  "elevationDifferenceM": null,
  "durationMinutes": 90,
  "difficulty": 2,
  "checkpoints": [
    {"name": "斜頭巷登山口", "order": 1},
    {"name": "二嵙山", "order": 2},
    {"name": "頭嵙山（小百岳三角點）", "order": 3},
    {"name": "民政里", "order": 4}
  ],
  "evacuationPoints": [],
  "permitNotes": null,
  "sourceOrganization": "臺中市風景區管理所",
  "sourceUrl": "https://www.scenic.taichung.gov.tw/media/921858/大坑登山步道總導覽圖.pdf",
  "sourceReferences": [
    {
      "organization": "臺中市風景區管理所",
      "url": "https://www.scenic.taichung.gov.tw/media/921858/大坑登山步道總導覽圖.pdf",
      "fields": ["distanceKm", "durationMinutes", "difficulty"]
    },
    {
      "organization": "臺中市政府觀光旅遊局",
      "url": "https://travel.taichung.gov.tw/zh-tw/experience/hikingtrail/5",
      "fields": ["mountainName", "routeName", "region", "kind", "checkpoints"]
    },
    {
      "organization": "教育部體育署",
      "url": "https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=40",
      "fields": ["slug", "designations"]
    }
  ],
  "sourceVersion": "2026-07-17",
  "reviewedAt": "2026-07-17"
}
```

Added to `data/routes/sources.json`: the PDF map URL (臺中市風景區管理所),
the hikingtrail/5 URL (臺中市政府觀光旅遊局), and the isports PKNO=40 URL
(教育部體育署) — none were previously present.

---

## 042 南觀音山 — REJECTED

Checked (same Dakeng research pass as 041 above):
- https://travel.taichung.gov.tw/zh-tw/experience/hikingtrail/15 (大坑11號
  登山步道, official structured page, raw HTML). Publishes: "所在區域 北屯區",
  "難度 親子級", "路線長度 1公里", "運動時間 1 小時" (single value, not a
  range), "海拔高度 190~318 公尺", "起點：南觀音山，終點：廍子路", and route
  description "...步道最高點為**南觀音山玉佛寺**，再沿下山步道返回中臺科技大學
  中台湖旁" — this explicitly confirms the trail's highest point IS 南觀音山's
  summit (a large Buddha statue marks the peak). This page alone gives
  distance/duration/checkpoints/text-difficulty for a route that clearly
  reaches the actual summit.
- https://www.scenic.taichung.gov.tw/media/921858/大坑登山步道總導覽圖.pdf
  (same official PDF map used for 041). This map does **not** have an "11"
  entry matching the numbering system above; instead it has a separately-
  labeled purple loop icon "中臺科大觀音山登山步道" with its own exact stats:
  "35分 1km ★★" (休閒級 per the map's own legend).
- These two official, same-agency sources disagree: the numbered-trail page
  (大坑11號) states 親子級/1★-equivalent difficulty and 60-minute duration for
  a 1km route; the map's differently-named entry (中臺科大觀音山登山步道)
  states 休閒級/2★ and 35 minutes for what is also stated as a 1km route.
  Unlike every other Dakeng trail I checked (1, 2, 3, 3-1, 4, 5, 5-1, 6, 7,
  8, 9, 9-1, 10 — all 13 of which had the map's star rating match the
  hikingtrail page's text tier exactly), this is the one pair that does not
  reconcile, and the map itself signals they may be two distinct trails (a
  different icon/name, not slotted into the "11" numbering) rather than the
  same trail measured twice.

I could not confirm with confidence that "大坑11號登山步道" and "中臺科大觀音山
登山步道" are the same physical route, so I could not safely combine the
duration+checkpoints from one page with the difficulty-star from the other.
Taken separately, neither single source publishes all of distance +
duration + a schema-compatible numeric difficulty + checkpoints together:
`hikingtrail/15` has no numeric difficulty (only the text tier "親子級",
without a map-legend match I trust for this specific route); the PDF map's
"中臺科大觀音山" entry has no checkpoint/narrative detail at all. Rejected
rather than guessing which source's numbers apply to the addition.

---

## 043 三汀山 — REJECTED

Checked:
- https://travel.taichung.gov.tw/zh-tw/attractions/intro/743 (咬人狗坑生態
  景觀步道, 臺中市政府觀光旅遊局 — official domain). This "attractions/intro"
  template (distinct from the "experience/hikingtrail" template used
  successfully for Dakeng trails 1-11) renders its content client-side; the
  raw HTML response contains only site navigation/footer chrome and zero
  body text (confirmed by direct grep and by a WebFetch pass that also
  found nothing). No distance/duration/difficulty/checkpoint data was
  retrievable from this official page despite it being the correct
  authoritative URL.
- No dedicated official PDF trail map found for 咬人狗坑/三汀山 (unlike
  Dakeng, which had one) after a targeted search.
- isports.sa.gov.tw PKNO=42 is designation evidence only per the brief's
  rule #4, not used for route facts.
- All specific numeric figures found (e.g. "全長單程3.9公里，落差361公尺",
  "5條步道1260M/1055M/785M/305M/555M") come from private hiking blogs
  (健行筆記, vocus, gpx-trace sites), not from the government page itself,
  and are not usable as official sources per the brief's constraints.

Missing all of `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` from a verifiable official source — the one official page
found does not expose its content to a non-JS-executing fetch, and no
alternate official source with the same data was located. Rejected.

---

## 046 阿罩霧山 — REJECTED

Checked:
- https://travel.taichung.gov.tw/zh-tw/attractions/intro/1400 (中心瓏登山
  步道, 臺中市政府觀光旅遊局 — official domain, same "attractions/intro"
  template as 043). Same result: raw HTML and WebFetch both returned zero
  body content — only navigation chrome, no trail statistics.
- No dedicated official PDF trail map found for 中心瓏/阿罩霧山 after a
  targeted search (unlike Dakeng).
- isports.sa.gov.tw PKNO=45 is designation evidence only, not used for
  route facts.
- Numeric figures found in search results ("7.66公里總里程，214.11公尺總
  爬升" and a full GPX-derived checkpoint list with segment times) trace to
  a private hiking blog's own recorded GPS track, not an official
  publication — explicitly disallowed ("never derive elevationGainM/ascent
  from KML").

Missing all of `distanceKm`, `durationMinutes`, `difficulty`, and
`checkpoints` from a verifiable official source, for the same structural
reason as 043 (the official attraction page's content is not accessible via
static fetch, and no alternate official structured source exists). Rejected.

---

## 049 貓囒山 — REJECTED

Checked:
- https://www.sunmoonlake.gov.tw/attractions/Attractions?A=20&Id=64 (貓囒山
  步道, 日月潭國家風景區管理處 — official page, raw HTML fetched and parsed
  directly, real body content present unlike the Taichung "intro" template
  above). Publishes: "貓囒山是日月潭四秀之一，海拔約1020公尺...全長約4.6公里，
  路線難度低，坡度平緩...往返約需2至2.5小時" and a narrative describing two
  segments (登山口→茶改場魚池分場 ~3.3公里, 茶改場→中央氣象署日月潭氣象站
  ~1.3公里, terminus elevation 1020m). This is the correct, authoritative
  NSA page (confirmed against multiple search results pointing to it).
- Distance (4.6km) is stated as an approximate total ("全長約4.6公里"), not
  qualifying as the required non-null but this alone might be tolerable;
  the blocking issues are duration and difficulty:
  `durationMinutes`: only "往返約需2至2.5小時" — an explicit **range**
  (120-150 minutes), not a single exact figure. `difficulty`: only the
  qualitative "路線難度低" ("low difficulty") — no numeric value and no
  documented tier-to-number mapping (this NSA does not use the same
  numbered scale as recreation.forest.gov.tw or a Dakeng-style star legend).
- No structured itinerary/segment-time table exists on this page (unlike
  forest.gov.tw's pattern), so `durationMinutes` cannot be reconstructed
  from summed official segment times either.

Missing required fields: `durationMinutes` (only a range published) and
`difficulty` (only a qualitative label, no numeric value or official 1:1
mapping). Rejected.

---

## Fields left `null` (not derived) on all three additions

Per the brief's constraint, `elevationGainM` was left `null` on all three
records because no official source among those checked publishes a
distinct cumulative-ascent figure (only elevation ranges or an explicit
"高度落差" total-difference figure, which is a different field).
`elevationDifferenceM` was populated only where a source *explicitly*
labels a figure as the difference/落差 itself (037: forest.gov.tw's own
"高度落差 606 公尺" field; 039: pre-existing record, untouched); for 041, the
Dakeng sources only give an elevation *range* (595~859m) without an
explicit difference label, so `elevationDifferenceM` was left `null` rather
than computed by subtraction.

## Verify

```
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm run routes:verify
```

```
Catalog invalid
Hundred peaks: 100
Suburban routes: 55
Small hundred peaks: 8
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` increased from 5 (at HEAD, commit 3dd963b) to 8 —
exactly the 3 mountains added in this batch (037, 039, 041). `Catalog
invalid` / the suburban-route and remaining-small-hundred-peak "missing"
lists are expected and out of this batch's scope (the full catalog is still
incomplete outside these 10 mountains).
