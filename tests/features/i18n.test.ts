import { expect, it } from 'vitest';

import { bilingual, copy } from '@/src/features/i18n/copy';

it('keeps Traditional Chinese first and English second', () => {
  expect(bilingual('平安回報', 'Safe check-in')).toBe('平安回報\nSafe check-in');
});

it('keeps dynamic system values unchanged on both language lines', () => {
  expect(copy.routeLoadError()).toBe(
    '目前沒有可用的已啟用路線版本。正式路線目錄尚未通過安全驗證時，無法建立行程。\nNo enabled route version is available. A trip cannot be created until the official route catalog passes safety verification.',
  );
  expect(copy.authenticationError('管理留守綁定', 'managing guardian bindings')).toBe(
    '請先完成 LINE 登入，才能管理留守綁定。\nComplete LINE login before managing guardian bindings.',
  );
  expect(copy.checkInSuccess()).toBe('回報已成功送出\nCheck-in sent successfully');
  expect(copy.helpConfirmation('留守人', 'guardians')).toBe(
    '求助通知已建立並送往留守人。\nA help notification was created and sent to guardians.',
  );
  expect(copy.unavailableLocation('GPS', 'GPS')).toBe('未取得 GPS\nGPS unavailable');
  expect(copy.viewerTeam(['阿山'])).toBe('隊伍：阿山\nTeam: 阿山');
  expect(copy.reportRoute('玉山主峰線')).toBe('路線：玉山主峰線\nRoute: 玉山主峰線');
});

it('preserves every line of dynamic list values verbatim', () => {
  const checkpoint = '第一段\n第二段\n第三段';

  expect(copy.guardianNames([checkpoint])).toBe(`${checkpoint}\n${checkpoint}`);
  expect(copy.viewerTeam([checkpoint])).toBe(`隊伍：${checkpoint}\nTeam: ${checkpoint}`);
  expect(copy.reportCheckpoints([checkpoint])).toBe(
    `檢查點：${checkpoint}\nCheckpoints: ${checkpoint}`,
  );
});

it('keeps the phase-1 action copy bilingual', () => {
  expect(copy.quickCheckInSafe).toBe('平安\nSafe');
  expect(copy.extendByMinutes(30)).toBe('+30 分鐘\n+30 minutes');
  expect(copy.finishAction).toBe('平安下山（結束行程）\nSafely down (finish trip)');
});

it('keeps the guardian invite copy bilingual', () => {
  expect(copy.inviteGuardian).toBe('邀請留守人\nInvite a guardian');
  expect(copy.copyInviteLink).toBe('複製邀請連結\nCopy invite link');
  expect(copy.acceptInviteTitle('阿山')).toBe(
    '阿山 邀請你擔任留守人\n阿山 invited you to be their guardian',
  );
  expect(copy.guardianBoundNotice('小美')).toBe(
    '小美 已成為你的留守人。\n小美 is now your guardian.',
  );
  expect(copy.alreadyGuardian('阿山')).toBe(
    '你已經是 阿山 的留守人。\nYou are already a guardian for 阿山.',
  );
});
