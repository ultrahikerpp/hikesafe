import { describe, expect, it, vi } from 'vitest';

import { deleteExpiredPreciseLocations, type RetentionRepository } from '@/src/features/retention/delete-expired-precise-locations';

describe('deleteExpiredPreciseLocations', () => {
  it('redacts complete precise-location sets for eligible finished trips in one transaction', async () => {
    const redactEligibleLocations = vi.fn().mockResolvedValue(3);
    const transaction = vi.fn(async (operation: (repository: { redactEligibleLocations: typeof redactEligibleLocations }) => Promise<number>) =>
      operation({ redactEligibleLocations }));
    const repository: RetentionRepository = { transaction };
    const clock = () => new Date('2026-07-12T05:00:00.000Z');

    await expect(deleteExpiredPreciseLocations(clock, repository)).resolves.toEqual({ deleted: 3 });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(redactEligibleLocations).toHaveBeenCalledWith(new Date('2026-04-13T05:00:00.000Z'));
  });

  it('delegates eligibility to the atomic cleanup query so active and unresolved-alert trips stay intact', async () => {
    const redactEligibleLocations = vi.fn().mockResolvedValue(0);
    const repository: RetentionRepository = {
      transaction: async (operation) => operation({ redactEligibleLocations }),
    };

    await expect(deleteExpiredPreciseLocations(() => new Date('2026-07-12T05:00:00.000Z'), repository))
      .resolves.toEqual({ deleted: 0 });
    expect(redactEligibleLocations).toHaveBeenCalledTimes(1);
  });
});
