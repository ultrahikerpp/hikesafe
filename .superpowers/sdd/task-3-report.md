### Task 3 Report: 文案與環境變數 (Guardian invite copy + optional official account link)

**Status:** DONE

**What was done:**
1. Added the two failing tests from the brief's Step 1:
   - `tests/features/i18n.test.ts`: `it('keeps the guardian invite copy bilingual', ...)`.
   - `tests/features/env.test.ts`: `it('treats the official account link as optional', ...)`.
2. Ran `npx vitest run tests/features/i18n.test.ts tests/features/env.test.ts` and confirmed RED — `copy.inviteGuardian` was `undefined`; `parseEnv(...).NEXT_PUBLIC_LINE_OA_URL` was `undefined` even when passed a valid URL (not in schema).
3. Inserted 19 static copy keys into `src/features/i18n/copy.ts` immediately after `createBindingCode` (`myGuardians`, `guardiansTitle`, `noGuardianBindings`, `inviteGuardian`, `shareInviteToLine`, `copyInviteLink`, `inviteLinkCopied`, `inviteCreateError`, `inviteLimitReached`, `revokeBinding`, `revokeBindingError`, `groupBindingSection`, `acceptInviteAction`, `inviteNotFound`, `inviteExpired`, `inviteUsed`, `inviteRevoked`, `acceptInviteError`, `addOfficialAccount`), verbatim from the brief's Step 3.
4. Inserted 6 function copy keys immediately before `reportEvacuationPoints` (the file's last function key): `inviteExpiresAt`, `inviteShareMessage`, `acceptInviteTitle`, `acceptInviteSuccess`, `alreadyGuardian`, `guardianBoundNotice`, verbatim from the brief.
5. Added `NEXT_PUBLIC_LINE_OA_URL: z.string().url().optional()` to the zod schema in `src/env.ts`, directly below `NEXT_PUBLIC_LIFF_ID`.
6. Ran `npx vitest run tests/features/i18n.test.ts tests/features/env.test.ts` and confirmed GREEN (10/10 passed, 3 files).
7. Ran the full scoped suite `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"` — 44 files / 253 tests passed (baseline 251 + 2 new), no regressions.
8. Ran `npx tsc --noEmit` and diffed the error set against the pre-branch state via `git stash` — confirmed my change adds zero new type errors (see Concerns).
9. Committed as `feat: add guardian invite copy and optional official account link` (commit `ce4b365`).

**Test output — RED:**
```
❯ tests/features/i18n.test.ts (5 tests | 1 failed)
   × keeps the guardian invite copy bilingual
❯ tests/features/env.test.ts (3 tests | 1 failed)
   × treats the official account link as optional

FAIL tests/features/env.test.ts > parseEnv > treats the official account link as optional
AssertionError: expected undefined to be 'https://line.me/R/ti/p/@hikesafe'
FAIL tests/features/i18n.test.ts > keeps the guardian invite copy bilingual
AssertionError: expected undefined to be '邀請留守人\nInvite a guardian'

 Test Files  2 failed | 1 passed (3)
      Tests  2 failed | 8 passed (10)
```

**Test output — GREEN (targeted):**
```
 Test Files  3 passed (3)
      Tests  10 passed (10)
```

**Test output — GREEN (scoped full suite):**
```
 Test Files  44 passed (44)
      Tests  253 passed (253)
```

**Commit:** `ce4b365` — `feat: add guardian invite copy and optional official account link` (4 files changed, 81 insertions)

**Self-review findings:**
- All new copy keys match the brief's exact Chinese and English text (copy-pasted directly from the brief; confirmed by the new test assertions passing).
- `NEXT_PUBLIC_LINE_OA_URL` is correctly `.optional()`: absent → `undefined`; valid URL → passes through; `'not-a-url'` → throws. All three assertions in the new env test pass.
- Static keys placed near `createBindingCode` (existing guardian-binding key), function keys placed in the file's function-key section immediately before `reportEvacuationPoints`, matching the brief's placement instructions.

**Concerns:**
The brief states pre-existing `tsc --noEmit` errors are confined to `tests/integration/alert-race.test.ts` and `tests/integration/full-trip-flow.test.ts`. On this branch I found ~110 additional lines of pre-existing errors in other test files (`tests/api/routes.test.ts`, `tests/features/line-conversation.test.ts`, `tests/features/line-messages.test.ts`, `tests/features/trip-commands.test.ts`, `tests/features/schema.test.ts`, `tests/features/route-catalog.test.ts`, `tests/features/retention.test.ts`, `tests/api/trip-lifecycle.test.ts`, `tests/features/alert-process.test.ts`, `tests/features/report.test.ts`, `tests/features/quick-trip-form.test.tsx`) — none of which I touched. Verified via `git stash`/`tsc --noEmit`/`git stash pop` that this exact error set (same line count) exists before my change too, so it's pre-existing branch state unrelated to this task, not something I introduced. My change itself adds zero new tsc errors. Flagging in case this signals stale/incomplete state from an earlier task on this branch that's worth someone's attention.
