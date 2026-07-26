import { NextResponse } from 'next/server';

import { getEnv } from '@/src/env';
import { processDueAlerts, type ProcessDueAlertsInput } from '@/src/features/alerts/process';
import { pushLineMessage } from '@/src/integrations/line/client';
import {
  databaseAlertHeartbeat,
  heartbeatErrorMessage,
  isAlertHeartbeatHealthy,
  type JobHeartbeat,
  type JobHeartbeatRepository,
} from '@/src/features/ops/job-heartbeat';

interface JobDependencies {
  secret?: string;
  now?: () => Date;
  process?: (input: ProcessDueAlertsInput) => ReturnType<typeof processDueAlerts>;
  heartbeat?: Pick<JobHeartbeatRepository, 'started' | 'succeeded' | 'failed'>;
}

const defaultProcess = (input: ProcessDueAlertsInput) => processDueAlerts({
  ...input,
  send: pushLineMessage,
});

export const handleAlertsJob = async (request: Request, dependencies: JobDependencies = {}) => {
  const secret = dependencies.secret ?? getEnv().JOB_SECRET;
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const now = (dependencies.now ?? (() => new Date()))();
  const heartbeat = dependencies.heartbeat ?? databaseAlertHeartbeat;
  const record = async (operation: () => Promise<void>) => {
    try { await operation(); } catch (error) { console.error('Unable to record alerts heartbeat', error); }
  };
  await record(() => heartbeat.started(now));
  try {
    const result = await (dependencies.process ?? defaultProcess)({ now });
    await record(() => heartbeat.succeeded(now));
    return NextResponse.json(result);
  } catch (error) {
    await record(() => heartbeat.failed(now, heartbeatErrorMessage(error)));
    throw error;
  }
};

interface HealthDependencies {
  secret?: string;
  now?: () => Date;
  readHeartbeat?: () => Promise<JobHeartbeat | undefined>;
}

export const handleAlertsHealth = async (request: Request, dependencies: HealthDependencies = {}) => {
  const secret = dependencies.secret ?? getEnv().JOB_SECRET;
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const now = (dependencies.now ?? (() => new Date()))();
  const heartbeat = await (dependencies.readHeartbeat ?? databaseAlertHeartbeat.read)();
  const healthy = isAlertHeartbeatHealthy(heartbeat, now);
  return NextResponse.json({
    healthy,
    lastStartedAt: heartbeat?.lastStartedAt?.toISOString() ?? null,
    lastSucceededAt: heartbeat?.lastSucceededAt?.toISOString() ?? null,
    lastFailedAt: heartbeat?.lastFailedAt?.toISOString() ?? null,
  }, { status: healthy ? 200 : 503 });
};

export const GET = (request: Request) => handleAlertsJob(request);
