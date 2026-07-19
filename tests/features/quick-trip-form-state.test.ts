import { describe, expect, it } from 'vitest';

import {
  calculatePlannedFinish,
  canSubmitQuickTrip,
  currentStartValue,
  isValidTripWindow,
  missingQuickTripFields,
} from '@/app/trips/new/quick-trip-form';

describe('quick trip form state', () => {
  it('rounds the default start to the current local minute', () => {
    const now = new Date(2026, 6, 18, 8, 12, 59, 900);
    expect(currentStartValue(now)).toBe('2026-07-18T08:12');
  });

  it('uses the selected route official duration for the initial finish time', () => {
    expect(calculatePlannedFinish('2026-07-18T08:00', 240))
      .toBe('2026-07-18T12:00');
  });

  it('does not auto-fill a finish time when the route has no published duration', () => {
    expect(calculatePlannedFinish('2026-07-18T08:00', null)).toBe('');
  });

  it('rejects incomplete or reversed windows and accepts a confirmed complete setup', () => {
    expect(isValidTripWindow('2026-07-18T08:00', '2026-07-18T07:59')).toBe(false);
    expect(canSubmitQuickTrip({
      routeVersionId: 'route-1',
      guardianBindingIds: ['binding-1'],
      startsAt: '2026-07-18T08:00',
      plannedFinishAt: '2026-07-18T12:00',
      vehicle: '汽車 ABC-1234',
      confirmed: true,
    })).toBe(true);
    expect(canSubmitQuickTrip({
      routeVersionId: 'route-1',
      guardianBindingIds: [],
      startsAt: '2026-07-18T08:00',
      plannedFinishAt: '2026-07-18T12:00',
      vehicle: '汽車 ABC-1234',
      confirmed: true,
    })).toBe(false);
  });

  it('lists every missing quick-trip field in a stable order', () => {
    expect(missingQuickTripFields({
      routeVersionId: '',
      guardianBindingIds: [],
      startsAt: '2026-07-18T08:00',
      plannedFinishAt: '',
      vehicle: ' ',
      confirmed: false,
    })).toEqual(['route', 'guardians', 'timeWindow', 'vehicle', 'confirmation']);
  });

  it('returns no missing fields for a submittable quick trip', () => {
    expect(missingQuickTripFields({
      routeVersionId: 'route-1',
      guardianBindingIds: ['binding-1'],
      startsAt: '2026-07-18T08:00',
      plannedFinishAt: '2026-07-18T12:00',
      vehicle: '汽車',
      confirmed: true,
    })).toEqual([]);
  });
});
