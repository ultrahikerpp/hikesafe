# HikeSafe Phase 2：連結式留守人綁定設計

日期：2026-07-21
狀態：已與使用者逐節確認
上游：`docs/superpowers/specs/2026-07-19-line-first-ux-redesign-design.md` §2（本文件為對照 Phase 1 實際落地結果後的修正版，衝突處以本文件為準）

## 背景

Phase 1（UI 設計系統與頁面重構）已合併 master（commit `107ae7b`）。目前留守人綁定只有一條路徑：登山客在建立行程表單按【建立留守綁定碼】產生 6 碼文字碼，再由本人在群組／OA 私訊輸入「綁定 CODE」。這條路徑無法把綁定能力交給留守人自行完成，也沒有分享與複製功能。

Phase 2 目標：登山客產生**一次性邀請連結**，透過 LINE 分享或複製交給留守人，留守人點連結即可自行完成綁定，雙方都收到確認。

## 對上游 spec §2 的四項修正

實作前對照現況後發現的問題，均已與使用者確認：

1. **接受後保留 token 雜湊**。上游 §2 步驟 5 要求接受成功後清除 `invite_token_hash`。清除後 `GET /api/guardian-invites/{token}` 查不到列只能回 404，`status='used'` 永遠不會出現，accept 頁無法顯示「這個邀請已被使用」。改為保留雜湊（SHA-256 的已消費 token 無洩露價值），unique 約束照舊。
2. **每次邀請一律新建 token，不重用未過期的 pending 邀請**。重用會破壞多留守人情境：邀請 A 後再按一次要邀請 B，會拿到同一條連結，先接受者消費掉、後者失效。代價是列數可能膨脹，以「單一使用者未過期 pending 邀請上限 10 條」的檢查作為防濫用下限。
3. **新增重複綁定檢查**。上游未提。同一個 LINE 使用者對同一位登山客已有未撤銷綁定時再接受邀請，會產生第二條 binding，警示推播即重複發送。改為回 409 並在頁面顯示「你已經是 ○○ 的留守人」。
4. **補撤銷端點**。上游 §2 提到 `/guardians` 有撤銷鈕，但 API 表沒有對應端點。補 `DELETE /api/guardian-bindings/{id}`。

## 非目標

- 不改動警示排程邏輯、retention、offline queue。
- 群組文字碼綁定路徑（webhook 端「綁定 CODE」處理）行為不變，僅調整 UI 位置。
- Rich menu、聊天內 start／extend／finish、行程摘要卡屬 Phase 3，本期不做。
- 不清理 `drizzle/` 底下重複的 `0011_` 編號（`0011_line_location_source.sql`、`0011_route_catalog_tiered_sources.sql`）。migration runner 依檔名排序，兩者都會套用，實際不會出錯；本期新增的 migration 使用 `0012_`。

## Task 0：Phase 2 前的獨立修正

Phase 1 全分支 review 留下的非阻斷待辦：`help`／`finish`／`extend` 在 `fetch` 本身拋出例外時（離線情境）沒有使用者可見的錯誤提示，僅 non-ok response 才有。`help` 對登山客求助情境有安全風險，不再延期。

- 抽 `app/trips/[tripId]/request-action.ts`：包住 `fetch` 的 throw 與 non-ok 兩條路徑，統一回 `{ ok, error }`。
- `app/trips/[tripId]/TripActions.tsx` 的 help／finish／extend 三處改用此 helper。
- 回歸測試：mock `fetch` 直接 reject，斷言 `Notice` 出現錯誤文案（修正前失敗、修正後通過）。
- 獨立一個 commit，與連結式綁定不混。

## 資料模型

`drizzle/0012_guardian_invites.sql`：

```sql
ALTER TABLE line_bindings ADD COLUMN invite_token_hash text UNIQUE;
```

同步更新 `src/db/schema.ts` 的 `lineBindings` 定義。

- 效期共用既有 `code_expires_at` 欄位，24 小時。
- 邀請即建列，`source_type`／`source_id`／`bound_at` 為 null。建立行程表單的留守人選單已用 `boundAt && sourceId` 過濾（`app/trips/new/TripForm.tsx`），因此 pending 邀請不會污染選單。
- 與現有 `binding_code` 流程同構：建碼即建列、消費即綁定。

## Feature 層

`src/features/line/guardian-invites.ts`，照 `src/features/trips/invites.ts` 的既有形狀撰寫（repository interface + transaction 注入、可用 fake 測試）：

- token：`randomBytes(32).toString('base64url')`，資料庫只存 `createHash('sha256')` 十六進位值。
- 消費時以 `.for('update')` 鎖列，避免同一連結並行接受。

三個函式：

| 函式 | 行為 |
| --- | --- |
| `createGuardianInvite({ userId, now })` | 檢查未過期 pending 邀請數 < 10，否則 throw；建列並回 `{ token, expiresAt }` |
| `readGuardianInvite({ token, now })` | 回 `{ inviterDisplayName, expiresAt, status }` 或 undefined |
| `acceptGuardianInvite({ token, lineUserId, displayName, now })` | 驗證後綁定，回 `{ inviterDisplayName, bindingId }`；失敗以具名錯誤區分 |

狀態判定順序（先命中先回）：

1. 查無該雜湊 → undefined（呼叫端回 404）
2. `revokedAt` 非 null → `revoked`
3. `boundAt` 非 null → `used`
4. `codeExpiresAt <= now` → `expired`
5. 其餘 → `pending`

接受成功時的欄位寫入：`sourceType='user'`、`sourceId=留守人 lineUserId`、`displayName=留守人名稱`、`boundAt=now`；`inviteTokenHash` 保留不清除。

## API

| 端點 | 授權 | 行為 |
| --- | --- | --- |
| `POST /api/guardian-invites` | session cookie（同 `/api/guardian-bindings`） | 建立邀請，201 回 `{ inviteUrl, expiresAt }`；pending 超過 10 條回 409 |
| `GET /api/guardian-invites/[token]` | token 即能力憑證 | 200 回 `{ inviterDisplayName, expiresAt, status }`；查無回 404 |
| `POST /api/guardian-invites/accept` | body 內 LIFF `idToken` | 成功 200 回 `{ inviterDisplayName }` |
| `DELETE /api/guardian-bindings/[id]` | session cookie | 寫入 `revokedAt`；非本人的 binding 回 404 |

`inviteUrl` 格式：`https://liff.line.me/{NEXT_PUBLIC_LIFF_ID}/guardian/accept?token={token}`。

`POST /api/guardian-invites/accept` 狀態碼矩陣：

| 情況 | 狀態碼 |
| --- | --- |
| idToken 驗證失敗 | 401 |
| token 查無 | 404 |
| 已被使用／已撤銷／已是該登山客的留守人 | 409（以 body `reason` 區分 `used`／`revoked`／`already_bound`） |
| 已過期 | 410 |
| 成功 | 200 |

`DELETE` 對他人 binding 回 404 而非 403，避免洩露 id 存在性。

## 頁面

| 頁面 | 內容 |
| --- | --- |
| `/guardians`（新增） | 綁定清單（顯示名稱／類型／綁定時間／撤銷鈕）＋【邀請留守人】；產生連結後顯示【分享到 LINE】（僅在 `liff.isApiAvailable('shareTargetPicker')` 為真時 render）與【複製連結】（永遠存在）；次要區塊保留文字綁定碼，供群組綁定使用 |
| `/guardian/accept`（新增） | LIFF 登入（`bot_prompt` 提示加 OA 好友）→ 依 `status` 呈現四種畫面 → 一鍵確認 → 成功頁；push 失敗時顯著提示加好友 |
| `app/trips/new/TripForm.tsx` | 【建立留守綁定碼】換成【邀請留守人】＋【複製連結】；表單內文字碼 UI 移除（webhook 端處理邏輯不動） |
| `app/HomeContent.tsx` | 新增 `/guardians` 入口（Phase 3 rich menu 上線前的唯一到達路徑） |

沿用 Phase 1 的共用元件（`Button`／`Card`／`Chip`／`Notice`／`Expander`）與 design tokens，不新增元件。

## 通知

- 接受成功後 push 給登山客「○○ 已成為你的留守人」：對象取 `users.lineUserId`，用 `pushLineMessage`，`idempotencyKey` = binding id。push 失敗只記 log 不擋流程（登山客可能非好友）。
- 給留守人的歡迎 push 失敗（未加 OA 好友）時，由 accept 頁顯示加好友引導。
- 雙向確認的用意是防連結轉錯人：登山客立即看到對方名稱，發現錯誤可在 `/guardians` 撤銷。

## 安全

- token 一次性、32-byte 隨機、僅存雜湊、24 小時過期、成功即失效（靠 `boundAt` 而非刪雜湊）。
- token 不可猜測，`GET` 無需隱藏存在性；`DELETE` 則以 404 隱藏他人 binding id。
- 所有 session 端點沿用 `/api/guardian-bindings` 既有的 cookie 解析與 `verifySession`。
- 登山客把連結傳給自己並接受＝綁定自己私訊，與現行文字碼行為一致，不特別阻擋。

## 環境變數

`src/env.ts` 新增 `NEXT_PUBLIC_LINE_OA_URL`，設為 `.optional()`。未設定時 accept 頁的加好友引導降級為純文字提示，不擋部署。

## 錯誤處理

- 所有錯誤經 `Notice` 呈現，文案沿用 `src/features/i18n/copy.ts` 雙語模式，新增邀請／撤銷／accept 相關條目。
- accept 頁在 LIFF 未登入、pending、expired、used、revoked、already_bound 各有明確畫面與下一步指引（過期與已用皆導向「請登山客重新邀請」）。
- feature 層以具名錯誤回報失敗原因，由 API route 轉成狀態碼，不在 feature 層處理 HTTP。

## 測試策略

TDD，沿用現有 vitest + repository fake 模式。

| 測試檔 | 涵蓋 |
| --- | --- |
| `tests/features/guardian-invites.test.ts` | 建立（雜湊落庫、24h 效期）、狀態矩陣五種、接受成功、過期、重放、撤銷後拒絕、重複綁定、pending 上限 10 |
| `tests/api/guardian-invites-accept.test.ts` | idToken 驗證失敗 401、狀態碼矩陣、成功回傳 |
| `tests/features/guardians-page.test.tsx` | shareTargetPicker 不可用時只出現複製鈕、撤銷後清單更新 |
| `tests/features/guardian-accept-page.test.tsx` | 六種狀態畫面 |
| `tests/features/trip-actions.test.tsx` | 補 Task 0 回歸測試（`fetch` reject 時出現錯誤 Notice） |

覆蓋率目標：變更模組 80%+（`--cov` 範圍限變更檔案）。

## 營運前置作業

實作完成後由操作者在 LINE console 執行：

1. LIFF app 開啟 `shareTargetPicker`（`chat_message.write` scope）。未開啟時前端自動降級為只顯示複製連結，功能不中斷。
2. 確認 LIFF endpoint 指向部署網址、size 設定 Full。
3. 取得 OA 加好友連結（`https://line.me/R/ti/p/@{OA_ID}`）設為 `NEXT_PUBLIC_LINE_OA_URL`。
4. LINE Login channel 確認 bot link（`bot_prompt`）已連結 Messaging API channel。
