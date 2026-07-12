import { readFile } from 'node:fs/promises';

import {
  analyzeRouteCatalog,
  importRouteCatalog,
} from '@/src/features/routes/import';

const readJson = async (path: string) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8')) as unknown;

const main = async () => {
  const [catalog, sources] = await Promise.all([
    readJson('../data/routes/catalog.json'),
    readJson('../data/routes/sources.json'),
  ]);
  const report = analyzeRouteCatalog(catalog, sources);
  if (!report.valid) {
    throw new Error(
      `Route catalog rejected before import:\n${report.errors.join('\n')}`,
    );
  }

  if (!Array.isArray(catalog)) throw new Error('Route catalog must be an array');
  await importRouteCatalog(catalog);
  console.log(`Imported routes: ${catalog.length}`);
};

void main();
