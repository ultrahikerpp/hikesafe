interface LiffLike {
  shareTargetPicker: (
    messages: Array<{ type: 'text'; text: string }>,
  ) => Promise<{ status?: string } | undefined>;
  isApiAvailable: (apiName: 'shareTargetPicker') => boolean;
  getProfile: () => Promise<{ displayName: string }>;
}

export interface ShareInviteDeps {
  loadLiff?: () => Promise<LiffLike>;
  copyToClipboard?: (text: string) => Promise<void>;
}

export type ShareInviteResult =
  | { status: 'shared' }
  | { status: 'cancelled' }
  | { status: 'copied'; reason: 'unavailable' | 'line_error' }
  | { status: 'failed'; reason: 'clipboard_error' };

const defaultLoadLiff = async (): Promise<LiffLike> =>
  (await import('@line/liff')).default as unknown as LiffLike;

const redactMessage = (message: string, inviteUrl: string) =>
  message.replaceAll(inviteUrl, '[redacted]').replace(/https?:\/\/\S+/g, '[redacted]');

const errorDetails = (error: unknown, inviteUrl: string) => {
  if (!error || typeof error !== 'object') {
    return { message: redactMessage(String(error), inviteUrl) };
  }
  const value = error as { code?: unknown; message?: unknown };
  return {
    ...(typeof value.code === 'string' ? { code: value.code } : {}),
    message: typeof value.message === 'string'
      ? redactMessage(value.message, inviteUrl)
      : 'Unknown error',
  };
};

const copyFallback = async (
  inviteUrl: string,
  reason: 'unavailable' | 'line_error',
  copyToClipboard: (text: string) => Promise<void>,
): Promise<ShareInviteResult> => {
  try {
    await copyToClipboard(inviteUrl);
    return { status: 'copied', reason };
  } catch (error) {
    console.error('Guardian invite fallback copy failed', {
      stage: 'clipboard',
      ...errorDetails(error, inviteUrl),
    });
    return { status: 'failed', reason: 'clipboard_error' };
  }
};

export const shareInviteLink = async (
  inviteUrl: string,
  buildMessage: (inviterName: string) => string,
  deps: ShareInviteDeps = {},
): Promise<ShareInviteResult> => {
  const copyToClipboard = deps.copyToClipboard ?? ((text) => navigator.clipboard.writeText(text));

  let liff: LiffLike;
  try {
    liff = await (deps.loadLiff ?? defaultLoadLiff)();
  } catch (error) {
    console.error('Guardian invite LINE SDK unavailable', {
      stage: 'loadLiff',
      ...errorDetails(error, inviteUrl),
    });
    return copyFallback(inviteUrl, 'unavailable', copyToClipboard);
  }

  if (!liff.isApiAvailable('shareTargetPicker')) {
    return copyFallback(inviteUrl, 'unavailable', copyToClipboard);
  }

  let inviterName = '';
  try {
    inviterName = (await liff.getProfile()).displayName;
  } catch {
    // The inviter name only personalises the message; sharing works without it.
  }

  try {
    const result = await liff.shareTargetPicker([
      { type: 'text', text: buildMessage(inviterName) },
    ]);
    return result?.status === 'success' ? { status: 'shared' } : { status: 'cancelled' };
  } catch (error) {
    console.error('Guardian invite LINE share failed', {
      stage: 'shareTargetPicker',
      ...errorDetails(error, inviteUrl),
    });
    return copyFallback(inviteUrl, 'line_error', copyToClipboard);
  }
};
