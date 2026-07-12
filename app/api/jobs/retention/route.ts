import { NextResponse } from 'next/server';

import { getEnv } from '@/src/env';
import { deleteExpiredPreciseLocations } from '@/src/features/retention/delete-expired-precise-locations';

interface RetentionJobDependencies {
  secret?: string;
  now?: () => Date;
  remove?: (clock: () => Date) => ReturnType<typeof deleteExpiredPreciseLocations>;
}

export const handleRetentionJob = async (request: Request, dependencies: RetentionJobDependencies = {}) => {
  const secret = dependencies.secret ?? getEnv().JOB_SECRET;
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await (dependencies.remove ?? deleteExpiredPreciseLocations)(dependencies.now ?? (() => new Date())));
};

export const GET = (request: Request) => handleRetentionJob(request);
