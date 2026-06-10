#!/usr/bin/env node

/**
 * Database migration helper script
 * Loads environment and applies migrations
 */

import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

console.log("📦 Connecting to database...");
const connection = postgres(databaseUrl, {
  ssl: process.env.DATABASE_SSL === "false" ? false : "require",
  max: 1,
});

const db = drizzle(connection);

async function ensureLocalSupabaseCompatibility() {
  await connection.unsafe(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
END
$$;
  `);

  await connection.unsafe(`CREATE SCHEMA IF NOT EXISTS auth;`);
  await connection.unsafe(`CREATE SCHEMA IF NOT EXISTS storage;`);
  await connection.unsafe(`
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
  `);

  await connection.unsafe(`
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean DEFAULT false NOT NULL,
  file_size_limit integer,
  allowed_mime_types text[]
);
  `);

  await connection.unsafe(`
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL REFERENCES storage.buckets(id),
  name text NOT NULL,
  owner uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
  `);
}

await ensureLocalSupabaseCompatibility();

console.log("🔄 Running migrations...");
await migrate(db, { migrationsFolder: "./migrations" });

console.log("✅ Migrations completed successfully!");
await connection.end();
