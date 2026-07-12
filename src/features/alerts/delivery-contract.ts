/**
 * Task 7 delivery boundary: immediately before a side effect, query the
 * stable alert event ID with `alert_events.status = 'pending'` and
 * `trips.status = 'active'`. The external provider's idempotency key is that
 * same event ID. A cancelled or historical claimed event therefore cannot be
 * delivered after an extension or finish transaction commits.
 */
export interface AlertDeliveryRepository {
  findPendingActiveEvent(eventId: string): Promise<{ id: string } | undefined>;
}

export const deliverPendingActiveAlert = async (
  eventId: string,
  repository: AlertDeliveryRepository,
  deliver: (input: { eventId: string; idempotencyKey: string }) => Promise<void>,
) => {
  const event = await repository.findPendingActiveEvent(eventId);
  if (!event) return 'skipped' as const;
  await deliver({ eventId: event.id, idempotencyKey: event.id });
  return 'sent' as const;
};
