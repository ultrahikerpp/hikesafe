export interface EmergencyReportLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: Date;
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
  lastCheckIn: { at: string; location: { latitude: number; longitude: number; accuracyMeters: number; capturedAt: string } | null } | null;
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

const list = (
  items: Array<string | { name: string }>,
  emptyLabel = '未提供',
) => items.length
  ? items.map((item) => typeof item === 'string' ? item : item.name).join('、')
  : emptyLabel;

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
      } : null,
    } : null,
    vehicle: trip.vehicle,
    equipment: trip.equipment,
    checkpoints: trip.checkpoints.map((item) => typeof item === 'string' ? item : item.name),
    evacuationPoints: trip.evacuationPoints.map((item) => typeof item === 'string' ? item : item.name),
    automatic119Report: false,
  };
  const lines = [
    'HikeSafe 通報摘要',
    `隊伍：${list(data.team)}`,
    `路線：${data.route}`,
    `開始時間：${taipeiTime(data.startedAt)}`,
    `預計下山：${taipeiTime(data.plannedFinishAt)}`,
    `最後成功回報：${data.lastCheckIn ? taipeiTime(data.lastCheckIn.at) : '尚無回報'}`,
  ];
  if (data.lastCheckIn?.location) {
    const current = data.lastCheckIn.location;
    lines.push(
      `最後位置：${current.latitude}, ${current.longitude}`,
      `GPS 精度：${current.accuracyMeters} 公尺`,
      `GPS 時間：${taipeiTime(current.capturedAt)}`,
    );
  } else {
    lines.push('最後位置未取得');
  }
  lines.push(
    `車輛：${data.vehicle || '未提供'}`,
    `裝備：${list(data.equipment)}`,
    `檢查點：${list(data.checkpoints)}`,
    `撤離點：${list(data.evacuationPoints, '官方資料未載明')}`,
    'HikeSafe 尚未代為通報 119',
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
    }).from(checkIns).where(eq(checkIns.tripId, tripId)).orderBy(desc(checkIns.createdAt)).limit(1),
  ]);
  const checkIn = lastCheckIn[0];
  const location = checkIn?.locationStatus === 'available' && checkIn.latitude !== null && checkIn.longitude !== null &&
    checkIn.accuracyMeters !== null && checkIn.locationCapturedAt !== null
    ? { latitude: checkIn.latitude, longitude: checkIn.longitude, accuracyMeters: checkIn.accuracyMeters, capturedAt: checkIn.locationCapturedAt }
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
