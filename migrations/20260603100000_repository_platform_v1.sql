CREATE TYPE "public"."repository_activity_type" AS ENUM('created', 'updated', 'starred', 'unstarred', 'bookmarked', 'unbookmarked', 'watched', 'unwatched', 'forked', 'contributor_added', 'visibility_changed');--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "verified_skills" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "recruiter_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE TABLE "repository_watchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notify_on_activity" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_forks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_repository_id" uuid NOT NULL,
	"fork_repository_id" uuid NOT NULL,
	"forked_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository_analytics" ADD COLUMN "watchers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "repository_analytics" ADD COLUMN "forks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "repository_analytics" ADD COLUMN "trust_impact" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "repository_analytics" ADD COLUMN "proof_impact" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "repository_analytics" ADD COLUMN "recruiter_views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE "repository_activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"type" "repository_activity_type" NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository_watchers" ADD CONSTRAINT "repository_watchers_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_forks" ADD CONSTRAINT "repository_forks_parent_repository_id_repositories_id_fk" FOREIGN KEY ("parent_repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_forks" ADD CONSTRAINT "repository_forks_fork_repository_id_repositories_id_fk" FOREIGN KEY ("fork_repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_activity_events" ADD CONSTRAINT "repository_activity_events_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "repository_watchers_repository_id_idx" ON "repository_watchers" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repository_watchers_user_id_idx" ON "repository_watchers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_watchers_user_repository_unique_idx" ON "repository_watchers" USING btree ("user_id","repository_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_forks_fork_repository_unique_idx" ON "repository_forks" USING btree ("fork_repository_id");--> statement-breakpoint
CREATE INDEX "repository_forks_forked_by_idx" ON "repository_forks" USING btree ("forked_by");--> statement-breakpoint
CREATE INDEX "repository_forks_parent_repository_id_idx" ON "repository_forks" USING btree ("parent_repository_id");--> statement-breakpoint
CREATE INDEX "repository_activity_events_repository_created_at_idx" ON "repository_activity_events" USING btree ("repository_id","created_at");--> statement-breakpoint
CREATE INDEX "repository_activity_events_actor_id_idx" ON "repository_activity_events" USING btree ("actor_id");
