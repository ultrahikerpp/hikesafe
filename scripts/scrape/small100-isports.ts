import { readFile } from 'node:fs/promises';

import {
  extractById,
  fetchText,
  mergeManifestEntry,
  readExistingManifest,
  writeManifest,
  writeRawBundle,
} from './lib';

type SmallHundredPeak = {
  number: number;
  mountainName: string;
  counties: string[];
  sourceOrganization: string;
  sourceUrl: string;
  sourceVersion: string;
};

const main = async () => {
  const peaks = JSON.parse(
    await readFile(new URL('../../data/routes/small-hundred-peaks.json', import.meta.url), 'utf8'),
  ) as SmallHundredPeak[];
  const manifest = await readExistingManifest();

  for (const peak of peaks) {
    const html = await fetchText(peak.sourceUrl);
    const bundle = {
      number: peak.number,
      mountainName: peak.mountainName,
      counties: peak.counties,
      url: peak.sourceUrl,
      fetchedAt: new Date().toISOString(),
      heightM: extractById(html, 'IsportContent_M_MOUNT_HEIGHT_MM'),
      location: extractById(html, 'IsportContent_M_NOUNT_LOC'),
      intro: extractById(html, 'IsportContent_M_MOUNT_INTRO_EXP'),
      environment: extractById(html, 'IsportContent_M_MOUNT_ENVRMT_CRTS_EXP'),
      climbSeason: extractById(html, 'IsportContent_M_MOUNT_CLIMB_SEASON_EXP'),
      climbWay: extractById(html, 'IsportContent_M_MOUNT_CLIMB_WAY_EXP'),
      trafficInfo: extractById(html, 'IsportContent_M_MOUNT_TRAFFIC_INFO_EXP'),
      noticeItem: extractById(html, 'IsportContent_M_MOUNT_NOTICE_ITEM_EXP'),
    };
    const hash = await writeRawBundle('isports', String(peak.number).padStart(3, '0'), bundle);
    mergeManifestEntry(manifest, peak.number, peak.mountainName, 'isports', {
      url: peak.sourceUrl,
      hash,
      fetchedAt: bundle.fetchedAt,
    });
    console.log(`${peak.number}\t${peak.mountainName}\t${bundle.heightM ?? '(no height)'}`);
  }

  await writeManifest(manifest);
};

void main();
