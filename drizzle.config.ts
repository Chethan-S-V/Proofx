import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Drizzle.");
}

export default {
  schema: "./src/db/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: process.env.DATABASE_SSL === "false" ? false : "require",
  },
  migrations: {
    prefix: "timestamp",
  },
} satisfies Config;
