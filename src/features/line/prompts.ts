import { bilingual } from '@/src/features/i18n/copy';
import type { LineMessage, LineQuickReplyAction } from '@/src/features/line/messages';

export interface LineTripChoice {
  id: string;
  routeName: string;
}

export type TripChooserIntent = 'select' | 'extend' | 'finish' | 'help';

const postback = (label: string, data: string): LineQuickReplyAction => ({ type: 'postback', label, data });
const conciseLabel = (label: string) => Array.from(label).slice(0, 20).join('');

const sendLocationLabel = bilingual('📍 傳送位置', 'Send location');
const cancelLabel = bilingual('取消', 'Cancel');

const chooserText: Record<TripChooserIntent, string> = {
  select: bilingual('請選擇要回報的行程', 'Choose a trip to check in'),
  extend: bilingual('請選擇要延長的行程', 'Choose a trip to extend'),
  finish: bilingual('請選擇要結束的行程', 'Choose a trip to finish'),
  help: bilingual('請選擇需要協助的行程', 'Choose a trip that needs help'),
};

const tooManyTrips = bilingual(
  '行程數量超過 LINE 可顯示的選項，請開啟 HikeSafe 網頁選擇行程。',
  'There are too many trips to show in LINE. Open HikeSafe on the web to choose a trip.',
);

const usageGuide = bilingual(
  [
    'HikeSafe 使用說明',
    '・建立行程：點選單「建立行程」',
    '・開始行程：建立後點摘要卡的「開始行程」，再傳送目前位置',
    '・回報平安：輸入「回報」，或直接傳送位置',
    '・延長下山時間：輸入「延長」',
    '・平安下山：輸入「平安下山」',
    '・需要協助：輸入「需要協助」',
    '・留守人：點選單「我的留守人」邀請或撤銷',
  ].join('\n'),
  [
    'HikeSafe usage',
    '- Create a trip: tap "Create trip" in the menu',
    '- Start a trip: tap "Start trip" on the summary card, then send your location',
    '- Check in: type "回報", or just send your location',
    '- Extend the planned finish: type "延長"',
    '- Finish safely: type "平安下山"',
    '- Need help: type "需要協助"',
    '- Guardians: tap "My guardians" in the menu to invite or revoke',
  ].join('\n'),
);

export const buildCheckInPrompt = ({ tripId, includeLocation }: { tripId: string; includeLocation: boolean }): LineMessage => ({
  type: 'text',
  text: bilingual('請選擇回報內容', 'Choose a check-in'),
  quickReply: {
    items: [
      ...(includeLocation ? [{ type: 'action' as const, action: { type: 'location' as const, label: sendLocationLabel } }] : []),
      { type: 'action', action: postback(bilingual('✅ 平安', 'Safe'), `hikesafe:check-in:${tripId}:safe`) },
      { type: 'action', action: postback(bilingual('🏠 已到山屋', 'At shelter'), `hikesafe:check-in:${tripId}:shelter`) },
    ],
  },
});

export const buildTripChooser = (trips: LineTripChoice[], intent: TripChooserIntent = 'select'): LineMessage => {
  if (trips.length > 13) return { type: 'text', text: tooManyTrips };
  return {
    type: 'text',
    text: chooserText[intent],
    quickReply: {
      items: trips.map((trip) => ({
        type: 'action',
        action: postback(conciseLabel(trip.routeName), `hikesafe:trip:${trip.id}:${intent}`),
      })),
    },
  };
};

export const buildHelpConfirmation = (tripId: string): LineMessage => ({
  type: 'text',
  text: bilingual('需要協助？確認後會通知留守人。', 'Need help? Confirm to notify guardians.'),
  quickReply: {
    items: [
      { type: 'action', action: postback(bilingual('確認求助', 'Confirm'), `hikesafe:help:${tripId}:confirm`) },
      { type: 'action', action: postback(cancelLabel, `hikesafe:help:${tripId}:cancel`) },
    ],
  },
});

export const buildExtendPrompt = (tripId: string): LineMessage => ({
  type: 'text',
  text: bilingual('要延長多久？時間會加在原本的預計下山時間上。', 'How long to extend? The time is added to the current planned finish.'),
  quickReply: {
    items: [30, 60, 120].map((minutes) => ({
      type: 'action',
      action: postback(bilingual(`+${minutes} 分`, `+${minutes} min`), `hikesafe:extend:${tripId}:${minutes}`),
    })),
  },
});

export const buildFinishConfirmation = (tripId: string): LineMessage => ({
  type: 'text',
  text: bilingual('確認全隊已安全下山？確認後會通知留守人。', 'Confirm everyone is safely down? Guardians will be notified.'),
  quickReply: {
    items: [
      { type: 'action', action: postback(bilingual('確認下山', 'Confirm'), `hikesafe:finish:${tripId}:confirm`) },
      { type: 'action', action: postback(cancelLabel, `hikesafe:finish:${tripId}:cancel`) },
    ],
  },
});

export const buildStartLocationPrompt = (): LineMessage => ({
  type: 'text',
  text: bilingual('請傳送目前位置以開始行程。', 'Send your current location to start the trip.'),
  quickReply: {
    items: [{ type: 'action', action: { type: 'location', label: sendLocationLabel } }],
  },
});

export const buildUsageReply = (): LineMessage => ({ type: 'text', text: usageGuide });
