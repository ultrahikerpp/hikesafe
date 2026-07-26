import { describe, expect, it, vi } from 'vitest';

import { handleLogout } from '@/app/api/auth/logout/route';

describe('POST /api/auth/logout', () => {
  it('revokes the current session and clears its cookie', async () => {
    const revoke = vi.fn().mockResolvedValue(undefined);
    const response = await handleLogout(new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { cookie: 'besafe_session=session-token' },
    }), { revoke });

    expect(response.status).toBe(204);
    expect(revoke).toHaveBeenCalledWith('session-token');
    expect(response.headers.get('set-cookie')).toContain('besafe_session=;');
  });
});
