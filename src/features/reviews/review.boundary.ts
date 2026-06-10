export type ReviewDecision = "approved" | "changes_requested" | "commented";

export type ReviewBoundaryModel = {
  authorId: string;
  decision: ReviewDecision;
  id: string;
  pullRequestId: string;
  repositoryId: string;
};
