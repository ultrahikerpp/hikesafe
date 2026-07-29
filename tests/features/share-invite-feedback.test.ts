import { describe, expect, it } from 'vitest';

import { copy } from '@/src/features/i18n/copy';
import { shareInviteNotice } from '@/src/lib/share-invite-feedback';

describe('shareInviteNotice', () => {
  it('clears feedback after a successful share', () => {
    expect(shareInviteNotice({ status: 'shared' })).toBeUndefined();
  });

  it('maps each non-success result to a specific notice', () => {
    expect(shareInviteNotice({ status: 'cancelled' })).toEqual({
      tone: 'warning',
      text: copy.shareCancelled,
    });
    expect(shareInviteNotice({ status: 'copied', reason: 'unavailable' })).toEqual({
      tone: 'warning',
      text: copy.shareUnavailableCopied,
    });
    expect(shareInviteNotice({ status: 'copied', reason: 'line_error' })).toEqual({
      tone: 'warning',
      text: copy.shareFailedCopied,
    });
    expect(shareInviteNotice({ status: 'failed', reason: 'clipboard_error' })).toEqual({
      tone: 'error',
      text: copy.shareAndCopyFailed,
    });
  });
});
