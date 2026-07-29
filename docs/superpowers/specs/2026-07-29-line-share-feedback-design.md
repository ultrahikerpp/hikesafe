# HikeSafe LINE 分享回饋修正設計

日期：2026-07-29
狀態：已與使用者確認並完成實作

## 問題

建立留守人邀請前，按鈕「邀請留守人」容易被理解為立即分享，使用者不易預期「分享到 LINE」會在邀請連結建立成功後才出現。

目前 `shareInviteLink` 將 LINE SDK 載入失敗、API 不可用、`shareTargetPicker` reject 與 clipboard 失敗合併為同一路徑，畫面一律顯示「此裝置無法開啟 LINE 分享」。這會隱藏真正原因，且把使用者取消誤判為成功。

## 目標

1. 將「邀請留守人」改為「建立邀請連結」。
2. 保持 `shareTargetPicker` 為主要分享方式。
3. 明確區分分享成功、使用者取消、環境不支援、LINE API 失敗與 clipboard 失敗。
4. LINE 分享不可用或失敗時仍自動複製邀請連結，避免流程中斷。

## 非目標

- 不加入 `navigator.share()` 系統分享面板。
- 不修改邀請 API、token、效期、接受流程或 LINE Console 設定。
- 不改變「建立邀請連結後才顯示分享／複製按鈕」的漸進式流程。

## 分享結果

`shareInviteLink` 回傳可判別的結果：

| 結果 | 條件 | Clipboard | 使用者回饋 |
| --- | --- | --- | --- |
| `shared` | target picker 回傳 `status: success` | 不使用 | 清除舊提示 |
| `cancelled` | target picker 關閉且沒有回傳結果 | 不使用 | 已取消分享，邀請連結仍可使用 |
| `copied: unavailable` | SDK 無法載入，或 `isApiAvailable('shareTargetPicker')` 為 false | 複製 | 目前開啟環境不支援 LINE 分享，已複製邀請連結 |
| `copied: line_error` | target picker 在顯示／送出前 reject | 複製 | LINE 分享暫時失敗，已複製邀請連結 |
| `failed: clipboard_error` | fallback clipboard 也失敗 | 複製失敗 | 無法分享或複製邀請連結，請稍後再試 |

LINE SDK 錯誤只記錄安全的 `code`、`message` 與分享階段，不記錄 token、invite URL 或 LINE user ID。

## UI

- `copy.inviteGuardian` 改為「建立邀請連結 / Create invite link」。
- `TripForm` 與 `GuardiansContent` 共用相同結果到文案／tone 的映射：
  - `shared`：移除舊提示。
  - `cancelled`：warning status。
  - `copied`：warning status。
  - `failed`：error alert。
- 「分享到 LINE」與「複製邀請連結」仍只在 invite URL 建立成功後顯示。

## 測試

- `share-invite.test.ts` 覆蓋成功、取消、API 不可用、SDK／LINE reject、clipboard reject。
- 建立行程與留守人管理頁測試逐一驗證結果文案與 tone。
- i18n 測試驗證新按鈕與錯誤文案皆為中文第一行、英文第二行。
- 完成後執行 focused tests、完整非 PostgreSQL 測試與 production build。
