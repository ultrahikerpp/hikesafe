export type AlertStage = 'started' | 'extended' | 'due' | 'overdue_60' | 'overdue_120';

const stages: ReadonlyArray<readonly [AlertStage, number]> = [
  ['due', 0],
  ['overdue_60', 60],
  ['overdue_120', 120],
];

export const scheduleAlertEvents = (tripId: string, plannedFinishAt: Date) => stages.map(
  ([stage, minutes]) => ({
    tripId,
    stage,
    dueAt: new Date(plannedFinishAt.getTime() + minutes * 60_000),
  }),
);
