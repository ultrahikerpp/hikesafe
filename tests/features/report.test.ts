import { describe, expect, it } from 'vitest';

import { buildEmergencyReport } from '@/src/features/reports/build-report';

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
        },
      },
    });

    expect(report.text).toContain('隊伍：阿山、小玉');
    expect(report.text).toContain('路線：玉山主峰線');
    expect(report.text).toContain('開始時間：2026-07-12 09:00 Asia/Taipei');
    expect(report.text).toContain('預計下山：2026-07-12 17:00 Asia/Taipei');
    expect(report.text).toContain('最後成功回報：2026-07-12 13:10 Asia/Taipei');
    expect(report.text).toContain('GPS 精度：12 公尺');
    expect(report.text).toContain('GPS 時間：2026-07-12 13:09 Asia/Taipei');
    expect(report.text).toContain('車輛：白色廂型車 ABC-1234');
    expect(report.text).toContain('裝備：頭燈、保暖衣');
    expect(report.text).toContain('檢查點：排雲山莊');
    expect(report.text).toContain('撤離點：塔塔加登山口');
    expect(report.text).toContain('BeSafe 尚未代為通報 119');
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

    expect(report.text).toContain('最後位置未取得');
    expect(report.text).not.toContain('23.4701');
    expect(report.data.lastCheckIn?.location).toBeNull();
  });

  it('serializes real route checkpoint and evacuation objects by their names', () => {
    const report = buildEmergencyReport({
      ...trip,
      checkpoints: [{ name: '排雲山莊', order: 1 }] as unknown as string[],
      evacuationPoints: [{ name: '塔塔加登山口', order: 1 }] as unknown as string[],
      lastCheckIn: null,
    });

    expect(report.text).toContain('檢查點：排雲山莊');
    expect(report.text).toContain('撤離點：塔塔加登山口');
    expect(report.text).not.toContain('[object Object]');
  });
});
