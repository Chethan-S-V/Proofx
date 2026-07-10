import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { organizationTypeValues } from "../../features/organizations/organization.constants";

export const organizationTypeEnum = pgEnum("organization_type", organizationTypeValues);

export const organizationStatusEnum = pgEnum("organization_status", ["draft", "active", "under_review", "verified", "suspended", "archived"]);
export const organizationVerificationStatusEnum = pgEnum("organization_verification_status", ["not_started", "email_pending", "domain_pending", "document_pending", "manual_review", "verified", "rejected"]);
export const organizationFollowPreferenceEnum = pgEnum("organization_follow_preference", ["all_updates", "important_updates", "challenges", "jobs", "proof_activity", "off"]);
export const organizationMembershipStatusEnum = pgEnum("organization_membership_status", ["invited", "requested", "active", "suspended", "left", "removed"]);
export const organizationRoleKeyEnum = pgEnum("organization_role_key", [
  "OWNER",
  "ADMIN",
  "HR_MANAGER",
  "RECRUITER",
  "TEAM_MANAGER",
  "PROOF_VERIFIER",
  "CHALLENGE_MANAGER",
  "CONTENT_MANAGER",
  "ANALYST",
  "MEMBER",
]);
export const organizationPostStatusEnum = pgEnum("organization_post_status", ["draft", "scheduled", "published", "archived"]);
export const organizationPostTypeEnum = pgEnum("organization_post_type", ["text", "image", "video", "document", "announcement", "article", "event_announcement", "job_announcement", "challenge_announcement", "proof_showcase", "member_achievement"]);
export const proofVerificationStatusEnum = pgEnum("proof_verification_status", ["submitted", "under_review", "more_information_required", "verified", "rejected", "revoked", "expired"]);
export const proofVerificationDecisionEnum = pgEnum("proof_verification_decision", ["submitted", "review_started", "more_information_required", "verified", "rejected", "revoked", "expired"]);
export const candidatePipelineStageEnum = pgEnum("candidate_pipeline_stage", ["sourced", "contacted", "interested", "screening", "interview", "technical_evaluation", "offer", "hired", "rejected", "withdrawn"]);
export const organizationJobStatusEnum = pgEnum("organization_job_status", ["draft", "published", "paused", "closed", "archived"]);
export const organizationRemotePolicyEnum = pgEnum("organization_remote_policy", ["onsite", "hybrid", "remote", "flexible"]);
export const organizationEmploymentTypeEnum = pgEnum("organization_employment_type", ["full_time", "part_time", "contract", "internship", "temporary", "volunteer"]);

export const organizationsTable = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdBy: uuid("created_by").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: organizationTypeEnum("type").notNull(),
    industry: text("industry"),
    size: text("size"),
    foundedYear: integer("founded_year"),
    website: text("website"),
    primaryEmail: text("primary_email"),
    phone: text("phone"),
    country: text("country"),
    state: text("state"),
    city: text("city"),
    postalCode: text("postal_code"),
    headquarters: text("headquarters"),
    tagline: text("tagline"),
    description: text("description"),
    specialties: jsonb("specialties").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    technologies: jsonb("technologies").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    services: jsonb("services").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    professionalCategories: jsonb("professional_categories").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    logoUrl: text("logo_url"),
    coverUrl: text("cover_url"),
    socialLinks: jsonb("social_links").$type<Array<{ label: string; url: string }>>().default(sql`'[]'::jsonb`).notNull(),
    careerPageUrl: text("career_page_url"),
    status: organizationStatusEnum("status").default("draft").notNull(),
    verificationStatus: organizationVerificationStatusEnum("verification_status").default("not_started").notNull(),
    onboardingStep: integer("onboarding_step").default(1).notNull(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    allowMessages: boolean("allow_messages").default(true).notNull(),
    publicPhone: boolean("public_phone").default(false).notNull(),
    publicDepartments: boolean("public_departments").default(true).notNull(),
    followerCount: integer("follower_count").default(0).notNull(),
    memberCount: integer("member_count").default(1).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    createdByIdx: index("organizations_created_by_idx").on(table.createdBy),
    searchIdx: index("organizations_search_idx").on(table.name, table.slug, table.industry),
    slugUniqueIdx: uniqueIndex("organizations_slug_unique_idx").on(table.slug),
  }),
);

export const organizationFollowsTable = pgTable(
  "organization_follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    preference: organizationFollowPreferenceEnum("preference").default("important_updates").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdIdx: index("organization_follows_organization_id_idx").on(table.organizationId),
    userIdIdx: index("organization_follows_user_id_idx").on(table.userId),
    userOrganizationUniqueIdx: uniqueIndex("organization_follows_user_organization_unique_idx").on(table.userId, table.organizationId),
  }),
);

export const organizationRolesTable = pgTable(
  "organization_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizationsTable.id, { onDelete: "cascade" }),
    key: organizationRoleKeyEnum("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationKeyUniqueIdx: uniqueIndex("organization_roles_organization_key_unique_idx").on(table.organizationId, table.key),
    organizationIdIdx: index("organization_roles_organization_id_idx").on(table.organizationId),
  }),
);

export const organizationPermissionsTable = pgTable(
  "organization_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    keyUniqueIdx: uniqueIndex("organization_permissions_key_unique_idx").on(table.key),
  }),
);

export const organizationRolePermissionsTable = pgTable(
  "organization_role_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roleId: uuid("role_id").notNull().references(() => organizationRolesTable.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id").notNull().references(() => organizationPermissionsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    rolePermissionUniqueIdx: uniqueIndex("organization_role_permissions_role_permission_unique_idx").on(table.roleId, table.permissionId),
  }),
);

export const organizationMembersTable = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    invitedBy: uuid("invited_by").references(() => usersTable.id, { onDelete: "set null" }),
    jobTitle: text("job_title"),
    departmentId: uuid("department_id"),
    teamId: uuid("team_id"),
    membershipType: text("membership_type"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    publicVisibility: boolean("public_visibility").default(true).notNull(),
    status: organizationMembershipStatusEnum("status").default("requested").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdIdx: index("organization_members_organization_id_idx").on(table.organizationId),
    statusIdx: index("organization_members_status_idx").on(table.organizationId, table.status),
    userIdIdx: index("organization_members_user_id_idx").on(table.userId),
    userOrganizationUniqueIdx: uniqueIndex("organization_members_user_organization_unique_idx").on(table.userId, table.organizationId),
  }),
);

export const organizationMemberRolesTable = pgTable(
  "organization_member_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id").notNull().references(() => organizationMembersTable.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => organizationRolesTable.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    memberRoleUniqueIdx: uniqueIndex("organization_member_roles_member_role_unique_idx").on(table.memberId, table.roleId),
  }),
);

export const organizationDepartmentsTable = pgTable(
  "organization_departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    parentDepartmentId: uuid("parent_department_id"),
    headMemberId: uuid("head_member_id"),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdIdx: index("organization_departments_organization_id_idx").on(table.organizationId),
    organizationNameUniqueIdx: uniqueIndex("organization_departments_organization_name_unique_idx").on(table.organizationId, table.name),
  }),
);

export const organizationTeamsTable = pgTable(
  "organization_teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => organizationDepartmentsTable.id, { onDelete: "set null" }),
    leadMemberId: uuid("lead_member_id"),
    name: text("name").notNull(),
    description: text("description"),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdIdx: index("organization_teams_organization_id_idx").on(table.organizationId),
    organizationNameUniqueIdx: uniqueIndex("organization_teams_organization_name_unique_idx").on(table.organizationId, table.name),
  }),
);

export const organizationTeamMembersTable = pgTable(
  "organization_team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").notNull().references(() => organizationTeamsTable.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => organizationMembersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    teamMemberUniqueIdx: uniqueIndex("organization_team_members_team_member_unique_idx").on(table.teamId, table.memberId),
  }),
);

export const organizationLocationsTable = pgTable(
  "organization_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    country: text("country").notNull(),
    state: text("state"),
    city: text("city"),
    postalCode: text("postal_code"),
    isHeadquarters: boolean("is_headquarters").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationIdIdx: index("organization_locations_organization_id_idx").on(table.organizationId),
  }),
);

export const organizationPostsTable = pgTable(
  "organization_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    type: organizationPostTypeEnum("type").default("text").notNull(),
    status: organizationPostStatusEnum("status").default("draft").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    mediaUrl: text("media_url"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    metrics: jsonb("metrics").$type<Record<string, number>>().default(sql`'{}'::jsonb`).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationStatusIdx: index("organization_posts_organization_status_idx").on(table.organizationId, table.status),
  }),
);

export const proofVerificationRequestsTable = pgTable(
  "proof_verification_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proofId: uuid("proof_id"),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "restrict" }),
    status: proofVerificationStatusEnum("status").default("submitted").notNull(),
    evidence: jsonb("evidence").$type<Array<{ label: string; url?: string; note?: string }>>().default(sql`'[]'::jsonb`).notNull(),
    requestMessage: text("request_message"),
    reviewerMemberId: uuid("reviewer_member_id"),
    privateReviewNote: text("private_review_note"),
    publicVerificationNote: text("public_verification_note"),
    evidenceSnapshot: jsonb("evidence_snapshot").$type<Record<string, unknown> | null>(),
    version: integer("version").default(1).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationStatusIdx: index("proof_verification_requests_organization_status_idx").on(table.organizationId, table.status),
    userIdIdx: index("proof_verification_requests_user_id_idx").on(table.userId),
  }),
);

export const proofVerificationEventsTable = pgTable(
  "proof_verification_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id").notNull().references(() => proofVerificationRequestsTable.id, { onDelete: "restrict" }),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "restrict" }),
    actorId: uuid("actor_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    decision: proofVerificationDecisionEnum("decision").notNull(),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    requestCreatedAtIdx: index("proof_verification_events_request_created_at_idx").on(table.requestId, table.createdAt),
  }),
);

export const organizationSavedCandidatesTable = pgTable(
  "organization_saved_candidates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    savedBy: uuid("saved_by").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    candidateUniqueIdx: uniqueIndex("organization_saved_candidates_unique_idx").on(table.organizationId, table.candidateId),
    organizationIdIdx: index("organization_saved_candidates_organization_id_idx").on(table.organizationId),
  }),
);

export const organizationCandidateListsTable = pgTable(
  "organization_candidate_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationNameUniqueIdx: uniqueIndex("organization_candidate_lists_organization_name_unique_idx").on(table.organizationId, table.name),
  }),
);

export const organizationCandidateListMembersTable = pgTable(
  "organization_candidate_list_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id").notNull().references(() => organizationCandidateListsTable.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    addedBy: uuid("added_by").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    listCandidateUniqueIdx: uniqueIndex("organization_candidate_list_members_list_candidate_unique_idx").on(table.listId, table.candidateId),
  }),
);

export const organizationCandidatePipelineTable = pgTable(
  "organization_candidate_pipeline",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    jobId: uuid("job_id"),
    stage: candidatePipelineStageEnum("stage").default("sourced").notNull(),
    assignedRecruiterId: uuid("assigned_recruiter_id").references(() => usersTable.id, { onDelete: "set null" }),
    internalNote: text("internal_note"),
    followUpAt: timestamp("follow_up_at", { withTimezone: true }),
    createdBy: uuid("created_by").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationCandidateUniqueIdx: uniqueIndex("organization_candidate_pipeline_organization_candidate_unique_idx").on(table.organizationId, table.candidateId),
    organizationStageIdx: index("organization_candidate_pipeline_organization_stage_idx").on(table.organizationId, table.stage),
  }),
);

export const organizationCandidateStageHistoryTable = pgTable(
  "organization_candidate_stage_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pipelineId: uuid("pipeline_id").notNull().references(() => organizationCandidatePipelineTable.id, { onDelete: "cascade" }),
    fromStage: candidatePipelineStageEnum("from_stage"),
    toStage: candidatePipelineStageEnum("to_stage").notNull(),
    actorId: uuid("actor_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pipelineCreatedAtIdx: index("organization_candidate_stage_history_pipeline_created_at_idx").on(table.pipelineId, table.createdAt),
  }),
);

export const organizationJobsTable = pgTable(
  "organization_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => organizationDepartmentsTable.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    location: text("location"),
    remotePolicy: organizationRemotePolicyEnum("remote_policy").default("onsite").notNull(),
    employmentType: organizationEmploymentTypeEnum("employment_type").default("full_time").notNull(),
    description: text("description"),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    skills: jsonb("skills").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    experienceLevel: text("experience_level"),
    salaryVisible: boolean("salary_visible").default(false).notNull(),
    salaryRange: text("salary_range"),
    applicationDeadline: date("application_deadline"),
    status: organizationJobStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationStatusIdx: index("organization_jobs_organization_status_idx").on(table.organizationId, table.status),
  }),
);

export const organizationAuditLogsTable = pgTable(
  "organization_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "restrict" }),
    actorId: uuid("actor_id").references(() => usersTable.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: uuid("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    organizationCreatedAtIdx: index("organization_audit_logs_organization_created_at_idx").on(table.organizationId, table.createdAt),
  }),
);

export const organizationsRelations = relations(organizationsTable, ({ many, one }) => ({
  auditLogs: many(organizationAuditLogsTable),
  createdByUser: one(usersTable, { fields: [organizationsTable.createdBy], references: [usersTable.id] }),
  departments: many(organizationDepartmentsTable),
  follows: many(organizationFollowsTable),
  jobs: many(organizationJobsTable),
  members: many(organizationMembersTable),
  posts: many(organizationPostsTable),
  proofVerificationRequests: many(proofVerificationRequestsTable),
  teams: many(organizationTeamsTable),
}));

export type Organization = typeof organizationsTable.$inferSelect;
export type NewOrganization = typeof organizationsTable.$inferInsert;
export type OrganizationMember = typeof organizationMembersTable.$inferSelect;
export type OrganizationRole = typeof organizationRolesTable.$inferSelect;
export type OrganizationRoleKey = (typeof organizationRoleKeyEnum.enumValues)[number];
export type OrganizationPermission = typeof organizationPermissionsTable.$inferSelect;
export type OrganizationDepartment = typeof organizationDepartmentsTable.$inferSelect;
export type OrganizationTeam = typeof organizationTeamsTable.$inferSelect;
export type OrganizationJob = typeof organizationJobsTable.$inferSelect;
export type OrganizationPost = typeof organizationPostsTable.$inferSelect;
export type ProofVerificationRequest = typeof proofVerificationRequestsTable.$inferSelect;
export type CandidatePipelineStage = (typeof candidatePipelineStageEnum.enumValues)[number];
