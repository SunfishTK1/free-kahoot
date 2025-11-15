import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  AZURE_API_KEY: z.string().optional(),
  AZURE_ENDPOINT: z.string().optional(),
  AZURE_VERSION: z.string().optional(),
  AZURE_MODEL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('Invalid environment variables', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      DIRECT_URL: process.env.DIRECT_URL ?? '',
      JWT_SECRET: process.env.JWT_SECRET ?? '',
      AZURE_API_KEY: process.env.AZURE_API_KEY,
      AZURE_ENDPOINT: process.env.AZURE_ENDPOINT,
      AZURE_VERSION: process.env.AZURE_VERSION,
      AZURE_MODEL: process.env.AZURE_MODEL,
    };
