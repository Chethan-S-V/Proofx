import { SOURCE_CONTROL_STORAGE_BUCKET } from "../source-control/source-control.boundary";

export type RepositoryStorageObject = {
  branchId: string;
  commitId: string;
  path: string;
  repositoryId: string;
};

function normalizeStoragePath(path: string) {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

export function getRepositoryStoragePath(object: RepositoryStorageObject) {
  return `${object.repositoryId}/${object.branchId}/commits/${object.commitId}/${normalizeStoragePath(object.path)}`;
}

export function getRepositoryStorageBucket() {
  return SOURCE_CONTROL_STORAGE_BUCKET;
}
