import { describe, expect, it } from 'vitest';

import {
  buildCheckInPrompt,
  buildExtendPrompt,
  buildFinishConfirmation,
  buildHelpConfirmation,
  buildStartLocationPrompt,
  buildTripChooser,
  buildUsageReply,
} from '@/src/features/line/prompts';

const labelsWithin20 = (message: { quickReply?: { items: Array<{ action: { label: string } }> } }) =>
  message.quickReply?.items.every(({ action }) => Array.from(action.label).length <= 20) ?? true;

describe('line prompts', () => {
  it('builds a bilingual check-in prompt with concise typed Quick Reply actions', () => {
    const prompt = buildCheckInPrompt({ tripId: 'trip-1', includeLocation: true });

    expect(prompt).toMatchObject({
      type: 'text',
      text: expect.stringMatching(/\n/),
      quickReply: {
        items: expect.arrayContaining([
          { type: 'action', action: { type: 'location', label: '📍 傳送位置\nSend location' } },
          { type: 'action', action: { type: 'postback', label: '✅ 平安\nSafe', data: 'hikesafe:check-in:trip-1:safe' } },
          { type: 'action', action: { type: 'postback', label: '🏠 已到山屋\nAt shelter', data: 'hikesafe:check-in:trip-1:shelter' } },
        ]),
      },
    });
    expect(labelsWithin20(prompt)).toBe(true);
    expect(buildCheckInPrompt({ tripId: 'trip-1', includeLocation: false }).quickReply?.items
      .some(({ action }) => action.type === 'location')).toBe(false);
  });

  it('defaults the trip chooser to the check-in intent', () => {
    const chooser = buildTripChooser([
      { id: 'trip-1', routeName: '玉山主峰線' },
      { id: 'trip-2', routeName: '雪山東峰線' },
    ]);

    expect(chooser.text).toMatch(/\n/);
    expect(chooser.quickReply?.items).toEqual([
      { type: 'action', action: { type: 'postback', label: '玉山主峰線', data: 'hikesafe:trip:trip-1:select' } },
      { type: 'action', action: { type: 'postback', label: '雪山東峰線', data: 'hikesafe:trip:trip-2:select' } },
    ]);
    expect(chooser.quickReply?.items.some(({ action }) => action.type === 'location')).toBe(false);
    expect(labelsWithin20(chooser)).toBe(true);
  });

  it('carries the requested intent into every chooser postback', () => {
    for (const intent of ['extend', 'finish', 'help'] as const) {
      const chooser = buildTripChooser([{ id: 'trip-1', routeName: '玉山主峰線' }], intent);
      expect(chooser.quickReply?.items).toEqual([
        { type: 'action', action: { type: 'postback', label: '玉山主峰線', data: `hikesafe:trip:trip-1:${intent}` } },
      ]);
    }
  });

  it('gives each chooser intent its own bilingual prompt text', () => {
    const texts = (['select', 'extend', 'finish', 'help'] as const)
      .map((intent) => buildTripChooser([{ id: 'trip-1', routeName: '玉山主峰線' }], intent).text);

    expect(new Set(texts).size).toBe(4);
    for (const text of texts) expect(text).toMatch(/\n/);
  });

  it('uses a bilingual text-only web fallback for 14 active trips', () => {
    const chooser = buildTripChooser(Array.from({ length: 14 }, (_, index) => ({
      id: `trip-${index + 1}`,
      routeName: `行程 ${index + 1}`,
    })));

    expect(chooser.type).toBe('text');
    expect(chooser.text).toMatch(/請開啟 HikeSafe 網頁.*\n.*Open HikeSafe on the web/s);
    expect(chooser.quickReply).toBeUndefined();
  });

  it('builds a bilingual help confirmation with explicit confirm and cancel actions', () => {
    const confirmation = buildHelpConfirmation('trip-1');

    expect(confirmation).toMatchObject({
      type: 'text',
      text: expect.stringMatching(/\n/),
      quickReply: {
        items: [
          { type: 'action', action: { type: 'postback', label: '確認求助\nConfirm', data: 'hikesafe:help:trip-1:confirm' } },
          { type: 'action', action: { type: 'postback', label: '取消\nCancel', data: 'hikesafe:help:trip-1:cancel' } },
        ],
      },
    });
  });

  it('offers exactly the three supported extension lengths', () => {
    const prompt = buildExtendPrompt('trip-1');

    expect(prompt.text).toMatch(/\n/);
    expect(prompt.quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined)).toEqual([
      'hikesafe:extend:trip-1:30',
      'hikesafe:extend:trip-1:60',
      'hikesafe:extend:trip-1:120',
    ]);
    expect(labelsWithin20(prompt)).toBe(true);
  });

  it('builds a bilingual finish confirmation with confirm and cancel actions', () => {
    const confirmation = buildFinishConfirmation('trip-1');

    expect(confirmation.text).toMatch(/\n/);
    expect(confirmation.quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined)).toEqual([
      'hikesafe:finish:trip-1:confirm',
      'hikesafe:finish:trip-1:cancel',
    ]);
    expect(labelsWithin20(confirmation)).toBe(true);
  });

  it('asks for a location with only a location action when starting a trip', () => {
    const prompt = buildStartLocationPrompt();

    expect(prompt.text).toMatch(/\n/);
    expect(prompt.quickReply?.items).toEqual([
      { type: 'action', action: { type: 'location', label: '📍 傳送位置\nSend location' } },
    ]);
  });

  it('lists every supported chat command in the usage reply', () => {
    const usage = buildUsageReply();

    expect(usage.type).toBe('text');
    for (const command of ['回報', '延長', '平安下山', '需要協助', '說明']) {
      expect(usage.text).toContain(command);
    }
    expect(usage.text).toMatch(/\n/);
  });
});
