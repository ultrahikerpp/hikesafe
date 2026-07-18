import { describe, expect, it } from 'vitest';

import { buildEmergencyReport } from '@/src/features/reports/build-report';
import { copy } from '@/src/features/i18n/copy';

describe('buildEmergencyReport', () => {
  const trip = {
    team: ['阿山', '小玉'],
    route: '玉山主峰線',
    startedAt: new Date('2026-07-12T01:00:00.000Z'),
    plannedFinishAt: new Date('2026-07-12T09:00:00.000Z'),
    vehicle: '白色廂型車 ABC-1234',
    equipment: ['頭燈', '保暖衣'],
    checkpoints: ['排雲山莊'],
    evacuationPoints: ['塔塔加登山口'],
  };

  it('includes the required rescue details and current GPS metadata', () => {
    const report = buildEmergencyReport({
      ...trip,
      lastCheckIn: {
        at: new Date('2026-07-12T05:10:00.000Z'),
        location: {
          latitude: 23.4701,
          longitude: 120.9502,
          accuracyMeters: 12,
          capturedAt: new Date('2026-07-12T05:09:00.000Z'),
          source: 'gps',
        },
      },
    });

    expect(report.text).toContain(copy.reportTeam(trip.team));
    expect(report.text).toContain(copy.reportRoute(trip.route));
    expect(report.text).toContain(copy.reportStartedAt('2026-07-12 09:00 Asia/Taipei'));
    expect(report.text).toContain(copy.reportPlannedFinish('2026-07-12 17:00 Asia/Taipei'));
    expect(report.text).toContain(copy.reportLastCheckIn('2026-07-12 13:10 Asia/Taipei'));
    expect(report.text).toContain(copy.reportLocationAccuracy('gps', 12));
    expect(report.text).toContain(copy.reportLocationTime('gps', '2026-07-12 13:09 Asia/Taipei'));
    expect(report.text).toContain(copy.reportVehicle(trip.vehicle));
    expect(report.text).toContain(copy.reportEquipment(trip.equipment));
    expect(report.text).toContain(copy.reportCheckpoints(trip.checkpoints));
    expect(report.text).toContain(copy.reportEvacuationPoints(trip.evacuationPoints));
    expect(report.text).toContain(copy.noAutomatic119Report);
    expect(report.data.lastCheckIn?.location).toEqual(expect.objectContaining({ accuracyMeters: 12 }));
  });

  it('reports an unavailable current location instead of relabeling an older coordinate', () => {
    const report = buildEmergencyReport({
      ...trip,
      lastCheckIn: {
        at: new Date('2026-07-12T06:00:00.000Z'),
        location: null,
      },
      previousAvailableLocation: {
        latitude: 23.4701,
        longitude: 120.9502,
        accuracyMeters: 12,
        capturedAt: new Date('2026-07-12T05:09:00.000Z'),
      },
    });

    expect(report.text).toContain(copy.reportUnavailableLocation);
    expect(report.text).not.toContain('23.4701');
    expect(report.data.lastCheckIn?.location).toBeNull();
  });

  it('labels a LINE-backed timestamp without inventing GPS accuracy', () => {
    const report = buildEmergencyReport({
      ...trip,
      lastCheckIn: {
        at: new Date('2026-07-12T05:10:00.000Z'),
        location: {
          latitude: 23.4701,
          longitude: 120.9502,
          accuracyMeters: null,
          capturedAt: new Date('2026-07-12T05:09:00.000Z'),
          source: 'line',
        },
      },
    });

    expect(report.text).toContain(copy.reportLocation(23.4701, 120.9502));
    expect(report.text).toContain(copy.reportLocationTime('line', '2026-07-12 13:09 Asia/Taipei'));
    expect(report.text).toContain(copy.reportLocationAccuracy('line', null));
    expect(report.text).toContain('位置精度：LINE 未提供\nLocation accuracy: Not provided by LINE');
    expect(report.text).not.toMatch(/GPS 精度|GPS accuracy/);
    expect(report.text).not.toMatch(/GPS 時間|GPS time/);
    expect(report.data.lastCheckIn?.location).toEqual(
      expect.objectContaining({ accuracyMeters: null, source: 'line' }),
    );
  });

  it('labels network time and accuracy as network-derived', () => {
    const report = buildEmergencyReport({
      ...trip,
      lastCheckIn: {
        at: new Date('2026-07-12T05:10:00.000Z'),
        location: {
          latitude: 23.4701,
          longitude: 120.9502,
          accuracyMeters: 18,
          capturedAt: new Date('2026-07-12T05:09:00.000Z'),
          source: 'network',
        },
      },
    });

    expect(report.text).toContain(copy.reportLocationTime('network', '2026-07-12 13:09 Asia/Taipei'));
    expect(report.text).toContain(copy.reportLocationAccuracy('network', 18));
    expect(report.text).not.toMatch(/GPS 時間|GPS time|GPS 精度|GPS accuracy/);
  });

  it('serializes real route checkpoint and evacuation objects by their names', () => {
    const report = buildEmergencyReport({
      ...trip,
      checkpoints: [{ name: '排雲山莊', order: 1 }] as unknown as string[],
      evacuationPoints: [{ name: '塔塔加登山口', order: 1 }] as unknown as string[],
      lastCheckIn: null,
    });

    expect(report.text).toContain(copy.reportCheckpoints(['排雲山莊']));
    expect(report.text).toContain(copy.reportEvacuationPoints(['塔塔加登山口']));
    expect(report.text).not.toContain('[object Object]');
  });

  it('identifies an empty official evacuation list without inventing a point', () => {
    const report = buildEmergencyReport({
      ...trip,
      evacuationPoints: [],
      lastCheckIn: null,
    });

    expect(report.text).toContain(copy.reportEvacuationPoints([]));
  });

  it('preserves multiline user-entered report values verbatim', () => {
    const equipment = '主繩\n副繩\n備用繩';
    const report = buildEmergencyReport({
      ...trip,
      equipment: [equipment],
      lastCheckIn: null,
    });

    expect(report.text.split(equipment)).toHaveLength(3);
  });
});
