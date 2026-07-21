import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/app/LiffBootstrap', () => ({ LiffBootstrap: () => null }));
vi.mock('@line/liff', () => ({
  default: {
    isApiAvailable: vi.fn(() => false),
    getProfile: vi.fn(async () => ({ userId: 'U-guardian-self', displayName: '小美' })),
    shareTargetPicker: vi.fn(async () => undefined),
  },
}));

import { GuardiansContent } from '@/app/guardians/GuardiansContent';
import { copy } from '@/src/features/i18n/copy';
import liff from '@line/liff';

const bindings = [
  { id: 'binding-1', sourceType: 'user', displayName: '小美', sourceId: 'U-guardian', boundAt: '2026-07-20T00:00:00.000Z' },
];

const respondWith = (routes: Record<string, unknown>) => vi.fn(async (url: string, init?: RequestInit) => {
  const key = `${init?.method ?? 'GET'} ${url}`;
  if (!(key in routes)) return new Response(null, { status: 500 });
  const body = routes[key];
  return new Response(body === null ? null : JSON.stringify(body), { status: body === null ? 204 : 200 });
});

describe('guardians page', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    vi.mocked(liff.isApiAvailable).mockReturnValue(false);
  });

  afterEach(cleanup);

  it('offers only the copy button when LINE sharing is unavailable', async () => {
    vi.stubGlobal('fetch', respondWith({
      'GET /api/guardian-bindings': { bindings },
      'POST /api/guardian-invites': {
        inviteUrl: 'https://liff.line.me/liff-1/guardian/accept?token=t', expiresAt: '2026-07-22T00:00:00.000Z',
      },
    }));
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));

    expect(await screen.findByRole('button', { name: copy.copyInviteLink })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: copy.shareInviteToLine })).not.toBeInTheDocument();
  });

  it('offers the share button when LINE sharing is available', async () => {
    vi.mocked(liff.isApiAvailable).mockReturnValue(true);
    vi.stubGlobal('fetch', respondWith({
      'GET /api/guardian-bindings': { bindings },
      'POST /api/guardian-invites': {
        inviteUrl: 'https://liff.line.me/liff-1/guardian/accept?token=t', expiresAt: '2026-07-22T00:00:00.000Z',
      },
    }));
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));

    expect(await screen.findByRole('button', { name: copy.shareInviteToLine })).toBeInTheDocument();
  });

  it('copies the invite link and confirms it', async () => {
    vi.stubGlobal('fetch', respondWith({
      'GET /api/guardian-bindings': { bindings },
      'POST /api/guardian-invites': {
        inviteUrl: 'https://liff.line.me/liff-1/guardian/accept?token=t', expiresAt: '2026-07-22T00:00:00.000Z',
      },
    }));
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.copyInviteLink }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://liff.line.me/liff-1/guardian/accept?token=t',
    );
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
