import { createHash } from 'node:crypto';

const stableJson = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) =>
    `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
};

export const hashIdempotencyRequest = (request: unknown) =>
  createHash('sha256').update(stableJson(request)).digest('hex');

export const hashViewerGrant = (token: string) =>
  createHash('sha256').update(token).digest('hex');
