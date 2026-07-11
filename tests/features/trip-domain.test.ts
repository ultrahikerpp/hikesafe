import { describe, expect, it } from 'vitest';

import { canFinishTrip, transitionTrip } from '@/src/features/trips/domain';

describe('trip state', () => {
  it('allows leader and deputy to finish an active trip', () => {
    expect(canFinishTrip('leader')).toBe(true);
    expect(canFinishTrip('deputy')).toBe(true);
    expect(canFinishTrip('member')).toBe(false);
    expect(transitionTrip('active', 'finish')).toBe('finished');
  });

  it('rejects starting a finished trip', () => {
    expect(() => transitionTrip('finished', 'start')).toThrow(
      'Invalid trip transition',
    );
  });
});
