import { relations, sql } from "drizzle-orm";
import {
  boolean,
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

export const repositoryVisibilityEnum = pgEnum("repository_visibility", ["public", "private", "unlisted"]);
export const repositoryContributorRoleEnum = pgEnum("repository_contributor_role", ["owner", "maintainer", "contributor", "viewer"]);
export const repositoryActivityTypeEnum = pgEnum("repository_activity_type", [
  "created",
  "updated",
  "starred",
  "unstarred",
  "bookmarked",
  "unbookmarked",
  "watched",
  "unwatched",
  "forked",
  "contributor_added",
  "visibility_changed",
  "file_created",
  "file_updated",
  "file_renamed",
  "file_deleted",
  "folder_created",
  "branch_created",
  "branch_switched",
  "commit_created",
  "release_created",
  "tag_created",
]);
export const repositoryMemberRoleEnum = pgEnum("repository_member_role", ["owner", "maintainer", "contributor", "viewer"]);
export const repositoryFileKindEnum = pgEnum("repository_file_kind", ["text", "image", "binary"]);
export const repositoryActivityScopeEnum = pgEnum("repository_activity_scope", [
  "repository",
  "file",
  "folder",
  "branch",
  "commit",
  "member",
  "release",
  "tag",
]);

export const repositoriesTable = pgTable(
  "repositories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    readme: text("readme"),
    visibility: repositoryVisibilityEnum("visibility").default("private").notNull(),
    sourceUrl: text("source_url"),
    verifiedSkills: jsonb("verified_skills").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    recruiterVisible: boolean("recruiter_visible").default(true).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("repositories_owner_id_idx").on(table.ownerId),
    ownerSlugUniqueIdx: uniqueIndex("repositories_owner_slug_unique_idx").on(table.ownerId, table.slug),
    searchIdx: index("repositories_search_idx").on(table.name, table.slug),
  })
);

export const repositoryTagsTable = pgTable(
  "repository_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdIdx: index("repository_tags_repository_id_idx").on(table.repositoryId),
    repositoryTagUniqueIdx: uniqueIndex("repository_tags_repository_name_unique_idx").on(table.repositoryId, table.name),
  })
);

export const repositoryStarsTable = pgTable(
  "repository_stars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdIdx: index("repository_stars_repository_id_idx").on(table.repositoryId),
    userIdIdx: index("repository_stars_user_id_idx").on(table.userId),
    userRepositoryUniqueIdx: uniqueIndex("repository_stars_user_repository_unique_idx").on(table.userId, table.repositoryId),
  })
);

export const repositoryBookmarksTable = pgTable(
  "repository_bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdIdx: index("repository_bookmarks_repository_id_idx").on(table.repositoryId),
    userIdIdx: index("repository_bookmarks_user_id_idx").on(table.userId),
    userRepositoryUniqueIdx: uniqueIndex("repository_bookmarks_user_repository_unique_idx").on(table.userId, table.repositoryId),
  })
);

export const repositoryWatchersTable = pgTable(
  "repository_watchers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    notifyOnActivity: boolean("notify_on_activity").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdIdx: index("repository_watchers_repository_id_idx").on(table.repositoryId),
    userIdIdx: index("repository_watchers_user_id_idx").on(table.userId),
    userRepositoryUniqueIdx: uniqueIndex("repository_watchers_user_repository_unique_idx").on(table.userId, table.repositoryId),
  })
);

export const repositoryForksTable = pgTable(
  "repository_forks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentRepositoryId: uuid("parent_repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    forkRepositoryId: uuid("fork_repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    forkedBy: uuid("forked_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    forkRepositoryUniqueIdx: uniqueIndex("repository_forks_fork_repository_unique_idx").on(table.forkRepositoryId),
    forkedByIdx: index("repository_forks_forked_by_idx").on(table.forkedBy),
    parentRepositoryIdIdx: index("repository_forks_parent_repository_id_idx").on(table.parentRepositoryId),
  })
);

export const repositoryContributorsTable = pgTable(
  "repository_contributors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    role: repositoryContributorRoleEnum("role").default("contributor").notNull(),
    invitedBy: uuid("invited_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdIdx: index("repository_contributors_repository_id_idx").on(table.repositoryId),
    userIdIdx: index("repository_contributors_user_id_idx").on(table.userId),
    userRepositoryUniqueIdx: uniqueIndex("repository_contributors_user_repository_unique_idx").on(table.userId, table.repositoryId),
  })
);

export const repositoryMembersTable = pgTable(
  "repository_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    role: repositoryMemberRoleEnum("role").default("contributor").notNull(),
    invitedBy: uuid("invited_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdIdx: index("repository_members_repository_id_idx").on(table.repositoryId),
    userIdIdx: index("repository_members_user_id_idx").on(table.userId),
    userRepositoryUniqueIdx: uniqueIndex("repository_members_user_repository_unique_idx").on(table.userId, table.repositoryId),
  })
);

export const repositoryFoldersTable = pgTable(
  "repository_folders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    parentFolderId: uuid("parent_folder_id"),
    name: text("name").notNull(),
    path: text("path").notNull(),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    parentFolderIdIdx: index("repository_folders_parent_folder_id_idx").on(table.parentFolderId),
    pathUniqueIdx: uniqueIndex("repository_folders_repository_path_unique_idx").on(table.repositoryId, table.path),
    repositoryIdIdx: index("repository_folders_repository_id_idx").on(table.repositoryId),
  })
);

export const branchesTable = pgTable(
  "branches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sourceBranchId: uuid("source_branch_id"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    defaultIdx: index("branches_repository_default_idx").on(table.repositoryId, table.isDefault),
    repositoryIdIdx: index("branches_repository_id_idx").on(table.repositoryId),
    repositoryNameUniqueIdx: uniqueIndex("branches_repository_name_unique_idx").on(table.repositoryId, table.name),
  })
);

export const repositoryFilesTable = pgTable(
  "repository_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branchesTable.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id").references(() => repositoryFoldersTable.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    path: text("path").notNull(),
    kind: repositoryFileKindEnum("kind").default("text").notNull(),
    mimeType: text("mime_type"),
    extension: text("extension"),
    storageBucket: text("storage_bucket").default("repository-files").notNull(),
    storagePath: text("storage_path").notNull(),
    sizeBytes: integer("size_bytes").default(0).notNull(),
    createdBy: uuid("created_by").notNull(),
    updatedBy: uuid("updated_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    branchPathUniqueIdx: uniqueIndex("repository_files_branch_path_unique_idx").on(table.branchId, table.path),
    folderIdIdx: index("repository_files_folder_id_idx").on(table.folderId),
    repositoryIdIdx: index("repository_files_repository_id_idx").on(table.repositoryId),
  })
);

export const commitsTable = pgTable(
  "commits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branchesTable.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    branchCreatedAtIdx: index("commits_branch_created_at_idx").on(table.branchId, table.createdAt),
    repositoryCreatedAtIdx: index("commits_repository_created_at_idx").on(table.repositoryId, table.createdAt),
  })
);

export const commitFilesTable = pgTable(
  "commit_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commitId: uuid("commit_id")
      .notNull()
      .references(() => commitsTable.id, { onDelete: "cascade" }),
    repositoryFileId: uuid("repository_file_id").references(() => repositoryFilesTable.id, { onDelete: "set null" }),
    path: text("path").notNull(),
    changeType: text("change_type").notNull(),
    storagePath: text("storage_path"),
    sizeBytes: integer("size_bytes").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    commitIdIdx: index("commit_files_commit_id_idx").on(table.commitId),
    repositoryFileIdIdx: index("commit_files_repository_file_id_idx").on(table.repositoryFileId),
  })
);

export const repositoryActivityTable = pgTable(
  "repository_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").notNull(),
    scope: repositoryActivityScopeEnum("scope").default("repository").notNull(),
    type: repositoryActivityTypeEnum("type").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    actorIdIdx: index("repository_activity_actor_id_idx").on(table.actorId),
    repositoryCreatedAtIdx: index("repository_activity_repository_created_at_idx").on(table.repositoryId, table.createdAt),
  })
);

export const repositoryReleasesTable = pgTable(
  "repository_releases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    tagName: text("tag_name").notNull(),
    name: text("name").notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdIdx: index("repository_releases_repository_id_idx").on(table.repositoryId),
    repositoryTagUniqueIdx: uniqueIndex("repository_releases_repository_tag_unique_idx").on(table.repositoryId, table.tagName),
  })
);

export const repositoryAnalyticsTable = pgTable(
  "repository_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    views: integer("views").default(0).notNull(),
    stars: integer("stars").default(0).notNull(),
    watchers: integer("watchers").default(0).notNull(),
    forks: integer("forks").default(0).notNull(),
    bookmarks: integer("bookmarks").default(0).notNull(),
    contributors: integer("contributors").default(0).notNull(),
    proofSubmissions: integer("proof_submissions").default(0).notNull(),
    trustImpact: integer("trust_impact").default(0).notNull(),
    proofImpact: integer("proof_impact").default(0).notNull(),
    recruiterViews: integer("recruiter_views").default(0).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryIdUniqueIdx: uniqueIndex("repository_analytics_repository_id_unique_idx").on(table.repositoryId),
  })
);

export const repositoryActivityEventsTable = pgTable(
  "repository_activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").notNull(),
    type: repositoryActivityTypeEnum("type").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    repositoryCreatedAtIdx: index("repository_activity_events_repository_created_at_idx").on(table.repositoryId, table.createdAt),
    actorIdIdx: index("repository_activity_events_actor_id_idx").on(table.actorId),
  })
);

export const repositoriesRelations = relations(repositoriesTable, ({ many, one }) => ({
  activityEvents: many(repositoryActivityEventsTable),
  activity: many(repositoryActivityTable),
  analytics: one(repositoryAnalyticsTable),
  branches: many(branchesTable),
  bookmarks: many(repositoryBookmarksTable),
  contributors: many(repositoryContributorsTable),
  files: many(repositoryFilesTable),
  folders: many(repositoryFoldersTable),
  forks: many(repositoryForksTable),
  members: many(repositoryMembersTable),
  releases: many(repositoryReleasesTable),
  stars: many(repositoryStarsTable),
  tags: many(repositoryTagsTable),
  watchers: many(repositoryWatchersTable),
}));

export type Repository = typeof repositoriesTable.$inferSelect;
export type NewRepository = typeof repositoriesTable.$inferInsert;
export type RepositoryTag = typeof repositoryTagsTable.$inferSelect;
export type RepositoryAnalytics = typeof repositoryAnalyticsTable.$inferSelect;
export type RepositoryVisibility = (typeof repositoryVisibilityEnum.enumValues)[number];
export type RepositoryContributorRole = (typeof repositoryContributorRoleEnum.enumValues)[number];
export type RepositoryActivityEvent = typeof repositoryActivityEventsTable.$inferSelect;
export type RepositoryActivityType = (typeof repositoryActivityTypeEnum.enumValues)[number];
export type RepositoryMember = typeof repositoryMembersTable.$inferSelect;
export type RepositoryMemberRole = (typeof repositoryMemberRoleEnum.enumValues)[number];
export type RepositoryFolder = typeof repositoryFoldersTable.$inferSelect;
export type Branch = typeof branchesTable.$inferSelect;
export type RepositoryFile = typeof repositoryFilesTable.$inferSelect;
export type Commit = typeof commitsTable.$inferSelect;
export type CommitFile = typeof commitFilesTable.$inferSelect;
export type RepositoryActivity = typeof repositoryActivityTable.$inferSelect;
export type RepositoryRelease = typeof repositoryReleasesTable.$inferSelect;
