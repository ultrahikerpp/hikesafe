import type { AlertStage } from '@/src/features/alerts/domain';
import { bilingual } from '@/src/features/i18n/copy';

export interface AlertMessageTrip {
  id: string;
  routeName: string;
  plannedFinishAt: Date;
  team: string[];
  lastCheckInAt: Date | null;
  lastLocationStatus: 'available' | 'unavailable' | 'redacted';
  lastLocationAccuracyMeters: number | null;
  lastLocationSource: 'gps' | 'network' | 'line' | null;
  viewerGrantUrl?: string;
  reportText?: string;
  leaderPhone?: string;
}

export type LineQuickReplyAction =
  | { type: 'postback'; label: string; data: string }
  | { type: 'location'; label: string };

export interface LineQuickReply {
  items: Array<{ type: 'action'; action: LineQuickReplyAction }>;
}

export type LineMessage =
  | { type: 'text'; text: string; quickReply?: LineQuickReply }
  | { type: 'flex'; altText: string; contents: Record<string, unknown> };

export interface LineTripChoice {
  id: string;
  routeName: string;
}

const formatTime = (value: Date | null) => {
  if (!value) return '尚無回報';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')} Asia/Taipei`;
};

const locationText = (status: AlertMessageTrip['lastLocationStatus']) => ({
  available: '最後位置：可用',
  unavailable: '最後位置：無法取得',
  redacted: '最後位置：已隱藏',
}[status]);

const locationDetails = (trip: AlertMessageTrip) => [
  locationText(trip.lastLocationStatus),
  ...(trip.lastLocationSource === 'line' && trip.lastLocationAccuracyMeters === null
    ? [bilingual('位置精度：LINE 未提供', 'Location accuracy: Not provided by LINE')]
    : []),
];

const postback = (label: string, data: string): LineQuickReplyAction => ({ type: 'postback', label, data });
const conciseLabel = (label: string) => Array.from(label).slice(0, 20).join('');

export const buildCheckInPrompt = ({ tripId, includeLocation }: { tripId: string; includeLocation: boolean }): LineMessage => ({
  type: 'text',
  text: bilingual('請選擇回報內容', 'Choose a check-in'),
  quickReply: {
    items: [
      ...(includeLocation ? [{ type: 'action' as const, action: { type: 'location' as const, label: '傳送位置' } }] : []),
      { type: 'action', action: postback('平安', `hikesafe:check-in:${tripId}:safe`) },
      { type: 'action', action: postback('到避難處', `hikesafe:check-in:${tripId}:shelter`) },
    ],
  },
});

export const buildTripChooser = (trips: LineTripChoice[]): LineMessage => ({
  type: 'text',
  text: bilingual('請選擇要回報的行程', 'Choose a trip to check in'),
  quickReply: {
    items: trips.map((trip) => ({ type: 'action', action: postback(conciseLabel(trip.routeName), `hikesafe:trip:${trip.id}:select`) })),
  },
});

export const buildHelpConfirmation = (tripId: string): LineMessage => ({
  type: 'text',
  text: bilingual('需要協助？確認後會通知留守人。', 'Need help? Confirm to notify guardians.'),
  quickReply: {
    items: [
      { type: 'action', action: postback('確認求助', `hikesafe:help:${tripId}:confirm`) },
      { type: 'action', action: postback('取消', `hikesafe:help:${tripId}:cancel`) },
    ],
  },
});

const card = (
  color: string,
  title: string,
  trip: AlertMessageTrip,
  body: string[],
  actions: Array<{ label: string; uri: string } | { label: string; clipboardText: string }>,
): LineMessage => ({
  type: 'flex',
  altText: title,
  contents: {
    type: 'bubble',
    styles: { header: { backgroundColor: color } },
    header: {
      type: 'box', layout: 'vertical', contents: [{ type: 'text', text: title, color: '#FFFFFF', weight: 'bold' }],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'text', text: trip.routeName, weight: 'bold', wrap: true },
        { type: 'text', text: `預計下山：${formatTime(trip.plannedFinishAt)}`, wrap: true },
        { type: 'text', text: `隊伍：${trip.team.join('、') || '未提供'}`, wrap: true },
        { type: 'text', text: `最後回報：${formatTime(trip.lastCheckInAt)}`, wrap: true },
        ...body.map((text) => ({ type: 'text', text, wrap: true, size: 'sm' })),
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: actions.map((action) => ({
        type: 'button', style: 'link', action: 'uri' in action
          ? { type: 'uri', label: action.label, uri: action.uri }
          : { type: 'clipboard', label: action.label, clipboardText: action.clipboardText },
      })),
    },
  },
});

export const buildLineMessage = (stage: AlertStage, trip: AlertMessageTrip): LineMessage => {
  if (stage === 'started') {
    return card('#2E8B57', '已啟程：HikeSafe 留守通知', trip, [
      '隊伍已在登山口啟程；此通知不代表持續 GPS 追蹤。',
    ], []);
  }
  if (stage === 'extended') {
    return card('#2F80ED', '下山時間已調整', trip, [
      '新的預計下山時間已更新，後續逾時提醒會依此時間計算。',
    ], []);
  }
  if (stage === 'help') {
    return card('#D64545', '需要協助：請立即聯絡隊員', trip, [...locationDetails(trip), '此訊息不代表 HikeSafe 已代為通報 119。'], [
      ...(trip.viewerGrantUrl ? [{ label: '查看行程', uri: trip.viewerGrantUrl }] : []),
      { label: '複製通報摘要', clipboardText: trip.reportText ?? '' }, { label: '撥打 119', uri: 'tel:119' },
    ]);
  }
  if (stage === 'finished') {
    return card('#2E8B57', '已安全下山', trip, [...locationDetails(trip), '行程已結束，未送出的逾時警示已取消。'], []);
  }
  if (stage === 'due') {
    return {
      type: 'text',
      text: `HikeSafe 提醒：${trip.routeName} 預計下山時間是 ${formatTime(trip.plannedFinishAt)}，請回報目前進度或延長下山時間。`,
    };
  }
  if (stage === 'overdue_60') {
    const phone = trip.leaderPhone?.trim();
    return card('#F5C542', '已逾時 60 分鐘：請協助確認', trip, [
      '未回報不代表遇險，也可能是無訊號。請先聯絡隊員確認狀況。',
      ...(phone ? [] : ['目前沒有可撥號的領隊聯絡資料。']),
      ...(!trip.viewerGrantUrl ? ['請透過 LINE 聯絡已綁定的留守人員。'] : []),
    ], phone
      ? [{ label: '聯絡隊員', uri: `tel:${phone}` }]
      : trip.viewerGrantUrl ? [{ label: '查看行程', uri: trip.viewerGrantUrl }] : []);
  }
  return card('#D64545', '已逾時 120 分鐘：請評估通報', trip, [
    ...locationDetails(trip),
    `通報摘要：${trip.reportText ?? '請整理隊伍與路線資訊後通報。'}`,
    '系統尚未自動聯絡 119，請由留守人員依現況判斷是否通報。',
    ...(!trip.viewerGrantUrl ? ['請透過 LINE 聯絡已綁定的個別留守人員取得行程資訊。'] : []),
  ], [
    ...(trip.viewerGrantUrl ? [{ label: '查看行程', uri: trip.viewerGrantUrl }] : []),
    { label: '複製通報摘要', clipboardText: trip.reportText ?? '' },
    { label: '撥打 119', uri: 'tel:119' },
  ]);
};
