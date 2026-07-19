# HikeSafe LINE-first UX 重構設計

日期：2026-07-19
狀態：已與使用者逐節確認

## 背景與目標

HikeSafe 目前已有 LIFF bootstrap、LINE webhook 對話（回報／求助／選行程）、警示三階段推播，但：

1. UI 僅有素樸樣式，行程操作使用 `window.prompt`／`window.confirm`，在 LINE 內建瀏覽器體驗差。
2. 留守綁定碼要求登山客本人在群組／OA 私訊輸入「綁定 CODE」，無法把碼交給留守人自行綁定，也沒有複製／分享功能。
3. 建立行程、開始、延長、結束仍是網頁操作，沒有 rich menu，使用者需要面對 Vercel 網址。

目標：登山客與留守人**全程在 LINE 內完成所有操作**（LIFF 頁面＋聊天訊息），並將 UI 升級為 LINE 原生風設計系統。

## 已確認的設計決策

| 決策 | 選擇 |
| --- | --- |
| 架構 | 混合式 LINE-first：rich menu＋聊天一鍵操作＋LIFF 頁面（表單、檢視） |
| 留守綁定 | 連結式邀請為主（shareTargetPicker 分享＋複製連結備援）；群組文字碼路徑原樣保留 |
| 配色 | A・LINE 原生風（LINE 綠 `#06C755`、白卡片、淺灰底） |
| 進行中行程頁版面 | B・大按鈕垂直堆疊，點按原地展開（Expander），無彈窗 |
| 建立行程表單版面 | B・單頁卡片分區（路線／時間／留守人／其他） |

## 非目標

- 不改動警示排程邏輯、retention、offline queue 的行為。
- 不做背景追蹤、導航、自動求援（維持 leave-behind 工具定位）。
- 不改動路線目錄資料與驗證流程。
- 群組綁定流程（登山客在群組輸入「綁定 CODE」）不變。

## 1. 架構：混合式 LINE-first

### 入口設計

**登山客＝OA rich menu（2×3 六格）**：

| 格 | 動作 |
| --- | --- |
| 建立行程 | LIFF URL → `/trips/new` |
| 進行中行程 | LIFF URL → `/trips/active` |
| 回報平安 | message action 送出「回報」（沿用現有 conversation 流程） |
| 我的留守人 | LIFF URL → `/guardians`（新頁：綁定清單＋邀請＋撤銷） |
| 需要協助 | message action 送出「需要協助」（沿用現有流程） |
| 使用說明 | message action 送出「說明」（conversation 新增 usage 回覆） |

**留守人＝邀請卡片與警示推播**：點邀請卡進 LIFF 綁定頁；警示推播的「查看行程」已是 LIFF URL（`src/features/alerts/process.ts:260`），本次僅需將 viewer 頁面套用新視覺。

### 聊天補完行程生命週期

- 建立行程成功後，OA 對登山客 push 一張行程摘要 Flex 卡，附「開始行程」按鈕（postback）。push 失敗（極少數：非好友）時靜默略過，LIFF 頁上的開始按鈕仍可用。
- conversation postback 文法擴充（沿用 `hikesafe:` 前綴與現有授權檢查——tripId 必須在該使用者的行程內）：
  - `hikesafe:start:{tripId}:{confirm|cancel}` — 開始行程（無 GPS；開始後以 quick reply 邀請傳送位置）。
  - `hikesafe:extend:{tripId}:{30|60|120}` — 延長預計下山時間。
  - `hikesafe:finish:{tripId}:{confirm|cancel}` — 平安下山，confirm 前先回確認 quick reply。
- 實作層呼叫與 API route 相同的 feature 層指令，idempotencyKey＝webhook event id（與現有 check-in 相同模式）。

### Rich menu 佈建

`scripts/line/setup-rich-menu.ts`：SVG 模板（配色 A）→ `sharp` 轉 2500×1686 PNG → Messaging API 建立、上傳、設為預設。可重複執行（先刪同名 menu）、提供 `--dry-run`（只輸出 PNG 與 payload 不上傳）。

## 2. 連結式留守人綁定

### 流程

1. 登山客在開團表單「留守人」卡或 `/guardians` 頁按【邀請留守人】→ `POST /api/guardian-invites`。
2. 伺服器產生 32-byte random token（base64url），在 `line_bindings` 建列存 **SHA-256 雜湊**與效期（**24 小時**），回傳 `inviteUrl`：`https://liff.line.me/{NEXT_PUBLIC_LIFF_ID}/guardian/accept?token={token}`。
3. LIFF 呼叫 `liff.shareTargetPicker` 送出 Flex 邀請卡（登山客 `users.displayName`＋說明＋【成為留守人】按鈕）。`shareTargetPicker` 不可用（權限未開／外部瀏覽器）時自動降級只顯示【複製邀請連結】。複製按鈕永遠存在（備援管道用）。
4. 留守人點按鈕 → `/guardian/accept` LIFF 頁自動 LINE 登入（`bot_prompt` 提示加 OA 好友）→ `GET /api/guardian-invites/{token}` 顯示「○○ 邀請你擔任留守人」與效期狀態 → 一鍵確認 → `POST /api/guardian-invites/accept`（body：`token`＋LIFF `idToken`）。
5. 伺服器驗證 LINE id token（沿用 `verify-id-token`）與 token 雜湊、效期、未綁定、未撤銷，成功則更新該列：`sourceType='user'`、`sourceId=留守人 lineUserId`、`displayName=留守人名稱`、`boundAt=now`、清除 token 雜湊。
6. 雙向確認：登山客收到「○○ 已成為你的留守人」push；留守人頁面顯示成功，若對留守人的 push 失敗（未加好友）則頁面顯著提示加好友（附 OA 加好友連結）。

### 資料模型

`line_bindings` 新增欄位 `invite_token_hash text unique`（nullable）＋ 對應 migration。建邀請即建列、接受即綁定，與現有 `binding_code` 流程同構；`code_expires_at` 欄位共用作為效期。

### API

| 端點 | 授權 | 行為 |
| --- | --- | --- |
| `POST /api/guardian-invites` | session cookie（同 `/api/guardian-bindings`） | 建立邀請，201 回 `{ inviteUrl, expiresAt }` |
| `GET /api/guardian-invites/{token}` | token 即能力憑證 | 回 `{ inviterDisplayName, expiresAt, status }`，`status ∈ pending｜expired｜used｜revoked`；token 不存在才回 404 |
| `POST /api/guardian-invites/accept` | body 內 LIFF idToken | 驗證後綁定；重放／過期回 409／410；成功回 `{ inviterDisplayName }` |

### 安全

- token 一次性、僅存雜湊、24h 過期、成功即失效；撤銷沿用 `revokedAt`（`/guardians` 頁提供撤銷鈕）。
- 綁定成功即通知登山客並顯示對方名稱，防連結轉錯人；發現錯誤可立即撤銷。
- 登山客把連結傳給自己並接受＝綁定自己私訊，與現行文字碼行為一致，不特別阻擋。

## 3. UI 設計系統（配色 A・LINE 原生風）

### Design tokens（`app/globals.css` CSS variables）

- 主色 `--color-primary: #06C755`、按壓 `#05A94A`；背景 `#F7F8FA`；卡片 `#FFFFFF`、圓角 `14px`、陰影 `0 1px 4px rgba(0,0,0,.06)`。
- 文字：主 `#111827`、次要 `#8B8F98`；危險 `#D93025`。
- 警示三階段：黃 `#F5A623`（超時）→ 橘 `#FF7A1A`（+60）→ 紅 `#D93025`（+120）；網頁與 Flex 卡片 header 用同一組色。
- 觸控目標 ≥44px（主按鈕 48px）、`env(safe-area-inset-bottom)` padding、保留 `prefers-reduced-motion`。

### 共用元件（`app/components/`，每檔 <50 行）

| 元件 | 用途 |
| --- | --- |
| `Button` | primary／secondary／danger／ghost 四型，全寬 |
| `Card` | 白底圓角卡片容器 |
| `Chip` | 狀態徽章（進行中／草稿／已結束／未綁定） |
| `Notice` | 成功／警示／錯誤橫幅（含 `role="status"`／`role="alert"`） |
| `Expander` | 原地展開操作區，取代所有 `window.prompt`／`confirm` |

## 4. 頁面重構

| 頁面 | 內容 |
| --- | --- |
| `/`（首頁） | 標題卡（LOGO＋副標）、行程狀態卡（有進行中行程直接顯示可點入）、2×2 主操作 |
| `/trips/new`（版面 B） | 四張卡：路線（搜尋＋已選摘要）／時間（依路線自動帶入）／留守人（已綁清單＋【邀請留守人】【複製邀請連結】）／其他（交通、裝備、電話，摺疊）。送出鍵停用時顯示缺件原因（如「尚缺留守人」） |
| `/trips/[tripId]`（版面 B） | 狀態卡＋全寬按鈕堆疊：回報平安（展開：平安／已到山屋／自訂訊息附 GPS）、延長時間（展開：+30/+60/+120/自訂）、平安下山（展開確認列）、需要協助（展開確認＋留言）。離線佇列以 Notice 呈現 |
| `/trips/active` | 套用新視覺（轉向邏輯不變） |
| `/guardians`（新增） | 綁定清單（顯示名稱／類型／時間）＋撤銷＋邀請按鈕 |
| `/guardian/accept`（新增） | 邀請摘要＋一鍵確認＋加好友引導 |
| `/trips/[tripId]/guardian-viewer` | 套用新視覺（token 授權邏輯不變） |

## 5. 錯誤處理

- 所有錯誤經 `Notice` 呈現，文案沿用 `src/features/i18n/copy.ts` 雙語模式，新增邀請／撤銷／accept 相關條目。
- `GET /api/guardian-invites/{token}` 以 `status` 區分過期／已用／已撤銷，accept 頁據此顯示「請登山客重新邀請」等指引；token 為 32-byte 隨機值，不可猜測，無需隱藏存在性。
- accept 頁在 LIFF 未登入、token 失效、已被使用三種狀態各有明確畫面與下一步指引。
- conversation 新增 postback 沿用現有「不在你的行程內」防護與錯誤文案模式。

## 6. 測試策略（TDD，vitest＋repository fakes，沿用現有模式）

- 邀請 token：建立（雜湊落庫、效期）、消費（成功綁定）、過期、重放、撤銷後拒絕——單元＋整合。
- conversation：start／extend／finish postback 的授權、確認流、冪等。
- 表單邏輯：`canSubmitQuickTrip` 缺件提示文案、Expander 開闔狀態。
- accept API：id token 驗證失敗 401、token 狀態碼矩陣。
- rich menu 腳本：`--dry-run` 產出 payload 快照測試。
- 覆蓋率目標：變更模組 80%+（`--cov` 範圍限變更檔案）。

## 7. 分期實施（各自獨立可交付，依序）

1. **Phase 1｜UI 設計系統與頁面重構**：tokens、共用元件、四頁改版、移除所有彈窗。
2. **Phase 2｜連結式綁定**：migration、三支 API、`/guardians`、`/guardian/accept`、分享／複製、雙向通知。
3. **Phase 3｜LINE-first 補完**：rich menu 佈建腳本、聊天 start／extend／finish、行程摘要卡、「說明」回覆、viewer 頁視覺。

## 8. 營運前置作業（實作完成後由操作者在 LINE console 執行）

1. LIFF app 開啟 `shareTargetPicker`（chat_message.write scope）。
2. 確認 LIFF endpoint 指向部署網址、size 設定 Full。
3. 取得 OA 加好友連結（`https://line.me/R/ti/p/@{OA_ID}`）供 accept 頁使用（新增 env `NEXT_PUBLIC_LINE_OA_URL`）。
4. 執行 `scripts/line/setup-rich-menu.ts` 佈建 rich menu。
5. LINE Login channel 確認 bot link（`bot_prompt`）已連結 Messaging API channel。
