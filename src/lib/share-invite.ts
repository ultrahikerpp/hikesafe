interface LiffLike {
  shareTargetPicker: (messages: Array<{ type: 'text'; text: string }>) => Promise<unknown>;
  getProfile: () => Promise<{ displayName: string }>;
}

export interface ShareInviteDeps {
  loadLiff?: () => Promise<LiffLike>;
  copyToClipboard?: (text: string) => Promise<void>;
}

export type ShareInviteResult = 'shared' | 'copied';

const defaultLoadLiff = async (): Promise<LiffLike> =>
  (await import('@line/liff')).default as unknown as LiffLike;

// Opens the LINE share sheet so the hiker can pick a guardian and send the invite in one
// step. When LINE sharing is not available (e.g. the page was opened in an external
// browser), it copies the link instead so the invite is never a dead end.
export const shareInviteLink = async (
  inviteUrl: string,
  buildMessage: (inviterName: string) => string,
  deps: ShareInviteDeps = {},
): Promise<ShareInviteResult> => {
  const copyToClipboard = deps.copyToClipboard ?? ((text) => navigator.clipboard.writeText(text));
  try {
    const liff = await (deps.loadLiff ?? defaultLoadLiff)();
    let inviterName = '';
    try {
      inviterName = (await liff.getProfile()).displayName;
    } catch {
      // The inviter name only personalises the message; sharing works without it.
    }
    await liff.shareTargetPicker([{ type: 'text', text: buildMessage(inviterName) }]);
    return 'shared';
  } catch {
    await copyToClipboard(inviteUrl);
    return 'copied';
  }
};
