# Task 8 batch report: Small Hundred Peak designations — Chiayi/South cluster F

Reviewed at: 2026-07-17
Reviewer: Claude (subagent), Task 8 batch "south-f"

## Summary

All ten mountains were researched. **0 added, 10 rejected.** Two mountains
(崁頭山, 竹子尖山) have official, otherwise-complete route data but are
under active closure right now and were rejected under the mandatory safety
rule. The other eight lack an official source that covers all
schema-required fields (most commonly: no official numeric `durationMinutes`
and/or `difficulty`, or no official ordered `checkpoints` sequence, or no
official source at all).

Overlap check: grepped `data/routes/catalog.json` (all 154 records, including
every `checkpoints[].name` entry) for all ten mountain names and short-form
variants — zero matches anywhere in the file, top-level or nested. Also
confirmed none of the ten appear in `data/routes/hundred-peaks.json` (the 100
traditional Hundred Peaks). All ten are genuinely new, unclaimed candidates;
none required merging into an existing record.

Baseline before this batch: `npm run routes:verify` reported `Small hundred
peaks: 12`. Since 0 mountains were added, this count is unchanged after this
batch (see Verify section).

---

## 051 松柏坑山 (彰化縣/南投縣) — REJECTED

**Designation source:** 教育部體育署 i運動資訊平台,
https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=50
(designation evidence only, per brief — not used for route facts.)

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found under this mountain name (checked via site search and general web search).
- 參山國家風景區管理處 (official NSA), 登廟步道 (aka 豐柏生態步道):
  https://www.trimt-nsa.gov.tw/zh-tw/trail/45/ — this IS a complete official
  route record: distance 2.11 km total / 1.8 km main section, duration 83
  minutes, difficulty level 1, checkpoints 豐柏廣場 → (4 pavilions) → 賞猿台 →
  臥雲橋 → 摸乳巷 → 受天宮, status quoted verbatim: "狀態：正常營運" (normal
  operation, not closed).
- Cross-checked via multiple hiking-log sources (健行筆記 review 18696,
  輝哥的天空 changhuaAA051 page) that the actual 松柏坑山 三角點 (survey
  marker / summit) is a separate location ~1.8 km further from 受天宮, now
  situated inside the fenced yard of a private tea factory ("茶の魔手"), and
  reached only via a short unofficial spur near 南投縣名間鄉埔中村辦公室 —
  not part of any officially published route.

**Reason for rejection:** The one official, complete trail record found
(登廟步道) terminates at 受天宮 temple, not at 松柏坑山's summit/survey
marker. No official source publishes a route whose checkpoints reach the
actual mountain summit that this Small Hundred Peak designation refers to.
Using 登廟步道's data would misrepresent a different route as if it were the
mountain's route.

**Closure check:** Confirmed no closure on the one official trail found
(explicit "正常營運" status). Not the blocking issue here.

---

## 052 後尖山 (南投縣) — REJECTED

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=51

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 日月潭國家風景區管理處 (official NSA):
  https://www.sunmoonlake.gov.tw/zh-TW/Attractions/Attractions?a=20&id=34 —
  states 全長約6.5公里 (distance) and 海拔約1008公尺 (summit elevation), and
  a 663 m trailhead elevation, but the page has **no** stated duration, no
  stated difficulty rating, and no ordered checkpoint list — only prose
  description of terrain sections.
- 南投縣政府 (official county tourism site):
  https://travel.nantou.gov.tw/attractions/jian-mountain-trail/ — same
  distance/elevation figures, confirmed independently: **no** duration, **no**
  difficulty, **no** checkpoint list on this page either.

**Reason for rejection:** `durationMinutes` is a required, non-nullable
field per the schema, and `difficulty` is also required and non-nullable —
neither has any official numeric value published on either official source
found. (elevationGainM could theoretically be derived as 1008−663=345, but
the brief explicitly forbids deriving elevation figures — and this is moot
since duration/difficulty already block the record.)

**Closure check:** Both pages state the trail is open 09:00–17:00
year-round, closing only "因颱風等其他天然災害影響，或實施整修工程時" with
separate announcements — no currently-active closure notice found on either
page.

---

## 053 鳳凰山 (南投縣) — REJECTED

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=52

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 南投縣政府 (official county tourism site),
  https://travel.nantou.gov.tw/article/nantou-10-hiking-trail/ — states 單程4公里
  (one-way distance) and 往返6小時10分鐘 (370-minute round trip duration),
  and difficulty as the single word "中" (medium) with no numeric scale
  defined anywhere on the page.

**Reason for rejection:** `difficulty` requires an official numeric value or
an official tier scheme with an explicit 1:1 numeric mapping stated by the
source; "中" alone, undefined, does not qualify — mapping it to a number
would be a guess, which the brief explicitly forbids. Separately, the page
describes three different possible trailheads (溪頭露營區 / 鳳凰林道5k /
151縣道14.4k) without designating one canonical route, so there is no single
official ordered `checkpoints` sequence either — a second, independent
blocker.

**Closure check:** No closure/repair/storm-damage language found on the
official page.

---

## 054 金柑樹山 (南投縣) — REJECTED

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=53

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 南投分署 (林業及自然保育署南投分署) trail listing (nantou.forest.gov.tw/trail) —
  no entry for this mountain.
- 南投縣政府 tourism site — no dedicated page found for this trail.
- All route data (9.4 km, 371 m elevation gain, 4h10m duration) that exists
  online comes exclusively from hiking blogs (impoca.com, vocus.cc,
  hiking.biji.co) — none official.

**Reason for rejection:** No official government/national-park/forestry
source of any kind was found publishing route facts for this mountain.
Every required field would have to come from unofficial hiking blogs, which
the project's sourcing rules do not permit.

**Closure check:** No official source exists to check; no closure was
mentioned in the unofficial sources reviewed (informational only, not relied
upon for the decision).

---

## 057 梨子腳山 (嘉義縣) — REJECTED

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=56

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 阿里山國家風景區管理處 (ali-nsa.net) — no listing for 梨子腳山 (it lists
  the nearby 太平雲梯 attraction, but not this mountain/trail).
- No 嘉義縣政府 or township-level official trail page found either.
- All route data (distance, duration figures, which conflict between
  sources — some say ~1 km/65 min round trip, others describe it only as
  part of a longer unofficial ridge traverse) comes from hiking blogs only.

**Reason for rejection:** No official source found for any required field.

**Closure check:** No official source exists to check.

---

## 061 大湖尖山 (嘉義縣) — REJECTED

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=60

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 嘉義縣文化觀光局 (official), listing found via web search at
  `https://www.tbocc.gov.tw/SightLib/Sight_Detail.aspx?id=89110ba4-65d3-e411-a5d3-e4115b13f301&lang=tw`
  — fetched directly (both via WebFetch and `curl`); the URL returns
  **HTTP 404 "Not Found"**, i.e. the official listing page is dead/removed.
- 阿里山國家風景區管理處 (ali-nsa.net) — no listing found for this mountain.

**Reason for rejection:** No working official source was found. The only
lead (嘉義縣文化觀光局's own catalog entry) 404s.

**Closure check:** No accessible official source to check.

---

## 062 紅毛埤山 (嘉義市) — REJECTED

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=61

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- 嘉義市政府觀光旅遊網 (official city tourism site):
  https://travel.chiayi.gov.tw/TravelInformation/C000005/1/24563d14-b307-4aab-8e52-0eb772c878ac
  (蘭潭後山步道) — states 主線全長約3公里 (distance) and "2小時內即可走完全程"
  (duration, ≈120 min), plus GPS coordinates 23°28'45.5"N 120°29'22.9"E for
  the trailhead. **No** difficulty rating anywhere on the page. The
  page's only "checkpoint"-like content is an unordered list of peak/place
  names encountered along the network of paths (山仔頂山、紅毛埤山、新樂園、
  湖底、小公園、筍寮、後花園) — explicitly a set of place mentions, not a
  single official ordered same-start/same-end sequence.

**Reason for rejection:** `difficulty` (required, non-nullable) has no
official source. `checkpoints` also fails: the brief explicitly instructs
not to use "a partial list of place mentions" as checkpoints, and that is
exactly what this page provides — it names peaks and historic sites reachable
from the trail network, not an ordered route.

**Closure check:** Fetched the full page text; contains no
closed/repair/storm-damage language. Confirmed not closed.

---

## 064 崁頭山 (臺南市) — REJECTED (active closure)

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=63

**Source checked:** `recreation.forest.gov.tw` official trail database —
**hit found:** https://recreation.forest.gov.tw/Trail/RT?tr_id=109
(崁頭山步道). This page otherwise has complete official data: distance 3.2
km, elevation range 580–844 m (264 m difference), difficulty level 2,
checkpoints 孚佑宮 → 石蟾蜍 → 大石壁 → 崁頭山 → 情人石 → 蟾蜍石 → 孚佑宮,
入山申請：否.

**Reason for rejection — SAFETY, non-negotiable:** Reading the full page
text (not just the data table) surfaced an active closure notice, quoted
verbatim:

> 【暫停開放】2025/01/23 - 2026/12/31 崁頭山步道全線整修工程中，暫停開放

Translation: the entire trail is suspended for renovation work from
2025-01-23 through 2026-12-31. Today's review date is 2026-07-17 — this
closure is **currently active**. Per the brief's non-negotiable safety rule,
this trail must not be added to the catalog while closed, regardless of how
complete the rest of the official data is.

**Closure check:** Explicitly checked and found active — this is the reason
for rejection.

---

## 065 三腳南山 (嘉義縣/臺南市) — REJECTED

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=64

**Sources checked:**
- `recreation.forest.gov.tw` — no trail entry found.
- `hiking.chiayi.travel/trailinfo/959` — confirmed via page footer to be
  operated by 嘉義縣文化觀光局 (official), but the page is a client-rendered
  single-page app; a direct fetch (WebFetch and raw `curl`, 486 KB of HTML/JS
  retrieved) returns only the app shell with an in-app error message "無法
  加載步道信息" (unable to load trail information) — no usable data was
  retrievable. Attempted the page's backing API directly
  (`https://astros.chiayi.travel/api/trailinfo/959`) — returned HTTP 404;
  the API root returned HTTP 503.
- 雲嘉南濱海國家風景區管理處 (swcoast-nsa.gov.tw) — no listing found for
  this mountain.

**Reason for rejection:** No official source with retrievable, usable route
facts was found. The one official-domain page that exists could not be
accessed by any available fetch method.

**Closure check:** No accessible official source content to check.

---

## 067 竹子尖山 (臺南市) — REJECTED (active closure)

**Designation source:** https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=66

**Source checked:** 臺南市政府觀光旅遊局 (official city tourism site):
https://www.twtainan.net/zh-tw/attractions/detail/635/ (梅嶺登山步道系統).
This page identifies 梅龍步道 (~2.5 km) and 觀音步道 (~1.1 km) as the two
routes that connect to 竹子尖山's summit (elevation 1109 m, second-order
survey marker).

**Reason for rejection — SAFETY, non-negotiable:** Reading the full page
text surfaced an active closure notice for the primary route, quoted
verbatim:

> 梅龍登山步道受颱風影響，邊坡多處土石崩落，步道受阻無法通行，為維護安全，
> 自即日起暫停開放

Translation: 梅龍步道 is closed indefinitely — typhoon damage caused
multiple slope collapses that block the trail, closed "as of today" for
safety. The page states the 觀音步道 (the other route reaching 竹子尖山) is
closed under the same conditions. Both official approach routes to this
mountain are therefore currently impassable/closed. Per the brief's
non-negotiable safety rule, this must be rejected, not added.

**Closure check:** Explicitly checked and found active on both approach
routes — this is the reason for rejection.

---

## Verify

```
$ export PATH="/opt/homebrew/opt/node@24/bin:$PATH" && npm run routes:verify
Catalog invalid
Hundred peaks: 100
Suburban routes: 54
Small hundred peaks: 12
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks: 12` is unchanged from the pre-batch baseline (also 12),
consistent with 0 mountains added this batch. `Missing sources: 0` and
`Duplicate slugs: 0` confirm no partial/broken edits were made — no catalog
or sources file changes were made in this batch at all, since every
candidate was rejected. `Catalog invalid` is expected/pre-existing per the
brief (100 traditional Hundred Peaks are complete, but Suburban routes and
Small Hundred Peaks remain below target counts — unrelated to this batch).

## Files changed

None in `data/routes/catalog.json` or `data/routes/sources.json` — zero
additions this batch. Only this report file was added.
