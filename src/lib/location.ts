export interface LocationFix {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: Date;
  source: 'gps' | 'network';
}

export function assertFreshLocation(fix: LocationFix, now: Date) {
  if (now.getTime() - fix.capturedAt.getTime() > 5 * 60_000) {
    throw new Error('Location is stale');
  }
  if (fix.accuracyMeters > 200) {
    throw new Error('Location accuracy is insufficient');
  }
  return fix;
}
