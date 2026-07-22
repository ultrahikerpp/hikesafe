import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/env', () => ({ getEnv: () => ({ NEXT_PUBLIC_LIFF_ID: 'liff-id' }) }));

import { buildTripSummaryCard, pushTripSummary } from '@/src/features/line/trip-summary';

const summary = {
  tripId: 'trip-1',
  routeName: '玉山主峰線',
  plannedFinishAt: new Date('2026-07-18T08:00:00.000Z'),
  team: ['阿山', '小玉'],
  guardianCount: 2,
  liffId: 'liff-id',
};

const lookup = {
  lineUserId: 'line-owner-1',
  routeName: '玉山主峰線',
  plannedFinishAt: new Date('2026-07-18T08:00:00.000Z'),
  team: ['阿山', '小玉'],
  guardianCount: 2,
};

describe('buildTripSummaryCard', () => {
  it('shows the route, planned finish, team, and guardian count', () => {
    const serialized = JSON.stringify(buildTripSummaryCard(summary));

    expect(serialized).toContain('玉山主峰線');
    expect(serialized).toContain('2026-07-18 16:00 Asia/Taipei');
    expect(serialized).toContain('阿山、小玉');
    expect(serialized).toContain('2');
  });

  it('offers a start postback and a LIFF trip page fallback', () => {
    const card = buildTripSummaryCard(summary);
    const serialized = JSON.stringify(card);

    expect(card.type).toBe('flex');
    expect(serialized).toContain('hikesafe:start:trip-1:confirm');
    expect(serialized).toContain('https://liff.line.me/liff-id/trips/trip-1');
  });
});

describe('pushTripSummary', () => {
  it('pushes the card to the owner with the trip id as the retry key', async () => {
    const push = vi.fn(async () => undefined);
    const repository = { findTripSummary: vi.fn(async () => lookup) };

    await pushTripSummary({ tripId: 'trip-1', ownerUserId: 'user-1' }, { repository, push });

    expect(repository.findTripSummary).toHaveBeenCalledWith({ tripId: 'trip-1', ownerUserId: 'user-1' });
    expect(push).toHaveBeenCalledWith(expect.objectContaining({
      to: 'line-owner-1',
      idempotencyKey: 'trip-1',
    }));
  });

  it('stays silent and logs when the push fails', async () => {
    const push = vi.fn(async () => { throw new Error('LINE push failed (403)'); });
    const repository = { findTripSummary: vi.fn(async () => lookup) };
    const logger = { error: vi.fn() };

    await expect(pushTripSummary({ tripId: 'trip-1', ownerUserId: 'user-1' }, { repository, push, logger }))
      .resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });

  it('does nothing when the trip summary cannot be found', async () => {
    const push = vi.fn(async () => undefined);
    const repository = { findTripSummary: vi.fn(async () => undefined) };

    await pushTripSummary({ tripId: 'trip-1', ownerUserId: 'user-1' }, { repository, push });

    expect(push).not.toHaveBeenCalled();
  });
});
