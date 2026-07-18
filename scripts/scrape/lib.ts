import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchText = async (
  url: string,
  options: { encoding?: 'utf-8' | 'big5'; retries?: number; throttleMs?: number } = {},
): Promise<string> => {
  const { encoding = 'utf-8', retries = 2, throttleMs = 800 } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      await sleep(throttleMs);
      return new TextDecoder(encoding).decode(buffer);
    } catch (error) {
      lastError = error;
      await sleep(throttleMs * (attempt + 1));
    }
  }
  throw new Error(`Failed to fetch ${url}: ${String(lastError)}`);
};

export const stripTags = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '|')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[|\s]+/g, ' ')
    .trim();

export const extractById = (html: string, id: string): string | null => {
  const match = new RegExp(`id="${id}"[^>]*>([\\s\\S]*?)</span>`, 'i').exec(html);
  if (!match) return null;
  const text = stripTags(match[1]);
  return text.length > 0 ? text : null;
};

const contentHash = (content: string) => createHash('sha256').update(content).digest('hex');

export const writeRawBundle = async (
  sourceDirectory: string,
  fileStem: string,
  bundle: unknown,
) => {
  const directory = path.resolve(process.cwd(), 'data/routes/raw', sourceDirectory);
  await mkdir(directory, { recursive: true });
  const content = JSON.stringify(bundle, null, 2);
  await writeFile(path.join(directory, `${fileStem}.json`), content, 'utf8');
  return contentHash(content);
};

export type ManifestEntry = {
  number: number;
  mountainName: string;
  sources: Record<string, { url: string; hash: string; fetchedAt: string } | null>;
};

export const mergeManifestEntry = (
  manifest: Map<number, ManifestEntry>,
  number: number,
  mountainName: string,
  sourceKey: string,
  entry: { url: string; hash: string; fetchedAt: string } | null,
) => {
  const existing = manifest.get(number) ?? { number, mountainName, sources: {} };
  existing.sources[sourceKey] = entry;
  manifest.set(number, existing);
};

export const writeManifest = async (manifest: Map<number, ManifestEntry>) => {
  const sorted = [...manifest.values()].sort((a, b) => a.number - b.number);
  await writeFile(
    path.resolve(process.cwd(), 'data/routes/raw-manifest.json'),
    JSON.stringify(sorted, null, 2) + '\n',
    'utf8',
  );
};

export const readExistingManifest = async (): Promise<Map<number, ManifestEntry>> => {
  try {
    const { readFile } = await import('node:fs/promises');
    const content = await readFile(
      path.resolve(process.cwd(), 'data/routes/raw-manifest.json'),
      'utf8',
    );
    const entries = JSON.parse(content) as ManifestEntry[];
    return new Map(entries.map((entry) => [entry.number, entry]));
  } catch {
    return new Map();
  }
};
