import { copy } from '@/src/features/i18n/copy';

export interface EmergencyReportLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: Date;
  source: 'gps' | 'network' | 'line';
}

export interface EmergencyReportInput {
  team: string[];
  route: string;
  startedAt: Date;
  plannedFinishAt: Date;
  lastCheckIn: { at: Date; location: EmergencyReportLocation | null } | null;
  vehicle: string;
  equipment: string[];
  checkpoints: Array<string | { name: string }>;
  evacuationPoints: Array<string | { name: string }>;
  previousAvailableLocation?: EmergencyReportLocation;
}

export interface EmergencyReportData {
  team: string[];
  route: string;
  startedAt: string;
  plannedFinishAt: string;
  lastCheckIn: { at: string; location: { latitude: number; longitude: number; accuracyMeters: number | null; capturedAt: string; source: 'gps' | 'network' | 'line' } | null } | null;
  vehicle: string;
  equipment: string[];
  checkpoints: string[];
  evacuationPoints: string[];
  automatic119Report: false;
}

export interface EmergencyReport {
  text: string;
  data: EmergencyReportData;
}

const taipeiTime = (value: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')} Asia/Taipei`;
};

export const buildEmergencyReport = (trip: EmergencyReportInput): EmergencyReport => {
  const location = trip.lastCheckIn?.location;
  const data: EmergencyReportData = {
    team: trip.team,
    route: trip.route,
    startedAt: trip.startedAt.toISOString(),
    plannedFinishAt: trip.plannedFinishAt.toISOString(),
    lastCheckIn: trip.lastCheckIn ? {
      at: trip.lastCheckIn.at.toISOString(),
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracyMeters,
        capturedAt: location.capturedAt.toISOString(),
        source: location.source,
      } : null,
    } : null,
    vehicle: trip.vehicle,
    equipment: trip.equipment,
    checkpoints: trip.checkpoints.map((item) => typeof item === 'string' ? item : item.name),
    evacuationPoints: trip.evacuationPoints.map((item) => typeof item === 'string' ? item : item.name),
    automatic119Report: false,
  };
  const lines = [
    copy.reportTitle,
    copy.reportTeam(data.team),
    copy.reportRoute(data.route),
    copy.reportStartedAt(taipeiTime(data.startedAt)),
    copy.reportPlannedFinish(taipeiTime(data.plannedFinishAt)),
    copy.reportLastCheckIn(data.lastCheckIn ? taipeiTime(data.lastCheckIn.at) : undefined),
  ];
  if (data.lastCheckIn?.location) {
    const current = data.lastCheckIn.location;
    lines.push(
      copy.reportLocation(current.latitude, current.longitude),
      copy.reportLocationTime(current.source, taipeiTime(current.capturedAt)),
    );
    if (current.accuracyMeters !== null) {
      lines.splice(lines.length - 1, 0, copy.reportGpsAccuracy(current.accuracyMeters));
    }
  } else {
    lines.push(copy.reportUnavailableLocation);
  }
  lines.push(
    copy.reportVehicle(data.vehicle),
    copy.reportEquipment(data.equipment),
    copy.reportCheckpoints(data.checkpoints),
    copy.reportEvacuationPoints(data.evacuationPoints),
    copy.noAutomatic119Report,
  );
  return { text: lines.join('\n'), data };
};

export const loadEmergencyReport = async (tripId: string): Promise<EmergencyReport | undefined> => {
  const [{ db }, { checkIns, routeVersions, tripMembers, trips, users }, { desc, eq }] = await Promise.all([
    import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
  ]);
  const [trip] = await db.select({
    route: routeVersions.routeName,
    startedAt: trips.startedAt,
    startsAt: trips.startsAt,
    plannedFinishAt: trips.plannedFinishAt,
    vehicle: trips.vehicle,
    equipment: trips.equipment,
    checkpoints: routeVersions.checkpoints,
    evacuationPoints: routeVersions.evacuationPoints,
  }).from(trips).innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
    .where(eq(trips.id, tripId)).limit(1);
  if (!trip) return undefined;
  const [team, lastCheckIn] = await Promise.all([
    db.select({ name: users.displayName }).from(tripMembers).innerJoin(users, eq(users.id, tripMembers.userId))
      .where(eq(tripMembers.tripId, tripId)),
    db.select({
      createdAt: checkIns.createdAt,
      locationStatus: checkIns.locationStatus,
      latitude: checkIns.latitude,
      longitude: checkIns.longitude,
      accuracyMeters: checkIns.accuracyMeters,
      locationCapturedAt: checkIns.locationCapturedAt,
      locationSource: checkIns.locationSource,
    }).from(checkIns).where(eq(checkIns.tripId, tripId)).orderBy(desc(checkIns.createdAt)).limit(1),
  ]);
  const checkIn = lastCheckIn[0];
  const location = checkIn?.locationStatus === 'available' && checkIn.latitude !== null && checkIn.longitude !== null &&
    checkIn.locationCapturedAt !== null && checkIn.locationSource !== null
    ? { latitude: checkIn.latitude, longitude: checkIn.longitude, accuracyMeters: checkIn.accuracyMeters, capturedAt: checkIn.locationCapturedAt, source: checkIn.locationSource }
    : null;
  return buildEmergencyReport({
    team: team.map((member) => member.name),
    route: trip.route,
    startedAt: trip.startedAt ?? trip.startsAt,
    plannedFinishAt: trip.plannedFinishAt,
    lastCheckIn: checkIn ? { at: checkIn.createdAt, location } : null,
    vehicle: trip.vehicle,
    equipment: trip.equipment as string[],
    checkpoints: trip.checkpoints as string[],
    evacuationPoints: trip.evacuationPoints as string[],
  });
};
