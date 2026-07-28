CREATE TABLE "user_blocks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "blocker_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "blocked_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "user_blocks_pair_unique" UNIQUE("blocker_id", "blocked_id"),
  CONSTRAINT "user_blocks_not_self" CHECK ("blocker_id" <> "blocked_id")
);
CREATE INDEX "user_blocks_blocker_idx" ON "user_blocks" ("blocker_id", "created_at");
