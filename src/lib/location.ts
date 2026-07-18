export interface LocationFix {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: Date;
  source: 'gps' | 'network';
}

export interface LineLocationFix {
  latitude: number;
  longitude: number;
  capturedAt: Date;
  source: 'line';
}

export type CheckInLocation = LocationFix | LineLocationFix;

const MAX_CLOCK_SKEW_MS = 30_000;
const TAIWAN_BOUNDS = {
  minLatitude: 18,
  maxLatitude: 27,
  minLongitude: 116,
  maxLongitude: 123,
};

const assertCoordinatesInTaiwan = (latitude: number, longitude: number) => {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < TAIWAN_BOUNDS.minLatitude ||
    latitude > TAIWAN_BOUNDS.maxLatitude ||
    longitude < TAIWAN_BOUNDS.minLongitude ||
    longitude > TAIWAN_BOUNDS.maxLongitude
  ) {
    throw new Error('Location coordinates are outside Taiwan');
  }
};

const assertTimestamp = (capturedAt: Date, now: Date, maxAgeMs: number) => {
  const capturedAtTime = capturedAt.getTime();
  const nowTime = now.getTime();

  if (!Number.isFinite(capturedAtTime)) {
    throw new Error('Location timestamp is invalid');
  }
  if (capturedAtTime - nowTime > MAX_CLOCK_SKEW_MS) {
    throw new Error('Location timestamp is in the future');
  }
  if (nowTime - capturedAtTime > maxAgeMs) {
    throw new Error('Location is stale');
  }
};

export function assertFreshLocation(fix: LocationFix, now: Date) {
  assertTimestamp(fix.capturedAt, now, 5 * 60_000);
  if (!Number.isFinite(fix.accuracyMeters) || fix.accuracyMeters < 0) {
    throw new Error('Location accuracy is invalid');
  }
  if (fix.accuracyMeters > 200) {
    throw new Error('Location accuracy is insufficient');
  }
  assertCoordinatesInTaiwan(fix.latitude, fix.longitude);
  return fix;
}

export function assertFreshLineLocation(fix: LineLocationFix, now: Date) {
  assertTimestamp(fix.capturedAt, now, 5 * 60_000);
  assertCoordinatesInTaiwan(fix.latitude, fix.longitude);
  return fix;
}
