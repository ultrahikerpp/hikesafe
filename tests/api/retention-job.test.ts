import { describe, expect, it, vi } from 'vitest';

import { handleRetentionJob } from '@/app/api/jobs/retention/route';

describe('GET /api/jobs/retention', () => {
  it('rejects missing or incorrect bearer credentials before cleanup', async () => {
    const remove = vi.fn();

    await expect((await handleRetentionJob(new Request('http://localhost/api/jobs/retention'), {
      secret: 'job-secret', remove,
    })).status).toBe(401);
    await expect((await handleRetentionJob(new Request('http://localhost/api/jobs/retention', {
      headers: { authorization: 'Bearer wrong-secret' },
    }), { secret: 'job-secret', remove })).status).toBe(401);
    expect(remove).not.toHaveBeenCalled();
  });

  it('runs cleanup with a valid bearer credential and returns its deleted count', async () => {
    const now = new Date('2026-07-12T05:00:00.000Z');
    const remove = vi.fn().mockResolvedValue({ deleted: 3 });

    const response = await handleRetentionJob(new Request('http://localhost/api/jobs/retention', {
      headers: { authorization: 'Bearer job-secret' },
    }), { secret: 'job-secret', now: () => now, remove });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ deleted: 3 });
    expect(remove).toHaveBeenCalledWith(expect.any(Function));
    expect(remove.mock.calls[0][0]()).toEqual(now);
  });
});
