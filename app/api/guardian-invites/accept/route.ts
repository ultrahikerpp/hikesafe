import { NextResponse } from 'next/server';
import { z } from 'zod';

import { copy } from '@/src/features/i18n/copy';
import { acceptGuardianInvite } from '@/src/features/line/guardian-invites';
import { pushLineMessage } from '@/src/integrations/line/client';
import { verifyLineIdToken } from '@/src/integrations/line/verify-id-token';

const schema = z.object({ token: z.string().min(1), idToken: z.string().min(1) }).strict();

const statusByReason = {
  not_found: 404, used: 409, revoked: 409, already_bound: 409, expired: 410,
} as const;

export const POST = async (request: Request) => {
  const parsed = schema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  let identity;
  try { identity = await verifyLineIdToken(parsed.data.idToken); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const result = await acceptGuardianInvite({
    token: parsed.data.token,
    lineUserId: identity.lineUserId,
    displayName: identity.displayName,
    now: new Date(),
  });
  if (!result.ok) {
    return NextResponse.json({ reason: result.reason }, { status: statusByReason[result.reason] });
  }

  try {
    await pushLineMessage({
      to: result.inviterLineUserId,
      messages: [{ type: 'text', text: copy.guardianBoundNotice(identity.displayName) }],
      idempotencyKey: result.bindingId,
    });
  } catch (error) {
    console.error('Guardian bound notification failed', { bindingId: result.bindingId, error });
  }

  return NextResponse.json({ inviterDisplayName: result.inviterDisplayName });
};
