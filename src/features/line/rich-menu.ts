export const RICH_MENU_NAME = 'hikesafe-main';
export const RICH_MENU_SIZE = { width: 2500, height: 1686 };

const COLUMN_WIDTH = 1250;
const ROW_HEIGHT = 562;

const PALETTE = {
  background: '#F7F8FA',
  card: '#FFFFFF',
  primary: '#06C755',
  danger: '#D93025',
  text: '#111827',
  muted: '#8B8F98',
};

interface Cell {
  label: string;
  caption: string;
  tone: 'primary' | 'danger' | 'muted';
  action: (liffId: string) => Record<string, string>;
}

const liffUri = (liffId: string, path: string) => `https://liff.line.me/${liffId}${path}`;

const cells: Cell[] = [
  { label: '建立行程', caption: 'Create trip', tone: 'primary', action: (liffId) => ({ type: 'uri', label: '建立行程', uri: liffUri(liffId, '/trips/new') }) },
  { label: '進行中行程', caption: 'Active trip', tone: 'primary', action: (liffId) => ({ type: 'uri', label: '進行中行程', uri: liffUri(liffId, '/trips/active') }) },
  { label: '回報平安', caption: 'Check in', tone: 'primary', action: () => ({ type: 'message', label: '回報平安', text: '回報' }) },
  { label: '我的留守人', caption: 'My guardians', tone: 'primary', action: (liffId) => ({ type: 'uri', label: '我的留守人', uri: liffUri(liffId, '/guardians') }) },
  { label: '需要協助', caption: 'Need help', tone: 'danger', action: () => ({ type: 'message', label: '需要協助', text: '需要協助' }) },
  { label: '使用說明', caption: 'Usage', tone: 'muted', action: () => ({ type: 'message', label: '使用說明', text: '說明' }) },
];

const boundsFor = (index: number) => ({
  x: (index % 2) * COLUMN_WIDTH,
  y: Math.floor(index / 2) * ROW_HEIGHT,
  width: COLUMN_WIDTH,
  height: ROW_HEIGHT,
});

export const buildRichMenuPayload = (liffId: string) => ({
  size: RICH_MENU_SIZE,
  selected: true,
  name: RICH_MENU_NAME,
  chatBarText: 'HikeSafe 選單',
  areas: cells.map((cell, index) => ({ bounds: boundsFor(index), action: cell.action(liffId) })),
});

const toneColor = (tone: Cell['tone']) =>
  tone === 'danger' ? PALETTE.danger : tone === 'muted' ? PALETTE.muted : PALETTE.primary;

const cellSvg = (cell: Cell, index: number) => {
  const { x, y } = boundsFor(index);
  const centerX = x + COLUMN_WIDTH / 2;
  return [
    `<rect x="${x + 8}" y="${y + 8}" width="${COLUMN_WIDTH - 16}" height="${ROW_HEIGHT - 16}" rx="24" fill="${PALETTE.card}"/>`,
    `<rect x="${x + 8}" y="${y + 8}" width="${COLUMN_WIDTH - 16}" height="10" rx="5" fill="${toneColor(cell.tone)}"/>`,
    `<text x="${centerX}" y="${y + ROW_HEIGHT / 2}" text-anchor="middle" font-size="104" font-weight="bold" fill="${PALETTE.text}">${cell.label}</text>`,
    `<text x="${centerX}" y="${y + ROW_HEIGHT / 2 + 84}" text-anchor="middle" font-size="52" fill="${PALETTE.muted}">${cell.caption}</text>`,
  ].join('');
};

export const buildRichMenuSvg = () => [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${RICH_MENU_SIZE.width}" height="${RICH_MENU_SIZE.height}" viewBox="0 0 ${RICH_MENU_SIZE.width} ${RICH_MENU_SIZE.height}">`,
  `<rect width="${RICH_MENU_SIZE.width}" height="${RICH_MENU_SIZE.height}" fill="${PALETTE.background}"/>`,
  ...cells.map(cellSvg),
  '</svg>',
].join('');
