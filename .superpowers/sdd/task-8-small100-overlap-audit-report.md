# Task 8: Small Hundred Peak overlap audit against existing catalog records

Review date: 2026-07-17

Per Task 8 Step 1 ("Audit overlaps"), cross-referenced the 93 still-undesignated
official Small Hundred Peaks (`data/routes/small-hundred-peaks.json`) against
`mountainName`/`routeName` in the existing 154-record catalog, instead of
researching each mountain from scratch. This is controller-performed work
(no subagent dispatch) — it required only reading a handful of already-known
files and one pair of disambiguating fetches, done directly rather than as a
research batch.

## Method

Substring match on `mountainName` between each undesignated Small Hundred
Peak and every existing catalog record. Six candidate matches were found;
each was checked against `region`/county before acceptance, since the
official Small Hundred Peak list and the traditional Hundred Peak list use
some identical mountain names for geographically unrelated peaks.

## Accepted (4)

- **030 五指山** → `wuzhishan-hiking-trail` (region 新竹縣北埔鄉, matches the
  official county 新竹縣 exactly).
- **058 獨立山** → `independent-mountain-dalongding-trail` (region 嘉義縣竹崎鄉,
  matches official county 嘉義縣; the record's own composite name
  "獨立山-大巃頂步道" and routeName already name 獨立山 as one of the two
  named points on the trail).
- **059 大塔山** → `tashan-trail` (region 嘉義縣阿里山鄉, matches official
  county 嘉義縣; mountainName is already exactly `大塔山`).
- **063 大棟山** → `guanziling-dadongshan-trail` — see disambiguation below.

Each acceptance added `designations: ["taiwan_small_hundred_peak:0XX"]` and
one new `sourceReferences` entry (`教育部體育署`, the exact `isports.sa.gov.tw`
URL already registered for that number in `small-hundred-peaks.json`, `fields:
["designations"]`), matching the pattern established in the North-A batch
(commit 3dd963b). No other field on any of these four records was changed.
The corresponding `(organization, url)` pairs were appended to
`data/routes/sources.json`.

### Disambiguation: `guanziling-dadongshan-trail` is 063 大棟山, not 060 大凍山

The record's `mountainName`/`routeName` both read "關子嶺大凍山步道" (containing
"大凍山"), which would naively suggest official designation **060 大凍山**.
But the official small-hundred-peak list carries **060 大凍山** and
**063 大棟山** as two distinct designations (dòng/凍 vs dòng/棟 — near-homophones,
easily confused in casual sources), and the record's own checkpoint list
names its actual summit **"大棟山三角點"**, not 大凍山.

Fetched both official Sports Administration pages to resolve this directly:

- `isports.sa.gov.tw/...PKNO=59` (**060 大凍山**): elevation 1,976m, 嘉義縣阿里山鄉
  (Alishan Township), accessed via 多林/頂湖 trailheads near Fenqihu — a
  different, higher peak entirely. This matches the mountain already
  evaluated (and correctly rejected for insufficient official minute-level
  duration data) in `.superpowers/sdd/task-8-single-dadongshan-recheck-report.md`
  (commit ce12e47, predates this session) — that rejection concerned the
  Fenqihu-side trail to 060, and is unaffected by this audit.
- `isports.sa.gov.tw/...PKNO=62` (**063 大棟山**): elevation 1,241m, border of
  嘉義縣大埔鄉/臺南市白河區 (Guanziling hot-spring area), trailhead 仙祖廟, route
  "關嶺國小→土地公廟→第一涼亭(橫石亭)→大棟山三角點" — this matches
  `guanziling-dadongshan-trail`'s own checkpoints (`橫石亭` at order 2,
  `大棟山三角點` at order 4) and region (臺南市白河區) exactly.

Conclusion: the trail's Forestry-published name retains a historical/colloquial
"大凍山" label, but the peak it actually summits is officially 大棟山 (063).
Assigned the designation accordingly; left `mountainName`/`routeName` and all
other fields untouched, since those are the Forestry Bureau's own published
route name (`recreation.forest.gov.tw/Trail/RT?tr_id=105`), not something
this audit has grounds to rewrite.

## Rejected as false positives (2)

- **024 石門山** (official county: 桃園市) — substring-matched
  `shimen-mountain-hehuan`, but that record's region is 南投縣仁愛鄉 and its
  source is 太魯閣國家公園管理處: a ~3,200m Hundred Peak near Hehuanshan on
  the Central Cross-Island Highway, not the ~615m hill near Shimen Reservoir
  in Taoyuan that the Small Hundred Peak list designates. Same name,
  unrelated mountains. Not merged.
- **066 西阿里關山** (official counties: 臺南市/高雄市) — substring-matched
  `guanshan-mountain` (mountainName `關山`), but that record is the
  ~3,666m Yushan-National-Park Hundred Peak on the 南一段 traverse
  (source: 玉山國家公園管理處, region 高雄市桃源區). 西阿里關山 is a low
  (~700-900m) hill near 阿里關 on the Tainan/Kaohsiung border — an entirely
  different peak that happens to share the substring "關山". This is also
  expected structurally: the Hundred Peaks (高山百岳) and Small Hundred Peaks
  (低海拔小百岳) lists are designed to be complementary, not overlapping, by
  elevation class. Not merged.

## Verification

```
npm run routes:verify
Catalog invalid
Hundred peaks: 100
Suburban routes: 54
Small hundred peaks: 11
Missing sources: 0
Duplicate slugs: 0
```

`Small hundred peaks` rose from 7 to 11 (the 4 accepted merges); `Missing
sources: 0` and `Duplicate slugs: 0` hold. `Catalog invalid` remains expected
— 46 suburban routes and 89 small-hundred-peak designations remain outside
this audit's scope. No record's `mountainName`, `routeName`, `region`, or any
route-fact field was altered by this audit; only `designations`,
`sourceReferences`, `sourceVersion`, and `reviewedAt` changed on the 4
accepted records.

## Result

- `data/routes/catalog.json`: 4 existing records gained a `designations` entry
  and one `sourceReferences` entry each. No new records, no deletions, no
  other field changes. Total record count unchanged (154).
- `data/routes/sources.json`: 4 new `(教育部體育署, isports.sa.gov.tw PKNO=...)`
  pairs appended (246 → 250).
- This report added.

## Post-review addition: 055 石壁山

A fresh-context task reviewer re-verified this batch and found the stated
method (substring match on `mountainName`/`routeName` only) missed one real
match, because it never checked `checkpoints[].name` — the exact technique
this audit itself had to use to resolve 063 大棟山. **055 石壁山** (official
counties 嘉義縣/雲林縣) matches `jianan-yunfeng-trail` (region 雲林縣古坑鄉),
whose checkpoint order 2 is literally `石壁山三角點`. Independently confirmed
against `isports.sa.gov.tw/...PKNO=54` (the official page for 055): it names
both `好望角` and `嘉南雲峰` as directly connected trail features, matching
this record's checkpoints 3 and 7. Added `designations:
["taiwan_small_hundred_peak:055"]` and a matching `教育部體育署`
`sourceReferences` entry, following the same pattern as the other 4.
`npm run routes:verify` now reports `Small hundred peaks: 12`. No other gaps
were found in the reviewer's deeper sweep (which also checked checkpoints and
common character-variant spellings across all 89 then-undesignated peaks).
