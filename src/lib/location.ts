export interface LocationFix {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: Date;
  source: 'gps' | 'network';
}

const MAX_CLOCK_SKEW_MS = 30_000;
const TAIWAN_BOUNDS = {
  minLatitude: 18,
  maxLatitude: 27,
  minLongitude: 116,
  maxLongitude: 123,
};

export function assertFreshLocation(fix: LocationFix, now: Date) {
  const capturedAt = fix.capturedAt.getTime();
  const nowTime = now.getTime();

  if (!Number.isFinite(capturedAt)) {
    throw new Error('Location timestamp is invalid');
  }
  if (capturedAt - nowTime > MAX_CLOCK_SKEW_MS) {
    throw new Error('Location timestamp is in the future');
  }
  if (nowTime - capturedAt > 5 * 60_000) {
    throw new Error('Location is stale');
  }
  if (!Number.isFinite(fix.accuracyMeters) || fix.accuracyMeters < 0) {
    throw new Error('Location accuracy is invalid');
  }
  if (fix.accuracyMeters > 200) {
    throw new Error('Location accuracy is insufficient');
  }
  if (
    !Number.isFinite(fix.latitude) ||
    !Number.isFinite(fix.longitude) ||
    fix.latitude < TAIWAN_BOUNDS.minLatitude ||
    fix.latitude > TAIWAN_BOUNDS.maxLatitude ||
    fix.longitude < TAIWAN_BOUNDS.minLongitude ||
    fix.longitude > TAIWAN_BOUNDS.maxLongitude
  ) {
    throw new Error('Location coordinates are outside Taiwan');
  }
  return fix;
}
