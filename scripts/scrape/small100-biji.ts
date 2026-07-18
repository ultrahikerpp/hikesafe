import { readFile } from 'node:fs/promises';

import {
  extractById,
  fetchText,
  mergeManifestEntry,
  readExistingManifest,
  writeManifest,
  writeRawBundle,
} from './lib';

type SmallHundredPeak = { number: number; mountainName: string };

const mountainNameAliases: Record<string, string> = {
  土庫丘: '土庫岳',
};

const normalizeMountainName = (name: string) =>
  name.normalize('NFKC').replace(/主峰|山塊|山系/g, '');

const listEntryPattern =
  /href="\/index\.php\?q=mountain&act=famous-detail&category=2&id=(\d+)"[^>]*title="([^"]*)"/g;

const trailItemPattern =
  /<li class="panel_item[\s\S]*?data-id="(\d+)"[\s\S]*?<\/li>\s*(?=<li class="panel_item|<\/ul>)/g;

const fetchBijiMountainList = async () => {
  const entries: Array<{ id: number; title: string }> = [];
  for (let page = 1; page <= 8; page += 1) {
    const html = await fetchText(
      `https://hiking.biji.co/index.php?q=mountain&act=famous-list&id=2&page=${page}`,
    );
    let match: RegExpExecArray | null;
    listEntryPattern.lastIndex = 0;
    let found = 0;
    while ((match = listEntryPattern.exec(html))) {
      entries.push({ id: Number(match[1]), title: match[2] });
      found += 1;
    }
    if (found === 0) break;
  }
  return entries;
};

const matchMountainId = (
  peakName: string,
  entries: Array<{ id: number; title: string }>,
) => {
  const alias = mountainNameAliases[peakName] ?? peakName;
  const normalizedPeak = normalizeMountainName(alias);
  return entries.find((entry) => {
    const normalizedTitle = normalizeMountainName(entry.title);
    return (
      normalizedTitle === normalizedPeak ||
      normalizedTitle.includes(normalizedPeak) ||
      normalizedPeak.includes(normalizedTitle)
    );
  });
};

const extractTrailSummaries = (html: string) => {
  const trails: Array<{
    trailId: number;
    name: string | null;
    difficultyText: string | null;
    distanceText: string | null;
    durationText: string | null;
  }> = [];
  trailItemPattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = trailItemPattern.exec(html))) {
    const block = match[0];
    trails.push({
      trailId: Number(match[1]),
      name: /<strong class="text-lg">([^<]*)<\/strong>/.exec(block)?.[1] ?? null,
      difficultyText: /<li>([^<]*難度)<\/li>/.exec(block)?.[1] ?? null,
      distanceText: /<li>([\d.]+公里)<\/li>/.exec(block)?.[1] ?? null,
      durationText: /<li>(所需時間[^<]*)<\/li>/.exec(block)?.[1]?.trim() ?? null,
    });
  }
  return trails;
};

const fetchTrailDetail = async (trailId: number) => {
  const url = `https://hiking.biji.co/index.php?q=trail&act=detail&id=${trailId}`;
  const html = await fetchText(url);
  return {
    url,
    elevationRangeText: extractLabeledListItem(html, '海拔高度'),
    elevationDifferenceText: extractLabeledListItem(html, '高度落差'),
    surfaceText: extractLabeledListItem(html, '路面狀況'),
    permitMountainText: extractLabeledListItem(html, '申請入山'),
    permitParkText: extractLabeledListItem(html, '申請入園'),
    managingPark: extractLabeledListItem(html, '所屬園區'),
  };
};

const extractLabeledListItem = (html: string, label: string): string | null => {
  const match = new RegExp(`${label}[^<]*<\\/dt>(?:\\s*<[^>]+>)*\\s*([^<]+)`, 'i').exec(html);
  return match ? match[1].trim() : null;
};

const main = async () => {
  const peaks = JSON.parse(
    await readFile(new URL('../../data/routes/small-hundred-peaks.json', import.meta.url), 'utf8'),
  ) as SmallHundredPeak[];
  const manifest = await readExistingManifest();
  const listEntries = await fetchBijiMountainList();
  console.log(`biji small-100 list: ${listEntries.length} mountains found`);

  for (const peak of peaks) {
    const entry = matchMountainId(peak.mountainName, listEntries);
    if (!entry) {
      console.log(`${peak.number}\t${peak.mountainName}\t(no biji list match)`);
      mergeManifestEntry(manifest, peak.number, peak.mountainName, 'biji', null);
      continue;
    }

    const mountainUrl = `https://hiking.biji.co/index.php?q=mountain&act=famous-detail&category=2&id=${entry.id}`;
    const mountainHtml = await fetchText(mountainUrl);
    const trailSummaries = extractTrailSummaries(mountainHtml);

    const trails = [];
    for (const summary of trailSummaries.slice(0, 2)) {
      const detail = await fetchTrailDetail(summary.trailId);
      trails.push({ ...summary, ...detail });
    }
    for (const summary of trailSummaries.slice(2)) {
      trails.push({ ...summary, url: null, elevationRangeText: null, elevationDifferenceText: null, surfaceText: null, permitMountainText: null, permitParkText: null, managingPark: null });
    }

    const bundle = {
      number: peak.number,
      mountainName: peak.mountainName,
      bijiMountainId: entry.id,
      bijiMountainTitle: entry.title,
      mountainUrl,
      fetchedAt: new Date().toISOString(),
      trails,
    };
    const hash = await writeRawBundle('biji', String(peak.number).padStart(3, '0'), bundle);
    mergeManifestEntry(manifest, peak.number, peak.mountainName, 'biji', {
      url: mountainUrl,
      hash,
      fetchedAt: bundle.fetchedAt,
    });
    console.log(`${peak.number}\t${peak.mountainName}\t${trails.length} trail(s)`);
  }

  await writeManifest(manifest);
};

void main();
