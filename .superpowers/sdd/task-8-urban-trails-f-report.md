# Task 8 suburban trails batch F

## Scope

Reviewed only the exact remaining canonical names 鵝公髻山、加里山、火炎山.
No Hundred Peak records were changed and no Small Hundred Peak designation was
added.

## Results

### 鵝公髻山 — rejected

Official source: [i運動資訊平台](https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=31)

The official profile describes multiple access routes and separate ascent
times, including 山上人家、第一登山口、第二登山口及金鵝橋旁登山口。It does
not define one complete route boundary with a numeric difficulty, exact total
distance, or a complete ordered checkpoint route. No catalog record was added.

### 加里山 — rejected

Official source: [台灣山林悠遊網](https://recreation.forest.gov.tw/Trail/RT?tr_id=043)

The official page presents two distinct boundaries: the 6.8 km 鹿場主線原路來回
and the 9.6 km 大坪支段 O 型路線. The page's summary recommendation is also
「一天／約半天至1天／7-9小時」rather than one exact duration. The detailed
鹿場主線 checkpoints provide component times, but selecting or summing them
would resolve a summary-versus-detail conflict rather than use one published
total duration. No catalog record was added.

### 火炎山 — rejected

Official source: [i運動資訊平台](https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=35)

The official profile describes several different approaches and trails,
including 苑裡火炎山古道、火炎山北鞍古道、南鞍古道及苗栗南橫古道. Its
步程情報 gives ascent times for two approaches but does not provide one
complete route boundary, exact total distance, numeric difficulty, or an
ordered checkpoint list for a single route. No catalog record was added.

## Verification

- Node 24 catalog verifier: source registry, schema, and duplicate-slug checks
  pass; only the expected overall coverage errors remain.
- `git diff --check`: passed.
- `data/routes/catalog.json`: unchanged.
