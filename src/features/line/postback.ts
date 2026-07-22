import type { TripChooserIntent } from '@/src/features/line/prompts';

export const EXTEND_OPTION_MINUTES = [30, 60, 120] as const;
export type ExtendMinutes = (typeof EXTEND_OPTION_MINUTES)[number];

export type ParsedPostback =
  | { kind: 'check-in'; tripId: string; message: 'safe' | 'shelter' }
  | { kind: 'help'; tripId: string; action: 'confirm' | 'cancel' }
  | { kind: 'trip'; tripId: string; intent: TripChooserIntent }
  | { kind: 'start'; tripId: string; action: 'confirm' | 'cancel' }
  | { kind: 'extend'; tripId: string; minutes: ExtendMinutes }
  | { kind: 'finish'; tripId: string; action: 'confirm' | 'cancel' };

const checkInPattern = /^hikesafe:check-in:([^:]+):(safe|shelter)$/;
const helpPattern = /^hikesafe:help:([^:]+):(confirm|cancel)$/;
const tripPattern = /^hikesafe:trip:([^:]+):(select|extend|finish|help)$/;
const startPattern = /^hikesafe:start:([^:]+):(confirm|cancel)$/;
const extendPattern = new RegExp(`^hikesafe:extend:([^:]+):(${EXTEND_OPTION_MINUTES.join('|')})$`);
const finishPattern = /^hikesafe:finish:([^:]+):(confirm|cancel)$/;

export const parsePostback = (data: string): ParsedPostback | undefined => {
  const checkIn = checkInPattern.exec(data);
  if (checkIn) return { kind: 'check-in', tripId: checkIn[1], message: checkIn[2] as 'safe' | 'shelter' };

  const help = helpPattern.exec(data);
  if (help) return { kind: 'help', tripId: help[1], action: help[2] as 'confirm' | 'cancel' };

  const trip = tripPattern.exec(data);
  if (trip) return { kind: 'trip', tripId: trip[1], intent: trip[2] as TripChooserIntent };

  const start = startPattern.exec(data);
  if (start) return { kind: 'start', tripId: start[1], action: start[2] as 'confirm' | 'cancel' };

  const extend = extendPattern.exec(data);
  if (extend) return { kind: 'extend', tripId: extend[1], minutes: Number(extend[2]) as ExtendMinutes };

  const finish = finishPattern.exec(data);
  if (finish) return { kind: 'finish', tripId: finish[1], action: finish[2] as 'confirm' | 'cancel' };

  return undefined;
};
