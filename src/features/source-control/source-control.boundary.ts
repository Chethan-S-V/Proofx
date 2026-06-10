export type SourceControlObjectKind = "repository" | "folder" | "file" | "branch" | "commit" | "tag" | "release";

export type SourceControlRef = {
  id: string;
  kind: SourceControlObjectKind;
  repositoryId: string;
};

export type SourceControlPath = {
  branchId: string;
  path: string;
  repositoryId: string;
};

export type SourceControlChangeType = "created" | "updated" | "renamed" | "moved" | "deleted";

export type SourceControlChange = {
  changeType: SourceControlChangeType;
  nextPath?: string;
  previousPath?: string;
  repositoryFileId?: string;
};

export const SOURCE_CONTROL_STORAGE_BUCKET = "repository-files";
