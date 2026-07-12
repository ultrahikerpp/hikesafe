import { TripActions } from './TripActions';

export default async function ActiveTripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <main>
    <h1>進行中行程</h1>
    <TripActions tripId={tripId} initialState={{
      gpsFreshness: '尚未取得',
      pendingQueueCount: 0,
    }} />
  </main>;
}
