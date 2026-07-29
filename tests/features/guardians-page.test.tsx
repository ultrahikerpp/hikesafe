import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/app/LiffBootstrap', () => ({ LiffBootstrap: () => null }));
vi.mock('@line/liff', () => ({
  default: {
    getProfile: vi.fn(async () => ({ userId: 'U-guardian-self', displayName: '小美' })),
    isApiAvailable: vi.fn(() => true),
    shareTargetPicker: vi.fn(async () => ({ status: 'success' })),
  },
}));

import { GuardiansContent } from '@/app/guardians/GuardiansContent';
import { copy } from '@/src/features/i18n/copy';
import liff from '@line/liff';

const bindings = [
  { id: 'binding-1', sourceType: 'user', displayName: '小美', sourceId: 'U-guardian', boundAt: '2026-07-20T00:00:00.000Z' },
];

const inviteUrl = 'https://liff.line.me/liff-1/guardian/accept?token=t';

const respondWith = (routes: Record<string, unknown>) => vi.fn(async (url: string, init?: RequestInit) => {
  const key = `${init?.method ?? 'GET'} ${url}`;
  if (!(key in routes)) return new Response(null, { status: 500 });
  const body = routes[key];
  return new Response(body === null ? null : JSON.stringify(body), { status: body === null ? 204 : 200 });
});

const invitingFetch = () => respondWith({
  'GET /api/guardian-bindings': { bindings },
  'POST /api/guardian-invites': { inviteUrl, expiresAt: '2026-07-22T00:00:00.000Z' },
});

describe('guardians page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    vi.mocked(liff.isApiAvailable).mockReturnValue(true);
    vi.mocked(liff.shareTargetPicker).mockResolvedValue({ status: 'success' });
  });

  afterEach(cleanup);

  it('always offers the share button once an invite exists', async () => {
    vi.stubGlobal('fetch', invitingFetch());
    render(<GuardiansContent />);

    expect(screen.queryByRole('button', { name: copy.shareInviteToLine })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: copy.copyInviteLink })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));

    expect(await screen.findByRole('button', { name: copy.shareInviteToLine })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.copyInviteLink })).toBeInTheDocument();
  });

  it('shares the invite through the LINE target picker without copying', async () => {
    vi.stubGlobal('fetch', invitingFetch());
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.shareInviteToLine }));

    await waitFor(() => expect(liff.shareTargetPicker).toHaveBeenCalledWith([
      { type: 'text', text: copy.inviteShareMessage('小美', inviteUrl) },
    ]));
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('copies the link with an unavailable-environment warning when the API is unavailable', async () => {
    vi.mocked(liff.isApiAvailable).mockReturnValueOnce(false);
    vi.stubGlobal('fetch', invitingFetch());
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.shareInviteToLine }));

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(inviteUrl));
    expect((await screen.findByRole('status')).textContent).toBe(copy.shareUnavailableCopied);
    expect(liff.shareTargetPicker).not.toHaveBeenCalled();
  });

  it('copies the link with a LINE failure warning when the target picker rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(liff.shareTargetPicker).mockRejectedValueOnce(new Error('shareTargetPicker not available'));
    vi.stubGlobal('fetch', invitingFetch());
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.shareInviteToLine }));

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(inviteUrl));
    const status = await screen.findByRole('status');
    expect(status.textContent).toBe(copy.shareFailedCopied);
  });

  it('reports cancellation without copying the invite link', async () => {
    vi.mocked(liff.shareTargetPicker).mockResolvedValueOnce(undefined);
    vi.stubGlobal('fetch', invitingFetch());
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.shareInviteToLine }));

    expect((await screen.findByRole('status')).textContent).toBe(copy.shareCancelled);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('shows an error when LINE sharing and fallback copying both fail', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(liff.shareTargetPicker).mockRejectedValueOnce(new Error('LINE failed'));
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard denied'));
    vi.stubGlobal('fetch', invitingFetch());
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.shareInviteToLine }));

    expect((await screen.findByRole('alert')).textContent).toBe(copy.shareAndCopyFailed);
  });

  it('copies the invite link and confirms it', async () => {
    vi.stubGlobal('fetch', invitingFetch());
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.copyInviteLink }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(inviteUrl);
    const status = await screen.findByRole('status');
    expect(status.textContent).toBe(copy.inviteLinkCopied);
  });

  it('surfaces the pending invite limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) =>
      init?.method === 'POST' && url === '/api/guardian-invites'
        ? new Response(JSON.stringify({ error: 'Too many pending guardian invites' }), { status: 409 })
        : new Response(JSON.stringify({ bindings }), { status: 200 })));
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(copy.inviteLimitReached);
  });

  it('removes a binding from the list after revoking it', async () => {
    const fetchMock = respondWith({
      'GET /api/guardian-bindings': { bindings },
      'DELETE /api/guardian-bindings/binding-1': null,
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<GuardiansContent />);

    expect(await screen.findByText(/小美/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: copy.revokeBinding }));

    await waitFor(() => expect(screen.queryByText(/小美/)).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/guardian-bindings/binding-1', { method: 'DELETE' });
  });

  it('shows an error notice instead of "no guardians" when the initial load fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })));
    render(<GuardiansContent />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(copy.authenticationError('讀取留守人清單', 'loading your guardian list'));
    expect(screen.queryByText(/尚未綁定任何留守人/)).not.toBeInTheDocument();
  });
});
