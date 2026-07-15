# Task 8 single-route review: 金面山

## Decision

拒絕加入 `金面山`。本次沒有修改 `data/routes/catalog.json`。

## Official-source review

- 臺北市政府工務局大地工程處《臺北市統計年報》114 年 12 月底步道表列出「金面山步道」：`內湖步道叉路→金龍里福德宮(剪刀石→小金面)`，長度 2,786 公尺。這是明確的起迄與長度，但未同時提供本 catalog 所需的完整時間、難度、檢查點、撤離點與入山申請欄位。
- 交通部觀光署東北角及宜蘭海岸國家風景區管理處的淡蘭國家綠道頁面描述「金面山親山步道」有多處登山口，總長約 2.5 公里，並以文字描述不同地形難度；它沒有與前述 2,786 公尺起迄邊界一致的完整路線欄位。
- 臺北市政府英文官方資料列「Jinmianshan Hiking Trail」約 2.33 公里、約 3 小時，與前述 2,786 公尺官方步道表及淡蘭頁面的約 2.5 公里不一致。

## Eligibility result

不符合收錄條件：目前官方資料至少存在 2.33、約 2.5、2.786 公里的不同長度／邊界表述，也沒有單一 coherent boundary 能一次明確指派全部 16 個 `RouteInput` 欄位。因此未推算距離、邊界、難度、時間、檢查點、撤離點或許可資訊，亦未新增 designation。

## Sources

- https://www-ws.gov.taipei/Download.ashx?icon=.pdf&n=MTE05bm0MTLmnIjoh7rljJfluILlt6Xli5nntbHoqIjmnIjloLEucGRm&u=LzAwMS9VcGxvYWQvMzQ0L3JlbGZpbGUvMTcxMDMvOTUyOTEwNy8xMGJhZmYwMy0zM2E1LTRkZTctYTBhMi0yZTI4NmZmMjQ4N2EucGRm
- https://danlantrail.necoast-nsa.gov.tw/Towns-Content.aspx?a=3426&cat=3408&fromCnt=0&l=1&listid=3256
- https://english.gov.taipei/News_Content.aspx?Create=1&n=4FF938C7E036410F&s=9A173D1D6064AA54
