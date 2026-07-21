# Task 4 Report: Widen `startTrip` location source requirement

## Summary

Widened the `startTrip` domain-layer gate to accept any `CheckInLocation` (GPS, network, and LINE location sources) instead of requiring only `source === 'gps'`. The location parameter remains **required**. This closes the gap between the route's Zod schema (which already accepted `source: 'network'`) and the domain layer (which rejected it), and enables Task 8's use of LINE location messages to start trips.

## What changed per file

### `src/features/trips/commands.ts`

1. **Line 6-12 (imports)**: Removed `type LocationFix` from the import list. Now imports only `{ assertFreshLineLocation, assertFreshLocation, type CheckInLocation }` from `@/src/lib/location`.

2. **Line 59-65 (`StartTripCommand` interface)**: Changed `location` field type from `LocationFix` to `CheckInLocation`.

3. **Deleted lines 94-97 (removed function)**: Deleted the entire `assertGps` function which enforced GPS-only:
   ```ts
   // DELETED
   const assertGps = (location: LocationFix, now: Date) => {
     if (location.source !== 'gps') throw new Error('Location must be GPS');
     return assertFreshLocation(location, now);
   };
   ```

4. **Line 171 (changed validation call)**: Changed from `assertGps(command.location, command.now)` to `assertCheckInLocation(command.location, command.now)`.

The existing `assertCheckInLocation` function (lines 94-104) already handles both GPS/network locations (via `assertFreshLocation`) and LINE locations (via `assertFreshLineLocation`) correctly — no changes needed there.

### `tests/features/trip-commands.test.ts`

1. **Added lines 20-25 (new constant)**: Added `freshLineFix` constant for testing LINE location acceptance:
   ```ts
   const freshLineFix = {
     latitude: 24.18,
     longitude: 121.28,
     capturedAt: new Date('2026-07-12T00:59:00.000Z'),
     source: 'line' as const,
   };
   ```

2. **Updated existing test (lines 115-157)**: Changed the test name from "allows a LINE location for check-ins but still rejects it for trip start" to "allows a LINE location for both check-ins and trip start" and updated expectations. The test now verifies that LINE locations are accepted for `startTrip`, not rejected.

3. **Added three new tests (lines 159-192)**:
   - `it('starts a draft trip from a LINE location fix', ...)` — verifies LINE location acceptance at trip start
   - `it('rejects a stale LINE location fix when starting', ...)` — verifies freshness validation still applies to LINE
   - `it('rejects a LINE location fix outside Taiwan when starting', ...)` — verifies Taiwan bounds checking still applies to LINE

## TDD Evidence

### RED (before implementation)

Command:
```bash
npx vitest run tests/features/trip-commands.test.ts -t "LINE location"
```

Output:
```
 RUN  v4.1.10 /Users/miroppp/Side Projects/hikesafe

 ❯ tests/features/trip-commands.test.ts (11 tests | 3 failed | 7 skipped) 8ms
     × starts a draft trip from a LINE location fix 2ms
     × rejects a stale LINE location fix when starting 3ms
     × rejects a LINE location fix outside Taiwan when starting 1ms

...

 FAIL  tests/features/trip-commands.test.ts > trip lifecycle commands > starts a draft trip from a LINE location fix
Error: Location must be GPS
 ❯ assertGps src/features/trips/commands.ts:95:40
     93|
     94| const assertGps = (location: LocationFix, now: Date) => {
     95|   if (location.source !== 'gps') throw new Error('Location must be GPS'…
       |                                        ^
     96|   return assertFreshLocation(location, now);
     97| };
 ❯ src/features/trips/commands.ts:175:5
 ❯ runIdempotent src/features/trips/commands.ts:159:24

 Test Files  1 failed | 1 skipped (2)
      Tests  1 failed | 3 passed | 14 skipped (18)
```

All three new tests failed as expected with "Location must be GPS" error.

### GREEN (after implementation)

Command:
```bash
npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"
```

Output:
```
 RUN  v4.1.10 /Users/miroppp/Side Projects/hikesafe


 Test Files  50 passed (50)
      Tests  301 passed (301)
   Start at  23:42:47
   Duration  6.91s (transform 1.54s, setup 2.95s, import 5.64s, tests 4.17s, environment 27.64s)
```

All 50 test files with 301 total tests pass. Matches the brief's expected result exactly: "50 files / 301 tests passing."

## LocationFix cleanup verification

Command:
```bash
grep -n "LocationFix" src/features/trips/commands.ts || echo "no LocationFix references remain"
```

Output:
```
no LocationFix references remain
```

Confirmed: all `LocationFix` type references have been removed from `src/features/trips/commands.ts`.

## Commit

Commit hash: `0a7bb2e`

```
fix: accept LINE and network location fixes when starting a trip
```

## Notes on the test change

The existing test "allows a LINE location for check-ins but still rejects it for trip start" (line 115) was testing the OLD requirement that LINE should be rejected for trip start. Since the task changes this requirement to accept LINE for trip start, the test was updated to reflect the new expected behavior — renamed and changed to expect success instead of rejection. This is not a "weakening" of the test but rather an update to match the new requirement. No test regressed; the behavior changed as specified.

## Self-review findings

- ✓ `StartTripCommand.location` is now typed as `CheckInLocation` (union of GPS, network, and LINE locations)
- ✓ The `assertGps` function is completely removed; no references remain
- ✓ `assertCheckInLocation` handles both GPS/network (via `assertFreshLocation`) and LINE (via `assertFreshLineLocation`)
- ✓ Validation still enforces:
  - Freshness: max 5 minutes old (via timestamp check)
  - Taiwan bounds: both GPS/network and LINE locations validated via `assertCoordinatesInTaiwan`
  - Accuracy (GPS/network only): still 0–200m range via `assertFreshLocation`
- ✓ Location parameter remains **required** (type is non-optional `CheckInLocation`, no `?`)
- ✓ No `console.log` statements added
- ✓ All functions under 50 lines; file under 800 lines; nesting at most 4 levels
- ✓ No input parameter mutations
- ✓ All 301 tests pass with zero regressions
- ✓ Brief's code transcribed exactly, no deviations noted

## No ambiguities or issues

The brief was clear and the implementation matches exactly. No deviations from the specified changes.
