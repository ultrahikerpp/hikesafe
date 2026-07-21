# Task 3: 「說明」使用說明回覆 — Completion Report

**Commit SHA:** `2470ccc`

**Status:** DONE

---

## Changes Made

### 1. `src/features/line/conversation.ts`

**Imports (line 1-13):**
- Added `buildUsageReply` to the import from `@/src/features/line/prompts`

**isSupported function (line 83-88):**
- Updated text matching to include `text === '說明'` alongside existing commands
- New condition: `return text === '需要協助' || text === '求助' || text === '回報' || text === '說明' || Boolean(text?.match(/^回報\s+/));`

**handleLineConversation function (line 100-102):**
- Added early return for `說明` command immediately after `if (!isSupported(event)) return [];`
- New line: `if (event.text?.trim() === '說明') return [buildUsageReply()];`
- This placement ensures the usage guide is returned **before any database lookup**, satisfying the requirement that unregistered users receive an answer

### 2. `tests/features/line-conversation.test.ts`

**New Test 1: "answers the usage command without touching the repository" (line 217-225)**
- Verifies the usage command returns exactly one text message
- Message contains "HikeSafe 使用說明"
- **Critical assertion:** `expect(repository.findUserByLineUserId).not.toHaveBeenCalled()` — proves no database lookup occurs
- Confirms the feature works for all users including unregistered ones

**New Test 2: "answers the usage command for an unregistered LINE user" (line 227-236)**
- Tests explicitly with an unknown LINE user ID (`'line-user-unknown'`)
- Mock repository configured with `undefined` user (simulating missing registration)
- Returns exactly one message containing "HikeSafe 使用說明"
- Verifies graceful handling without error

---

## TDD Evidence

### RED Phase (Failing Tests)

```
❯ tests/features/line-conversation.test.ts (14 tests | 2 failed | 12 skipped) 6ms
    × answers the usage command without touching the repository 4ms
    × answers the usage command for an unregistered LINE user 1ms

AssertionError: expected [] to have a length of 1 but got +0
```

**Root cause:** `isSupported` did not recognize `說明`, so both tests received empty arrays.

### GREEN Phase (Passing Tests)

After implementation:

```
 Test Files  1 passed (1)
      Tests  2 passed | 12 skipped (14)
 Start at  23:37:10
 Duration  1.02s (transform 112ms, setup 71ms, import 330ms, tests 2ms, environment 535ms)
```

Both new tests pass immediately after implementing the three changes.

---

## Full Test Suite Result

**Final Run Command:**
```bash
npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"
```

**Result:**
```
 Test Files  50 passed (50)
      Tests  298 passed (298)
 Start at  23:37:18
 Duration  8.34s (transform 2.10s, setup 3.59s, import 7.14s, tests 4.94s, environment 34.34s)
```

✅ **Expected:** 50 files / 298 tests — **ACHIEVED**

---

## Verification Against Brief

- ✅ Test added for repository-free usage command handling
- ✅ Test added for unregistered user scenario
- ✅ `buildUsageReply` imported correctly
- ✅ `isSupported` updated to recognize `說明`
- ✅ Early return placed immediately after `isSupported` check, before any repository access
- ✅ Uses exact function call: `return [buildUsageReply()];`
- ✅ No console.log statements added
- ✅ No input parameter mutations
- ✅ All changes trace to requirements
- ✅ Commit message format: `feat: answer the LINE usage command before any lookup`
- ✅ No Co-Authored-By line (per user rules/common/git-workflow.md)

---

## Code Review Findings

### Correctness
- **Early-exit placement:** The `說明` check sits **immediately after** the unsupported-event guard, before the repository is instantiated. This guarantees zero database access for unregistered users.
- **Test isolation:** The first test explicitly mocks the repository and verifies `findUserByLineUserId.not.toHaveBeenCalled()`, providing regression protection against accidental database lookup.

### Style Adherence
- ✅ Function remains under 50 lines (unchanged footprint)
- ✅ File remains under 800 lines (now 209 lines)
- ✅ Nesting depth ≤ 4
- ✅ No input mutation
- ✅ No hardcoded values (uses `buildUsageReply()` factory)
- ✅ Matches existing code style (consistent with other text checks like `'需要協助'`)

### Integration
- ✅ Reuses existing `buildUsageReply()` from Task 1 (no duplication)
- ✅ Uses existing mocking patterns in test suite
- ✅ Bilingual copy delegated to `buildUsageReply()`, not hardcoded
- ✅ No breaking changes to existing public interfaces

---

## Notes

**No ambiguities in brief:** All code blocks matched expectations exactly. The three-part implementation (import, isSupported update, early return) is clean and surgical.

**Integration with prior tasks:** Task 1 (`buildUsageReply`) and Task 2 are both relied upon. This task's implementation shows no sign of regressions in those areas.
