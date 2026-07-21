'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Notice } from '@/app/components/Notice';
import { copy } from '@/src/features/i18n/copy';

type InviteStatus = 'pending' | 'expired' | 'used' | 'revoked';

interface Invite { inviterDisplayName: string; expiresAt: string; status: InviteStatus }

const statusMessage: Record<Exclude<InviteStatus, 'pending'>, string> = {
  expired: copy.inviteExpired,
  used: copy.inviteUsed,
  revoked: copy.inviteRevoked,
};

const identityToken = async () => {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) throw new Error('LIFF is not configured');
  const { default: liff } = await import('@line/liff');
  await liff.init({ liffId });
  if (!liff.isLoggedIn()) { liff.login(); return undefined; }
  const idToken = liff.getIDToken();
  if (!idToken) throw new Error('LINE ID token unavailable');
  return idToken;
};

export function AcceptInvite({ token }: { token?: string }) {
  const [invite, setInvite] = useState<Invite>();
  const [error, setError] = useState(token ? undefined : copy.inviteNotFound);
  const [accepted, setAccepted] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const response = await fetch(`/api/guardian-invites/${encodeURIComponent(token)}`);
        if (!response.ok) { setError(copy.inviteNotFound); return; }
        setInvite(await response.json() as Invite);
      } catch (fetchError) {
        console.error('Guardian invite lookup failed', { error: fetchError });
        setError(copy.acceptInviteError);
      }
    })();
  }, [token]);

  const accept = async () => {
    if (!token || !invite) return;
    setBusy(true);
    try {
      const idToken = await identityToken();
      if (!idToken) return;
      const response = await fetch('/api/guardian-invites/accept', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, idToken }),
      });
      if (response.ok) { setAccepted(invite.inviterDisplayName); return; }
      const body = await response.json().catch(() => ({})) as { reason?: string };
      if (body.reason === 'already_bound') { setError(copy.alreadyGuardian(invite.inviterDisplayName)); return; }
      setError(body.reason && body.reason in statusMessage
        ? statusMessage[body.reason as Exclude<InviteStatus, 'pending'>]
        : copy.acceptInviteError);
    } catch (acceptError) {
      console.error('Guardian invite acceptance failed', { error: acceptError });
      setError(copy.acceptInviteError);
    } finally { setBusy(false); }
  };

  const officialAccountUrl = process.env.NEXT_PUBLIC_LINE_OA_URL;

  if (accepted) return <main><Card>
    <Notice tone="success">{copy.acceptInviteSuccess(accepted)}</Notice>
    <p className="source-note">{copy.addOfficialAccount}</p>
    {officialAccountUrl && <a className="btn btn-secondary" href={officialAccountUrl}>
      {copy.addOfficialAccount}
    </a>}
  </Card></main>;

  if (error) return <main><Card><Notice tone="error">{error}</Notice></Card></main>;
  if (!invite) return <main><Card>
    <p className="source-note" role="status">{copy.liffLoading}</p>
  </Card></main>;
  if (invite.status !== 'pending') return <main><Card>
    <Notice tone="error">{statusMessage[invite.status]}</Notice>
  </Card></main>;

  return <main><Card>
    <h1>{copy.acceptInviteTitle(invite.inviterDisplayName)}</h1>
    <p className="source-note">{copy.addOfficialAccount}</p>
    <Button disabled={busy} onClick={() => void accept()}>{copy.acceptInviteAction}</Button>
  </Card></main>;
}
