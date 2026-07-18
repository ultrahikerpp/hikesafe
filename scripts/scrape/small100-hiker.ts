import { readFile } from 'node:fs/promises';

import {
  fetchText,
  mergeManifestEntry,
  readExistingManifest,
  stripTags,
  writeManifest,
  writeRawBundle,
} from './lib';

type SmallHundredPeak = { number: number; mountainName: string };

const baseUrl = 'https://xn--kwr22her7a6qdvs6a.tw/mountain/nopaiA/';
const indexPages = ['001lettlenomountain-main.htm', '002nomountain-main.htm'];

const mountainNameAliases: Record<string, string> = {
  馬拉邦山: '馬那邦山',
};

const normalizeMountainName = (name: string) =>
  name.normalize('NFKC').replace(/主峰|汐止|大溪|龍潭/g, '');

const linkPattern = /<a href="([^"]*\.htm)"[^>]*>([^<]*)<\/a>/g;

const fetchIndexLinks = async () => {
  const links: Array<{ href: string; text: string }> = [];
  for (const page of indexPages) {
    const buffer = await fetchText(`${baseUrl}${page}`, { encoding: 'big5' });
    linkPattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = linkPattern.exec(buffer))) {
      links.push({ href: match[1], text: match[2].trim() });
    }
  }
  return links;
};

const matchHref = (peakName: string, links: Array<{ href: string; text: string }>) => {
  const alias = mountainNameAliases[peakName] ?? peakName;
  const normalizedPeak = normalizeMountainName(alias);
  return links.find((link) => {
    const normalizedText = normalizeMountainName(link.text);
    return (
      normalizedText === normalizedPeak ||
      normalizedText.includes(normalizedPeak) ||
      normalizedPeak.includes(normalizedText)
    );
  });
};

const extractAnchoredWindow = (text: string, number: number, windowSize = 1500) => {
  const marker = `小百岳 #${String(number).padStart(3, '0')}`;
  const compact = text.replace(/小百岳\s*#\s*(\d{3})/g, (_, digits) => `小百岳 #${digits}`);
  const index = compact.indexOf(marker);
  if (index === -1) return compact;
  const start = Math.max(0, index - windowSize);
  const end = Math.min(compact.length, index + windowSize);
  return compact.slice(start, end);
};

const main = async () => {
  const peaks = JSON.parse(
    await readFile(new URL('../../data/routes/small-hundred-peaks.json', import.meta.url), 'utf8'),
  ) as SmallHundredPeak[];
  const manifest = await readExistingManifest();
  const links = await fetchIndexLinks();
  console.log(`hiker index: ${links.length} links found`);

  const pageTextCache = new Map<string, string>();

  for (const peak of peaks) {
    const hit = matchHref(peak.mountainName, links);
    if (!hit) {
      console.log(`${peak.number}\t${peak.mountainName}\t(no hiker index match)`);
      mergeManifestEntry(manifest, peak.number, peak.mountainName, 'hiker', null);
      continue;
    }

    const url = `${baseUrl}${hit.href}`;
    let pageText = pageTextCache.get(hit.href);
    if (pageText === undefined) {
      const html = await fetchText(url, { encoding: 'big5' });
      pageText = stripTags(html);
      pageTextCache.set(hit.href, pageText);
    }

    const bundle = {
      number: peak.number,
      mountainName: peak.mountainName,
      matchedLinkText: hit.text,
      url,
      fetchedAt: new Date().toISOString(),
      text: extractAnchoredWindow(pageText, peak.number),
    };
    const hash = await writeRawBundle('hiker', String(peak.number).padStart(3, '0'), bundle);
    mergeManifestEntry(manifest, peak.number, peak.mountainName, 'hiker', {
      url,
      hash,
      fetchedAt: bundle.fetchedAt,
    });
    console.log(`${peak.number}\t${peak.mountainName}\t${bundle.text.length} chars`);
  }

  await writeManifest(manifest);
};

void main();
