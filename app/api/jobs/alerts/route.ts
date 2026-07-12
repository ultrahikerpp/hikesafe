import { NextResponse } from 'next/server';

import { getEnv } from '@/src/env';
import { processDueAlerts, type ProcessDueAlertsInput } from '@/src/features/alerts/process';
import { pushLineMessage } from '@/src/integrations/line/client';

interface JobDependencies {
  secret?: string;
  now?: () => Date;
  process?: (input: ProcessDueAlertsInput) => ReturnType<typeof processDueAlerts>;
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
  const result = await (dependencies.process ?? defaultProcess)({
    now: (dependencies.now ?? (() => new Date()))(),
  });
  return NextResponse.json(result);
};

export const GET = (request: Request) => handleAlertsJob(request);
