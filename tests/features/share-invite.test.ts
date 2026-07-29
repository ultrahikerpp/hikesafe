import { afterEach, describe, expect, it, vi } from 'vitest';

import { shareInviteLink } from '@/src/lib/share-invite';

const url = 'https://liff.line.me/abc/guardian/accept?token=t';

describe('shareInviteLink', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shares through the LINE target picker and does not fall back to copying', async () => {
    const shareTargetPicker = vi.fn().mockResolvedValue({ status: 'success' });
    const isApiAvailable = vi.fn().mockReturnValue(true);
    const getProfile = vi.fn().mockResolvedValue({ displayName: 'Amy' });
    const copyToClipboard = vi.fn();
    const buildMessage = vi.fn((name: string) => `${name}: ${url}`);

    await expect(shareInviteLink(url, buildMessage, {
      loadLiff: async () => ({ shareTargetPicker, isApiAvailable, getProfile }),
      copyToClipboard,
    })).resolves.toEqual({ status: 'shared' });

    expect(isApiAvailable).toHaveBeenCalledWith('shareTargetPicker');
    expect(buildMessage).toHaveBeenCalledWith('Amy');
    expect(shareTargetPicker).toHaveBeenCalledWith([{ type: 'text', text: `Amy: ${url}` }]);
    expect(copyToClipboard).not.toHaveBeenCalled();
  });

  it('reports cancellation without copying when the target picker closes without success', async () => {
    const shareTargetPicker = vi.fn().mockResolvedValue(undefined);
    const copyToClipboard = vi.fn();

    await expect(shareInviteLink(url, () => 'msg', {
      loadLiff: async () => ({
        shareTargetPicker,
        isApiAvailable: () => true,
        getProfile: async () => ({ displayName: 'Amy' }),
      }),
      copyToClipboard,
    })).resolves.toEqual({ status: 'cancelled' });

    expect(copyToClipboard).not.toHaveBeenCalled();
  });

  it('copies the link when the target picker API is unavailable', async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);
    const shareTargetPicker = vi.fn();
    const getProfile = vi.fn();

    await expect(shareInviteLink(url, () => 'msg', {
      loadLiff: async () => ({
        shareTargetPicker,
        isApiAvailable: () => false,
        getProfile,
      }),
      copyToClipboard,
    })).resolves.toEqual({ status: 'copied', reason: 'unavailable' });

    expect(copyToClipboard).toHaveBeenCalledWith(url);
    expect(getProfile).not.toHaveBeenCalled();
    expect(shareTargetPicker).not.toHaveBeenCalled();
  });

  it('copies the link with a LINE error reason when the target picker rejects', async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(shareInviteLink(url, () => 'msg', {
      loadLiff: async () => ({
        shareTargetPicker: vi.fn().mockRejectedValue({
          code: '403',
          message: `Forbidden for ${url}`,
        }),
        isApiAvailable: () => true,
        getProfile: async () => ({ displayName: 'Amy' }),
      }),
      copyToClipboard,
    })).resolves.toEqual({ status: 'copied', reason: 'line_error' });

    expect(copyToClipboard).toHaveBeenCalledWith(url);
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(url);
    consoleError.mockRestore();
  });

  it('reports a clipboard error when LINE sharing and fallback copying both fail', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(shareInviteLink(url, () => 'msg', {
      loadLiff: async () => ({
        shareTargetPicker: vi.fn().mockRejectedValue(new Error('LINE unavailable')),
        isApiAvailable: () => true,
        getProfile: async () => ({ displayName: 'Amy' }),
      }),
      copyToClipboard: vi.fn().mockRejectedValue(new Error('Clipboard denied')),
    })).resolves.toEqual({ status: 'failed', reason: 'clipboard_error' });

    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(url);
    consoleError.mockRestore();
  });

  it('still shares when the profile lookup fails, using an empty inviter name', async () => {
    const shareTargetPicker = vi.fn().mockResolvedValue({ status: 'success' });
    const getProfile = vi.fn().mockRejectedValue(new Error('no profile scope'));
    const buildMessage = vi.fn((name: string) => `[${name}]`);
    const copyToClipboard = vi.fn();

    await expect(shareInviteLink(url, buildMessage, {
      loadLiff: async () => ({ shareTargetPicker, isApiAvailable: () => true, getProfile }),
      copyToClipboard,
    })).resolves.toEqual({ status: 'shared' });

    expect(buildMessage).toHaveBeenCalledWith('');
    expect(copyToClipboard).not.toHaveBeenCalled();
  });
});
