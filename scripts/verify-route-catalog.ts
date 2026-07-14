import { readFile } from 'node:fs/promises';

import { analyzeRouteCatalog } from '@/src/features/routes/import';

const readJson = async (path: string) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8')) as unknown;

const main = async () => {
  const [catalog, sources] = await Promise.all([
    readJson('../data/routes/catalog.json'),
    readJson('../data/routes/sources.json'),
  ]);
  const report = analyzeRouteCatalog(catalog, sources);

  console.log(report.valid ? 'Catalog valid' : 'Catalog invalid');
  console.log(`Hundred peaks: ${report.hundredPeaks}`);
  console.log(`Suburban routes: ${report.suburbanRoutes}`);
  console.log('Small hundred peaks: ' + report.smallHundredPeaks);
  console.log(`Missing sources: ${report.missingSources}`);
  console.log(`Duplicate slugs: ${report.duplicateSlugs}`);
  for (const error of report.errors) console.error(`- ${error}`);

  if (!report.valid) process.exitCode = 1;
};

void main();
