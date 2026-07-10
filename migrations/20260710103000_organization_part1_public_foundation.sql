ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "headquarters" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "public_phone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_type_idx" ON "organizations" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_verification_status_idx" ON "organizations" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_location_idx" ON "organizations" USING btree ("country","state","city");
