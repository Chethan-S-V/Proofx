CREATE TYPE "public"."repository_visibility" AS ENUM('public', 'private', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."repository_contributor_role" AS ENUM('owner', 'maintainer', 'contributor', 'viewer');--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"readme" text,
	"visibility" "repository_visibility" DEFAULT 'private' NOT NULL,
	"source_url" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_stars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_contributors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "repository_contributor_role" DEFAULT 'contributor' NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"bookmarks" integer DEFAULT 0 NOT NULL,
	"contributors" integer DEFAULT 0 NOT NULL,
	"proof_submissions" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository_tags" ADD CONSTRAINT "repository_tags_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_stars" ADD CONSTRAINT "repository_stars_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_bookmarks" ADD CONSTRAINT "repository_bookmarks_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_contributors" ADD CONSTRAINT "repository_contributors_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_analytics" ADD CONSTRAINT "repository_analytics_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "repositories_owner_id_idx" ON "repositories" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repositories_owner_slug_unique_idx" ON "repositories" USING btree ("owner_id","slug");--> statement-breakpoint
CREATE INDEX "repositories_search_idx" ON "repositories" USING btree ("name","slug");--> statement-breakpoint
CREATE INDEX "repository_tags_repository_id_idx" ON "repository_tags" USING btree ("repository_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_tags_repository_name_unique_idx" ON "repository_tags" USING btree ("repository_id","name");--> statement-breakpoint
CREATE INDEX "repository_stars_repository_id_idx" ON "repository_stars" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repository_stars_user_id_idx" ON "repository_stars" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_stars_user_repository_unique_idx" ON "repository_stars" USING btree ("user_id","repository_id");--> statement-breakpoint
CREATE INDEX "repository_bookmarks_repository_id_idx" ON "repository_bookmarks" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repository_bookmarks_user_id_idx" ON "repository_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_bookmarks_user_repository_unique_idx" ON "repository_bookmarks" USING btree ("user_id","repository_id");--> statement-breakpoint
CREATE INDEX "repository_contributors_repository_id_idx" ON "repository_contributors" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repository_contributors_user_id_idx" ON "repository_contributors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_contributors_user_repository_unique_idx" ON "repository_contributors" USING btree ("user_id","repository_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_analytics_repository_id_unique_idx" ON "repository_analytics" USING btree ("repository_id");
