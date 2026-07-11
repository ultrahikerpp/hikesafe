import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  LINE_CHANNEL_ID: z.string().min(1),
  LINE_CHANNEL_SECRET: z.string().min(1),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  JOB_SECRET: z.string().min(32),
  NEXT_PUBLIC_LIFF_ID: z.string().min(1),
});

export const parseEnv = (value: Record<string, string | undefined>) => schema.parse(value);
export const getEnv = () => parseEnv(process.env);
