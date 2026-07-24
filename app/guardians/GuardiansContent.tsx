'use client';

import { useCallback, useEffect, useState } from 'react';

import { LiffBootstrap } from '@/app/LiffBootstrap';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { Notice } from '@/app/components/Notice';
import { copy } from '@/src/features/i18n/copy';
import { formatTime } from '@/src/lib/format-time';
import { shareInviteLink } from '@/src/lib/share-invite';

interface GuardianBinding {
  id: string;
  sourceType: 'user' | 'group' | 'room' | null;
  displayName: string | null;
  sourceId: string | null;
  boundAt: string | null;
}

interface Invite { inviteUrl: string; expiresAt: string }

export function GuardiansContent() {
  const [bindings, setBindings] = useState<GuardianBinding[]>([]);
  const [invite, setInvite] = useState<Invite>();
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string }>();
  const [busy, setBusy] = useState(false);
  const [bindingCode, setBindingCode] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/guardian-bindings');
    if (!response.ok) throw new Error('Guardian bindings unavailable');
    const body = await response.json() as { bindings: GuardianBinding[] };
    setBindings(body.bindings.filter((binding) => binding.boundAt && binding.sourceId));
  }, []);

  useEffect(() => {
    void refresh().catch(() => {
      setLoadFailed(true);
      setNotice({ tone: 'error', text: copy.authenticationError('讀取留守人清單', 'loading your guardian list') });
    });
  }, [refresh]);

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
    const inviteUrl = invite.inviteUrl;
    const result = await shareInviteLink(inviteUrl, (name) => copy.inviteShareMessage(name, inviteUrl));
    setNotice(result === 'copied' ? { tone: 'success', text: copy.shareUnavailableCopied } : undefined);
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
      {bindings.length === 0 && !loadFailed && <p className="source-note">{copy.noGuardianBindings}</p>}
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
        <Button variant="secondary" onClick={() => void shareToLine()}>{copy.shareInviteToLine}</Button>
        <Button variant="ghost" onClick={() => void copyLink()}>{copy.copyInviteLink}</Button>
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
