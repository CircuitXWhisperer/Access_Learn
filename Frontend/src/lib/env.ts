import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  VITE_ENABLE_REAL_TIME: z.string().default('true').transform((v) => v === 'true'),
  VITE_DEMO_MODE: z.string().default('false').transform((v) => v === 'true'),
  VITE_N8N_CHAT_WEBHOOK_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) throw new Error(`Invalid frontend environment: ${parsed.error.message}`);
export const env = parsed.data;
