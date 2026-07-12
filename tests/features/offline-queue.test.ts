import { describe, expect, it } from 'vitest';

import { enqueueCheckIn, flushCheckIns, type CheckInQueueStore } from '@/src/offline/check-in-queue';

const makeStore = (): CheckInQueueStore & { rows: any[] } => ({
  rows: [],
  add: async (item) => { (store.rows as any[]).push(item); },
  list: async () => [...store.rows].sort((left, right) => left.createdAt - right.createdAt),
  remove: async (id) => { store.rows = store.rows.filter((item) => item.id !== id); },
});
let store: ReturnType<typeof makeStore>;

describe('offline check-in queue', () => {
  it('shows a newly queued check-in as pending, never sent', async () => {
    store = makeStore();
    const item = await enqueueCheckIn({ tripId: 'trip-1', message: '已到稜線', idempotencyKey: 'key-1' }, store, () => 10);
    expect(item).toMatchObject({ status: 'pending', idempotencyKey: 'key-1' });
    expect(await store.list()).toEqual([expect.objectContaining({ status: 'pending' })]);
  });

  it('flushes oldest-first, retains failures, and retries with the original key', async () => {
    store = makeStore();
    await enqueueCheckIn({ tripId: 'trip-1', message: 'first', idempotencyKey: 'key-1' }, store, () => 10);
    await enqueueCheckIn({ tripId: 'trip-1', message: 'second', idempotencyKey: 'key-2' }, store, () => 20);
    const attempts: string[] = [];
    await flushCheckIns(store, async (item) => {
      attempts.push(item.idempotencyKey);
      if (item.idempotencyKey === 'key-1') throw new Error('offline');
    });
    expect(attempts).toEqual(['key-1']);
    expect(await store.list()).toEqual([
      expect.objectContaining({ idempotencyKey: 'key-1', status: 'pending' }),
      expect.objectContaining({ idempotencyKey: 'key-2', status: 'pending' }),
    ]);
    await flushCheckIns(store, async (item) => { attempts.push(item.idempotencyKey); });
    expect(attempts).toEqual(['key-1', 'key-1', 'key-2']);
    expect(await store.list()).toEqual([]);
  });
});
