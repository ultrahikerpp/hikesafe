# Task 5 Report: 行程選擇器意圖接線

## Summary

Task 5 successfully wires trip chooser intents through to the appropriate prompt handlers, fixing a critical bug where users asking for help would receive a check-in prompt instead of help confirmation when selecting a trip from the chooser.

**Status:** DONE  
**Commit SHA:** ed4164c  
**Test Results:** 50 files / 305 tests passing (100%)

---

## Changes Made

### File: `tests/features/line-conversation.test.ts`

Added four new test cases to verify intent routing:

1. **Test: "offers a help chooser carrying the help intent for multiple active trips"**
   - Verifies that when a user types "需要協助" with multiple active trips, the chooser buttons emit `:help` postbacks instead of `:select`
   - Expected: `['hikesafe:trip:trip-1:help', 'hikesafe:trip:trip-2:help']`

2. **Test: "returns a help confirmation after choosing a trip with the help intent"**
   - Verifies that posting back `hikesafe:trip:trip-1:help` routes to `buildHelpConfirmation()` instead of `buildCheckInPrompt()`
   - Expected: `['hikesafe:help:trip-1:confirm', 'hikesafe:help:trip-1:cancel']`

3. **Test: "still returns a check-in prompt for the select intent"**
   - Confirms that the `:select` intent (default trip chooser path) still maps to `buildCheckInPrompt()` with safe/shelter options
   - Verifies no regression from the original behavior

4. **Test: "returns the matching prompt for the extend and finish intents"**
   - Verifies that `:extend` postbacks route to `buildExtendPrompt()` (with 30/60/120 min options)
   - Verifies that `:finish` postbacks route to `buildFinishConfirmation()` (with confirm/cancel options)

### File: `src/features/line/conversation.ts`

#### Imports (Lines 5-11)
Added two missing builders and the intent type:
```ts
import {
  buildCheckInPrompt,
  buildExtendPrompt,           // NEW
  buildFinishConfirmation,     // NEW
  buildHelpConfirmation,
  buildTripChooser,
  buildUsageReply,
  type TripChooserIntent,      // NEW
} from '@/src/features/line/prompts';
```

#### Function: `chooseAndRetry` (Lines 92-96)
Updated to accept and pass through the intent parameter:

**Before:**
```ts
const chooseAndRetry = (activeTrips: ActiveLineTrip[]) => [
  textMessage(retryAfterChoosing),
  buildTripChooser(activeTrips),
];
```

**After:**
```ts
const chooseAndRetry = (activeTrips: ActiveLineTrip[], intent: TripChooserIntent) => [
  textMessage(retryAfterChoosing),
  buildTripChooser(activeTrips, intent),
];
```

#### Postback Handler: `trip` Intent Dispatch (Lines 149-155)
Replaced single-path `buildCheckInPrompt()` with intent-based routing:

**Before:**
```ts
if (parsed.kind === 'trip') return [buildCheckInPrompt({ tripId, includeLocation: false })];
```

**After:**
```ts
if (parsed.kind === 'trip') {
  if (parsed.intent === 'help') return [buildHelpConfirmation(tripId)];
  if (parsed.intent === 'extend') return [buildExtendPrompt(tripId)];
  if (parsed.intent === 'finish') return [buildFinishConfirmation(tripId)];
  return [buildCheckInPrompt({ tripId, includeLocation: false })];
}
```

#### Text Handler: "需要協助" / "求助" (Line 189)
Updated to pass `'help'` intent to chooser:

**Before:**
```ts
if (activeTrips.length !== 1) return chooseAndRetry(activeTrips);
```

**After:**
```ts
if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'help');
```

#### Text Handler: Free Text Check-in (Line 200)
Updated to pass `'select'` intent to chooser:

**Before:**
```ts
if (activeTrips.length !== 1) return chooseAndRetry(activeTrips);
```

**After:**
```ts
if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'select');
```

---

## TDD Evidence

### RED Phase
Running new intent tests before implementation:

```
 RUN  v4.1.10 /Users/miroppp/Side Projects/hikesafe

 ❯ tests/features/line-conversation.test.ts (18 tests | 3 failed | 14 skipped) 7ms
     × offers a help chooser carrying the help intent for multiple active trips 5ms
     × returns a help confirmation after choosing a trip with the help intent 1ms
     × returns the matching prompt for the extend and finish intents 1ms

FAIL  tests/features/line-conversation.test.ts > ... offers a help chooser ...
AssertionError: expected [ 'hikesafe:trip:trip-1:select', …(1) ] to deeply equal [ 'hikesafe:trip:trip-1:help', …(1) ]

FAIL  tests/features/line-conversation.test.ts > ... returns a help confirmation ...
AssertionError: expected [ 'hikesafe:check-in:trip-1:safe', …(1) ] to deeply equal [ 'hikesafe:help:trip-1:confirm', …(1) ]

FAIL  tests/features/line-conversation.test.ts > ... returns the matching prompt for the extend and finish intents
AssertionError: expected [ 'hikesafe:extend:trip-1:30', …(2) ] to deeply equal [ …(2) ]
```

**Summary:** 3 failed, 1 passed, 14 skipped

### GREEN Phase
Running tests after implementation:

```
 RUN  v4.1.10 /Users/miroppp/Side Projects/hikesafe

 Test Files  1 passed (1)
      Tests  4 passed | 14 skipped (18)
 Start at  23:49:05
 Duration  871ms (transform 68ms, setup 58ms, import 260ms, tests 4ms, environment 469ms)
```

**Summary:** 4 passed, 14 skipped

### Full Suite
Running complete test suite after implementation:

```
 RUN  v4.1.10 /Users/miroppp/Side Projects/hikesafe

 Test Files  50 passed (50)
      Tests  305 passed (305)
 Start at  23:49:11
 Duration  7.20s (transform 1.81s, setup 3.09s, import 5.62s, tests 4.39s, environment 29.40s)
```

**Summary:** 50 files, 305 tests, 100% pass rate

---

## Intent Routing Verification

All four intents now route correctly:

| Intent | Postback Pattern | Handler | Confirmation |
|--------|------------------|---------|--------------|
| `select` | `hikesafe:trip:X:select` | `buildCheckInPrompt()` | Shows safe/shelter/location options ✓ |
| `help` | `hikesafe:trip:X:help` | `buildHelpConfirmation()` | Shows confirm/cancel help request ✓ |
| `extend` | `hikesafe:trip:X:extend` | `buildExtendPrompt()` | Shows 30/60/120 min extension options ✓ |
| `finish` | `hikesafe:trip:X:finish` | `buildFinishConfirmation()` | Shows confirm/cancel trip finish ✓ |

---

## Self-Review Findings

### Code Quality
- **Immutability:** No input mutations; all functions use return values
- **Function Size:** `chooseAndRetry` remains under 5 lines; dispatch block fits within 50-line guideline
- **Nesting Depth:** Maximum 2 levels (if check, then dispatch), within limit of 4
- **No console.log:** All logging handled via existing error flows

### Correctness
- All four chooser intents accounted for in postback dispatch
- Existing tests continue to pass (no regression)
- Default fallback case (`'select'`) preserves original behavior for backwards compatibility
- Both text-input paths correctly determine which intent to pass

### Architecture
- Reuses existing `buildTripChooser(trips, intent?)` signature (Task 1)
- Consumes `parsePostback` result with intent field (Task 2)
- Intent parameter flows through: user input → text/postback handler → chooser → postback → dispatch
- `TripChooserIntent` type ensures type safety at all dispatch points

### Test Coverage
- All four intents have explicit positive test cases
- Regression test for `'select'` intent ensures original behavior intact
- Multiple-trip scenario tested for all four intents via `makeRepository(trips)`

---

## Notes

- The brief's code transcription was accurate; no corrections needed
- `buildTripChooser()` already accepts optional `intent` parameter with default `'select'`
- `event.location` branch (line 122) correctly leaves chooser call unchanged—location is ambiguous and defaults to `'select'`
- No `Co-Authored-By` line in commit per project git-workflow.md (attribution disabled globally)

---

## Conclusion

Task 5 is complete. The trip chooser now carries user intent through to the appropriate prompt handler, fixing the critical bug where help requests were answered with check-in prompts. All 305 tests pass, with 4 new tests confirming the four intents route to their correct handlers.
