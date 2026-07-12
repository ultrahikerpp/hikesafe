import { openDB } from 'idb';

export interface QueuedCheckIn {
  id: string;
  tripId: string;
  message?: string;
  location?: unknown;
  idempotencyKey: string;
  createdAt: number;
  status: 'pending';
}

export interface CheckInQueueStore {
  add(item: QueuedCheckIn): Promise<void>;
  list(): Promise<QueuedCheckIn[]>;
  remove(id: string): Promise<void>;
}

export const enqueueCheckIn = async (
  input: Omit<QueuedCheckIn, 'id' | 'createdAt' | 'status'>,
  store: CheckInQueueStore,
  now = Date.now,
): Promise<QueuedCheckIn> => {
  const item: QueuedCheckIn = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now(),
    status: 'pending',
  };
  await store.add(item);
  return item;
};

export const flushCheckIns = async (
  store: CheckInQueueStore,
  send: (item: QueuedCheckIn) => Promise<void>,
) => {
  for (const item of await store.list()) {
    try {
      await send(item);
      await store.remove(item.id);
    } catch {
      // Preserve the original item, particularly its idempotency key, for retry.
      break;
    }
  }
};

export const createIndexedDbCheckInStore = (): CheckInQueueStore => {
  const database = openDB('besafe', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('check-ins')) db.createObjectStore('check-ins', { keyPath: 'id' });
    },
  });
  return {
    async add(item) { (await database).put('check-ins', item); },
    async list() {
      const items = await (await database).getAll('check-ins') as QueuedCheckIn[];
      return items.sort((left, right) => left.createdAt - right.createdAt);
    },
    async remove(id) { (await database).delete('check-ins', id); },
  };
};
