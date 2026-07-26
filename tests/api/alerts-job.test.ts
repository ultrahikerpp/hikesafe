import { describe, expect, it, vi } from 'vitest';

import { handleAlertsHealth, handleAlertsJob } from '@/app/api/jobs/alerts/route';

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

  it('records a successful heartbeat after processing', async () => {
    const heartbeat = {
      started: vi.fn(),
      succeeded: vi.fn(),
      failed: vi.fn(),
    };
    const now = new Date('2026-07-12T05:00:00.000Z');
    const process = vi.fn().mockResolvedValue({ claimed: 0, sent: 0, failed: 0, skipped: 0 });

    await handleAlertsJob(new Request('http://localhost/api/jobs/alerts', {
      headers: { authorization: 'Bearer job-secret' },
    }), { secret: 'job-secret', now: () => now, process, heartbeat });

    expect(heartbeat.started).toHaveBeenCalledWith(now);
    expect(heartbeat.succeeded).toHaveBeenCalledWith(now);
    expect(heartbeat.failed).not.toHaveBeenCalled();
  });

  it('returns a failing health status when no recent successful heartbeat exists', async () => {
    const response = await handleAlertsHealth(new Request('http://localhost/api/jobs/alerts/health', {
      headers: { authorization: 'Bearer job-secret' },
    }), {
      secret: 'job-secret',
      now: () => new Date('2026-07-12T05:05:00.000Z'),
      readHeartbeat: vi.fn().mockResolvedValue({
        lastStartedAt: new Date('2026-07-12T05:00:00.000Z'),
        lastSucceededAt: new Date('2026-07-12T05:00:00.000Z'),
        lastFailedAt: null,
        lastError: null,
      }),
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ healthy: false });
  });
});
