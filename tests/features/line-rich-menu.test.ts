import { describe, expect, it } from 'vitest';

import { buildRichMenuPayload, buildRichMenuSvg, RICH_MENU_NAME, RICH_MENU_SIZE } from '@/src/features/line/rich-menu';

describe('buildRichMenuPayload', () => {
  it('declares a 2500x1686 default menu named hikesafe-main', () => {
    const payload = buildRichMenuPayload('liff-id') as {
      size: { width: number; height: number };
      selected: boolean;
      name: string;
      chatBarText: string;
    };

    expect(payload.size).toEqual({ width: 2500, height: 1686 });
    expect(payload.selected).toBe(true);
    expect(payload.name).toBe(RICH_MENU_NAME);
    expect(Array.from(payload.chatBarText).length).toBeLessThanOrEqual(14);
  });

  it('lays out six cells in two columns and three rows without gaps or overlap', () => {
    const { areas } = buildRichMenuPayload('liff-id') as {
      areas: Array<{ bounds: { x: number; y: number; width: number; height: number } }>;
    };

    expect(areas).toHaveLength(6);
    expect(areas.map(({ bounds }) => [bounds.x, bounds.y])).toEqual([
      [0, 0], [1250, 0],
      [0, 562], [1250, 562],
      [0, 1124], [1250, 1124],
    ]);
    for (const { bounds } of areas) {
      expect(bounds.width).toBe(1250);
      expect(bounds.height).toBe(562);
    }
    const covered = areas.reduce((total, { bounds }) => total + bounds.width * bounds.height, 0);
    expect(covered).toBe(RICH_MENU_SIZE.width * RICH_MENU_SIZE.height);
  });

  it('wires each cell to its LIFF page or chat command', () => {
    const { areas } = buildRichMenuPayload('liff-id') as {
      areas: Array<{ action: Record<string, string> }>;
    };

    expect(areas.map(({ action }) => action)).toEqual([
      { type: 'uri', label: '建立行程', uri: 'https://liff.line.me/liff-id/trips/new' },
      { type: 'uri', label: '進行中行程', uri: 'https://liff.line.me/liff-id/trips/active' },
      { type: 'message', label: '回報平安', text: '回報' },
      { type: 'uri', label: '我的留守人', uri: 'https://liff.line.me/liff-id/guardians' },
      { type: 'message', label: '需要協助', text: '需要協助' },
      { type: 'message', label: '使用說明', text: '說明' },
    ]);
  });

  it('keeps every action label within the 20 character limit', () => {
    const { areas } = buildRichMenuPayload('liff-id') as { areas: Array<{ action: Record<string, string> }> };
    for (const { action } of areas) expect(Array.from(action.label).length).toBeLessThanOrEqual(20);
  });
});

describe('buildRichMenuSvg', () => {
  it('renders a 2500x1686 canvas carrying every cell label', () => {
    const svg = buildRichMenuSvg();

    expect(svg).toContain('width="2500"');
    expect(svg).toContain('height="1686"');
    for (const label of ['建立行程', '進行中行程', '回報平安', '我的留守人', '需要協助', '使用說明']) {
      expect(svg).toContain(label);
    }
  });

  it('uses the Phase 1 palette and marks the help cell as dangerous', () => {
    const svg = buildRichMenuSvg();

    expect(svg).toContain('#06C755');
    expect(svg).toContain('#F7F8FA');
    expect(svg).toContain('#D93025');
  });
});
