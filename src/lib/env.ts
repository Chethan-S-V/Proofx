import { z } from "zod";

/**
 * Environment validation schema
 *
 * Validates all required environment variables at runtime
 * Runs on app startup to catch configuration errors early
 * 
 * Variables:
 * - DATABASE_URL: PostgreSQL connection string
 * - DATABASE_SSL: Set to "false" for local PostgreSQL without SSL
 * - AUTH_SECRET: Secret used to sign local session cookies
 */
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL URL")
    .refine((url) => url.startsWith("postgres://") || url.startsWith("postgresql://"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  DATABASE_SSL: z.enum(["true", "false"]).default("true"),
  APP_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

/**
 * Validated environment variables
 * Type-safe access to environment configuration
 */
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  DATABASE_SSL: process.env.DATABASE_SSL,
  APP_URL: process.env.APP_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

/**
 * Type definition for validated environment
 */
export type Environment = z.infer<typeof envSchema>;
