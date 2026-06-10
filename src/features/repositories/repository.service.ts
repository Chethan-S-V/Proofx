import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  branchesTable,
  commitFilesTable,
  commitsTable,
  db,
  repositoriesTable,
  repositoryActivityEventsTable,
  repositoryActivityTable,
  repositoryAnalyticsTable,
  repositoryBookmarksTable,
  repositoryContributorsTable,
  repositoryFilesTable,
  repositoryFoldersTable,
  repositoryForksTable,
  repositoryMembersTable,
  repositoryReleasesTable,
  repositoryStarsTable,
  repositoryTagsTable,
  repositoryWatchersTable,
  type Branch,
  type Commit,
  type Repository,
  type RepositoryActivity,
  type RepositoryActivityEvent,
  type RepositoryActivityType,
  type RepositoryFile,
  type RepositoryFolder,
  type RepositoryMemberRole,
} from "../../db";
import { readStorageText, writeStorageFile } from "../../lib/storage/local-storage";
import {
  repositoryBranchSchema,
  repositoryContributorSchema,
  repositoryCreateSchema,
  repositoryFileCreateSchema,
  repositoryFileDeleteSchema,
  repositoryFileRenameSchema,
  repositoryFileSaveSchema,
  repositoryFolderSchema,
  repositoryIdSchema,
  repositoryMemberSchema,
  repositorySearchSchema,
  repositoryUpdateSchema,
  type RepositoryBranchInput,
  type RepositoryContributorInput,
  type RepositoryCreateInput,
  type RepositoryFileCreateInput,
  type RepositoryFileDeleteInput,
  type RepositoryFileRenameInput,
  type RepositoryFileSaveInput,
  type RepositoryFolderInput,
  type RepositoryMemberInput,
  type RepositorySearchInput,
  type RepositoryUpdateInput,
} from "./repository.schemas";

const REPOSITORY_FILE_BUCKET = "repository-files";
const FREE_REPOSITORY_LIMIT = 3;

type RepositoryAnalyticsModel = {
  bookmarks: number;
  contributors: number;
  forks: number;
  proofImpact: number;
  proofScore: number;
  proofSubmissions: number;
  recruiterViews: number;
  stars: number;
  trustImpact: number;
  views: number;
  watchers: number;
};

export type RepositoryMemberModel = {
  createdAt: Date;
  role: RepositoryMemberRole;
  userId: string;
};

export type RepositoryCardModel = Repository & {
  analytics: RepositoryAnalyticsModel;
  activity: RepositoryActivityEvent[];
  contributors: RepositoryMemberModel[];
  isBookmarked: boolean;
  isStarred: boolean;
  isWatching: boolean;
  tags: string[];
};

export type RepositoryGitHostModel = RepositoryCardModel & {
  branches: Branch[];
  commits: Commit[];
  currentBranch: Branch;
  files: RepositoryFile[];
  folders: RepositoryFolder[];
  members: RepositoryMemberModel[];
  releases: Array<{ createdAt: Date; id: string; name: string; tagName: string }>;
  repositoryActivity: RepositoryActivity[];
  readmeFile: RepositoryFile | null;
  selectedFile: RepositoryFile | null;
  selectedFileContent: string;
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 72);
}

function normalizePath(path: string) {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

function getFileName(path: string) {
  const parts = normalizePath(path).split("/");
  return parts[parts.length - 1] || "untitled";
}

function getExtension(path: string) {
  const fileName = getFileName(path);
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? null : null;
}

function getFolderPath(path: string) {
  const parts = normalizePath(path).split("/");
  parts.pop();
  return parts.join("/");
}

function getFileKind(mimeType?: string | null) {
  if (mimeType?.startsWith("image/")) {
    return "image" as const;
  }

  if (mimeType && !mimeType.startsWith("text/") && mimeType !== "application/json") {
    return "binary" as const;
  }

  return "text" as const;
}

function getStoragePath(repositoryId: string, branchId: string, commitId: string, path: string) {
  return `${repositoryId}/${branchId}/commits/${commitId}/${normalizePath(path)}`;
}

function toArray(value: string[] | string) {
  return Array.isArray(value)
    ? value
    : value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

async function uploadRepositoryContent(storagePath: string, content: Blob | string, contentType = "text/plain") {
  await writeStorageFile(`${REPOSITORY_FILE_BUCKET}/${storagePath}`, content);
}

async function downloadRepositoryText(storagePath: string) {
  return readStorageText(`${REPOSITORY_FILE_BUCKET}/${storagePath}`);
}

async function createRepositoryActivity(
  repositoryId: string,
  actorId: string,
  type: RepositoryActivityType,
  message: string,
  metadata?: Record<string, unknown>,
  scope: "repository" | "file" | "folder" | "branch" | "commit" | "member" | "release" | "tag" = "repository"
) {
  await db.insert(repositoryActivityTable).values({
    actorId,
    message,
    metadata: metadata ?? null,
    repositoryId,
    scope,
    type,
  });

  await db.insert(repositoryActivityEventsTable).values({
    actorId,
    message,
    metadata: metadata ?? null,
    repositoryId,
    type,
  });
}

async function createUniqueSlug(ownerId: string, name: string) {
  const baseSlug = toSlug(name) || "repository";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const [existingRepository] = await db
      .select({ id: repositoriesTable.id })
      .from(repositoriesTable)
      .where(and(eq(repositoriesTable.ownerId, ownerId), eq(repositoriesTable.slug, candidate)))
      .limit(1);

    if (!existingRepository) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function replaceRepositoryTags(repositoryId: string, tags: string[] | string) {
  const normalizedTags = toArray(tags)
    .map((tag) => tag.toLowerCase())
    .slice(0, 8);

  await db.delete(repositoryTagsTable).where(eq(repositoryTagsTable.repositoryId, repositoryId));

  if (normalizedTags.length > 0) {
    await db.insert(repositoryTagsTable).values(normalizedTags.map((name) => ({ name, repositoryId }))).onConflictDoNothing();
  }
}

async function ensureRepositoryOwner(repositoryId: string, userId: string) {
  const [repository] = await db
    .select()
    .from(repositoriesTable)
    .where(and(eq(repositoriesTable.id, repositoryId), eq(repositoriesTable.ownerId, userId)))
    .limit(1);

  return repository ?? null;
}

async function ensureRepositoryWriteAccess(repositoryId: string, userId: string) {
  const [repository] = await db.select().from(repositoriesTable).where(eq(repositoriesTable.id, repositoryId)).limit(1);

  if (!repository) {
    return null;
  }

  if (repository.ownerId === userId) {
    return repository;
  }

  const [member] = await db
    .select()
    .from(repositoryMembersTable)
    .where(and(eq(repositoryMembersTable.repositoryId, repositoryId), eq(repositoryMembersTable.userId, userId)))
    .limit(1);

  if (member && ["owner", "maintainer", "contributor"].includes(member.role)) {
    return repository;
  }

  return null;
}

async function ensureDefaultBranch(repositoryId: string, userId: string) {
  const [existingBranch] = await db
    .select()
    .from(branchesTable)
    .where(and(eq(branchesTable.repositoryId, repositoryId), eq(branchesTable.isDefault, true)))
    .limit(1);

  if (existingBranch) {
    return existingBranch;
  }

  const [branch] = await db
    .insert(branchesTable)
    .values({ createdBy: userId, isDefault: true, name: "main", repositoryId })
    .returning();

  return branch;
}

async function getBranchOrDefault(repositoryId: string, userId: string, branchName?: string) {
  if (branchName) {
    const [branch] = await db
      .select()
      .from(branchesTable)
      .where(and(eq(branchesTable.repositoryId, repositoryId), eq(branchesTable.name, branchName)))
      .limit(1);

    if (branch) {
      return branch;
    }
  }

  return ensureDefaultBranch(repositoryId, userId);
}

async function ensureFolderPath(repositoryId: string, path: string, userId: string) {
  const normalizedPath = normalizePath(path);

  if (!normalizedPath) {
    return null;
  }

  const parts = normalizedPath.split("/");
  let parentFolderId: string | null = null;
  let currentPath = "";
  let folder: RepositoryFolder | null = null;

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const [existingFolder] = await db
      .select()
      .from(repositoryFoldersTable)
      .where(and(eq(repositoryFoldersTable.repositoryId, repositoryId), eq(repositoryFoldersTable.path, currentPath)))
      .limit(1);

    if (existingFolder) {
      parentFolderId = existingFolder.id;
      folder = existingFolder;
      continue;
    }

    const createdFolders: RepositoryFolder[] = await db
      .insert(repositoryFoldersTable)
      .values({
        createdBy: userId,
        name: part,
        parentFolderId,
        path: currentPath,
        repositoryId,
      })
      .returning();
    const [createdFolder] = createdFolders;

    await createRepositoryActivity(repositoryId, userId, "folder_created", `Folder ${currentPath} created`, { path: currentPath }, "folder");
    parentFolderId = createdFolder.id;
    folder = createdFolder;
  }

  return folder;
}

async function createCommitForFile(
  repositoryId: string,
  branchId: string,
  userId: string,
  message: string,
  path: string,
  changeType: "created" | "updated" | "renamed" | "deleted",
  repositoryFileId?: string | null,
  storagePath?: string | null,
  sizeBytes = 0
) {
  const [commit] = await db
    .insert(commitsTable)
    .values({
      authorId: userId,
      branchId,
      message,
      metadata: { path },
      repositoryId,
    })
    .returning();

  await db.insert(commitFilesTable).values({
    changeType,
    commitId: commit.id,
    path,
    repositoryFileId: repositoryFileId ?? null,
    sizeBytes,
    storagePath: storagePath ?? null,
  });

  await createRepositoryActivity(repositoryId, userId, "commit_created", message, { branchId, commitId: commit.id, path }, "commit");

  return commit;
}

export async function listRepositoryContributors(repositoryId: string) {
  const members = await db
    .select({
      createdAt: repositoryMembersTable.createdAt,
      role: repositoryMembersTable.role,
      userId: repositoryMembersTable.userId,
    })
    .from(repositoryMembersTable)
    .where(eq(repositoryMembersTable.repositoryId, repositoryId));

  if (members.length > 0) {
    return members;
  }

  return db
    .select({
      createdAt: repositoryContributorsTable.createdAt,
      role: repositoryContributorsTable.role,
      userId: repositoryContributorsTable.userId,
    })
    .from(repositoryContributorsTable)
    .where(eq(repositoryContributorsTable.repositoryId, repositoryId));
}

export async function listRepositoryMembers(repositoryId: string) {
  return listRepositoryContributors(repositoryId);
}

export async function listRepositoryActivity(repositoryId: string, limit = 12) {
  return db
    .select()
    .from(repositoryActivityEventsTable)
    .where(eq(repositoryActivityEventsTable.repositoryId, repositoryId))
    .orderBy(desc(repositoryActivityEventsTable.createdAt))
    .limit(limit);
}

export async function listGitRepositoryActivity(repositoryId: string, limit = 12) {
  return db
    .select()
    .from(repositoryActivityTable)
    .where(eq(repositoryActivityTable.repositoryId, repositoryId))
    .orderBy(desc(repositoryActivityTable.createdAt))
    .limit(limit);
}

export async function createRepository(ownerId: string, input: RepositoryCreateInput) {
  const parsed = repositoryCreateSchema.parse(input);
  const ownedRepositories = await db
    .select({ id: repositoriesTable.id })
    .from(repositoriesTable)
    .where(and(eq(repositoriesTable.ownerId, ownerId), eq(repositoriesTable.isArchived, false)));

  if (ownedRepositories.length >= FREE_REPOSITORY_LIMIT) {
    throw new Error("Free ProofX accounts can create up to 3 repositories. Upgrade to ProofX Premium to create more repositories.");
  }

  const now = new Date();
  const slug = await createUniqueSlug(ownerId, parsed.name);

  const [repository] = await db
    .insert(repositoriesTable)
    .values({
      description: parsed.description || null,
      name: parsed.name,
      ownerId,
      readme: parsed.readme || null,
      recruiterVisible: parsed.recruiterVisible,
      slug,
      sourceUrl: parsed.sourceUrl || null,
      updatedAt: now,
      verifiedSkills: parsed.verifiedSkills,
      visibility: parsed.visibility,
    })
    .returning();

  await db.insert(repositoryAnalyticsTable).values({ repositoryId: repository.id }).onConflictDoNothing();
  await db.insert(repositoryMembersTable).values({ repositoryId: repository.id, role: "owner", userId: ownerId }).onConflictDoNothing();
  await db.insert(repositoryContributorsTable).values({ repositoryId: repository.id, role: "owner", userId: ownerId }).onConflictDoNothing();
  await replaceRepositoryTags(repository.id, parsed.tags);
  const branch = await ensureDefaultBranch(repository.id, ownerId);
  await createRepositoryActivity(repository.id, ownerId, "created", "Repository created");

  if (parsed.readme) {
    await createRepositoryFile(ownerId, {
      branchId: branch.id,
      content: parsed.readme,
      message: "Create README",
      path: "README.md",
      repositoryId: repository.id,
    });
  }

  return repository;
}

export async function updateRepository(ownerId: string, input: RepositoryUpdateInput) {
  const parsed = repositoryUpdateSchema.parse(input);
  const repository = await ensureRepositoryOwner(parsed.id, ownerId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const [updatedRepository] = await db
    .update(repositoriesTable)
    .set({
      description: parsed.description || null,
      name: parsed.name,
      readme: parsed.readme || null,
      recruiterVisible: parsed.recruiterVisible,
      slug: repository.name === parsed.name ? repository.slug : await createUniqueSlug(ownerId, parsed.name),
      sourceUrl: parsed.sourceUrl || null,
      updatedAt: new Date(),
      verifiedSkills: parsed.verifiedSkills,
      visibility: parsed.visibility,
    })
    .where(and(eq(repositoriesTable.id, parsed.id), eq(repositoriesTable.ownerId, ownerId)))
    .returning();

  await replaceRepositoryTags(updatedRepository.id, parsed.tags);
  await createRepositoryActivity(updatedRepository.id, ownerId, "updated", "Repository settings updated");

  return updatedRepository;
}

export async function deleteRepository(ownerId: string, repositoryId: string) {
  const parsed = repositoryIdSchema.parse({ id: repositoryId });
  await db.delete(repositoriesTable).where(and(eq(repositoriesTable.id, parsed.id), eq(repositoriesTable.ownerId, ownerId)));
}

export async function setRepositoryVisibility(ownerId: string, repositoryId: string, visibility: RepositoryCreateInput["visibility"]) {
  const parsed = repositoryIdSchema.parse({ id: repositoryId });
  const [repository] = await db
    .update(repositoriesTable)
    .set({ updatedAt: new Date(), visibility })
    .where(and(eq(repositoriesTable.id, parsed.id), eq(repositoriesTable.ownerId, ownerId)))
    .returning();

  if (repository) {
    await createRepositoryActivity(repository.id, ownerId, "visibility_changed", `Visibility changed to ${visibility}`);
  }

  return repository ?? null;
}

export async function addRepositoryMember(ownerId: string, input: RepositoryMemberInput) {
  const parsed = repositoryMemberSchema.parse(input);
  const repository = await ensureRepositoryOwner(parsed.repositoryId, ownerId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  await db
    .insert(repositoryMembersTable)
    .values({
      invitedBy: ownerId,
      repositoryId: parsed.repositoryId,
      role: parsed.role,
      userId: parsed.userId,
    })
    .onConflictDoUpdate({
      target: [repositoryMembersTable.userId, repositoryMembersTable.repositoryId],
      set: {
        role: parsed.role,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(repositoryContributorsTable)
    .values({
      invitedBy: ownerId,
      repositoryId: parsed.repositoryId,
      role: parsed.role,
      userId: parsed.userId,
    })
    .onConflictDoUpdate({
      target: [repositoryContributorsTable.userId, repositoryContributorsTable.repositoryId],
      set: {
        role: parsed.role,
        updatedAt: new Date(),
      },
    });

  await createRepositoryActivity(parsed.repositoryId, ownerId, "contributor_added", `Member added as ${parsed.role}`, {
    memberId: parsed.userId,
    role: parsed.role,
  }, "member");
}

export async function addRepositoryContributor(ownerId: string, input: RepositoryContributorInput) {
  const parsed = repositoryContributorSchema.parse(input);
  await addRepositoryMember(ownerId, parsed);
}

export async function createRepositoryBranch(userId: string, input: RepositoryBranchInput) {
  const parsed = repositoryBranchSchema.parse(input);
  const repository = await ensureRepositoryWriteAccess(parsed.repositoryId, userId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const [branch] = await db
    .insert(branchesTable)
    .values({
      createdBy: userId,
      name: parsed.name,
      repositoryId: parsed.repositoryId,
      sourceBranchId: parsed.sourceBranchId ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (branch) {
    await createRepositoryActivity(repository.id, userId, "branch_created", `Branch ${branch.name} created`, { branchId: branch.id }, "branch");
  }

  return branch ?? null;
}

export async function createRepositoryFolder(userId: string, input: RepositoryFolderInput) {
  const parsed = repositoryFolderSchema.parse(input);
  const repository = await ensureRepositoryWriteAccess(parsed.repositoryId, userId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  return ensureFolderPath(repository.id, parsed.name, userId);
}

export async function createRepositoryFile(userId: string, input: RepositoryFileCreateInput) {
  const parsed = repositoryFileCreateSchema.parse(input);
  const repository = await ensureRepositoryWriteAccess(parsed.repositoryId, userId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const normalizedPath = normalizePath(parsed.path);
  const branch = await getBranchOrDefault(repository.id, userId);
  const branchId = parsed.branchId || branch.id;
  const folder = await ensureFolderPath(repository.id, getFolderPath(normalizedPath), userId);
  const content = parsed.content ?? "";
  const sizeBytes = new TextEncoder().encode(content).byteLength;
  const commit = await createCommitForFile(
    repository.id,
    branchId,
    userId,
    parsed.message || `Create ${normalizedPath}`,
    normalizedPath,
    "created",
    null,
    null,
    sizeBytes
  );
  const storagePath = getStoragePath(repository.id, branchId, commit.id, normalizedPath);

  await uploadRepositoryContent(storagePath, content);

  const [file] = await db
    .insert(repositoryFilesTable)
    .values({
      branchId,
      createdBy: userId,
      extension: getExtension(normalizedPath),
      folderId: folder?.id ?? null,
      kind: "text",
      mimeType: "text/plain",
      name: getFileName(normalizedPath),
      path: normalizedPath,
      repositoryId: repository.id,
      sizeBytes,
      storagePath,
      updatedBy: userId,
    })
    .onConflictDoUpdate({
      target: [repositoryFilesTable.branchId, repositoryFilesTable.path],
      set: {
        folderId: folder?.id ?? null,
        sizeBytes,
        storagePath,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    })
    .returning();

  await db.update(commitFilesTable).set({ repositoryFileId: file.id, storagePath }).where(eq(commitFilesTable.commitId, commit.id));
  await createRepositoryActivity(repository.id, userId, "file_created", `File ${normalizedPath} created`, { fileId: file.id, path: normalizedPath }, "file");

  return file;
}

export async function saveRepositoryFile(userId: string, input: RepositoryFileSaveInput) {
  const parsed = repositoryFileSaveSchema.parse(input);
  const repository = await ensureRepositoryWriteAccess(parsed.repositoryId, userId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const [existingFile] = await db.select().from(repositoryFilesTable).where(eq(repositoryFilesTable.id, parsed.fileId)).limit(1);

  if (!existingFile) {
    throw new Error("File not found");
  }

  const content = parsed.content ?? "";
  const sizeBytes = new TextEncoder().encode(content).byteLength;
  const commit = await createCommitForFile(
    repository.id,
    existingFile.branchId,
    userId,
    parsed.message || `Update ${existingFile.path}`,
    existingFile.path,
    "updated",
    existingFile.id,
    null,
    sizeBytes
  );
  const storagePath = getStoragePath(repository.id, existingFile.branchId, commit.id, existingFile.path);

  await uploadRepositoryContent(storagePath, content, existingFile.mimeType ?? "text/plain");

  const [file] = await db
    .update(repositoryFilesTable)
    .set({
      sizeBytes,
      storagePath,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(repositoryFilesTable.id, existingFile.id))
    .returning();

  await db.update(commitFilesTable).set({ storagePath }).where(eq(commitFilesTable.commitId, commit.id));
  await createRepositoryActivity(repository.id, userId, "file_updated", `File ${existingFile.path} updated`, { fileId: file.id }, "file");

  return file;
}

export async function renameRepositoryFile(userId: string, input: RepositoryFileRenameInput) {
  const parsed = repositoryFileRenameSchema.parse(input);
  const repository = await ensureRepositoryWriteAccess(parsed.repositoryId, userId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const [existingFile] = await db.select().from(repositoryFilesTable).where(eq(repositoryFilesTable.id, parsed.fileId)).limit(1);

  if (!existingFile) {
    throw new Error("File not found");
  }

  const newPath = normalizePath(parsed.path);
  const folder = await ensureFolderPath(repository.id, getFolderPath(newPath), userId);
  await createCommitForFile(
    repository.id,
    existingFile.branchId,
    userId,
    parsed.message || `Rename ${existingFile.path} to ${newPath}`,
    newPath,
    "renamed",
    existingFile.id,
    existingFile.storagePath,
    existingFile.sizeBytes
  );

  const [file] = await db
    .update(repositoryFilesTable)
    .set({
      extension: getExtension(newPath),
      folderId: folder?.id ?? null,
      name: getFileName(newPath),
      path: newPath,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(repositoryFilesTable.id, existingFile.id))
    .returning();

  await createRepositoryActivity(repository.id, userId, "file_renamed", `File renamed to ${newPath}`, { fileId: file.id }, "file");

  return file;
}

export async function deleteRepositoryFile(userId: string, input: RepositoryFileDeleteInput) {
  const parsed = repositoryFileDeleteSchema.parse(input);
  const repository = await ensureRepositoryWriteAccess(parsed.repositoryId, userId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const [existingFile] = await db.select().from(repositoryFilesTable).where(eq(repositoryFilesTable.id, parsed.fileId)).limit(1);

  if (!existingFile) {
    throw new Error("File not found");
  }

  await createCommitForFile(
    repository.id,
    existingFile.branchId,
    userId,
    parsed.message || `Delete ${existingFile.path}`,
    existingFile.path,
    "deleted",
    existingFile.id,
    existingFile.storagePath,
    existingFile.sizeBytes
  );
  await db.delete(repositoryFilesTable).where(eq(repositoryFilesTable.id, existingFile.id));
  await createRepositoryActivity(repository.id, userId, "file_deleted", `File ${existingFile.path} deleted`, { path: existingFile.path }, "file");
}

export async function uploadRepositoryFile(userId: string, input: RepositoryFileCreateInput, file: File) {
  const parsed = repositoryFileCreateSchema.parse(input);
  const repository = await ensureRepositoryWriteAccess(parsed.repositoryId, userId);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const basePath = normalizePath(parsed.path || file.name);
  const branchId = parsed.branchId;
  const folder = await ensureFolderPath(repository.id, getFolderPath(basePath), userId);
  const commit = await createCommitForFile(
    repository.id,
    branchId,
    userId,
    parsed.message || `Upload ${basePath}`,
    basePath,
    "created",
    null,
    null,
    file.size
  );
  const storagePath = getStoragePath(repository.id, branchId, commit.id, basePath);

  await uploadRepositoryContent(storagePath, file, file.type || "application/octet-stream");

  const [repositoryFile] = await db
    .insert(repositoryFilesTable)
    .values({
      branchId,
      createdBy: userId,
      extension: getExtension(basePath),
      folderId: folder?.id ?? null,
      kind: getFileKind(file.type),
      mimeType: file.type || "application/octet-stream",
      name: getFileName(basePath),
      path: basePath,
      repositoryId: repository.id,
      sizeBytes: file.size,
      storagePath,
      updatedBy: userId,
    })
    .onConflictDoUpdate({
      target: [repositoryFilesTable.branchId, repositoryFilesTable.path],
      set: {
        kind: getFileKind(file.type),
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storagePath,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    })
    .returning();

  await db.update(commitFilesTable).set({ repositoryFileId: repositoryFile.id, storagePath }).where(eq(commitFilesTable.commitId, commit.id));
  await createRepositoryActivity(repository.id, userId, "file_created", `File ${basePath} uploaded`, { fileId: repositoryFile.id }, "file");

  return repositoryFile;
}

export async function toggleRepositoryStar(userId: string, repositoryId: string) {
  const parsed = repositoryIdSchema.parse({ id: repositoryId });
  const [existingStar] = await db
    .select()
    .from(repositoryStarsTable)
    .where(and(eq(repositoryStarsTable.repositoryId, parsed.id), eq(repositoryStarsTable.userId, userId)))
    .limit(1);

  if (existingStar) {
    await db.delete(repositoryStarsTable).where(eq(repositoryStarsTable.id, existingStar.id));
    await createRepositoryActivity(parsed.id, userId, "unstarred", "Repository unstarred");
    return false;
  }

  await db.insert(repositoryStarsTable).values({ repositoryId: parsed.id, userId }).onConflictDoNothing();
  await createRepositoryActivity(parsed.id, userId, "starred", "Repository starred");
  return true;
}

export async function toggleRepositoryBookmark(userId: string, repositoryId: string) {
  const parsed = repositoryIdSchema.parse({ id: repositoryId });
  const [existingBookmark] = await db
    .select()
    .from(repositoryBookmarksTable)
    .where(and(eq(repositoryBookmarksTable.repositoryId, parsed.id), eq(repositoryBookmarksTable.userId, userId)))
    .limit(1);

  if (existingBookmark) {
    await db.delete(repositoryBookmarksTable).where(eq(repositoryBookmarksTable.id, existingBookmark.id));
    await createRepositoryActivity(parsed.id, userId, "unbookmarked", "Repository removed from bookmarks");
    return false;
  }

  await db.insert(repositoryBookmarksTable).values({ repositoryId: parsed.id, userId }).onConflictDoNothing();
  await createRepositoryActivity(parsed.id, userId, "bookmarked", "Repository bookmarked");
  return true;
}

export async function toggleRepositoryWatch(userId: string, repositoryId: string) {
  const parsed = repositoryIdSchema.parse({ id: repositoryId });
  const [existingWatcher] = await db
    .select()
    .from(repositoryWatchersTable)
    .where(and(eq(repositoryWatchersTable.repositoryId, parsed.id), eq(repositoryWatchersTable.userId, userId)))
    .limit(1);

  if (existingWatcher) {
    await db.delete(repositoryWatchersTable).where(eq(repositoryWatchersTable.id, existingWatcher.id));
    await createRepositoryActivity(parsed.id, userId, "unwatched", "Repository unwatched");
    return false;
  }

  await db.insert(repositoryWatchersTable).values({ repositoryId: parsed.id, userId }).onConflictDoNothing();
  await createRepositoryActivity(parsed.id, userId, "watched", "Repository watched");
  return true;
}

export async function forkRepository(userId: string, repositoryId: string) {
  const sourceRepository = await getRepositoryById(repositoryId, userId);

  if (!sourceRepository) {
    throw new Error("Repository not found");
  }

  const sourceTags = await db.select().from(repositoryTagsTable).where(eq(repositoryTagsTable.repositoryId, sourceRepository.id));
  const forkName = `${sourceRepository.name}-fork`;
  const [fork] = await db
    .insert(repositoriesTable)
    .values({
      description: sourceRepository.description,
      name: forkName,
      ownerId: userId,
      readme: sourceRepository.readme,
      recruiterVisible: sourceRepository.recruiterVisible,
      slug: await createUniqueSlug(userId, forkName),
      sourceUrl: sourceRepository.sourceUrl,
      updatedAt: new Date(),
      verifiedSkills: sourceRepository.verifiedSkills,
      visibility: "private",
    })
    .returning();

  await db.insert(repositoryAnalyticsTable).values({ repositoryId: fork.id }).onConflictDoNothing();
  await db.insert(repositoryMembersTable).values({ repositoryId: fork.id, role: "owner", userId }).onConflictDoNothing();
  await db.insert(repositoryContributorsTable).values({ repositoryId: fork.id, role: "owner", userId }).onConflictDoNothing();
  await replaceRepositoryTags(
    fork.id,
    sourceTags.map((tag) => tag.name)
  );
  await db
    .insert(repositoryForksTable)
    .values({ forkRepositoryId: fork.id, forkedBy: userId, parentRepositoryId: sourceRepository.id })
    .onConflictDoNothing();
  await ensureDefaultBranch(fork.id, userId);
  await createRepositoryActivity(sourceRepository.id, userId, "forked", `Repository forked into ${fork.name}`, { forkRepositoryId: fork.id });
  await createRepositoryActivity(fork.id, userId, "forked", `Forked from ${sourceRepository.name}`, { parentRepositoryId: sourceRepository.id });

  return fork;
}

export async function getRepositoryById(repositoryId: string, userId: string) {
  const parsed = repositoryIdSchema.parse({ id: repositoryId });
  const [repository] = await db.select().from(repositoriesTable).where(eq(repositoriesTable.id, parsed.id)).limit(1);

  if (!repository) {
    return null;
  }

  if (repository.visibility === "private" && repository.ownerId !== userId) {
    const [member] = await db
      .select({ id: repositoryMembersTable.id })
      .from(repositoryMembersTable)
      .where(and(eq(repositoryMembersTable.repositoryId, repository.id), eq(repositoryMembersTable.userId, userId)))
      .limit(1);

    if (!member) {
      return null;
    }
  }

  return repository;
}

export async function searchRepositories(userId: string, input: RepositorySearchInput = {}) {
  const parsed = repositorySearchSchema.parse(input);
  const filters = [eq(repositoriesTable.isArchived, false)];

  if (parsed.visibility) {
    filters.push(eq(repositoriesTable.visibility, parsed.visibility));
  }

  const query = parsed.query?.trim();
  const whereClause = query
    ? and(
        ...filters,
        or(
          ilike(repositoriesTable.name, `%${query}%`),
          ilike(repositoriesTable.slug, `%${query}%`),
          ilike(repositoriesTable.description, `%${query}%`)
        )
      )
    : and(...filters);

  const repositories = await db.select().from(repositoriesTable).where(whereClause).orderBy(desc(repositoriesTable.updatedAt));
  const visibleRepositories = repositories.filter((repository) => repository.visibility !== "private" || repository.ownerId === userId);
  const hydrated = await Promise.all(visibleRepositories.map((repository) => hydrateRepositoryForUser(repository.id, userId)));

  return hydrated.filter((repository): repository is RepositoryCardModel => Boolean(repository));
}

export async function listUserRepositories(userId: string) {
  const repositories = await db
    .select()
    .from(repositoriesTable)
    .where(and(eq(repositoriesTable.ownerId, userId), eq(repositoriesTable.isArchived, false)))
    .orderBy(desc(repositoriesTable.updatedAt));
  const hydrated = await Promise.all(repositories.map((repository) => hydrateRepositoryForUser(repository.id, userId)));

  return hydrated.filter((repository): repository is RepositoryCardModel => Boolean(repository));
}

async function getRepositoryTags(repositoryId: string) {
  const tags = await db.select().from(repositoryTagsTable).where(eq(repositoryTagsTable.repositoryId, repositoryId));
  return tags.map((tag) => tag.name);
}

async function getIsStarred(repositoryId: string, userId: string) {
  const [star] = await db
    .select({ id: repositoryStarsTable.id })
    .from(repositoryStarsTable)
    .where(and(eq(repositoryStarsTable.repositoryId, repositoryId), eq(repositoryStarsTable.userId, userId)))
    .limit(1);

  return Boolean(star);
}

async function getIsBookmarked(repositoryId: string, userId: string) {
  const [bookmark] = await db
    .select({ id: repositoryBookmarksTable.id })
    .from(repositoryBookmarksTable)
    .where(and(eq(repositoryBookmarksTable.repositoryId, repositoryId), eq(repositoryBookmarksTable.userId, userId)))
    .limit(1);

  return Boolean(bookmark);
}

async function getIsWatching(repositoryId: string, userId: string) {
  const [watcher] = await db
    .select({ id: repositoryWatchersTable.id })
    .from(repositoryWatchersTable)
    .where(and(eq(repositoryWatchersTable.repositoryId, repositoryId), eq(repositoryWatchersTable.userId, userId)))
    .limit(1);

  return Boolean(watcher);
}

export async function hydrateRepositoryForUser(repositoryId: string, userId: string): Promise<RepositoryCardModel | null> {
  const repository = await getRepositoryById(repositoryId, userId);

  if (!repository) {
    return null;
  }

  const [analyticsRow] = await db.select().from(repositoryAnalyticsTable).where(eq(repositoryAnalyticsTable.repositoryId, repository.id)).limit(1);
  const [activity, contributors, tags, isStarred, isBookmarked, isWatching] = await Promise.all([
    listRepositoryActivity(repository.id),
    listRepositoryContributors(repository.id),
    getRepositoryTags(repository.id),
    getIsStarred(repository.id, userId),
    getIsBookmarked(repository.id, userId),
    getIsWatching(repository.id, userId),
  ]);

  return {
    ...repository,
    activity,
    analytics: {
      bookmarks: analyticsRow?.bookmarks ?? 0,
      contributors: contributors.length,
      forks: analyticsRow?.forks ?? 0,
      proofImpact: analyticsRow?.proofImpact ?? 0,
      proofScore: analyticsRow?.proofImpact ?? 0,
      proofSubmissions: analyticsRow?.proofSubmissions ?? 0,
      recruiterViews: analyticsRow?.recruiterViews ?? 0,
      stars: analyticsRow?.stars ?? 0,
      trustImpact: analyticsRow?.trustImpact ?? 0,
      views: analyticsRow?.views ?? 0,
      watchers: analyticsRow?.watchers ?? 0,
    },
    contributors,
    isBookmarked,
    isStarred,
    isWatching,
    tags,
  };
}

export async function getRepositoryGitHost(repositoryId: string, userId: string, branchName?: string, fileId?: string) {
  const repository = await hydrateRepositoryForUser(repositoryId, userId);

  if (!repository) {
    return null;
  }

  const currentBranch = await getBranchOrDefault(repository.id, userId, branchName);
  const [branches, files, folders, commits, repositoryActivity, releases, members] = await Promise.all([
    db.select().from(branchesTable).where(eq(branchesTable.repositoryId, repository.id)).orderBy(desc(branchesTable.isDefault), desc(branchesTable.updatedAt)),
    db.select().from(repositoryFilesTable).where(eq(repositoryFilesTable.branchId, currentBranch.id)).orderBy(repositoryFilesTable.path),
    db.select().from(repositoryFoldersTable).where(eq(repositoryFoldersTable.repositoryId, repository.id)).orderBy(repositoryFoldersTable.path),
    db.select().from(commitsTable).where(eq(commitsTable.branchId, currentBranch.id)).orderBy(desc(commitsTable.createdAt)).limit(24),
    listGitRepositoryActivity(repository.id, 18),
    db
      .select({
        createdAt: repositoryReleasesTable.createdAt,
        id: repositoryReleasesTable.id,
        name: repositoryReleasesTable.name,
        tagName: repositoryReleasesTable.tagName,
      })
      .from(repositoryReleasesTable)
      .where(eq(repositoryReleasesTable.repositoryId, repository.id))
      .orderBy(desc(repositoryReleasesTable.createdAt)),
    listRepositoryMembers(repository.id),
  ]);

  const readmeFile = files.find((file) => file.path.toLowerCase() === "readme.md") ?? null;
  const selectedFile = files.find((file) => file.id === fileId) ?? readmeFile ?? files.find((file) => file.kind === "text") ?? null;
  const selectedFileContent = selectedFile?.kind === "text" ? await downloadRepositoryText(selectedFile.storagePath) : "";

  return {
    ...repository,
    branches,
    commits,
    currentBranch,
    files,
    folders,
    members,
    readmeFile,
    releases,
    repositoryActivity,
    selectedFile,
    selectedFileContent,
  };
}
