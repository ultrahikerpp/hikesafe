export interface AlertClaim {
  eventId: string;
  claimToken: string;
  claimVersion: number;
}

export interface AlertDeliveryRepository {
  /**
   * Atomically locks due events, transitions each to `claimed`, generates a
   * fresh opaque token, increments its version, and persists its expiry.
   * Reclaiming an expired event must replace the token before returning it.
   */
  claimDueActiveEvents(input: { now: Date; limit: number }): Promise<AlertClaim[]>;
  /**
   * Immediately before delivery, confirms this exact event ID, claim token,
   * and claim version are still `claimed`, unexpired, and associated with an
   * active trip.
   */
  confirmClaimedActiveEvent(claim: AlertClaim): Promise<{ id: string } | undefined>;
}

export const claimDueActiveAlerts = (
  input: { now: Date; limit: number },
  repository: AlertDeliveryRepository,
) => repository.claimDueActiveEvents(input);

export const deliverClaimedActiveAlert = async (
  claim: AlertClaim,
  repository: AlertDeliveryRepository,
  deliver: (input: { eventId: string; idempotencyKey: string }) => Promise<void>,
) => {
  const event = await repository.confirmClaimedActiveEvent(claim);
  if (!event) return 'skipped' as const;
  await deliver({ eventId: event.id, idempotencyKey: event.id });
  return 'sent' as const;
};
