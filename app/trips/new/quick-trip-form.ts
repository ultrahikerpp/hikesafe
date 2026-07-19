export interface QuickRouteSourceReference {
  tier?: 'official' | 'community';
}

export interface QuickRouteOption {
  id: string;
  region: string;
  mountainName: string;
  routeName: string;
  durationMinutes: number | null;
  sourceOrganization: string;
  sourceUrl: string;
  sourceVersion: string;
  reviewedAt: string;
  sourceReferences?: QuickRouteSourceReference[];
}

export interface QuickTripDefaultsResponse {
  routeVersionId: string | null;
  guardianBindingIds: string[];
  vehicle: string;
  equipment: string[];
  leaderPhone: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const localDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const currentStartValue = (now = new Date()) => {
  const rounded = new Date(now);
  rounded.setSeconds(0, 0);
  return localDateTime(rounded);
};

export const calculatePlannedFinish = (startsAt: string, durationMinutes: number | null) => {
  const start = new Date(startsAt);
  if (!startsAt || Number.isNaN(start.getTime()) || durationMinutes === null || durationMinutes <= 0) return '';
  return localDateTime(new Date(start.getTime() + durationMinutes * 60_000));
};

export const isValidTripWindow = (startsAt: string, plannedFinishAt: string) => {
  const start = new Date(startsAt).getTime();
  const finish = new Date(plannedFinishAt).getTime();
  return Number.isFinite(start) && Number.isFinite(finish) && finish > start;
};

export type QuickTripField = 'route' | 'guardians' | 'timeWindow' | 'vehicle' | 'confirmation';

export const missingQuickTripFields = (input: {
  routeVersionId: string;
  guardianBindingIds: string[];
  startsAt: string;
  plannedFinishAt: string;
  vehicle: string;
  confirmed: boolean;
}): QuickTripField[] => [
  ...(input.routeVersionId ? [] : ['route' as const]),
  ...(input.guardianBindingIds.length > 0 ? [] : ['guardians' as const]),
  ...(isValidTripWindow(input.startsAt, input.plannedFinishAt) ? [] : ['timeWindow' as const]),
  ...(input.vehicle.trim() ? [] : ['vehicle' as const]),
  ...(input.confirmed ? [] : ['confirmation' as const]),
];

export const canSubmitQuickTrip = (input: Parameters<typeof missingQuickTripFields>[0]) =>
  missingQuickTripFields(input).length === 0;
