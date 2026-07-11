export interface Clock { now(): Date }

export const systemClock: Clock = { now: () => new Date() };
export const createTestClock = (iso: string): Clock => ({ now: () => new Date(iso) });
