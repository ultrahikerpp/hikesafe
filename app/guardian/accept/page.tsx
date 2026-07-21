import { AcceptInvite } from './AcceptInvite';

export default async function GuardianAcceptPage(
  { searchParams }: { searchParams: Promise<{ token?: string }> },
) {
  return <AcceptInvite token={(await searchParams).token} />;
}
