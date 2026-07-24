import { describe, expect, it, vi } from 'vitest';

import { shareInviteLink } from '@/src/lib/share-invite';

const url = 'https://liff.line.me/abc/guardian/accept?token=t';

describe('shareInviteLink', () => {
  it('shares through the LINE target picker and does not fall back to copying', async () => {
    const shareTargetPicker = vi.fn().mockResolvedValue({ status: 'success' });
    const getProfile = vi.fn().mockResolvedValue({ displayName: 'Amy' });
    const copyToClipboard = vi.fn();
    const buildMessage = vi.fn((name: string) => `${name}: ${url}`);

    await expect(shareInviteLink(url, buildMessage, {
      loadLiff: async () => ({ shareTargetPicker, getProfile }),
      copyToClipboard,
    })).resolves.toBe('shared');

    expect(buildMessage).toHaveBeenCalledWith('Amy');
    expect(shareTargetPicker).toHaveBeenCalledWith([{ type: 'text', text: `Amy: ${url}` }]);
    expect(copyToClipboard).not.toHaveBeenCalled();
  });

  it('copies the link as a fallback when sharing is unavailable (e.g. opened outside LINE)', async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);

    await expect(shareInviteLink(url, () => 'msg', {
      loadLiff: async () => { throw new Error('shareTargetPicker not available'); },
      copyToClipboard,
    })).resolves.toBe('copied');

    expect(copyToClipboard).toHaveBeenCalledWith(url);
  });

  it('still shares when the profile lookup fails, using an empty inviter name', async () => {
    const shareTargetPicker = vi.fn().mockResolvedValue(undefined);
    const getProfile = vi.fn().mockRejectedValue(new Error('no profile scope'));
    const buildMessage = vi.fn((name: string) => `[${name}]`);
    const copyToClipboard = vi.fn();

    await expect(shareInviteLink(url, buildMessage, {
      loadLiff: async () => ({ shareTargetPicker, getProfile }),
      copyToClipboard,
    })).resolves.toBe('shared');

    expect(buildMessage).toHaveBeenCalledWith('');
    expect(copyToClipboard).not.toHaveBeenCalled();
  });
});
