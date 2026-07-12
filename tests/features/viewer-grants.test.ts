import { createHash } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { authorizeViewerGrant, type ViewerGrantRepository } from '@/src/features/auth/viewer-grants';

const hash = (token: string) => createHash('sha256').update(token).digest('hex');
const now = new Date('2026-07-12T05:00:00.000Z');

const repository = (overrides: Partial<ViewerGrantRepository> = {}): ViewerGrantRepository => ({
  findDirectGuardianGrants: vi.fn().mockResolvedValue([{
    tokenHash: hash('valid-token'),
    finishedAt: new Date('2026-07-01T05:00:00.000Z'),
    expiresAt: new Date('2026-10-01T05:00:00.000Z'),
  }]),
  ...overrides,
});

describe('authorizeViewerGrant', () => {
  it('requires a matching SHA-256 bearer token for the direct LINE guardian', async () => {
    const store = repository();

    await expect(authorizeViewerGrant({ tripId: 'trip-1', token: 'valid-token', lineUserId: 'U-guardian', now }, store)).resolves.toBe(true);
    await expect(authorizeViewerGrant({ tripId: 'trip-1', token: 'wrong-token', lineUserId: 'U-guardian', now }, store)).resolves.toBe(false);
    expect(store.findDirectGuardianGrants).toHaveBeenCalledWith('trip-1', 'U-guardian');
  });

  it('expires a completed trip grant ninety days after its actual finish', async () => {
    const store = repository({
      findDirectGuardianGrants: vi.fn().mockResolvedValue([{
        tokenHash: hash('valid-token'),
        finishedAt: new Date('2026-04-01T05:00:00.000Z'),
        expiresAt: new Date('2027-01-01T05:00:00.000Z'),
      }]),
    });

    await expect(authorizeViewerGrant({
      tripId: 'trip-1', token: 'valid-token', lineUserId: 'U-guardian', now,
    }, store)).resolves.toBe(false);
  });

  it('does not authorize a legacy group or room grant', async () => {
    const store = repository({ findDirectGuardianGrants: vi.fn().mockResolvedValue([]) });

    await expect(authorizeViewerGrant({
      tripId: 'trip-1', token: 'valid-token', lineUserId: 'U-group', now,
    }, store)).resolves.toBe(false);
  });
});
