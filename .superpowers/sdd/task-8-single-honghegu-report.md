# Task 8 — 紅河谷越嶺步道官方單一路線查核拒絕報告

## 結論

拒絕新增 `紅河谷越嶺步道` 到 `data/routes/catalog.json`。

原因不是單一欄位缺漏，而是截至 2026-07-16 可查得的官方來源裡，找不到可直接對應到 exact canonical 單一路線的官方資料頁。現有官方證據只到「官方資料庫／官方站點索引未收錄此精確路線」的程度，無法合法、精確地填入 route schema。

## 官方來源與直接值

### 1) 農業部林業及自然保育署 trail API

- URL: https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail
- 直接值：
  - 官方 API 回傳的步道清單中，未找到 `TR_CNAME` 為 `紅河谷越嶺步道`
  - 也未找到 `TR_CNAME` 含 `紅河谷` 的任何步道資料
  - 因此無對應的官方 `TRAILID`、單一路線 URL、距離、難度、遊程、入口或管制欄位可直接引用

### 2) 新北市觀光旅遊局官方 sitemap

- URL: https://newtaipei.travel/zh-tw/sitemap.xml
- 直接值：
  - 官方 sitemap 中未找到 `紅河谷`、`紅河谷越嶺步道`，也未找到相關 URL fragment
  - 因此找不到可作為 exact canonical 單一路線依據的新北觀旅官方頁面

### 3) 新北市烏來區公所官方 sitemap

- URL: https://www.wulai.ntpc.gov.tw/sitemap.xml
- 直接值：
  - 官方 sitemap 中未找到 `紅河谷`、`紅河谷越嶺步道`、`紅河谷越嶺古道` 相關頁面
  - 因此找不到烏來區公所層級的精確單一路線官方頁

## 缺欄

因不存在可直接對應的 exact canonical 官方單一路線資料頁，以下欄位皆無法用官方直接值填寫：

- `routeName`
- `region`
- `distanceKm`
- `durationMinutes`
- `difficulty`
- `checkpoints`
- `permitNotes`
- `sourceOrganization`
- `sourceUrl`
- `sourceReferences`

下列欄位也沒有官方直接值可安全填入：

- `mountainName`
- `startLat`
- `startLng`
- `designations`
- `elevationGainM`
- `elevationDifferenceM`
- `evacuationPoints`

## 拒絕理由

1. 官方步道主資料庫不存在可直接對應 `紅河谷越嶺步道` 的單一路線資料。
2. 新北市觀旅與烏來區公所的官方索引也未收錄此精確名稱頁面。
3. 在缺少 exact canonical 官方路線頁的情況下，若改用民間資料、模糊景點頁、步道系統頁、不同端點描述，會違反：
   - 只採官方來源
   - 不可把半天換算分鐘
   - 不可雙倍單程
   - 不可拼接不同越嶺段
   - `sourceReferences.fields` 只能列官方直接支持欄位

## 本次處置

- 未修改 `data/routes/catalog.json`
- 僅建立本報告
- 補登本報告引用的 2 個新北官方來源到 `data/routes/sources.json`
