import { GuardianViewer } from './GuardianViewer';

export default async function GuardianViewerPage({ params, searchParams }: { params: Promise<{ tripId: string }>; searchParams: Promise<{ grant?: string }> }) {
  const [{ tripId }, { grant }] = await Promise.all([params, searchParams]);
  return <GuardianViewer tripId={tripId} grant={grant ?? ''} />;
}
