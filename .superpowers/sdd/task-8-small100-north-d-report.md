# Task 8 batch report: Small Hundred Peak designations — North cluster D

Reviewed at 2026-07-17. All ten mountains in this batch were **rejected** — no
catalog record was added, no `data/routes/catalog.json` or
`data/routes/sources.json` edits were made. Overlap check against both
`data/routes/catalog.json` (154 records) and `data/routes/hundred-peaks.json`
(100 canonical peaks) found zero name/spelling-variant matches for any of the
ten mountain names, so the "add designation to existing record" path did not
apply to any of them.

Common failure pattern across this batch: every one of these ten peaks is a
municipal/suburban "郊山" reachable via city/district-government trail pages
(Taipei, New Taipei, Taoyuan) rather than `recreation.forest.gov.tw`'s
structured `Trail/RT` national-trail database (only 022 東眼山 is inside a
national forest recreation area, and even that page's internal trail data
turned out incomplete for this schema — see below). These municipal pages
consistently publish **either** a distance **or** a qualitative difficulty
tier (e.g. `自然健行型`, `休閒`, `親山休閒型`, `勇腳級`) but essentially never
an exact `durationMinutes` figure and never a numeric 0–6 difficulty that maps
1:1 to the catalog's scale — and several pages explicitly disclaim that their
tier system is not the general hiking-difficulty standard. Per the brief's
non-negotiable rule ("do not guess, average, or derive"; "reject rather than
guess"), and following this project's own established precedent in
`task-8-small100-north-a-report.md` (8 of 10 mountains in that batch were
rejected for the identical failure mode: text-only difficulty tier with no
official numeric mapping), every mountain below where a required field had no
directly-stated official numeric value was rejected rather than approximated.

---

## 009 劍潭山 (臺北市) — REJECTED

Checked:
- https://www.gov.taipei/News_Content.aspx?n=F0DDAF49B89E9413&sms=72544237BBE4C5F6&s=39FDE2C2DC3571FF
  (臺北市政府 official news release, "劍潭山親山步道生態導覽"). Publishes a full
  ordered checkpoint sequence: `劍潭捷運站2號出口→劍潭公園→大忠宮→電臺微波站
  木棧道觀景平臺→打印臺→崗哨體驗區→杜英大道→小山脊的相思林→七美觀音夕照觀景
  平臺→叉路→石階步道→竹林小徑→銘傳大學→捷運劍潭站1號出口`. Does **not** state
  distance, duration, or a difficulty rating anywhere in the release; only
  describes the trail qualitatively as "平緩好走" (flat and easy).
- https://www.geo.gov.taipei/News_Content.aspx?n=23285747C0511EC4&sms=72544237BBE4C5F6&s=C2629CAD556415CE
  (臺北市政府工務局大地工程處, "北市13條親山步道近捷運"). Lists 劍潭山親山步道
  by district (中山區) and nearest MRT station only; the press release
  explicitly contains no distance/duration/difficulty table for any of the
  13 trails listed.
- https://taipeigrandtrail.gov.taipei/News_Content.aspx?n=C94E32183886B2B7&sms=0D4775CC3E9CCAF5&s=BBF500B26F7707BA
  (臺北大縱走 official Segment 5 page). Gives distance/duration only for the
  *entire* Segment 5 (`約12公里 (累積68公里)`, `6～7小時`) which crosses
  multiple peaks (劍潭山, 忠勇山, 碧山巖 area, etc.) — not a boundary specific
  to 劍潭山, so it cannot be attributed to this mountain's own route without
  inventing a sub-segment boundary the source does not draw.

Missing required fields: `distanceKm` and `durationMinutes` have no official
value on any Taipei City government page found for a 劍潭山-specific route;
`difficulty` also has no numeric value anywhere. (Third-party blogs quote
"約3.3公里, 90分鐘" but blogs are not official sources per the brief.)
Rejected.

---

## 012 大尖山 (新北市, 汐止) — REJECTED

Checked:
- https://newtaipei.travel/zh-tw/attractions/detail/402603 (大尖山登山步道,
  新北市政府觀光旅遊局 — official structured page). Publishes
  `路線全長：約 2.91 公里` and `步道難易度等級：自然健行型（以木作及砌石等
  透水性鋪面及中度使用設施為主，供親近自然及具自然山徑健行能力者使用之
  類型）`. No `步行時間`/duration field present anywhere on the page (checked
  raw structured fields directly).
- https://www.xizhi.ntpc.gov.tw/home.jsp?id=4ca726a3e79c81ee (大尖山風景區
  一日遊, 新北市汐止區公所 — official). Gives only an approximate range,
  "循天秀宮旁階梯步行而上約30-40分鐘即可到達大尖山頂" (30–40 minutes, a range
  not an exact figure, and only for the climb from one specific trailhead,
  not tied to the 2.91 km route above), and separately "約需3~4小時" for a
  much longer itinerary continuing to 四分尾山 and 秀峰瀑布 (different route
  scope entirely). No numeric difficulty anywhere.
- https://newtaipei.travel/zh-tw/attractions/detail/402572 (大尖、二尖山系
  步道 — official, different page): `路線全長約 6.7 公里`, a different scope
  covering multiple peaks, not usable as "the" 大尖山 route either.

Missing required fields: `durationMinutes` has no single exact official value
tied to the 2.91 km structured route (only an approximate 30–40 min range for
a different, partial climb), and `difficulty` has no numeric value. Rejected.

---

## 014 土庫丘 (臺北市/新北市) — REJECTED

Note: `土庫丘` (small hundred peak #14, per
`data/routes/small-hundred-peaks.json`, isports PKNO=14) appears to be the
same mountain that municipal/hiking sources call `土庫岳` (389 m, at the
Taipei Nangang / New Taipei Xizhi-Shenkeng-Shiding border) — but since no
official source below supplies the required route fields regardless, this
identity question does not need to be resolved for this decision.

Checked:
- https://www.shenkeng.ntpc.gov.tw/home.jsp?id=adbb16502b55a98a (尋幽步道,
  新北市深坑區公所 — official). Describes the 更寮古道/土庫尖路 approach and
  states only `約一小時餘可達稜頂分岔路` (~1 hour or more to reach the ridge
  fork — not the summit itself, and not an exact figure). No distance in km
  anywhere on the page, no numeric difficulty, no ordered checkpoint list to
  a defined start/end.
- Searched specifically for a 南港區公所 or 石碇區公所 official page
  publishing a coherent 土庫岳/土庫丘 route with distance; none found — all
  other hits (Tony的自然人文旅記, 健行筆記, PeoPo公民新聞, various blogs) are
  non-official.

Missing required fields: `distanceKm` (no official value at all),
`durationMinutes` (only an approximate, partial "to the ridge fork" figure,
not to the summit), and `difficulty` (no numeric value). Rejected.

---

## 016 南勢角山 (新北市, 中和/烘爐地) — REJECTED

Checked:
- https://newtaipei.travel/zh-tw/attractions/detail/402583 (烘爐地登山步道,
  新北市政府觀光旅遊局 — official structured page). Publishes
  `路線全長：約 12.9 公里` and `步道難易度等級：自然健行型（...）`. This
  distance figure covers the full 微笑山線-connected trail network spanning
  中和、新店、土城 — not a single coherent route from one trailhead to the
  南勢角山三角點. No duration field present.
- https://www.zhonghe.ntpc.gov.tw/home.jsp?id=3bd1e5a549243b43 (中和區登山
  步道導覽圖, 新北市中和區公所 — official). The trail data on this page is
  embedded only in downloadable graphic/image trailhead-signage files, with
  no distance/duration/difficulty figures present in the page's text content.
- Cross-checked multiple secondary summaries citing conflicting distances for
  what is nominally "the same" 烘爐地/南勢角山 route (12.9 km on the official
  structured page vs. ~2 km and ~1.2 km figures repeated across various
  non-official summaries) — this mirrors the exact ambiguous-boundary failure
  mode that caused this project's prior rejection of 金面山 (Neihu) in
  `task-8-single-jinmian-report.md`.

Missing required fields: `durationMinutes` (no official value) and
`difficulty` (text tier only, no numeric mapping); additionally no single
official source draws a coherent one-route boundary matching a specific
distance figure. Rejected.

---

## 017 二格山 (臺北市/新北市) — REJECTED

Checked:
- https://newtaipei.travel/zh-tw/attractions/detail/403494 (二格山系步道,
  新北市政府觀光旅遊局 — official structured page). Publishes
  `路線全長：約 1.4 公里`, `標高678公尺`, `步道難易度等級：自然健行型（...）`.
  No duration field present. Start point given only as "阿洋柔產業道路與文山
  區交界區（與猴山岳入口相對）" — one of several possible trailheads, per the
  page's own text mentioning five different access routes.
- https://wsdo.gov.taipei/News_Content.aspx?n=C2339A8CEBE6FB41&s=FDB0B05E69D875E3
  (臺北市文山區公所 — official). Confirms elevation (687 m) and describes the
  terrain qualitatively ("沿路林蔭密閉，山路高低起伏，穿越尖石峻嶺...稍強之
  腳勁者，始能輕鬆登頂") and lists five different route options (via 猴山岳
  ridge, via 草南 industrial road off 指南路三段, via 小格頭 off the
  北宜公路, etc.) but publishes no distance, duration, difficulty rating, or
  single ordered checkpoint sequence for any specific one of them.

Missing required fields: `durationMinutes` (no official value anywhere) and
`difficulty` (text tier only). The five-routes-to-one-summit structure also
means no single official page commits to one coherent start/end boundary.
Rejected.

---

## 018 天上山 (新北市, 土城/三峽交界) — REJECTED

Checked:
- https://newtaipei.travel/zh-tw/attractions/detail/110585 (天上山系步道,
  新北市政府觀光旅遊局 — official structured page). Publishes
  `路線全長：約 9.6 公里` and `步道難易度等級：自然健行型（...）`. This is
  explicitly the "系" (system) distance covering the whole 天上山系 network of
  connected trails (土城區公所 describes this system as at least six named
  sub-trails: 桐園步道、善天稜道、天文稜道、麗景步道南段、甘天步道, etc.), not
  a single coherent route to the 三等三角點 summit (1,099 m). No duration
  field present.
- Searched for a 土城區公所 official page giving a single-route distance to
  the summit specifically (not the whole system); found only a mix of
  differing unofficial figures (0.5–0.7 km from the nearest trailhead, ~6 km
  for an O-shaped 桐花公園–火焰山–天上山 loop) with no single official source
  reconciling them to one boundary.

Missing required fields: `durationMinutes` (no official value) and
`difficulty` (text tier only, and applying to the whole trail system rather
than one route). No single official source draws one coherent route
boundary. Rejected.

---

## 019 鳶山 (新北市, 三峽) — REJECTED

Checked:
- https://newtaipei.travel/zh-tw/attractions/detail/110588 (鳶山登山步道,
  新北市政府觀光旅遊局 — official structured page). Publishes
  `路線全長約 4.2 公里`, `海拔達291公尺高`, `步道難易度等級：自然健行型（...）`.
  No duration field present.
- https://www.sanxia.ntpc.gov.tw/home.jsp?id=dc5b21213dfb17e5&act=be4f48068b2b0031&dataserno=0c2325202581f52a7af59b89f724bc13
  (登山步道-鳶山登山步道, 新北市三峽區公所 — official). States a *different*
  header figure verbatim: `鳶山登山步道( 6.6公里 , 約3小時- 休閒)`, with a
  route description `鳶峰路登山口→慈惠堂→鳶峰亭→鳶山光復銅鐘→A或B下山路線`
  where route A ("原路下山") takes ~1.5 hours and route B (continuing over the
  ridge to 三峽老街) takes the full ~3 hours matching the 6.6 km header.
  Difficulty is given only as the qualitative label `休閒`.

The two official sources disagree on distance for what is nominally the same
named trail (4.2 km vs. 6.6 km) because they describe different route scopes
(a shorter out-and-back to the bell/pavilion vs. a longer through-hike to
三峽老街) without either source drawing a boundary that matches both a
distance and the schema's other required fields together. This is the same
multiple-inconsistent-length failure mode that caused this project's prior
rejection of 金面山 (Neihu, `task-8-single-jinmian-report.md`).

Missing/blocking: no single coherent official route boundary with matching
distance+duration, and `difficulty` (`自然健行型` / `休閒`) has no numeric
1:1 mapping on either source. Rejected.

---

## 020 獅仔頭山 (新北市, 新店) — REJECTED

Checked:
- https://www.xindian.ntpc.gov.tw/home.jsp?id=20c572c026acb0a6 (獅仔頭山
  隘勇線登山步道, 新北市新店區公所 — official). Publishes a full ordered
  checkpoint sequence and an exact duration: `建議路線：觀景台→登山口→觀獅坪→
  崖梯→最高點→一等三角點→防蕃古碑→石寮遺址→佛祖洞→土匪洞→獅尾格坪（往返全程
  約3小時）`. Confirmed by direct raw-HTML text extraction (not just an AI
  summary). However, this official page states **no distance in kilometers
  anywhere** (`公里`/`全長` do not appear in the route-description text) and
  **no numeric difficulty** (only narrative description of relative ease
  after boardwalk construction).
- Confirmed the New Taipei official listing "獅頭山登山步道" (id=110769,
  `路線全長約 1.0 公里`) is a **different mountain** — its own page states it
  is 小獅山 beside 碧潭, explicitly distinct from 獅仔頭山 with the 一等三角點
  "at the border between Xindian and Sanxia districts" — so it cannot be used
  to supply the missing distance figure for our target mountain.

Missing required fields: `distanceKm` (no official value anywhere) and
`difficulty` (no numeric value). `durationMinutes` (180) and checkpoints (11
named points) were otherwise solidly sourced from this same official page.
Rejected — same failure mode as the north-a batch's 010 五分山 case (solid
duration/checkpoints, but no addable numeric difficulty and, here, also no
distance).

---

## 021 金面山 (桃園市, 大溪) — REJECTED

Note: distinct from Taipei Neihu's `金面山`, which this project already
reviewed and rejected under `task-8-single-jinmian-report.md` for an
unrelated reason (conflicting lengths). This is small hundred peak #21, the
Daxi-district `金面山` (667 m, aka 鳥嘴山/鳥嘴尖), a different mountain.

Checked:
- https://travel.tycg.gov.tw (桃園觀光導覽網, 桃園市政府 official tourism
  site): searched directly (site-scoped search) and via the Daxi-district
  attraction listing (`travel.tycg.gov.tw/zh-tw/travel/district/26`) — no
  attraction page for 金面山 exists on this official site. The official
  东眼山國家森林遊樂區 page confirms the site is otherwise actively
  maintained (found and used successfully for #022 below), so this is a
  genuine absence, not a fetch failure.
- Searched for a 大溪區公所 official page specifically; none found — every
  result (健行筆記, vocus.cc, pearrr-tw.com, udn.com, ISUN SPORTS blog,
  17jump.tw, etc.) is a private hiking blog or commercial outdoors site, not
  a government page.
- `recreation.forest.gov.tw`: no trail-database entry for this 金面山 exists
  (it is not inside a national forest recreation area).

Missing: no official government source of any kind publishes route facts
(distance/duration/difficulty/checkpoints) for this mountain — only its
designation is confirmed via `教育部體育署/isports.sa.gov.tw` (PKNO=21), which
the brief explicitly says is designation evidence only, not route-fact
evidence. Rejected for total absence of an official route-fact source.

---

## 022 東眼山 (新北市/桃園市) — REJECTED

Closest near-miss in this batch — 3 of 4 hard-required numeric fields were
found on an official source, but `difficulty` could not be.

Checked:
- https://recreation.forest.gov.tw/forest/RA?typ_id=0200003 (東眼山國家森林
  遊樂區, 農業部林業及自然保育署 — official). Confirmed via raw-HTML
  extraction (not just AI summary) the exact text for the summit-reaching
  route: "自導式步道是通往東眼山頂（1,212公尺）的循環步道，步道可由遊客中心
  或自然教育中心後方進入，再由餐廳走出...全程約4,130公尺。由於步道的海拔
  落差約300公尺". No duration stated on this page for this specific trail.
- https://recreation.forest.gov.tw/Education/NC?typ_id=DYS (東眼山自然教育
  中心, same authority — official). Confirmed via raw-HTML extraction the
  exact text: "自導式步道總長度：4,134公尺，行走一圈所需時間：150分鐘。" This
  gives an official, exact `distanceKm` (4.134) and `durationMinutes` (150)
  for the loop trail from 遊客中心 up to the 東眼山三角點 (1,212 m) and back
  via 餐廳 and 景觀步道 — reachable start/end: 遊客中心 → 東眼山三角點 → 餐廳
  → 遊客中心.
- **Difficulty search (the blocking field):** the same official page states
  the park uses its own three-tier scheme (`羽量級`／`輕量級`／`重量級`) for
  this trail, classifying the 自導式步道 as `重量級` — but explicitly caveats
  elsewhere on this site (confirmed via `recreation.forest.gov.tw`'s general
  trail-difficulty legend, used elsewhere in this catalog e.g. for the 東滿
  步道's official Level-2 rating at `Trail/RT?tr_id=023`) that "園區地圖步道
  的難易度是根據森林遊樂區標準而定，而非一般登山標準" (the park-map trail
  difficulty is based on the recreation-area's own standard, explicitly NOT
  the general hiking standard used elsewhere on this site). No document was
  found equating `羽量級`/`輕量級`/`重量級` to the 0–6 scale used by this
  catalog's `difficulty` field. Mapping `重量級` to a specific number without
  such a document would be exactly the kind of invented tier-mapping the
  brief and this project's own precedent (north-a's 001 陽明山系/003
  大武崙山/010 五分山 cases) rule out.
- Also confirmed `recreation.forest.gov.tw/Trail/RT` has no dedicated
  structured entry for 自導式步道 itself (only longer national trails like
  東滿步道 get `tr_id` records with the numeric difficulty field); the
  Trail/RT entry that DOES exist inside this recreation area (東滿步道,
  `tr_id=023`, difficulty Level 2) does not summit the 東眼山三角點 — its
  checkpoint list (`東眼山森林遊樂區→東滿步道西入口→拉卡山步道叉路→北插天山
  步道叉路→東滿步道東入口→滿月圓國家森林遊樂區`) passes through the
  recreation area but never lists the triangulation point, so it cannot
  substitute as "the 東眼山 route."

**Safety/closure check performed:** the official RA page's current notice
banner (verified by raw-HTML extraction, quoted in full) reads: "【重要公告】
為提供遊客更優質的遊憩環境，東眼山國家森林遊樂區於園區內部分區域進行整修
工程...1.為提供遊客更優質的遊憩環境，於115年3月25日起進行「入口鋪面改造
作業」，採單邊開放入園...2.園區內各項遊憩服務照常提供...3.提醒!!聯外道路
北113線(東眼產業道路)部分路段嚴重坍方(由大板根往東眼山國家森林遊樂區段)，
目前封閉中，預計8月初才可通行，請自北部遊客南下運用台7乙線行經三民至東眼山
國家森林遊樂區。" This is a partial *access-road* closure (one of the roads
leading in, with an official detour route given) plus routine entrance-paving
construction, not a trail or park closure — confirmed separately against
`recreation.forest.gov.tw/Forest/CloseList` (the site's official suspended-
openings list), which returned zero entries ("沒有符合的暫停開放景點", "0
筆資料") and did not list 東眼山 or any of its trails. Also checked and ruled
out a more serious concern: news searches surfaced a July 9–11, 2026
precautionary closure of 東眼山 and 拉拉山 for Typhoon Bawei (巴威颱風), but
the current live page (fetched today, 2026-07-17) shows the park open
("東眼山國家森林遊樂區目前開園營運中") with no typhoon-closure notice
remaining — the park has since reopened and the typhoon closure is no longer
in effect. This mountain was not rejected for any closure reason; it was
rejected solely for the missing `difficulty` field.

Missing required field: `difficulty` (required, cannot be null, integer
0–6) has no officially stated numeric value and no documented 1:1 tier
mapping. Rejected, even though `distanceKm` (4.134), `durationMinutes` (150),
and `elevationDifferenceM` (~300, officially stated as "約300公尺") were all
solidly sourced.

---

## Summary

| # | Mountain | Decision | Blocking field(s) |
|---|---|---|---|
| 009 | 劍潭山 | REJECTED | distanceKm, durationMinutes, difficulty |
| 012 | 大尖山 | REJECTED | durationMinutes, difficulty |
| 014 | 土庫丘 | REJECTED | distanceKm, durationMinutes, difficulty |
| 016 | 南勢角山 | REJECTED | durationMinutes, difficulty, route boundary |
| 017 | 二格山 | REJECTED | durationMinutes, difficulty, route boundary |
| 018 | 天上山 | REJECTED | durationMinutes, difficulty, route boundary |
| 019 | 鳶山 | REJECTED | difficulty, conflicting distance |
| 020 | 獅仔頭山 | REJECTED | distanceKm, difficulty |
| 021 | 金面山 (桃園) | REJECTED | no official route-fact source at all |
| 022 | 東眼山 | REJECTED | difficulty only |

**0 mountains added, 10 rejected.** No changes were made to
`data/routes/catalog.json` or `data/routes/sources.json`.

## Verification

```
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm run routes:verify
```

Output (unchanged from pre-batch baseline, as expected with zero additions):

```
Catalog invalid
Hundred peaks: 100
Suburban routes: 54
Small hundred peaks: 7
Missing sources: 0
Duplicate slugs: 0
```

`Missing sources: 0` and `Duplicate slugs: 0` confirm no corruption was
introduced. `Catalog invalid` / `Small hundred peaks: 7` are pre-existing
baseline conditions unrelated to this batch's scope (the full catalog is
still incomplete outside this batch).

## Files changed

- `.superpowers/sdd/task-8-small100-north-d-report.md` (this file) — new.
- `data/routes/catalog.json` — unchanged.
- `data/routes/sources.json` — unchanged.
