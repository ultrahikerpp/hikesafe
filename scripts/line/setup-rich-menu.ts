import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { getEnv } from '@/src/env';
import { buildRichMenuPayload, buildRichMenuSvg, RICH_MENU_NAME } from '@/src/features/line/rich-menu';

const OUTPUT_DIR = path.join(process.cwd(), 'scripts/line/out');

const api = async (url: string, init: RequestInit, token: string) => {
  const response = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${url} failed (${response.status}): ${await response.text()}`);
  }
  return response;
};

const removeExistingMenus = async (token: string) => {
  const response = await api('https://api.line.me/v2/bot/richmenu/list', { method: 'GET' }, token);
  const { richmenus } = await response.json() as { richmenus: Array<{ richMenuId: string; name: string }> };
  for (const menu of richmenus.filter(({ name }) => name === RICH_MENU_NAME)) {
    await api(`https://api.line.me/v2/bot/richmenu/${menu.richMenuId}`, { method: 'DELETE' }, token);
    console.info(`Deleted existing rich menu ${menu.richMenuId}`);
  }
};

const main = async () => {
  const dryRun = process.argv.includes('--dry-run');
  const env = getEnv();
  const payload = buildRichMenuPayload(env.NEXT_PUBLIC_LIFF_ID);
  const png = await sharp(Buffer.from(buildRichMenuSvg())).png().toBuffer();

  if (dryRun) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'rich-menu.png'), png);
    await writeFile(path.join(OUTPUT_DIR, 'rich-menu.json'), JSON.stringify(payload, null, 2));
    console.info(`Dry run complete. Review ${OUTPUT_DIR} before running without --dry-run.`);
    return;
  }

  const token = env.LINE_CHANNEL_ACCESS_TOKEN;
  await removeExistingMenus(token);

  const created = await api('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }, token);
  const { richMenuId } = await created.json() as { richMenuId: string };

  await api(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: { 'content-type': 'image/png' },
    body: new Uint8Array(png),
  }, token);

  await api(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, { method: 'POST' }, token);
  console.info(`Rich menu ${richMenuId} uploaded and set as default.`);
};

main().catch((error) => {
  console.error('Rich menu setup failed', error);
  process.exitCode = 1;
});
