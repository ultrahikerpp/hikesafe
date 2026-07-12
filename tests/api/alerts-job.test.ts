import { describe, expect, it, vi } from 'vitest';

import { handleAlertsJob } from '@/app/api/jobs/alerts/route';

describe('GET /api/jobs/alerts', () => {
  it('rejects missing or incorrect job credentials', async () => {
    const process = vi.fn();

    await expect((await handleAlertsJob(new Request('http://localhost/api/jobs/alerts'), {
      secret: 'job-secret', process,
    })).status).toBe(401);
    await expect((await handleAlertsJob(new Request('http://localhost/api/jobs/alerts', {
      headers: { authorization: 'Bearer wrong-secret' },
    }), { secret: 'job-secret', process })).status).toBe(401);
    expect(process).not.toHaveBeenCalled();
  });

  it('runs the processor with a valid bearer secret and reports its counters', async () => {
    const now = new Date('2026-07-12T05:00:00.000Z');
    const process = vi.fn().mockResolvedValue({ claimed: 2, sent: 1, failed: 1, skipped: 0 });

    const response = await handleAlertsJob(new Request('http://localhost/api/jobs/alerts', {
      headers: { authorization: 'Bearer job-secret' },
    }), { secret: 'job-secret', now: () => now, process });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ claimed: 2, sent: 1, failed: 1, skipped: 0 });
    expect(process).toHaveBeenCalledWith(expect.objectContaining({ now }));
  });
});
