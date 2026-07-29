import { copy } from '@/src/features/i18n/copy';
import type { ShareInviteResult } from '@/src/lib/share-invite';

export interface ShareInviteNotice {
  tone: 'warning' | 'error';
  text: string;
}

export const shareInviteNotice = (
  result: ShareInviteResult,
): ShareInviteNotice | undefined => {
  if (result.status === 'shared') return undefined;
  if (result.status === 'cancelled') {
    return { tone: 'warning', text: copy.shareCancelled };
  }
  if (result.status === 'failed') {
    return { tone: 'error', text: copy.shareAndCopyFailed };
  }
  return {
    tone: 'warning',
    text: result.reason === 'unavailable'
      ? copy.shareUnavailableCopied
      : copy.shareFailedCopied,
  };
};
