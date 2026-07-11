export type TripStatus = 'draft' | 'active' | 'finished' | 'cancelled';
export type TripRole = 'leader' | 'deputy' | 'member';
export type TripAction = 'start' | 'finish' | 'cancel';

const transitions: Record<
  TripStatus,
  Partial<Record<TripAction, TripStatus>>
> = {
  draft: { start: 'active', cancel: 'cancelled' },
  active: { finish: 'finished', cancel: 'cancelled' },
  finished: {},
  cancelled: {},
};

export const canFinishTrip = (role: TripRole) =>
  role === 'leader' || role === 'deputy';

export function transitionTrip(
  status: TripStatus,
  action: TripAction,
): TripStatus {
  const next = transitions[status][action];
  if (!next) throw new Error('Invalid trip transition');
  return next;
}
