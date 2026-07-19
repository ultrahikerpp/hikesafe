import { copy } from '@/src/features/i18n/copy';

export const formatTime = (value?: string) => {
  if (!value) return copy.notAvailableYet;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')} Asia/Taipei`;
};

export const formatElapsed = (startedAt?: string, now = new Date().toISOString()) => {
  if (!startedAt) return copy.notAvailableYet;
  const minutes = Math.max(0, Math.floor((new Date(now).getTime() - new Date(startedAt).getTime()) / 60_000));
  const hours = Math.floor(minutes / 60);
  return copy.elapsedTime(hours, minutes % 60);
};
