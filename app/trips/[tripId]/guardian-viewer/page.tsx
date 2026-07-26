import { GuardianViewer } from './GuardianViewer';

export default async function GuardianViewerPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <GuardianViewer tripId={tripId} />;
}
