CREATE TYPE "public"."organization_type" AS ENUM('company', 'startup', 'university', 'college', 'school', 'research_institution', 'ngo', 'nonprofit', 'government_organization', 'professional_association', 'community', 'open_source_organization', 'hospital', 'hotel', 'restaurant', 'agency', 'studio', 'production_house', 'law_firm', 'accounting_firm', 'consultancy', 'construction_company', 'manufacturing_company', 'sports_organization', 'media_organization', 'other');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('draft', 'active', 'under_review', 'verified', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."organization_verification_status" AS ENUM('not_started', 'email_pending', 'domain_pending', 'document_pending', 'manual_review', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."organization_follow_preference" AS ENUM('all_updates', 'important_updates', 'challenges', 'jobs', 'proof_activity', 'off');--> statement-breakpoint
CREATE TYPE "public"."organization_membership_status" AS ENUM('invited', 'requested', 'active', 'suspended', 'left', 'removed');--> statement-breakpoint
CREATE TYPE "public"."organization_role_key" AS ENUM('OWNER', 'ADMIN', 'HR_MANAGER', 'RECRUITER', 'TEAM_MANAGER', 'PROOF_VERIFIER', 'CHALLENGE_MANAGER', 'CONTENT_MANAGER', 'ANALYST', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."organization_post_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."organization_post_type" AS ENUM('text', 'image', 'video', 'document', 'announcement', 'article', 'event_announcement', 'job_announcement', 'challenge_announcement', 'proof_showcase', 'member_achievement');--> statement-breakpoint
CREATE TYPE "public"."proof_verification_status" AS ENUM('submitted', 'under_review', 'more_information_required', 'verified', 'rejected', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."proof_verification_decision" AS ENUM('submitted', 'review_started', 'more_information_required', 'verified', 'rejected', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."candidate_pipeline_stage" AS ENUM('sourced', 'contacted', 'interested', 'screening', 'interview', 'technical_evaluation', 'offer', 'hired', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."organization_job_status" AS ENUM('draft', 'published', 'paused', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."organization_remote_policy" AS ENUM('onsite', 'hybrid', 'remote', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."organization_employment_type" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'temporary', 'volunteer');--> statement-breakpoint

CREATE TABLE "organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_by" uuid NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "type" "organization_type" NOT NULL,
  "industry" text,
  "size" text,
  "founded_year" integer,
  "website" text,
  "primary_email" text,
  "phone" text,
  "country" text,
  "state" text,
  "city" text,
  "postal_code" text,
  "tagline" text,
  "description" text,
  "specialties" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "services" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "professional_categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "logo_url" text,
  "cover_url" text,
  "social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "career_page_url" text,
  "status" "organization_status" DEFAULT 'draft' NOT NULL,
  "verification_status" "organization_verification_status" DEFAULT 'not_started' NOT NULL,
  "onboarding_step" integer DEFAULT 1 NOT NULL,
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  "allow_messages" boolean DEFAULT true NOT NULL,
  "public_departments" boolean DEFAULT true NOT NULL,
  "follower_count" integer DEFAULT 0 NOT NULL,
  "member_count" integer DEFAULT 1 NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_follows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "preference" "organization_follow_preference" DEFAULT 'important_updates' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid,
  "key" "organization_role_key" NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "is_system" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_role_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "role_id" uuid NOT NULL,
  "permission_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "invited_by" uuid,
  "job_title" text,
  "department_id" uuid,
  "team_id" uuid,
  "membership_type" text,
  "start_date" date,
  "end_date" date,
  "public_visibility" boolean DEFAULT true NOT NULL,
  "status" "organization_membership_status" DEFAULT 'requested' NOT NULL,
  "joined_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_member_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "member_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "assigned_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "parent_department_id" uuid,
  "head_member_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "is_public" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_teams" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "department_id" uuid,
  "lead_member_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "is_archived" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_team_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "team_id" uuid NOT NULL,
  "member_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "label" text NOT NULL,
  "country" text NOT NULL,
  "state" text,
  "city" text,
  "postal_code" text,
  "is_headquarters" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "author_id" uuid NOT NULL,
  "type" "organization_post_type" DEFAULT 'text' NOT NULL,
  "status" "organization_post_status" DEFAULT 'draft' NOT NULL,
  "title" text,
  "body" text NOT NULL,
  "media_url" text,
  "scheduled_at" timestamp with time zone,
  "published_at" timestamp with time zone,
  "metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proof_verification_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "proof_id" uuid,
  "user_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "status" "proof_verification_status" DEFAULT 'submitted' NOT NULL,
  "evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "request_message" text,
  "reviewer_member_id" uuid,
  "private_review_note" text,
  "public_verification_note" text,
  "evidence_snapshot" jsonb,
  "version" integer DEFAULT 1 NOT NULL,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "decided_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proof_verification_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "actor_id" uuid NOT NULL,
  "decision" "proof_verification_decision" NOT NULL,
  "reason" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_saved_candidates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "candidate_id" uuid NOT NULL,
  "saved_by" uuid NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_candidate_lists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "created_by" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_candidate_list_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "list_id" uuid NOT NULL,
  "candidate_id" uuid NOT NULL,
  "added_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_candidate_pipeline" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "candidate_id" uuid NOT NULL,
  "job_id" uuid,
  "stage" "candidate_pipeline_stage" DEFAULT 'sourced' NOT NULL,
  "assigned_recruiter_id" uuid,
  "internal_note" text,
  "follow_up_at" timestamp with time zone,
  "created_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_candidate_stage_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pipeline_id" uuid NOT NULL,
  "from_stage" "candidate_pipeline_stage",
  "to_stage" "candidate_pipeline_stage" NOT NULL,
  "actor_id" uuid NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "department_id" uuid,
  "created_by" uuid NOT NULL,
  "title" text NOT NULL,
  "location" text,
  "remote_policy" "organization_remote_policy" DEFAULT 'onsite' NOT NULL,
  "employment_type" "organization_employment_type" DEFAULT 'full_time' NOT NULL,
  "description" text,
  "responsibilities" text,
  "requirements" text,
  "skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "experience_level" text,
  "salary_visible" boolean DEFAULT false NOT NULL,
  "salary_range" text,
  "application_deadline" date,
  "status" "organization_job_status" DEFAULT 'draft' NOT NULL,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "actor_id" uuid,
  "action" text NOT NULL,
  "target_type" text,
  "target_id" uuid,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_follows" ADD CONSTRAINT "organization_follows_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_follows" ADD CONSTRAINT "organization_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_roles" ADD CONSTRAINT "organization_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role_permissions" ADD CONSTRAINT "organization_role_permissions_role_id_organization_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."organization_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role_permissions" ADD CONSTRAINT "organization_role_permissions_permission_id_organization_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."organization_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member_roles" ADD CONSTRAINT "organization_member_roles_member_id_organization_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member_roles" ADD CONSTRAINT "organization_member_roles_role_id_organization_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."organization_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member_roles" ADD CONSTRAINT "organization_member_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_departments" ADD CONSTRAINT "organization_departments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_teams" ADD CONSTRAINT "organization_teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_teams" ADD CONSTRAINT "organization_teams_department_id_organization_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."organization_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_team_members" ADD CONSTRAINT "organization_team_members_team_id_organization_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."organization_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_team_members" ADD CONSTRAINT "organization_team_members_member_id_organization_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_locations" ADD CONSTRAINT "organization_locations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_posts" ADD CONSTRAINT "organization_posts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_posts" ADD CONSTRAINT "organization_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_verification_requests" ADD CONSTRAINT "proof_verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_verification_requests" ADD CONSTRAINT "proof_verification_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_verification_events" ADD CONSTRAINT "proof_verification_events_request_id_proof_verification_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."proof_verification_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_verification_events" ADD CONSTRAINT "proof_verification_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_verification_events" ADD CONSTRAINT "proof_verification_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_saved_candidates" ADD CONSTRAINT "organization_saved_candidates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_saved_candidates" ADD CONSTRAINT "organization_saved_candidates_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_saved_candidates" ADD CONSTRAINT "organization_saved_candidates_saved_by_users_id_fk" FOREIGN KEY ("saved_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_lists" ADD CONSTRAINT "organization_candidate_lists_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_lists" ADD CONSTRAINT "organization_candidate_lists_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_list_members" ADD CONSTRAINT "organization_candidate_list_members_list_id_organization_candidate_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."organization_candidate_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_list_members" ADD CONSTRAINT "organization_candidate_list_members_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_list_members" ADD CONSTRAINT "organization_candidate_list_members_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_pipeline" ADD CONSTRAINT "organization_candidate_pipeline_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_pipeline" ADD CONSTRAINT "organization_candidate_pipeline_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_pipeline" ADD CONSTRAINT "organization_candidate_pipeline_assigned_recruiter_id_users_id_fk" FOREIGN KEY ("assigned_recruiter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_pipeline" ADD CONSTRAINT "organization_candidate_pipeline_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_stage_history" ADD CONSTRAINT "organization_candidate_stage_history_pipeline_id_organization_candidate_pipeline_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."organization_candidate_pipeline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_candidate_stage_history" ADD CONSTRAINT "organization_candidate_stage_history_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_jobs" ADD CONSTRAINT "organization_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_jobs" ADD CONSTRAINT "organization_jobs_department_id_organization_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."organization_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_jobs" ADD CONSTRAINT "organization_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_audit_logs" ADD CONSTRAINT "organization_audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_audit_logs" ADD CONSTRAINT "organization_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "organizations_created_by_idx" ON "organizations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "organizations_search_idx" ON "organizations" USING btree ("name","slug","industry");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_unique_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organization_follows_organization_id_idx" ON "organization_follows" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_follows_user_id_idx" ON "organization_follows" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_follows_user_organization_unique_idx" ON "organization_follows" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_roles_organization_key_unique_idx" ON "organization_roles" USING btree ("organization_id","key");--> statement-breakpoint
CREATE INDEX "organization_roles_organization_id_idx" ON "organization_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_permissions_key_unique_idx" ON "organization_permissions" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_role_permissions_role_permission_unique_idx" ON "organization_role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_status_idx" ON "organization_members" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_user_organization_unique_idx" ON "organization_members" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_member_roles_member_role_unique_idx" ON "organization_member_roles" USING btree ("member_id","role_id");--> statement-breakpoint
CREATE INDEX "organization_departments_organization_id_idx" ON "organization_departments" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_departments_organization_name_unique_idx" ON "organization_departments" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "organization_teams_organization_id_idx" ON "organization_teams" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_teams_organization_name_unique_idx" ON "organization_teams" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_team_members_team_member_unique_idx" ON "organization_team_members" USING btree ("team_id","member_id");--> statement-breakpoint
CREATE INDEX "organization_locations_organization_id_idx" ON "organization_locations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_posts_organization_status_idx" ON "organization_posts" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "proof_verification_requests_organization_status_idx" ON "proof_verification_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "proof_verification_requests_user_id_idx" ON "proof_verification_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "proof_verification_events_request_created_at_idx" ON "proof_verification_events" USING btree ("request_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_saved_candidates_unique_idx" ON "organization_saved_candidates" USING btree ("organization_id","candidate_id");--> statement-breakpoint
CREATE INDEX "organization_saved_candidates_organization_id_idx" ON "organization_saved_candidates" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_candidate_lists_organization_name_unique_idx" ON "organization_candidate_lists" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_candidate_list_members_list_candidate_unique_idx" ON "organization_candidate_list_members" USING btree ("list_id","candidate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_candidate_pipeline_organization_candidate_unique_idx" ON "organization_candidate_pipeline" USING btree ("organization_id","candidate_id");--> statement-breakpoint
CREATE INDEX "organization_candidate_pipeline_organization_stage_idx" ON "organization_candidate_pipeline" USING btree ("organization_id","stage");--> statement-breakpoint
CREATE INDEX "organization_candidate_stage_history_pipeline_created_at_idx" ON "organization_candidate_stage_history" USING btree ("pipeline_id","created_at");--> statement-breakpoint
CREATE INDEX "organization_jobs_organization_status_idx" ON "organization_jobs" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "organization_audit_logs_organization_created_at_idx" ON "organization_audit_logs" USING btree ("organization_id","created_at");
