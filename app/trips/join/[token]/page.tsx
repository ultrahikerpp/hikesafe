import { JoinTrip } from './JoinTrip';

export default async function JoinTripPage({ params }: { params: Promise<{ token: string }> }) {
  return <JoinTrip token={(await params).token} />;
}
