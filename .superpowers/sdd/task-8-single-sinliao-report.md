# 新寮瀑布步道單筆查核報告

查核日期：2026-07-16

結論：拒絕新增 `新寮瀑布步道` 至 `data/routes/catalog.json`。

## 官方來源

1. 農業部林業及自然保育署步道基本資料 API
   URL: https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail

   直接查核結果：
   - `TRAILID`: `011`
   - `TR_CNAME`: `新寮瀑布步道`
   - `TR_POSITION`: `宜蘭縣南澳鄉`
   - `TR_LENGTH_NUM`: `1.200`
   - `TR_DIF_CLASS`: `1`
   - `TR_TOUR`: `半天`
   - `TR_permit`: `無`
   - `URL`: `https://recreation.forest.gov.tw/Trail/RT?tr_id=011`

2. 農業部林業及自然保育署步道官方頁
   URL: https://recreation.forest.gov.tw/Trail/RT?tr_id=011

   直接查核結果：
   - 頁面摘要列示：
     - `步道全長`: `1.2 公里`
     - `建議時間`: `半天`
     - `入山申請`: `否`
   - 頁面敘述列示：
     - `沿著新寮溪溪谷溯源而上，全長1.2k`
     - `第一層步道的前0.9k較為平坦，0.9k後的石階路較陡`
   - `詳細路線` 列示：
     - `林業及自然保育署宜蘭分署冬山工作站→(0.9K, 27分鐘)→吊橋叉路口→(0.1K, 3分鐘)→第一層瀑布觀瀑平臺→(0.5K, 15分鐘)→第二層小瀑布→原路折返→(1.2K, 45分鐘)→林業及自然保育署宜蘭分署冬山工作站`
   - 同頁 `特色景觀` 文字列示：
     - `來回約1小時`
     - `目前通往第一層瀑布的步道已完成，路程往返約1.2公里，約1小時可輕鬆完成`
     - `新寮瀑布步道全程來回原長3.4公里`

## 可直接支持的值

- `routeName`: `新寮瀑布步道`
- `region`: `宜蘭縣南澳鄉`
- `difficulty`: `1`
- `permitNotes`: 可直接落為 `入山申請：否`
- `sourceOrganization`: `農業部林業及自然保育署`
- `sourceUrl`: `https://recreation.forest.gov.tw/Trail/RT?tr_id=011`

## 缺欄與衝突

1. `durationMinutes` 無法安全填寫：
   - API 與頁面摘要只給 `半天`，不可換算分鐘。
   - 同頁另有 `來回約1小時`。
   - `詳細路線` 又列出 `27 + 3 + 15 + 45` 分鐘的另一條邊界不同路徑。

2. `distanceKm` 無法安全填寫：
   - API 與頁面摘要給 `1.2 公里`。
   - 同頁 `特色景觀` 給 `路程往返約1.2公里`。
   - 同頁 `詳細路線` 則列到 `第二層小瀑布`，分段里程為 `0.9K + 0.1K + 0.5K + 1.2K`，顯示另一個不同範圍。
   - 同頁又寫 `全程來回原長3.4公里`。

3. `checkpoints` 無法安全填寫：
   - 官方頁可讀到 `冬山工作站`、`吊橋叉路口`、`第一層瀑布觀瀑平臺`、`第二層小瀑布`。
   - 但同頁同時存在「目前完成到第一層瀑布」與「詳細路線延伸到第二層小瀑布」兩種 canonical 邊界，無法判定哪一組 checkpoint 才是該筆 route schema 應收錄的 exact single route。

## 拒絕理由

1. 官方確有 `新寮瀑布步道` 單一路線頁，但同一頁內對 canonical 範圍的描述互相衝突。
2. 官方資料至少同時存在三種不相容範圍：
   - 摘要／API：`1.2 公里`、`半天`
   - 特色景觀：`目前通往第一層瀑布`、`來回約1小時`、`往返約1.2公里`
   - 詳細路線：延伸至 `第二層小瀑布` 的分段路線
3. 依要求，不可：
   - 把 `半天` 換算成分鐘
   - 自行選邊界把不同官方段落拼成單一路線
   - 以其中一組 checkpoint／distance／duration 覆蓋另一組官方值

因此本次不修改 `data/routes/catalog.json`。

## source registry 一致性檢查

- `https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail` 已存在於 `data/routes/sources.json`。
- `https://recreation.forest.gov.tw/Trail/RT?tr_id=011` 已存在於 `data/routes/sources.json`。
- 本次因拒絕新增 route，未修改 `data/routes/sources.json`。
