# Task 8 suburban alternate-source reassessment

## Scope

Assessed only the exact canonical names `五寮尖`、`筆架連峰`、`南插天山`.
No Hundred Peak records or unrelated working-tree changes were touched.

## Results

### 五寮尖 — rejected

The additional official New Taipei Fire Department source records a 五寮尖
rescue activity, but does not publish a single route boundary, exact duration,
numeric difficulty, ordered checkpoints, or the other missing catalog fields.
It cannot complete the existing tourism and district-office descriptions into
one fully attributable `RouteInput`; no values were inferred.

### 筆架連峰 — rejected

The additional official New Taipei legal-office PDF states that the trail is
approximately 6.1 km and describes a rope-equipped climbing section. The New
Taipei government activity route PDF identifies a 筆架連峰 segment, but neither
source publishes an exact duration, numeric 0–6 difficulty, complete ordered
route boundary, or the remaining required fields for one catalog record. No
duration or difficulty was inferred.

### 南插天山 — rejected

The additional Forestry Agency research report documents an investigation route
from 上宇內 and five survey points, including elevations, while the Taoyuan
government historical-trail report identifies a route toward 南插天山. These
sources do not publish one complete catalog route boundary, exact duration,
numeric difficulty, or complete ordered checkpoints. No route values were
inferred from adjacent 北插天山 data or from the survey points.

No catalog records were added. No Small Hundred Peak designation was added.

## Additional official sources

- [新北市政府消防局：五寮尖救援紀錄](https://www.fire.ntpc.gov.tw/PageAlbum/Detail?fid=51&id=124)
- [新北市政府法制局：筆架山連峰相關會議紀錄](https://www.law.ntpc.gov.tw/userfiles/1150600/files/108%E5%B9%B4%E7%AC%AC1%E6%AC%A1%E5%9C%8B%E8%B3%A0%E6%9C%83%E8%AD%B0%E7%B4%80%E9%8C%84.pdf)
- [新北市政府：微笑山線縱走任務路線 PDF](https://www.ntpc.gov.tw/uploaddowndoc?file=news%2F202507011438525.pdf&filedisplay=%E9%99%84%E4%BB%B6%EF%BC%9A%E3%80%8C%E5%BE%AE%E7%AC%91%E5%B1%B1%E7%B7%9A%E7%B8%B1%E8%B5%B0%E5%B0%8B%E5%AF%B6%E9%9B%86%E7%AB%A0%E4%BB%BB%E5%8B%99%E3%80%8D%E6%B4%BB%E5%8B%9512%E6%AE%B5%E4%BB%BB%E5%8B%99%E8%B7%AF%E7%B7%9A.pdf&flag=doc)
- [農業部林業及自然保育署：南插天山調查報告](https://www.forest.gov.tw/File.aspx?fno=18769)
- [桃園市政府：復興區後山傳統古道遺址報告](https://ws.tycg.gov.tw/001/Upload/1/relfile/7882/1609995/e0ef0b7b-5281-4cd6-8898-72d793d4a3fc.pdf)

## Verification

- Node 24 catalog verifier: expected remaining failure is overall 100/100/100
  coverage; no source, schema, or duplicate-slug errors.
- `git diff --check`: passed.
- `data/routes/catalog.json`: unchanged.
