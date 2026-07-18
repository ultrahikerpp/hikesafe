export interface QuickRouteOption {
  id: string;
  region: string;
  mountainName: string;
  routeName: string;
  durationMinutes: number;
  sourceOrganization: string;
  sourceUrl: string;
  sourceVersion: string;
  reviewedAt: string;
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

export const calculatePlannedFinish = (startsAt: string, durationMinutes: number) => {
  const start = new Date(startsAt);
  if (!startsAt || Number.isNaN(start.getTime()) || durationMinutes <= 0) return '';
  return localDateTime(new Date(start.getTime() + durationMinutes * 60_000));
};

export const isValidTripWindow = (startsAt: string, plannedFinishAt: string) => {
  const start = new Date(startsAt).getTime();
  const finish = new Date(plannedFinishAt).getTime();
  return Number.isFinite(start) && Number.isFinite(finish) && finish > start;
};

export const canSubmitQuickTrip = (input: {
  routeVersionId: string;
  guardianBindingIds: string[];
  startsAt: string;
  plannedFinishAt: string;
  vehicle: string;
  confirmed: boolean;
}) => Boolean(
  input.routeVersionId &&
  input.guardianBindingIds.length > 0 &&
  input.vehicle.trim() &&
  input.confirmed &&
  isValidTripWindow(input.startsAt, input.plannedFinishAt),
);
