export type RepositoryInsightMetric =
  | "trust_impact"
  | "proof_score"
  | "traffic"
  | "commit_velocity"
  | "contributor_growth"
  | "repository_health";

export type RepositoryInsightPoint = {
  measuredAt: Date;
  metric: RepositoryInsightMetric;
  repositoryId: string;
  value: number;
};
