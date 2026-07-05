import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Code2,
  Eye,
  FileText,
  Folder,
  GitBranch,
  GitFork,
  GitPullRequest,
  Lock,
  MoreHorizontal,
  Package,
  Plus,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "../../../../src/components/ui/badge";
import { Button } from "../../../../src/components/ui/button";
import { Card } from "../../../../src/components/ui/card";
import { RepositoryCodeEditor } from "../../../../src/features/repositories/components/repository-code-editor";
import { RepositoryMarkdownViewer } from "../../../../src/features/repositories/components/repository-markdown-viewer";
import {
  addRepositoryMember,
  createRepository,
  createRepositoryBranch,
  createRepositoryFile,
  deleteRepository,
  deleteRepositoryFile,
  forkRepository,
  getRepositoryGitHost,
  listUserRepositories,
  renameRepositoryFile,
  saveRepositoryFile,
  toggleRepositoryStar,
  toggleRepositoryWatch,
  updateRepository,
  uploadRepositoryFile,
} from "../../../../src/features/repositories/repository.service";
import { repositoryVisibilitySchema } from "../../../../src/features/repositories/repository.schemas";
import { RepositoryUploadPanel } from "../../../../src/features/repositories/components/repository-upload-panel";
import { getServerUser } from "../../../../src/lib/auth/service";

type RepositoriesPageProps = {
  searchParams?: Promise<{
    branch?: string;
    file?: string;
    q?: string;
    repo?: string;
    tab?: string;
    visibility?: string;
    new?: string;
    path?: string;
    add?: string;
    explorer?: string;
  }>;
};

const repositoryTabs = [
  "Code",
  "Issues",
  "Pull Requests",
  "Actions",
  "Projects",
  "Wiki",
  "Security",
  "Insights",
  "Settings",
] as const;

const githubButtonClass =
  "!border-[#30363d] !bg-[#21262d] !text-[#f0f6fc] hover:!bg-[#30363d] focus-visible:ring-[#58a6ff]/30 dark:!border-[#30363d] dark:!bg-[#21262d] dark:!text-[#f0f6fc] dark:hover:!bg-[#30363d]";
const githubPrimaryButtonClass =
  "!bg-[#238636] !text-white hover:!bg-[#2ea043] focus-visible:ring-[#238636]/30 dark:!bg-[#238636] dark:!text-white dark:hover:!bg-[#2ea043]";
const githubDangerButtonClass =
  "!border-[#da3633]/60 !bg-[#da3633]/10 !text-[#ff7b72] hover:!bg-[#da3633]/20 focus-visible:ring-[#ff7b72]/30 dark:!border-[#da3633]/60 dark:!bg-[#da3633]/10 dark:!text-[#ff7b72] dark:hover:!bg-[#da3633]/20";

function getOptionalString(formData: FormData, key: string) {
  return formData.get(key)?.toString() || undefined;
}

function getCommitMessage(message: string | undefined, fallback: string) {
  return (message?.trim() || fallback).slice(0, 200);
}

async function requireUserId() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return user.id;
}

function normalizeRepositoryPath(path?: string) {
  return (path ?? "")
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

function isImmediateChild(path: string, parentPath: string) {
  const normalizedPath = normalizeRepositoryPath(path);
  const normalizedParentPath = normalizeRepositoryPath(parentPath);
  const relativePath = normalizedParentPath ? normalizedPath.replace(`${normalizedParentPath}/`, "") : normalizedPath;

  return normalizedPath !== normalizedParentPath && !relativePath.includes("/");
}

function getParentPath(path: string) {
  const parts = normalizeRepositoryPath(path).split("/");
  parts.pop();
  return parts.join("/");
}

function getRepositoryHref(repoId: string, tab = "Code", branch?: string, file?: string, path?: string) {
  const params = new URLSearchParams({ repo: repoId, tab });

  if (branch) {
    params.set("branch", branch);
  }

  if (file) {
    params.set("file", file);
  }

  if (path) {
    params.set("path", path);
  }

  return `/dashboard/repositories?${params.toString()}`;
}

function getRepositoryAddHref(repoId: string, mode: "create" | "upload", branch?: string, path?: string) {
  const params = new URLSearchParams({ repo: repoId, tab: "Code", add: mode });

  if (branch) {
    params.set("branch", branch);
  }

  if (path) {
    params.set("path", path);
  }

  return `/dashboard/repositories?${params.toString()}`;
}

function getRepositoryExplorerHref(repoId: string, expanded: boolean, branch?: string) {
  const params = new URLSearchParams({ repo: repoId, tab: "Code", explorer: expanded ? "open" : "closed" });

  if (branch) {
    params.set("branch", branch);
  }

  return `/dashboard/repositories?${params.toString()}`;
}

function getUserDisplayName(user: Awaited<ReturnType<typeof getServerUser>>) {
  const metadata = user?.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : undefined;
  const name = typeof metadata.name === "string" ? metadata.name : undefined;
  const firstName = typeof metadata.firstName === "string" ? metadata.firstName : undefined;
  const lastName = typeof metadata.lastName === "string" ? metadata.lastName : undefined;
  const joinedName = [firstName, lastName].filter(Boolean).join(" ");

  return fullName || name || joinedName || user?.email?.split("@")[0] || "User";
}

function shouldShowExplorerEntry(path: string, currentPath: string, selectedFilePath?: string) {
  const parentPath = getParentPath(path);

  if (!currentPath) {
    return !parentPath;
  }

  return (
    !parentPath ||
    path === currentPath ||
    currentPath.startsWith(`${path}/`) ||
    parentPath === currentPath ||
    path === selectedFilePath
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileExtension(path: string) {
  const fileName = path.split("/").pop() ?? path;
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "file" : "file";
}

export default async function RepositoriesPage({ searchParams }: RepositoriesPageProps) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const userDisplayName = getUserDisplayName(user);
  const params = (await searchParams) ?? {};
  const activeTab = repositoryTabs.find((tab) => tab.toLowerCase() === params.tab?.toLowerCase()) ?? "Code";
  const repositories = await listUserRepositories(userId);
  const canCreateRepository = repositories.length < 3;
  const isCreatingRepository = (params.new === "1" && canCreateRepository) || repositories.length === 0;
  const selectedRepositoryId = isCreatingRepository ? undefined : params.repo ?? repositories[0]?.id;
  const repository = selectedRepositoryId
    ? await getRepositoryGitHost(selectedRepositoryId, userId, params.branch, params.file)
    : null;
  const readmeMarkdown =
    repository?.selectedFile?.path.toLowerCase() === "readme.md"
      ? repository.selectedFileContent
      : repository?.readme ?? "";
  const latestCommit = repository?.commits[0];
  const currentPath = normalizeRepositoryPath(params.path);
  const selectedFilePath = repository?.selectedFile?.path;
  const isRepositoryExplorerOpen = params.explorer !== "closed";
  const currentFolder = repository?.folders.find((folder) => folder.path === currentPath) ?? null;
  const visibleFolders = repository
    ? repository.folders.filter((folder) => {
        if (currentPath && !folder.path.startsWith(`${currentPath}/`)) {
          return false;
        }

        return isImmediateChild(folder.path, currentPath);
      })
    : [];
  const visibleFiles = repository
    ? repository.files.filter((file) => {
        if (currentPath && !file.path.startsWith(`${currentPath}/`)) {
          return false;
        }

        return isImmediateChild(file.path, currentPath);
      })
    : [];
  const repositoryExplorerEntries = repository
    ? [
        ...repository.folders.map((folder) => ({
          id: `folder-${folder.id}`,
          depth: folder.path.split("/").length - 1,
          href: getRepositoryHref(
            repository.id,
            "Code",
            repository.currentBranch.name,
            undefined,
            folder.path === currentPath ? getParentPath(folder.path) : folder.path
          ),
          icon: "folder" as const,
          label: folder.path.split("/").pop() ?? folder.path,
          path: folder.path,
        })),
        ...repository.files.map((file) => ({
          id: `file-${file.id}`,
          depth: file.path.split("/").length - 1,
          href: getRepositoryHref(repository.id, "Code", repository.currentBranch.name, file.id, getParentPath(file.path)),
          icon: "file" as const,
          label: file.name,
          path: file.path,
        })),
      ]
        .filter((entry) => shouldShowExplorerEntry(entry.path, currentPath, selectedFilePath))
        .sort((left, right) => {
          const leftParent = getParentPath(left.path);
          const rightParent = getParentPath(right.path);

          if (leftParent === rightParent && left.icon !== right.icon) {
            return left.icon === "folder" ? -1 : 1;
          }

          return left.path.localeCompare(right.path);
        })
    : [];
  const repositoryFileSize = repository?.files.reduce((total, file) => total + file.sizeBytes, 0) ?? 0;
  const repositoryExtensions = repository
    ? Array.from(
        repository.files.reduce((extensions, file) => {
          const extension = getFileExtension(file.path);
          extensions.set(extension, (extensions.get(extension) ?? 0) + 1);
          return extensions;
        }, new Map<string, number>())
      )
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
    : [];
  const readmeFile = repository?.files.find((file) => file.path.toLowerCase() === "readme.md") ?? null;
  const workflowFiles =
    repository?.files.filter((file) => file.path.startsWith(".github/workflows/") || file.path.includes("/workflows/")) ?? [];
  const packageFiles =
    repository?.files.filter((file) =>
      ["package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "requirements.txt", "pyproject.toml", "Dockerfile"].includes(file.name)
    ) ?? [];
  const docsFiles =
    repository?.files.filter((file) => file.path.toLowerCase().includes("docs/") || file.extension === "md").slice(0, 8) ?? [];
  const securityFiles =
    repository?.files.filter((file) =>
      ["security.md", "codeowners", "dependabot.yml", "dependabot.yaml"].some((name) => file.path.toLowerCase().endsWith(name))
    ) ?? [];
  const projectColumns = repository
    ? [
        { count: Math.max(repository.files.length - repository.commits.length, 0), label: "Backlog" },
        { count: repository.commits.length, label: "In progress" },
        { count: repository.releases.length + repository.repositoryActivity.filter((event) => event.type === "file_created").length, label: "Done" },
      ]
    : [];
  const repositoryHealthScore = repository
    ? Math.min(
        100,
        (readmeFile ? 20 : 0) +
          (repository.files.length > 0 ? 20 : 0) +
          (repository.commits.length > 0 ? 20 : 0) +
          (repository.members.length > 1 ? 15 : 0) +
          (securityFiles.length > 0 ? 15 : 0) +
          (workflowFiles.length > 0 ? 10 : 0)
      )
    : 0;

  async function createRepositoryAction(formData: FormData) {
    "use server";

    const ownerId = await requireUserId();
    const repository = await createRepository(ownerId, {
      description: getOptionalString(formData, "description"),
      name: formData.get("name")?.toString() ?? "",
      readme: getOptionalString(formData, "readme"),
      recruiterVisible: formData.get("recruiterVisible") === "on",
      sourceUrl: getOptionalString(formData, "sourceUrl"),
      tags: getOptionalString(formData, "tags"),
      verifiedSkills: getOptionalString(formData, "verifiedSkills"),
      visibility: repositoryVisibilitySchema.parse(formData.get("visibility")?.toString() ?? "private"),
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repository.id));
  }

  async function updateRepositoryAction(formData: FormData) {
    "use server";

    const ownerId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";

    await updateRepository(ownerId, {
      description: getOptionalString(formData, "description"),
      id: repositoryId,
      name: formData.get("name")?.toString() ?? "",
      readme: getOptionalString(formData, "readme"),
      recruiterVisible: formData.get("recruiterVisible") === "on",
      sourceUrl: getOptionalString(formData, "sourceUrl"),
      tags: getOptionalString(formData, "tags"),
      verifiedSkills: getOptionalString(formData, "verifiedSkills"),
      visibility: repositoryVisibilitySchema.parse(formData.get("visibility")?.toString() ?? "private"),
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId, "Settings"));
  }

  async function deleteRepositoryAction(formData: FormData) {
    "use server";

    const ownerId = await requireUserId();
    await deleteRepository(ownerId, formData.get("repositoryId")?.toString() ?? "");
    revalidatePath("/dashboard/repositories");
    redirect("/dashboard/repositories");
  }

  async function addMemberAction(formData: FormData) {
    "use server";

    const ownerId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";

    await addRepositoryMember(ownerId, {
      repositoryId,
      role: formData.get("role")?.toString() as "maintainer" | "contributor" | "viewer",
      userId: formData.get("userId")?.toString() ?? "",
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId, "Settings"));
  }

  async function toggleStarAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    await toggleRepositoryStar(currentUserId, repositoryId);
    revalidatePath("/dashboard/repositories");
  }

  async function toggleWatchAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    await toggleRepositoryWatch(currentUserId, repositoryId);
    revalidatePath("/dashboard/repositories");
  }

  async function forkRepositoryAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const fork = await forkRepository(currentUserId, formData.get("repositoryId")?.toString() ?? "");
    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(fork.id));
  }

  async function createBranchAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    const branch = await createRepositoryBranch(currentUserId, {
      name: formData.get("name")?.toString() ?? "",
      repositoryId,
      sourceBranchId: getOptionalString(formData, "sourceBranchId"),
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId, "Code", branch?.name));
  }

  async function createFileAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    await createRepositoryFile(currentUserId, {
      branchId: formData.get("branchId")?.toString() ?? "",
      content: formData.get("content")?.toString() ?? "",
      message: getOptionalString(formData, "message"),
      path: formData.get("path")?.toString() ?? "",
      repositoryId,
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId));
  }

  async function saveFileAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    await saveRepositoryFile(currentUserId, {
      branchId: formData.get("branchId")?.toString() ?? "",
      content: formData.get("content")?.toString() ?? "",
      fileId: formData.get("fileId")?.toString() ?? "",
      message: getOptionalString(formData, "message"),
      path: formData.get("path")?.toString() ?? "",
      repositoryId,
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId, "Code", params.branch, formData.get("fileId")?.toString() ?? undefined));
  }

  async function renameFileAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    const file = await renameRepositoryFile(currentUserId, {
      fileId: formData.get("fileId")?.toString() ?? "",
      message: getOptionalString(formData, "message"),
      path: formData.get("path")?.toString() ?? "",
      repositoryId,
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId, "Code", params.branch, file.id));
  }

  async function deleteFileAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    await deleteRepositoryFile(currentUserId, {
      fileId: formData.get("fileId")?.toString() ?? "",
      message: getOptionalString(formData, "message"),
      repositoryId,
    });

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId));
  }

  async function uploadFilesAction(formData: FormData) {
    "use server";

    const currentUserId = await requireUserId();
    const repositoryId = formData.get("repositoryId")?.toString() ?? "";
    const branchId = formData.get("branchId")?.toString() ?? "";
    const basePath = normalizeRepositoryPath(formData.get("basePath")?.toString());
    const message = getOptionalString(formData, "message");
    const files = formData.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
    const paths = formData.getAll("paths").map((path) => normalizeRepositoryPath(path.toString()));

    await Promise.all(
      files.map((file, index) => {
        const relativePath = paths[index] || file.name;
        const uploadPath = normalizeRepositoryPath([basePath, relativePath].filter(Boolean).join("/"));

        return uploadRepositoryFile(
          currentUserId,
          {
            branchId,
            content: "",
            message: getCommitMessage(message, `Upload ${uploadPath}`),
            path: uploadPath,
            repositoryId,
          },
          file
        );
      })
    );

    revalidatePath("/dashboard/repositories");
    redirect(getRepositoryHref(repositoryId, "Code", params.branch, undefined, basePath));
  }

  return (
    <div className="mx-auto w-full max-w-[110rem] space-y-5 bg-[#0b1220] text-[#f0f6fc]">
      <div className="grid gap-5 xl:grid-cols-[20rem_1fr]">
        <aside>
          <Card className="overflow-hidden border-[#30363d] bg-[#0d1117] p-0 text-[#f0f6fc]">
            <div className="flex items-center justify-between gap-3 border-b border-[#30363d] px-4 py-3">
              <h2 className="text-sm font-semibold text-[#f0f6fc]">Codebase</h2>
              {canCreateRepository ? (
                <Link
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-[#238636] px-3 text-sm font-medium text-white transition hover:bg-[#2ea043]"
                  href="/dashboard/repositories?new=1"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New
                </Link>
              ) : (
                <span className="inline-flex h-8 cursor-not-allowed items-center justify-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3 text-sm font-medium text-[#8b949e]">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New
                </span>
              )}
            </div>
            {!canCreateRepository ? (
              <p className="border-b border-[#30363d] bg-[#161b22] px-4 py-3 text-xs leading-5 text-[#8b949e]">
                Free ProofX accounts can create up to 3 repositories. Upgrade to ProofX Premium to create more.
              </p>
            ) : null}
            <div className="divide-y divide-[#30363d]">
              {repositories.map((item) => {
                const isSelected = item.id === repository?.id;

                return (
                  <div key={item.id}>
                    <Link
                      className={`block px-4 py-3 text-sm transition ${
                        isSelected
                          ? "bg-[#161b22] text-[#f0f6fc]"
                          : "text-[#c9d1d9] hover:bg-[#161b22] hover:text-[#f0f6fc]"
                      }`}
                      href={
                        isSelected
                          ? getRepositoryExplorerHref(item.id, !isRepositoryExplorerOpen, repository?.currentBranch.name)
                          : getRepositoryExplorerHref(item.id, true)
                      }
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate font-medium">{item.name}</span>
                        {isSelected ? (
                          isRepositoryExplorerOpen ? (
                            <ChevronDown className="h-4 w-4 text-[#8b949e]" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-[#8b949e]" aria-hidden="true" />
                          )
                        ) : null}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#8b949e]">{item.slug}</span>
                    </Link>
                    {isSelected && isRepositoryExplorerOpen ? (
                      <div className="max-h-[34rem] space-y-0.5 overflow-y-auto border-t border-[#30363d] bg-[#0b1220] px-2 py-2 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-1">
                        {repositoryExplorerEntries.map((entry) => (
                          <Link
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                              entry.path === currentPath || entry.path === repository?.selectedFile?.path
                                ? "bg-[#21262d] text-[#f0f6fc]"
                                : "text-[#c9d1d9] hover:bg-[#161b22] hover:text-[#f0f6fc]"
                            }`}
                            href={entry.href}
                            key={entry.id}
                            style={{ paddingLeft: `${0.5 + entry.depth * 0.85}rem` }}
                          >
                            {entry.icon === "folder" ? (
                              entry.path === currentPath || currentPath.startsWith(`${entry.path}/`) ? (
                                <ChevronDown className="h-4 w-4 shrink-0 text-[#8b949e]" aria-hidden="true" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0 text-[#8b949e]" aria-hidden="true" />
                              )
                            ) : (
                              <FileText className="h-4 w-4 shrink-0 text-[#8b949e]" aria-hidden="true" />
                            )}
                            {entry.icon === "folder" ? <Folder className="h-4 w-4 shrink-0 text-[#8b949e]" aria-hidden="true" /> : null}
                            <span className="truncate">{entry.label}</span>
                          </Link>
                        ))}
                        {repositoryExplorerEntries.length === 0 ? (
                          <p className="px-2 py-2 text-xs text-[#8b949e]">No files yet.</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {repositories.length === 0 ? (
                <p className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-4 text-sm text-[#8b949e]">
                  No repositories yet.
                </p>
              ) : null}
            </div>
          </Card>
        </aside>

        {repository ? (
          <main className="min-w-0 space-y-5">
            <Card className="overflow-hidden border-[#30363d] bg-[#0d1117] text-[#f0f6fc]">
              <div className="border-b border-[#30363d] bg-[#010409] px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <BookOpen className="h-5 w-5 text-[#8b949e]" aria-hidden="true" />
                      <span className="max-w-44 truncate text-xl text-[#f0f6fc]">{userDisplayName}</span>
                      <span className="text-xl text-[#8b949e]">/</span>
                      <h1 className="truncate text-xl font-semibold text-[#f0f6fc]">{repository.name}</h1>
                      <span className="inline-flex items-center rounded-full border border-[#30363d] px-2 py-0.5 text-xs font-medium text-[#8b949e]">
                        {repository.visibility === "private" ? <Lock className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
                        {repository.visibility === "public" ? <Eye className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
                        {repository.visibility === "unlisted" ? <MoreHorizontal className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
                        {repository.visibility}
                      </span>
                      {repository.recruiterVisible ? <span className="inline-flex items-center rounded-full border border-[#238636]/40 bg-[#238636]/10 px-2 py-0.5 text-xs font-medium text-[#7ee787]">Recruiter visible</span> : null}
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8b949e]">
                      {repository.description || "No repository description yet."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {repository.tags.map((tag) => (
                        <span className="rounded-full bg-[#388bfd1a] px-2 py-1 text-xs font-medium text-[#58a6ff]" key={tag}>{tag}</span>
                      ))}
                      {repository.verifiedSkills.map((skill) => (
                        <span className="inline-flex items-center rounded-full bg-[#2386361a] px-2 py-1 text-xs font-medium text-[#7ee787]" key={skill}>
                          <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={toggleStarAction}>
                      <input name="repositoryId" type="hidden" value={repository.id} />
                      <Button className={githubButtonClass} size="sm" type="submit" variant="outline">
                        <Star className={repository.isStarred ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
                        Star
                        <span className="ml-1 rounded bg-[#30363d] px-1.5 text-xs">{repository.analytics.stars}</span>
                      </Button>
                    </form>
                    <form action={toggleWatchAction}>
                      <input name="repositoryId" type="hidden" value={repository.id} />
                      <Button className={githubButtonClass} size="sm" type="submit" variant="outline">
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Watch
                        <span className="ml-1 rounded bg-[#30363d] px-1.5 text-xs">{repository.analytics.watchers}</span>
                      </Button>
                    </form>
                    <form action={forkRepositoryAction}>
                      <input name="repositoryId" type="hidden" value={repository.id} />
                      <Button className={githubButtonClass} size="sm" type="submit" variant="outline">
                        <GitFork className="h-4 w-4" aria-hidden="true" />
                        Fork
                        <span className="ml-1 rounded bg-[#30363d] px-1.5 text-xs">{repository.analytics.forks}</span>
                      </Button>
                    </form>
                  </div>
                </div>

              </div>

              <nav className="flex overflow-x-auto border-b border-[#30363d] bg-[#010409] px-3" aria-label="Repository tabs">
                {repositoryTabs.map((tab) => (
                  <Link
                    className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${
                      activeTab === tab
                        ? "border-[#f78166] text-[#f0f6fc]"
                        : "border-transparent text-[#8b949e] hover:text-[#f0f6fc]"
                    }`}
                    href={getRepositoryHref(repository.id, tab, repository.currentBranch.name, params.file)}
                    key={tab}
                  >
                    {tab === "Code" ? <Code2 className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Issues" ? <FileText className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Pull Requests" ? <GitBranch className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Actions" ? <Activity className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Projects" ? <Folder className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Wiki" ? <BookOpen className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Security" ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Insights" ? <BarChart3 className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab === "Settings" ? <Settings className="h-4 w-4" aria-hidden="true" /> : null}
                    {tab}
                  </Link>
                ))}
              </nav>
            </Card>

            {activeTab === "Code" ? (
              <div className={currentPath ? "grid gap-5" : "grid gap-5 2xl:grid-cols-[1fr_24rem]"}>
                <section className="min-w-0 space-y-5">
                  <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex h-9 items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3 text-sm font-medium text-[#f0f6fc]">
                          <GitBranch className="h-4 w-4" aria-hidden="true" />
                          {repository.currentBranch.name}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {repository.branches.map((branch) => (
                            <Link className="rounded-md border border-[#30363d] px-3 py-1.5 text-sm text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc]" href={getRepositoryHref(repository.id, "Code", branch.name, undefined, currentPath)} key={branch.id}>
                              {branch.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <form action={createBranchAction} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <input name="repositoryId" type="hidden" value={repository.id} />
                        <input name="sourceBranchId" type="hidden" value={repository.currentBranch.id} />
                        <input className="h-9 rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#f0f6fc] outline-none" name="name" placeholder="feature/name" />
                        <Button className={`h-9 ${githubButtonClass}`} type="submit" variant="outline">
                          <GitBranch className="h-4 w-4" aria-hidden="true" />
                          Branch
                        </Button>
                      </form>
                    </div>
                  </Card>

                  <Card className="overflow-hidden border-[#30363d] bg-[#0d1117] text-[#f0f6fc]">
                    <div className="flex flex-col gap-3 border-b border-[#30363d] bg-[#161b22] p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-[#f0f6fc]">
                          {currentPath ? (
                            <span className="flex flex-wrap items-center gap-2">
                              <Link className="text-[#58a6ff] hover:underline" href={getRepositoryHref(repository.id, "Code", repository.currentBranch.name)}>
                                {repository.name}
                              </Link>
                              <span className="text-[#8b949e]">/</span>
                              <span>{currentPath}</span>
                            </span>
                          ) : (
                            "Code"
                          )}
                        </h2>
                        <p className="mt-1 text-xs text-[#8b949e]">
                          {latestCommit ? `${latestCommit.message} · ${latestCommit.id.slice(0, 8)}` : "No commits yet"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="group relative">
                          <button
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3 text-sm font-medium text-[#f0f6fc] outline-none hover:bg-[#30363d] focus-visible:ring-4 focus-visible:ring-[#58a6ff]/30"
                            type="button"
                          >
                            <FileText className="h-4 w-4" aria-hidden="true" />
                            Add file
                          </button>
                          <div className="invisible absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-md border border-[#30363d] bg-[#161b22] py-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                            <Link
                              className="block px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                              href={getRepositoryAddHref(repository.id, "create", repository.currentBranch.name, currentPath)}
                            >
                              Create new file
                            </Link>
                            <Link
                              className="block px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                              href={getRepositoryAddHref(repository.id, "upload", repository.currentBranch.name, currentPath)}
                            >
                              Upload files
                            </Link>
                          </div>
                        </div>
                        <Link
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#238636] px-3 text-sm font-medium text-white hover:bg-[#2ea043]"
                          href={getRepositoryHref(repository.id, "Code", repository.currentBranch.name, undefined, currentPath)}
                        >
                          <Code2 className="h-4 w-4" aria-hidden="true" />
                          Code
                        </Link>
                        <span className="inline-flex h-9 items-center rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-sm font-medium text-[#8b949e]">
                          {visibleFiles.length} files
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-[#30363d]">
                      {currentPath ? (
                        <Link
                          className="grid gap-3 px-4 py-3 text-sm text-[#c9d1d9] hover:bg-[#161b22] md:grid-cols-[1fr_16rem_8rem]"
                          href={getRepositoryHref(repository.id, "Code", repository.currentBranch.name, undefined, getParentPath(currentPath))}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <Folder className="h-4 w-4 text-[#8b949e]" aria-hidden="true" />
                            <span className="truncate font-mono">..</span>
                          </span>
                          <span className="hidden text-[#8b949e] md:block">Parent directory</span>
                          <span className="hidden text-[#8b949e] md:block">{currentFolder ? formatDate(currentFolder.updatedAt) : ""}</span>
                        </Link>
                      ) : null}
                      {visibleFolders.map((folder) => (
                        <Link
                          className="grid gap-3 px-4 py-3 text-sm text-[#c9d1d9] hover:bg-[#161b22] md:grid-cols-[1fr_16rem_8rem]"
                          href={getRepositoryHref(repository.id, "Code", repository.currentBranch.name, undefined, folder.path)}
                          key={folder.id}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <Folder className="h-4 w-4 text-[#8b949e]" aria-hidden="true" />
                            <span className="truncate font-mono">{currentPath ? folder.path.replace(`${currentPath}/`, "") : folder.path}</span>
                          </span>
                          <span className="hidden text-[#8b949e] md:block">Add files via upload</span>
                          <span className="hidden text-[#8b949e] md:block">{formatDate(folder.updatedAt)}</span>
                        </Link>
                      ))}
                      {visibleFiles.map((file) => (
                        <Link
                          className="grid gap-3 px-4 py-3 text-sm text-[#c9d1d9] hover:bg-[#161b22] md:grid-cols-[1fr_16rem_8rem]"
                          href={getRepositoryHref(repository.id, "Code", repository.currentBranch.name, file.id, currentPath)}
                          key={file.id}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <FileText className="h-4 w-4 text-[#8b949e]" aria-hidden="true" />
                            <span className="truncate font-mono text-[#f0f6fc]">{currentPath ? file.path.replace(`${currentPath}/`, "") : file.path}</span>
                          </span>
                          <span className="hidden truncate text-[#8b949e] md:block">{latestCommit?.message ?? file.kind}</span>
                          <span className="hidden text-[#8b949e] md:block">{formatDate(file.updatedAt)}</span>
                        </Link>
                      ))}
                      {visibleFiles.length === 0 && visibleFolders.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-[#8b949e]">This branch has no files yet. Create a file to make the first commit.</div>
                      ) : null}
                    </div>
                  </Card>

                  {params.file && repository.selectedFile ? (
                    <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h2 className="font-mono text-sm font-semibold text-[#f0f6fc]">{repository.selectedFile.path}</h2>
                          <p className="mt-1 text-xs text-[#8b949e]">{repository.selectedFile.sizeBytes} bytes stored in Supabase Storage</p>
                        </div>
                        <form action={deleteFileAction}>
                          <input name="repositoryId" type="hidden" value={repository.id} />
                          <input name="fileId" type="hidden" value={repository.selectedFile.id} />
                          <Button className={githubButtonClass} size="sm" type="submit" variant="outline">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </Button>
                        </form>
                      </div>

                      {repository.selectedFile.kind === "text" ? (
                        <RepositoryCodeEditor
                          action={saveFileAction}
                          branchId={repository.currentBranch.id}
                          content={repository.selectedFileContent}
                          fileId={repository.selectedFile.id}
                          path={repository.selectedFile.path}
                          repositoryId={repository.id}
                        />
                      ) : (
                        <p className="rounded-md border border-[#30363d] bg-[#161b22] p-4 text-sm text-[#8b949e]">
                          Binary and image files are stored in Supabase Storage. Text editing is available for code and markdown files.
                        </p>
                      )}

                      <form action={renameFileAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <input name="repositoryId" type="hidden" value={repository.id} />
                        <input name="fileId" type="hidden" value={repository.selectedFile.id} />
                        <input className="h-10 rounded-md border border-[#30363d] bg-[#0d1117] px-3 font-mono text-sm text-[#f0f6fc] outline-none" name="path" defaultValue={repository.selectedFile.path} />
                        <input className="h-10 rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#f0f6fc] outline-none" name="message" placeholder="Rename file" />
                        <Button className={githubButtonClass} type="submit" variant="outline">Rename</Button>
                      </form>
                    </Card>
                  ) : params.add === "create" ? (
                    <RepositoryCodeEditor
                      action={createFileAction}
                      branchId={repository.currentBranch.id}
                      content=""
                      path={currentPath ? `${currentPath}/README.md` : "README.md"}
                      repositoryId={repository.id}
                    />
                  ) : params.add === "upload" ? (
                    <RepositoryUploadPanel
                      action={uploadFilesAction}
                      basePath={currentPath}
                      branchId={repository.currentBranch.id}
                      repositoryId={repository.id}
                    />
                  ) : null}

                  {!currentPath && !params.add ? <RepositoryMarkdownViewer markdown={readmeMarkdown} /> : null}
                </section>

                {!currentPath ? (
                <aside className="space-y-5">
                  <Card className="border-0 border-b border-[#30363d] bg-transparent p-0 pb-5 text-[#f0f6fc] shadow-none">
                    <h2 className="text-base font-semibold">About</h2>
                    <p className="mt-3 text-sm italic leading-6 text-[#8b949e]">
                      {repository.description || "No description, website, or topics provided."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {repository.tags.map((tag) => (
                        <span className="rounded-full bg-[#388bfd1a] px-2 py-1 text-xs font-medium text-[#58a6ff]" key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="mt-5 space-y-3 border-t border-[#30363d] pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#8b949e]"><Star className="h-4 w-4" aria-hidden="true" /> Stars</span>
                        <span className="font-semibold">{repository.analytics.stars}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#8b949e]"><Eye className="h-4 w-4" aria-hidden="true" /> Watchers</span>
                        <span className="font-semibold">{repository.analytics.watchers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#8b949e]"><GitFork className="h-4 w-4" aria-hidden="true" /> Forks</span>
                        <span className="font-semibold">{repository.analytics.forks}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-0 border-b border-[#30363d] bg-transparent p-0 pb-5 text-[#f0f6fc] shadow-none">
                    <h2 className="text-base font-semibold">ProofX</h2>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b949e]">Trust Impact</span>
                        <span className="font-semibold">{repository.analytics.trustImpact}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b949e]">Proof Score</span>
                        <span className="font-semibold">{repository.analytics.proofScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b949e]">Recruiter Views</span>
                        <span className="font-semibold">{repository.analytics.recruiterViews}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {repository.verifiedSkills.map((skill) => (
                        <span className="inline-flex items-center rounded-full bg-[#2386361a] px-2 py-1 text-xs font-medium text-[#7ee787]" key={skill}>
                          <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <Card className="border-0 border-b border-[#30363d] bg-transparent p-0 pb-5 text-[#f0f6fc] shadow-none">
                    <h2 className="text-base font-semibold">Releases</h2>
                    <p className="mt-3 text-sm text-[#8b949e]">{repository.releases.length ? `${repository.releases.length} releases` : "No releases published"}</p>
                    <p className="mt-2 text-sm text-[#58a6ff]">Create a new release</p>
                  </Card>

                  <Card className="border-0 border-b border-[#30363d] bg-transparent p-0 pb-5 text-[#f0f6fc] shadow-none">
                    <h2 className="text-base font-semibold">Deployments <span className="rounded-full bg-[#30363d] px-1.5 text-xs">{repository.analytics.recruiterViews}</span></h2>
                    <p className="mt-3 text-sm text-[#8b949e]">No active deployments</p>
                  </Card>

                  <Card className="border-0 border-b border-[#30363d] bg-transparent p-0 pb-5 text-[#f0f6fc] shadow-none">
                    <h2 className="text-base font-semibold">Packages</h2>
                    <p className="mt-3 text-sm text-[#8b949e]">No packages published</p>
                    <p className="mt-2 text-sm text-[#58a6ff]">Publish your first package</p>
                  </Card>

                  <Card className="border-0 border-b border-[#30363d] bg-transparent p-0 pb-5 text-[#f0f6fc] shadow-none">
                    <h2 className="text-base font-semibold">Contributors</h2>
                    <div className="mt-4 space-y-2">
                      {repository.members.map((member) => (
                        <div className="flex items-center justify-between gap-3 text-sm" key={member.userId}>
                          <span className="truncate font-mono text-[#c9d1d9]">{member.userId.slice(0, 8)}</span>
                          <span className="rounded-full border border-[#30363d] px-2 py-0.5 text-xs text-[#8b949e]">{member.role}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="border-0 border-b border-[#30363d] bg-transparent p-0 pb-5 text-[#f0f6fc] shadow-none">
                    <h2 className="flex items-center gap-2 text-base font-semibold">
                      <Activity className="h-4 w-4 text-[#8b949e]" aria-hidden="true" />
                      Activity
                    </h2>
                    <div className="mt-4 space-y-3">
                      {repository.repositoryActivity.slice(0, 1).map((event) => (
                        <div className="border-b border-[#30363d] pb-3 last:border-0 last:pb-0" key={event.id}>
                          <p className="text-sm text-[#c9d1d9]">{event.message}</p>
                          <p className="mt-1 text-xs text-[#8b949e]">{formatDate(event.createdAt)}</p>
                        </div>
                      ))}
                      {repository.repositoryActivity.length === 0 ? <p className="text-sm text-[#8b949e]">No activity yet.</p> : null}
                    </div>
                  </Card>

                  <Card className="border-0 bg-transparent p-0 text-[#f0f6fc] shadow-none">
                    <h2 className="text-base font-semibold">Commits</h2>
                    <div className="mt-4 space-y-3">
                      {repository.commits.slice(0, 1).map((commit) => (
                        <div className="border-b border-[#30363d] pb-3 last:border-0 last:pb-0" key={commit.id}>
                          <p className="text-sm font-medium text-[#f0f6fc]">{commit.message}</p>
                          <p className="mt-1 font-mono text-xs text-[#8b949e]">{commit.id.slice(0, 8)} · {formatDate(commit.createdAt)}</p>
                        </div>
                      ))}
                      {repository.commits.length === 0 ? <p className="text-sm text-[#8b949e]">No commits yet.</p> : null}
                    </div>
                  </Card>
                </aside>
                ) : null}
              </div>
            ) : activeTab === "Settings" ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
                <Card className="border-slate-300 bg-white p-5 text-slate-950">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                    <Settings className="h-5 w-5 text-slate-500" aria-hidden="true" />
                    Repository settings
                  </h2>
                  <form action={updateRepositoryAction} className="mt-5 space-y-4">
                    <input name="repositoryId" type="hidden" value={repository.id} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                        <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none" name="name" defaultValue={repository.name} required />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Visibility</span>
                        <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none" name="visibility" defaultValue={repository.visibility}>
                          <option value="private">Private</option>
                          <option value="public">Public</option>
                          <option value="unlisted">Unlisted</option>
                        </select>
                      </label>
                    </div>
                    <textarea className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none" name="description" defaultValue={repository.description ?? ""} />
                    <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none" name="sourceUrl" defaultValue={repository.sourceUrl ?? ""} placeholder="Source URL" type="url" />
                    <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none" name="tags" defaultValue={repository.tags.join(", ")} placeholder="Tags" />
                    <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none" name="verifiedSkills" defaultValue={repository.verifiedSkills.join(", ")} placeholder="Verified skills" />
                    <textarea className="min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-950 outline-none" name="readme" defaultValue={repository.readme ?? ""} />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input className="h-4 w-4 accent-cyan-400" defaultChecked={repository.recruiterVisible} name="recruiterVisible" type="checkbox" />
                      Recruiter visible
                    </label>
                    <Button className={githubPrimaryButtonClass} type="submit">Save settings</Button>
                  </form>
                </Card>

                <aside className="space-y-5">
                  <Card className="border-slate-300 bg-white p-4 text-slate-950">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Users className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      Members
                    </h2>
                    <div className="mt-4 space-y-2">
                      {repository.members.map((member) => (
                        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2" key={member.userId}>
                          <span className="truncate font-mono text-xs text-slate-700">{member.userId}</span>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                      ))}
                    </div>
                    <form action={addMemberAction} className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                      <input name="repositoryId" type="hidden" value={repository.id} />
                      <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-mono text-sm text-slate-950 outline-none" name="userId" placeholder="User UUID" />
                      <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none" name="role" defaultValue="contributor">
                        <option value="maintainer">Maintainer</option>
                        <option value="contributor">Contributor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <Button className={`w-full ${githubButtonClass}`} type="submit" variant="outline">Add member</Button>
                    </form>
                  </Card>

                  <Card className="border-red-950/60 bg-red-950/20 p-4">
                    <h2 className="text-sm font-semibold text-red-100">Danger zone</h2>
                    <form action={deleteRepositoryAction} className="mt-4">
                      <input name="repositoryId" type="hidden" value={repository.id} />
                      <Button className={githubDangerButtonClass} type="submit" variant="outline">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete repository
                      </Button>
                    </form>
                  </Card>
                </aside>
              </div>
            ) : activeTab === "Issues" ? (
              <div className="space-y-5">
                <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-2 font-semibold text-[#f0f6fc]">
                        <FileText className="h-4 w-4 text-[#3fb950]" aria-hidden="true" />
                        {Math.max(repository.repositoryActivity.length, repository.files.length ? 1 : 0)} open
                      </span>
                      <span className="inline-flex items-center gap-2 text-[#8b949e]">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        {repository.releases.length} closed
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3 text-sm text-[#f0f6fc]" type="button">
                        <Tag className="h-4 w-4" aria-hidden="true" />
                        Labels
                      </button>
                      <button className="inline-flex h-9 items-center gap-2 rounded-md bg-[#238636] px-3 text-sm font-medium text-white" type="button">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        New issue
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-sm text-[#8b949e]">
                    <Search className="h-4 w-4" aria-hidden="true" />
                    is:issue is:open repo:{repository.slug}
                  </div>
                </Card>

                <Card className="overflow-hidden border-[#30363d] bg-[#0d1117] text-[#f0f6fc]">
                  <div className="divide-y divide-[#30363d]">
                    {repository.repositoryActivity.slice(0, 8).map((event, index) => (
                      <div className="flex gap-3 px-4 py-4" key={event.id}>
                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#3fb950]" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-sm font-semibold text-[#f0f6fc]">{event.message}</h2>
                          <p className="mt-1 text-xs text-[#8b949e]">#{index + 1} opened from repository activity on {formatDate(event.createdAt)}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#388bfd1a] px-2 py-0.5 text-xs text-[#58a6ff]">{event.scope}</span>
                            <span className="rounded-full bg-[#2386361a] px-2 py-0.5 text-xs text-[#7ee787]">{event.type.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {repository.repositoryActivity.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-[#8b949e]">No issues yet. Repository activity will appear here as trackable work.</div>
                    ) : null}
                  </div>
                </Card>
              </div>
            ) : activeTab === "Pull Requests" ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
                <Card className="overflow-hidden border-[#30363d] bg-[#0d1117] text-[#f0f6fc]">
                  <div className="border-b border-[#30363d] bg-[#161b22] p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold">
                      <GitPullRequest className="h-4 w-4 text-[#a371f7]" aria-hidden="true" />
                      Pull requests
                    </h2>
                    <p className="mt-1 text-xs text-[#8b949e]">Compare branches, review commits, and prepare merge-ready proof.</p>
                  </div>
                  <div className="divide-y divide-[#30363d]">
                    {repository.branches.map((branch) => (
                      <div className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_auto]" key={branch.id}>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#f0f6fc]">{branch.isDefault ? "Default branch" : `Compare ${branch.name} into ${repository.currentBranch.name}`}</h3>
                          <p className="mt-1 text-xs text-[#8b949e]">{branch.name} updated {formatDate(branch.updatedAt)}</p>
                        </div>
                        <Link className="inline-flex h-9 items-center justify-center rounded-md border border-[#30363d] bg-[#21262d] px-3 text-sm text-[#f0f6fc] hover:bg-[#30363d]" href={getRepositoryHref(repository.id, "Code", branch.name)}>
                          View branch
                        </Link>
                      </div>
                    ))}
                  </div>
                </Card>

                <aside className="space-y-5">
                  <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                    <h2 className="text-sm font-semibold">Merge checks</h2>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between"><span className="text-[#8b949e]">Commits</span><span>{repository.commits.length}</span></div>
                      <div className="flex items-center justify-between"><span className="text-[#8b949e]">Files changed</span><span>{repository.files.length}</span></div>
                      <div className="flex items-center justify-between"><span className="text-[#8b949e]">Reviewers</span><span>{repository.members.length}</span></div>
                    </div>
                  </Card>
                  <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                    <h2 className="text-sm font-semibold">Branch protection</h2>
                    <p className="mt-3 text-sm text-[#8b949e]">{workflowFiles.length ? "Workflow files detected for status checks." : "Add workflows to enable automated status checks."}</p>
                  </Card>
                </aside>
              </div>
            ) : activeTab === "Actions" ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
                <Card className="overflow-hidden border-[#30363d] bg-[#0d1117] text-[#f0f6fc]">
                  <div className="border-b border-[#30363d] bg-[#161b22] p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold">
                      <Activity className="h-4 w-4 text-[#58a6ff]" aria-hidden="true" />
                      Workflow runs
                    </h2>
                  </div>
                  <div className="divide-y divide-[#30363d]">
                    {(workflowFiles.length ? workflowFiles : repository.commits.slice(0, 6)).map((item) => (
                      <div className="flex items-center justify-between gap-3 px-4 py-4" key={item.id}>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#f0f6fc]">{"path" in item ? item.path : item.message}</h3>
                          <p className="mt-1 text-xs text-[#8b949e]">Triggered on {repository.currentBranch.name}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#2386361a] px-2 py-1 text-xs text-[#7ee787]">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          Ready
                        </span>
                      </div>
                    ))}
                    {workflowFiles.length === 0 && repository.commits.length === 0 ? <div className="px-4 py-10 text-center text-sm text-[#8b949e]">No workflow runs yet.</div> : null}
                  </div>
                </Card>
                <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                  <h2 className="text-sm font-semibold">Automation</h2>
                  <div className="mt-4 space-y-3 text-sm text-[#8b949e]">
                    <p>{workflowFiles.length} workflow files</p>
                    <p>{repository.commits.length} commit events</p>
                    <p>{repository.releases.length} release events</p>
                  </div>
                </Card>
              </div>
            ) : activeTab === "Projects" ? (
              <div className="space-y-5">
                <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                  <h2 className="text-sm font-semibold">Repository board</h2>
                  <p className="mt-1 text-sm text-[#8b949e]">Plan work from files, commits, and repository activity.</p>
                </Card>
                <div className="grid gap-4 lg:grid-cols-3">
                  {projectColumns.map((column) => (
                    <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]" key={column.label}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{column.label}</h3>
                        <span className="rounded-full bg-[#30363d] px-2 py-0.5 text-xs">{column.count}</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {repository.repositoryActivity.slice(0, 3).map((event) => (
                          <div className="rounded-md border border-[#30363d] bg-[#010409] p-3 text-sm" key={`${column.label}-${event.id}`}>
                            <p className="line-clamp-2 text-[#c9d1d9]">{event.message}</p>
                            <p className="mt-2 text-xs text-[#8b949e]">{event.type.replace(/_/g, " ")}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : activeTab === "Wiki" ? (
              <div className="grid gap-5 xl:grid-cols-[16rem_1fr]">
                <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                  <h2 className="text-sm font-semibold">Pages</h2>
                  <div className="mt-4 space-y-2">
                    {(docsFiles.length ? docsFiles : repository.files.slice(0, 6)).map((file) => (
                      <Link className="block truncate rounded-md px-2 py-1.5 text-sm text-[#c9d1d9] hover:bg-[#161b22]" href={getRepositoryHref(repository.id, "Code", repository.currentBranch.name, file.id, getParentPath(file.path))} key={file.id}>
                        {file.path}
                      </Link>
                    ))}
                  </div>
                </Card>
                <RepositoryMarkdownViewer markdown={readmeMarkdown || "# Wiki\n\nCreate README.md or documentation files to build the repository wiki."} />
              </div>
            ) : activeTab === "Security" ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
                <Card className="border-[#30363d] bg-[#0d1117] p-5 text-[#f0f6fc]">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <ShieldCheck className="h-5 w-5 text-[#3fb950]" aria-hidden="true" />
                    Security overview
                  </h2>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {[
                      { ok: Boolean(readmeFile), title: "Repository documentation", text: readmeFile ? "README is present." : "Add README.md." },
                      { ok: securityFiles.length > 0, title: "Security policy", text: securityFiles.length ? "Security metadata detected." : "Add SECURITY.md or CODEOWNERS." },
                      { ok: workflowFiles.length > 0, title: "Code scanning", text: workflowFiles.length ? "Workflow path detected." : "Add CI workflows." },
                      { ok: packageFiles.length > 0, title: "Dependency visibility", text: packageFiles.length ? "Dependency manifests detected." : "Add package manifests." },
                    ].map((item) => (
                      <div className="rounded-md border border-[#30363d] bg-[#010409] p-4" key={item.title}>
                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                          {item.ok ? <CheckCircle2 className="h-4 w-4 text-[#3fb950]" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4 text-[#f2cc60]" aria-hidden="true" />}
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#8b949e]">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                  <h2 className="text-sm font-semibold">Dependabot</h2>
                  <p className="mt-3 text-sm text-[#8b949e]">{packageFiles.length} dependency or package manifests found.</p>
                </Card>
              </div>
            ) : activeTab === "Insights" ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Health", value: `${repositoryHealthScore}%` },
                    { label: "Files", value: repository.files.length },
                    { label: "Commits", value: repository.commits.length },
                    { label: "Size", value: formatBytes(repositoryFileSize) },
                  ].map((metric) => (
                    <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]" key={metric.label}>
                      <p className="text-sm text-[#8b949e]">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                    </Card>
                  ))}
                </div>
                <Card className="border-[#30363d] bg-[#0d1117] p-5 text-[#f0f6fc]">
                  <h2 className="text-base font-semibold">Language and file mix</h2>
                  <div className="mt-4 space-y-3">
                    {repositoryExtensions.map(([extension, count]) => (
                      <div key={extension}>
                        <div className="mb-1 flex items-center justify-between text-sm"><span>.{extension}</span><span className="text-[#8b949e]">{count} files</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#21262d]">
                          <div className="h-full bg-[#58a6ff]" style={{ width: `${Math.max(8, (count / Math.max(repository.files.length, 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                    {repositoryExtensions.length === 0 ? <p className="text-sm text-[#8b949e]">No files to analyze yet.</p> : null}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
                <Card className="border-[#30363d] bg-[#0d1117] p-5 text-[#f0f6fc]">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <Package className="h-5 w-5 text-[#f2cc60]" aria-hidden="true" />
                    Packages and releases
                  </h2>
                  <div className="mt-5 divide-y divide-[#30363d] rounded-md border border-[#30363d]">
                    {packageFiles.map((file) => (
                      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm" key={file.id}>
                        <span className="truncate font-mono text-[#c9d1d9]">{file.path}</span>
                        <span className="text-[#8b949e]">{formatBytes(file.sizeBytes)}</span>
                      </div>
                    ))}
                    {packageFiles.length === 0 ? <div className="px-4 py-10 text-center text-sm text-[#8b949e]">No package manifests detected.</div> : null}
                  </div>
                </Card>
                <Card className="border-[#30363d] bg-[#0d1117] p-4 text-[#f0f6fc]">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <Rocket className="h-4 w-4 text-[#a371f7]" aria-hidden="true" />
                    Deployments
                  </h2>
                  <p className="mt-3 text-sm text-[#8b949e]">{repository.releases.length ? `${repository.releases.length} release targets available.` : "No deployments published yet."}</p>
                  <div className="mt-4 space-y-2">
                    {repository.releases.map((release) => (
                      <div className="rounded-md border border-[#30363d] bg-[#010409] p-3 text-sm" key={release.id}>
                        <p className="font-semibold">{release.name}</p>
                        <p className="mt-1 text-xs text-[#8b949e]">{release.tagName} · {formatDate(release.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </main>
        ) : (
          <main className="min-w-0">
            <Card className="border-slate-800 bg-slate-950/75">
              <div className="border-b border-slate-800 p-6">
                <h1 className="text-2xl font-semibold text-white">Create a new repository</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  A repository contains your files, revision history, README, members, and ProofX verification signals.
                </p>
              </div>

              <form action={createRepositoryAction} className="divide-y divide-slate-800">
                <section className="p-6">
                  <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Owner</span>
                      <input
                        className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 font-mono text-sm text-slate-400 outline-none"
                        disabled
                        value={userId.slice(0, 8)}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Repository name</span>
                      <input
                        className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/50"
                        name="name"
                        placeholder="proof-engine"
                        required
                      />
                    </label>
                  </div>
                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
                    <input
                      className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/50"
                      name="description"
                      placeholder="A short description of what this repository proves"
                    />
                  </label>
                </section>

                <section className="space-y-3 p-6">
                  <h2 className="text-sm font-semibold text-white">Visibility</h2>
                  <label className="flex gap-3 rounded-md border border-slate-800 bg-slate-950 p-4">
                    <input className="mt-1 h-4 w-4 accent-cyan-400" defaultChecked name="visibility" type="radio" value="private" />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        Private
                      </span>
                      <span className="mt-1 block text-sm text-slate-400">Only you and repository members can see this repository.</span>
                    </span>
                  </label>
                  <label className="flex gap-3 rounded-md border border-slate-800 bg-slate-950 p-4">
                    <input className="mt-1 h-4 w-4 accent-cyan-400" name="visibility" type="radio" value="public" />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Public
                      </span>
                      <span className="mt-1 block text-sm text-slate-400">Anyone can see this repository and its public proof signals.</span>
                    </span>
                  </label>
                  <label className="flex gap-3 rounded-md border border-slate-800 bg-slate-950 p-4">
                    <input className="mt-1 h-4 w-4 accent-cyan-400" name="visibility" type="radio" value="unlisted" />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        Unlisted
                      </span>
                      <span className="mt-1 block text-sm text-slate-400">Visible to people with the link, but kept out of broad discovery.</span>
                    </span>
                  </label>
                </section>

                <section className="grid gap-4 p-6 lg:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Tags</span>
                    <input className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="tags" placeholder="typescript, api" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Verified skills</span>
                    <input className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="verifiedSkills" placeholder="Next.js, PostgreSQL" />
                  </label>
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Source URL</span>
                    <input className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="sourceUrl" placeholder="https://github.com/org/repo" type="url" />
                  </label>
                </section>

                <section className="space-y-4 p-6">
                  <label className="flex items-start gap-3">
                    <input className="mt-1 h-4 w-4 accent-cyan-400" defaultChecked name="recruiterVisible" type="checkbox" />
                    <span>
                      <span className="block text-sm font-semibold text-white">Show this repository to recruiters</span>
                      <span className="mt-1 block text-sm text-slate-400">Expose ProofX trust impact, proof score, and verified skills on recruiter-facing views.</span>
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Initialize this repository with a README</span>
                    <textarea
                      className="min-h-40 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none"
                      name="readme"
                      placeholder="# Repository README"
                    />
                  </label>
                </section>

                <section className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
                  <Button className={githubPrimaryButtonClass} type="submit">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create repository
                  </Button>
                  <Link className="text-sm font-medium text-slate-400 hover:text-white" href="/dashboard/repositories">
                    Cancel
                  </Link>
                </section>
              </form>
            </Card>
          </main>
        )}
      </div>
    </div>
  );
}
