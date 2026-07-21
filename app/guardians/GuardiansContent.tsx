'use client';

import { useCallback, useEffect, useState } from 'react';

import { LiffBootstrap } from '@/app/LiffBootstrap';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { Notice } from '@/app/components/Notice';
import { copy } from '@/src/features/i18n/copy';
import { formatTime } from '@/src/lib/format-time';

interface GuardianBinding {
  id: string;
  sourceType: 'user' | 'group' | 'room' | null;
  displayName: string | null;
  sourceId: string | null;
  boundAt: string | null;
}

interface Invite { inviteUrl: string; expiresAt: string }

const shareAvailable = async () => {
  try {
    const { default: liff } = await import('@line/liff');
    return liff.isApiAvailable('shareTargetPicker');
  } catch { return false; }
};

export function GuardiansContent() {
  const [bindings, setBindings] = useState<GuardianBinding[]>([]);
  const [invite, setInvite] = useState<Invite>();
  const [canShare, setCanShare] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string }>();
  const [busy, setBusy] = useState(false);
  const [bindingCode, setBindingCode] = useState('');

  const refresh = useCallback(async () => {
    const response = await fetch('/api/guardian-bindings');
    if (!response.ok) return;
    const body = await response.json() as { bindings: GuardianBinding[] };
    setBindings(body.bindings.filter((binding) => binding.boundAt && binding.sourceId));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { void shareAvailable().then(setCanShare); }, []);

  const createInvite = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/guardian-invites', { method: 'POST' });
      if (response.status === 409) {
        setNotice({ tone: 'error', text: copy.inviteLimitReached });
        return;
      }
      if (!response.ok) {
        setNotice({ tone: 'error', text: copy.inviteCreateError });
        return;
      }
      setInvite(await response.json() as Invite);
      setNotice(undefined);
    } catch (error) {
      console.error('Guardian invite request failed', { error });
      setNotice({ tone: 'error', text: copy.inviteCreateError });
    } finally { setBusy(false); }
  };

  const copyLink = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.inviteUrl);
    setNotice({ tone: 'success', text: copy.inviteLinkCopied });
  };

  const shareToLine = async () => {
    if (!invite) return;
    const { default: liff } = await import('@line/liff');
    const profile = await liff.getProfile();
    await liff.shareTargetPicker([
      { type: 'text', text: copy.inviteShareMessage(profile.displayName, invite.inviteUrl) },
    ]);
  };

  const revoke = async (id: string) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/guardian-bindings/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        setNotice({ tone: 'error', text: copy.revokeBindingError });
        return;
      }
      setBindings((current) => current.filter((binding) => binding.id !== id));
    } catch (error) {
      console.error('Guardian binding revocation failed', { id, error });
      setNotice({ tone: 'error', text: copy.revokeBindingError });
    } finally { setBusy(false); }
  };

  return <main>
    <Card>
      <h1>{copy.guardiansTitle}</h1>
      <LiffBootstrap />
    </Card>

    <Card title={copy.myGuardians}>
      {bindings.length === 0 && <p className="source-note">{copy.noGuardianBindings}</p>}
      {bindings.map((binding) => <div key={binding.id} className="card-row">
        <span>{binding.displayName || copy.boundGuardian}</span>
        <Chip tone={binding.sourceType === 'group' ? 'neutral' : 'success'}>
          {binding.sourceType === 'group' ? copy.boundGroup : copy.boundGuardian}
        </Chip>
        <span className="source-note">{formatTime(binding.boundAt ?? undefined)}</span>
        <Button variant="danger" disabled={busy} onClick={() => void revoke(binding.id)}>
          {copy.revokeBinding}
        </Button>
      </div>)}
    </Card>

    <Card title={copy.inviteGuardian}>
      <Button disabled={busy} onClick={() => void createInvite()}>{copy.inviteGuardian}</Button>
      {invite && <>
        <p className="source-note">{copy.inviteExpiresAt(formatTime(invite.expiresAt))}</p>
        {canShare && <Button variant="secondary" onClick={() => void shareToLine()}>
          {copy.shareInviteToLine}
        </Button>}
        <Button variant="secondary" onClick={() => void copyLink()}>{copy.copyInviteLink}</Button>
      </>}
    </Card>

    <details className="card">
      <summary>{copy.groupBindingSection}</summary>
      <Button variant="ghost" disabled={busy} onClick={() => void (async () => {
        const response = await fetch('/api/guardian-bindings', { method: 'POST' });
        if (!response.ok) { setNotice({ tone: 'error', text: copy.bindingCodeError }); return; }
        setBindingCode((await response.json() as { code: string }).code);
      })()}>{copy.createBindingCode}</Button>
      {bindingCode && <Notice tone="success">{copy.bindingCodeInstructions(bindingCode)}</Notice>}
    </details>

    {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
  </main>;
}
