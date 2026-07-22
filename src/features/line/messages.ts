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

export const formatTime = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')} Asia/Taipei`;
};

const locationText = (status: AlertMessageTrip['lastLocationStatus']) => ({
  available: bilingual('最後位置：可用', 'Latest location: Available'),
  unavailable: bilingual('最後位置：無法取得', 'Latest location: Unavailable'),
  redacted: bilingual('最後位置：已隱藏', 'Latest location: Hidden'),
}[status]);

const lastCheckInText = (value: Date | null) => value
  ? bilingual(`最後回報：${formatTime(value)}`, `Last check-in: ${formatTime(value)}`)
  : bilingual('最後回報：尚無回報', 'Last check-in: No check-in yet');

const locationDetails = (trip: AlertMessageTrip) => [
  locationText(trip.lastLocationStatus),
  ...(trip.lastLocationSource === 'line' && trip.lastLocationAccuracyMeters === null
    ? [bilingual('位置精度：LINE 未提供', 'Location accuracy: Not provided by LINE')]
    : []),
];

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
        { type: 'text', text: bilingual(`預計下山：${formatTime(trip.plannedFinishAt)}`, `Planned finish: ${formatTime(trip.plannedFinishAt)}`), wrap: true },
        { type: 'text', text: bilingual(`隊伍：${trip.team.join('、') || '未提供'}`, `Team: ${trip.team.join(', ') || 'Not provided'}`), wrap: true },
        { type: 'text', text: lastCheckInText(trip.lastCheckInAt), wrap: true },
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
    return card('#2E8B57', bilingual('已啟程：HikeSafe 留守通知', 'Started: HikeSafe guardian notification'), trip, [
      bilingual('隊伍已在登山口啟程；此通知不代表持續 GPS 追蹤。', 'The team started at the trailhead; this notification does not indicate continuous GPS tracking.'),
    ], []);
  }
  if (stage === 'extended') {
    return card('#2F80ED', bilingual('下山時間已調整', 'Planned finish updated'), trip, [
      bilingual('新的預計下山時間已更新，後續逾時提醒會依此時間計算。', 'The planned finish has been updated; later overdue reminders use this time.'),
    ], []);
  }
  if (stage === 'help') {
    return card('#D64545', bilingual('需要協助：請立即聯絡隊員', 'Help needed: Contact the team now'), trip, [...locationDetails(trip), bilingual('此訊息不代表 HikeSafe 已代為通報 119。', 'This message does not mean HikeSafe has contacted 119 on your behalf.')], [
      ...(trip.viewerGrantUrl ? [{ label: bilingual('查看行程', 'View trip'), uri: trip.viewerGrantUrl }] : []),
      { label: bilingual('複製通報摘要', 'Copy report'), clipboardText: trip.reportText ?? '' }, { label: bilingual('撥打 119', 'Call 119'), uri: 'tel:119' },
    ]);
  }
  if (stage === 'finished') {
    return card('#2E8B57', bilingual('已安全下山', 'Safely down'), trip, [...locationDetails(trip), bilingual('行程已結束，未送出的逾時警示已取消。', 'The trip has ended and unsent overdue alerts were cancelled.')], []);
  }
  if (stage === 'due') {
    return {
      type: 'text',
      text: bilingual(
        `HikeSafe 提醒：${trip.routeName} 預計下山時間是 ${formatTime(trip.plannedFinishAt)}，請回報目前進度或延長下山時間。`,
        `HikeSafe reminder: ${trip.routeName}'s planned finish is ${formatTime(trip.plannedFinishAt)}. Send a check-in or extend the planned finish.`,
      ),
    };
  }
  if (stage === 'overdue_60') {
    const phone = trip.leaderPhone?.trim();
    return card('#F5C542', bilingual('已逾時 60 分鐘：請協助確認', '60 minutes overdue: Please check'), trip, [
      bilingual('未回報不代表遇險，也可能是無訊號。請先聯絡隊員確認狀況。', 'A missing check-in does not mean an emergency; there may be no signal. Contact the team first.'),
      ...(phone ? [] : [bilingual('目前沒有可撥號的領隊聯絡資料。', 'No leader contact number is available to call.')]),
      ...(!trip.viewerGrantUrl ? [bilingual('請透過 LINE 聯絡已綁定的留守人員。', 'Contact a bound guardian through LINE.')] : []),
    ], phone
      ? [{ label: bilingual('聯絡隊員', 'Contact member'), uri: `tel:${phone}` }]
      : trip.viewerGrantUrl ? [{ label: bilingual('查看行程', 'View trip'), uri: trip.viewerGrantUrl }] : []);
  }
  return card('#D64545', bilingual('已逾時 120 分鐘：請評估通報', '120 minutes overdue: Assess whether to report'), trip, [
    ...locationDetails(trip),
    ...(trip.reportText
      ? [bilingual('通報摘要：', 'Report summary:'), trip.reportText]
      : [bilingual('通報摘要：請整理隊伍與路線資訊後通報。', 'Report summary: Gather team and route information before reporting.')]),
    bilingual('系統尚未自動聯絡 119，請由留守人員依現況判斷是否通報。', 'HikeSafe has not contacted 119 automatically. Guardians should decide whether to report based on the situation.'),
    ...(!trip.viewerGrantUrl ? [bilingual('請透過 LINE 聯絡已綁定的個別留守人員取得行程資訊。', 'Contact an individually bound guardian through LINE for trip information.')] : []),
  ], [
    ...(trip.viewerGrantUrl ? [{ label: bilingual('查看行程', 'View trip'), uri: trip.viewerGrantUrl }] : []),
    { label: bilingual('複製通報摘要', 'Copy report'), clipboardText: trip.reportText ?? '' },
    { label: bilingual('撥打 119', 'Call 119'), uri: 'tel:119' },
  ]);
};
