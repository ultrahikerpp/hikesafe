import { eq } from 'drizzle-orm';

export interface JobHeartbeat {
  lastStartedAt: Date | null;
  lastSucceededAt: Date | null;
  lastFailedAt: Date | null;
  lastError: string | null;
}

export interface JobHeartbeatRepository {
  started(now: Date): Promise<void>;
  succeeded(now: Date): Promise<void>;
  failed(now: Date, error: string): Promise<void>;
  read(): Promise<JobHeartbeat | undefined>;
}

export const alertHeartbeatMaxAgeMs = 3 * 60 * 1_000;

export const isAlertHeartbeatHealthy = (heartbeat: JobHeartbeat | undefined, now: Date) => Boolean(
  heartbeat?.lastSucceededAt && now.getTime() - heartbeat.lastSucceededAt.getTime() <= alertHeartbeatMaxAgeMs,
);

export const databaseAlertHeartbeat: JobHeartbeatRepository = {
  async started(now) {
    const [{ db }, { jobHeartbeats }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'),
    ]);
    await db.insert(jobHeartbeats).values({ jobName: 'alerts', lastStartedAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: jobHeartbeats.jobName, set: { lastStartedAt: now, updatedAt: now } });
  },
  async succeeded(now) {
    const [{ db }, { jobHeartbeats }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'),
    ]);
    await db.update(jobHeartbeats).set({ lastSucceededAt: now, lastError: null, updatedAt: now })
      .where(eq(jobHeartbeats.jobName, 'alerts'));
  },
  async failed(now, error) {
    const [{ db }, { jobHeartbeats }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'),
    ]);
    await db.update(jobHeartbeats).set({ lastFailedAt: now, lastError: error.slice(0, 1000), updatedAt: now })
      .where(eq(jobHeartbeats.jobName, 'alerts'));
  },
  async read() {
    const [{ db }, { jobHeartbeats }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'),
    ]);
    const [heartbeat] = await db.select({
      lastStartedAt: jobHeartbeats.lastStartedAt,
      lastSucceededAt: jobHeartbeats.lastSucceededAt,
      lastFailedAt: jobHeartbeats.lastFailedAt,
      lastError: jobHeartbeats.lastError,
    }).from(jobHeartbeats).where(eq(jobHeartbeats.jobName, 'alerts')).limit(1);
    return heartbeat;
  },
};

export const heartbeatErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown alert job error';
