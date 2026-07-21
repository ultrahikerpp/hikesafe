import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn().mockResolvedValue(undefined),
    isLoggedIn: vi.fn().mockReturnValue(true),
    login: vi.fn(),
    getIDToken: vi.fn().mockReturnValue('id-token'),
  },
}));

import { AcceptInvite } from '@/app/guardian/accept/AcceptInvite';
import { copy } from '@/src/features/i18n/copy';

const inviteResponse = (status: string) => new Response(JSON.stringify({
  inviterDisplayName: '阿山', expiresAt: '2026-07-22T00:00:00.000Z', status,
}), { status: 200 });

describe('guardian accept page', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubEnv('NEXT_PUBLIC_LIFF_ID', 'liff-id');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it('asks for a valid link when the token is missing', () => {
    render(<AcceptInvite />);
    expect(screen.getByRole('alert').textContent).toBe(copy.inviteNotFound);
  });

  it.each([
    ['expired', copy.inviteExpired],
    ['used', copy.inviteUsed],
    ['revoked', copy.inviteRevoked],
  ])('explains the %s invite state', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(inviteResponse(status)));
    render(<AcceptInvite token="invite-token" />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(message);
    expect(screen.queryByRole('button', { name: copy.acceptInviteAction })).not.toBeInTheDocument();
  });

  it('reports a token that does not exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    render(<AcceptInvite token="nope" />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(copy.inviteNotFound);
  });

  it('binds the guardian and confirms with the hiker name', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(inviteResponse('pending'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ inviterDisplayName: '阿山' }), { status: 200 })));
    render(<AcceptInvite token="invite-token" />);

    fireEvent.click(await screen.findByRole('button', { name: copy.acceptInviteAction }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toBe(copy.acceptInviteSuccess('阿山'));
  });

  it('tells a returning guardian they are already bound', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(inviteResponse('pending'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ reason: 'already_bound' }), { status: 409 })));
    render(<AcceptInvite token="invite-token" />);

    fireEvent.click(await screen.findByRole('button', { name: copy.acceptInviteAction }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(copy.alreadyGuardian('阿山'));
  });
});
