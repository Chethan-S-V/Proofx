import type { SourceControlChange } from "../source-control/source-control.boundary";

export type CommitBoundaryModel = {
  authorId: string;
  branchId: string;
  createdAt: Date;
  id: string;
  message: string;
  repositoryId: string;
};

export type CommitCreateRequest = {
  authorId: string;
  branchId: string;
  changes: SourceControlChange[];
  message: string;
  repositoryId: string;
};
