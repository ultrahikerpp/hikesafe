import type { AlertStage } from '@/src/features/alerts/domain';

export interface AlertMessageTrip {
  id: string;
  routeName: string;
  plannedFinishAt: Date;
  team: string[];
  lastCheckInAt: Date | null;
  lastLocationStatus: 'available' | 'unavailable' | 'redacted';
  viewerGrantUrl?: string;
  reportText?: string;
  leaderPhone?: string;
}

export type LineMessage =
  | { type: 'text'; text: string }
  | { type: 'flex'; altText: string; contents: Record<string, unknown> };

const formatTime = (value: Date | null) => value
  ? `${value.toISOString().slice(0, 16).replace('T', ' ')} UTC`
  : '尚無回報';

const locationText = (status: AlertMessageTrip['lastLocationStatus']) => ({
  available: '最後位置：可用',
  unavailable: '最後位置：無法取得',
  redacted: '最後位置：已隱藏',
}[status]);

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
  if (stage === 'due') {
    return {
      type: 'text',
      text: `BeSafe 提醒：${trip.routeName} 預計下山時間是 ${formatTime(trip.plannedFinishAt)}，請回報目前進度或延長下山時間。`,
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
    locationText(trip.lastLocationStatus),
    `通報摘要：${trip.reportText ?? '請整理隊伍與路線資訊後通報。'}`,
    '系統尚未自動聯絡 119，請由留守人員依現況判斷是否通報。',
    ...(!trip.viewerGrantUrl ? ['請透過 LINE 聯絡已綁定的個別留守人員取得行程資訊。'] : []),
  ], [
    ...(trip.viewerGrantUrl ? [{ label: '查看行程', uri: trip.viewerGrantUrl }] : []),
    { label: '複製通報摘要', clipboardText: trip.reportText ?? '' },
    { label: '撥打 119', uri: 'tel:119' },
  ]);
};
