import { handleAlertsHealth } from '@/app/api/jobs/alerts/route';

export const GET = (request: Request) => handleAlertsHealth(request);
