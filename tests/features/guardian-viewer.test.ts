import { cleanup, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const select = vi.fn();

vi.mock('@/src/db/client', () => ({ db: { select } }));
vi.mock('@/app/LiffBootstrap', async () => {
  const { useEffect } = await import('react');
  return {
    LiffBootstrap: ({ onReady }: { onReady?: () => void }) => {
      useEffect(() => onReady?.(), []);
      return null;
    },
  };
});

import { GuardianViewer } from '@/app/trips/[tripId]/guardian-viewer/GuardianViewer';
import { loadGuardianViewer } from '@/src/features/guardian-viewer/service';

const capturedAt = new Date('2026-07-12T04:19:00.000Z');

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const loadCheckIn = (
  checkIn: { accuracyMeters: number | null; locationSource: 'gps' | 'network' | 'line' },
  locationStatus: 'available' | 'unavailable' | 'redacted' = 'available',
) => {
  select
    .mockReturnValueOnce({ from: () => ({ innerJoin: () => ({ where: () => ({ limit: async () => [{ route: '玉山主峰', plannedFinishAt: new Date('2026-07-12T05:00:00.000Z') }] }) }) }) })
    .mockReturnValueOnce({ from: () => ({ innerJoin: () => ({ where: async () => [{ name: '阿山' }] }) }) })
    .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => ({ limit: async () => [{
      createdAt: new Date('2026-07-12T04:20:00.000Z'),
      latitude: 23.47,
      longitude: 120.95,
      locationCapturedAt: capturedAt,
      locationStatus,
      ...checkIn,
    }] }) }) }) });
};

describe('loadGuardianViewer', () => {
  beforeEach(() => select.mockReset());

  it.each([
    { locationSource: 'line' as const, accuracyMeters: null },
    { locationSource: 'gps' as const, accuracyMeters: 12 },
    { locationSource: 'network' as const, accuracyMeters: 18 },
  ])('returns the persisted $locationSource source without changing its accuracy', async (checkIn) => {
    loadCheckIn(checkIn);

    const viewer = await loadGuardianViewer({ tripId: 'trip-1' });

    expect(viewer?.lastCheckIn?.location).toEqual({
      latitude: 23.47,
      longitude: 120.95,
      accuracyMeters: checkIn.accuracyMeters,
      capturedAt: capturedAt.toISOString(),
      source: checkIn.locationSource,
    });
  });

  it.each(['unavailable', 'redacted'] as const)('does not expose %s location data', async (locationStatus) => {
    loadCheckIn({ locationSource: 'gps', accuracyMeters: 12 }, locationStatus);

    const viewer = await loadGuardianViewer({ tripId: 'trip-1' });

    expect(viewer?.lastCheckIn?.location).toBeNull();
  });
});

describe('GuardianViewer', () => {
  const renderViewer = (location: {
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
    capturedAt: string;
    source: 'gps' | 'network' | 'line';
  }) => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        route: '玉山主峰',
        team: ['阿山'],
        lastCheckIn: { at: '2026-07-12T04:20:00.000Z', location },
        report: '119 摘要',
      }),
    })));
    render(createElement(GuardianViewer, { tripId: 'trip-1', grant: 'guardian-grant' }));
  };

  it('renders LINE coordinates and time with the required unknown-accuracy disclosure', async () => {
    renderViewer({ latitude: 23.47, longitude: 120.95, accuracyMeters: null, capturedAt: capturedAt.toISOString(), source: 'line' });

    expect(await screen.findByText(/最後位置：23\.47, 120\.95/)).toBeInTheDocument();
    expect(document.body).toHaveTextContent('LINE 回報時間：2026-07-12T04:19:00.000Z');
    expect(document.body).toHaveTextContent('位置精度：LINE 未提供');
    expect(document.body).toHaveTextContent('Location accuracy: Not provided by LINE');
    expect(document.body).not.toHaveTextContent('GPS accuracy');
  });

  it.each([
    ['gps' as const, 12, 'GPS 時間：2026-07-12T04:19:00.000Z', 'GPS 精度：12 公尺'],
    ['network' as const, 18, '網路定位時間：2026-07-12T04:19:00.000Z', '網路定位精度：18 公尺'],
  ])('renders %s-specific time and accuracy', async (source, accuracyMeters, timeText, accuracyText) => {
    renderViewer({ latitude: 23.47, longitude: 120.95, accuracyMeters, capturedAt: capturedAt.toISOString(), source });

    expect(await screen.findByText(/最後位置：23\.47, 120\.95/)).toBeInTheDocument();
    expect(document.body).toHaveTextContent(timeText);
    expect(document.body).toHaveTextContent(accuracyText);
  });
});
