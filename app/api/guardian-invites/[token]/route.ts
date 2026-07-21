import { NextResponse } from 'next/server';

import { readGuardianInvite } from '@/src/features/line/guardian-invites';

export const GET = async (_request: Request, { params }: { params: Promise<{ token: string }> }) => {
  const invite = await readGuardianInvite({ ...(await params), now: new Date() });
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  return NextResponse.json({
    inviterDisplayName: invite.inviterDisplayName,
    expiresAt: invite.expiresAt.toISOString(),
    status: invite.status,
  });
};
