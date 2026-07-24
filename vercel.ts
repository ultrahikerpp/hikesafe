import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  // Apply pending migrations before building on production deploys (the script itself
  // no-ops on preview/local). A failed migration fails the build and blocks the deploy.
  buildCommand: 'tsx scripts/deploy-migrate.ts && next build',
  crons: [
    { path: '/api/jobs/retention', schedule: '17 3 * * *' },
  ],
};
