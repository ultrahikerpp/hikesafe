# LINE Invite Share Feedback Implementation Plan

**Status:** Implemented on `codex/line-share-feedback`; focused tests, the 384-test non-PostgreSQL suite, and the production build pass. The PostgreSQL integration suite remains unverified because the configured local endpoint refuses connections.

**Goal:** Make guardian invite creation explicit and report LINE sharing outcomes accurately without changing the existing invite-first flow.

**Architecture:** Keep `shareTargetPicker` as the only primary share path. Return a discriminated result from the sharing helper, map it to one shared UI notice model, and let both invite screens render the same bilingual feedback. Only unavailable or failed LINE sharing falls back to copying; user cancellation does not.

**Tech Stack:** Next.js App Router, React, TypeScript, LINE LIFF SDK, Vitest, Testing Library

---

### Task 1: Define and verify LINE share outcomes

**Files:**
- Modify: `tests/features/share-invite.test.ts`
- Modify: `src/lib/share-invite.ts`

1. Add failing tests for successful share, user cancellation, unavailable API with successful copy, rejected LINE API with successful copy, and failed clipboard fallback.
2. Run `npm test -- tests/features/share-invite.test.ts` and confirm the new expectations fail against the string-only result.
3. Add `isApiAvailable('shareTargetPicker')` to the LIFF contract and return discriminated results:
   - `{ status: 'shared' }`
   - `{ status: 'cancelled' }`
   - `{ status: 'copied', reason: 'unavailable' | 'line_error' }`
   - `{ status: 'failed', reason: 'clipboard_error' }`
4. Treat a resolved picker response without `{ status: 'success' }` as cancellation. Log only the failure stage plus LINE error `code`/`message`; never log invite URLs, tokens, or user IDs.
5. Re-run the focused helper tests and confirm they pass.

### Task 2: Use one feedback mapping on both invite screens

**Files:**
- Create: `src/lib/share-invite-feedback.ts`
- Create: `tests/features/share-invite-feedback.test.ts`
- Modify: `src/features/i18n/copy.ts`
- Modify: `app/trips/new/TripForm.tsx`
- Modify: `app/guardians/GuardiansContent.tsx`
- Modify: `tests/features/i18n.test.ts`
- Modify: `tests/features/guardians-page.test.tsx`
- Modify: `tests/features/quick-trip-form.test.tsx`

1. Add failing tests that expect:
   - `邀請留守人` / `Invite a guardian` to become `建立邀請連結` / `Create invite link`.
   - cancellation to show a warning without copying.
   - unavailable API and LINE rejection to show different copied-link warnings.
   - clipboard fallback failure to show an error.
   - both pages to keep share/copy controls hidden until an invite URL exists.
2. Run the focused UI and i18n tests and confirm the new assertions fail.
3. Add bilingual copy for cancellation, unavailable environment, LINE API failure, and share-plus-copy failure.
4. Add one pure result-to-notice mapper returning either no notice or `{ tone: 'warning' | 'error', text }`.
5. Replace the trip form’s plain status note and the guardian page’s generic fallback with the shared mapper and `Notice`.
6. Re-run focused UI and i18n tests and confirm they pass.

### Task 3: Regression verification

**Files:**
- Verify only

1. Run `git diff --check`.
2. Run focused share and UI tests.
3. Run the complete non-database test set.
4. Run `npm test`; if PostgreSQL-only suites cannot connect to the configured local database, report that environmental limitation separately.
5. Run `npm run build`.
6. Review the final diff for scope, secret leakage, and preservation of the invite-first interaction.
