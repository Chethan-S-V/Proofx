ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'file_created';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'file_updated';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'file_renamed';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'file_deleted';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'folder_created';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'branch_created';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'branch_switched';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'commit_created';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'release_created';--> statement-breakpoint
ALTER TYPE "public"."repository_activity_type" ADD VALUE IF NOT EXISTS 'tag_created';--> statement-breakpoint
CREATE TYPE "public"."repository_member_role" AS ENUM('owner', 'maintainer', 'contributor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."repository_file_kind" AS ENUM('text', 'image', 'binary');--> statement-breakpoint
CREATE TYPE "public"."repository_activity_scope" AS ENUM('repository', 'file', 'folder', 'branch', 'commit', 'member', 'release', 'tag');--> statement-breakpoint
CREATE TABLE "repository_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "repository_member_role" DEFAULT 'contributor' NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"parent_folder_id" uuid,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"name" text NOT NULL,
	"source_branch_id" uuid,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"folder_id" uuid,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"kind" "repository_file_kind" DEFAULT 'text' NOT NULL,
	"mime_type" text,
	"extension" text,
	"storage_bucket" text DEFAULT 'repository-files' NOT NULL,
	"storage_path" text NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commit_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commit_id" uuid NOT NULL,
	"repository_file_id" uuid,
	"path" text NOT NULL,
	"change_type" text NOT NULL,
	"storage_path" text,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"scope" "repository_activity_scope" DEFAULT 'repository' NOT NULL,
	"type" "repository_activity_type" NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"tag_name" text NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository_members" ADD CONSTRAINT "repository_members_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_folders" ADD CONSTRAINT "repository_folders_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_folders" ADD CONSTRAINT "repository_folders_parent_folder_id_repository_folders_id_fk" FOREIGN KEY ("parent_folder_id") REFERENCES "public"."repository_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_source_branch_id_branches_id_fk" FOREIGN KEY ("source_branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_files" ADD CONSTRAINT "repository_files_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_files" ADD CONSTRAINT "repository_files_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_files" ADD CONSTRAINT "repository_files_folder_id_repository_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."repository_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commits" ADD CONSTRAINT "commits_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commits" ADD CONSTRAINT "commits_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commit_files" ADD CONSTRAINT "commit_files_commit_id_commits_id_fk" FOREIGN KEY ("commit_id") REFERENCES "public"."commits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commit_files" ADD CONSTRAINT "commit_files_repository_file_id_repository_files_id_fk" FOREIGN KEY ("repository_file_id") REFERENCES "public"."repository_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_activity" ADD CONSTRAINT "repository_activity_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_releases" ADD CONSTRAINT "repository_releases_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "repository_members_repository_id_idx" ON "repository_members" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repository_members_user_id_idx" ON "repository_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_members_user_repository_unique_idx" ON "repository_members" USING btree ("user_id","repository_id");--> statement-breakpoint
CREATE INDEX "repository_folders_parent_folder_id_idx" ON "repository_folders" USING btree ("parent_folder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_folders_repository_path_unique_idx" ON "repository_folders" USING btree ("repository_id","path");--> statement-breakpoint
CREATE INDEX "repository_folders_repository_id_idx" ON "repository_folders" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "branches_repository_default_idx" ON "branches" USING btree ("repository_id","is_default");--> statement-breakpoint
CREATE INDEX "branches_repository_id_idx" ON "branches" USING btree ("repository_id");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_repository_name_unique_idx" ON "branches" USING btree ("repository_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_files_branch_path_unique_idx" ON "repository_files" USING btree ("branch_id","path");--> statement-breakpoint
CREATE INDEX "repository_files_folder_id_idx" ON "repository_files" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "repository_files_repository_id_idx" ON "repository_files" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "commits_branch_created_at_idx" ON "commits" USING btree ("branch_id","created_at");--> statement-breakpoint
CREATE INDEX "commits_repository_created_at_idx" ON "commits" USING btree ("repository_id","created_at");--> statement-breakpoint
CREATE INDEX "commit_files_commit_id_idx" ON "commit_files" USING btree ("commit_id");--> statement-breakpoint
CREATE INDEX "commit_files_repository_file_id_idx" ON "commit_files" USING btree ("repository_file_id");--> statement-breakpoint
CREATE INDEX "repository_activity_actor_id_idx" ON "repository_activity" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "repository_activity_repository_created_at_idx" ON "repository_activity" USING btree ("repository_id","created_at");--> statement-breakpoint
CREATE INDEX "repository_releases_repository_id_idx" ON "repository_releases" USING btree ("repository_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_releases_repository_tag_unique_idx" ON "repository_releases" USING btree ("repository_id","tag_name");--> statement-breakpoint
INSERT INTO "repository_members" ("repository_id", "user_id", "role", "invited_by", "created_at", "updated_at")
SELECT "repository_id", "user_id", "role"::text::"repository_member_role", "invited_by", "created_at", "updated_at"
FROM "repository_contributors"
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "branches" ("repository_id", "name", "is_default", "created_by", "created_at", "updated_at")
SELECT "id", 'main', true, "owner_id", "created_at", "updated_at"
FROM "repositories"
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO storage.buckets (id, name, public)
VALUES ('repository-files', 'repository-files', false)
ON CONFLICT (id) DO NOTHING;
