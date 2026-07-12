import { readFile } from 'node:fs/promises';

import { importRouteCatalog } from '@/src/features/routes/import';

const main = async () => {
  const catalog = JSON.parse(
    await readFile(new URL('../data/routes/catalog.json', import.meta.url), 'utf8'),
  ) as unknown;

  if (!Array.isArray(catalog)) throw new Error('Route catalog must be an array');

  await importRouteCatalog(catalog);
  console.log(`Imported routes: ${catalog.length}`);
};

void main();
