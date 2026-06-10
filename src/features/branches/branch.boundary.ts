export type BranchProtectionLevel = "none" | "linear_history" | "review_required" | "locked";

export type BranchBoundaryModel = {
  id: string;
  isDefault: boolean;
  name: string;
  protectionLevel: BranchProtectionLevel;
  repositoryId: string;
};

export type BranchCreateRequest = {
  name: string;
  repositoryId: string;
  sourceBranchId?: string;
};
