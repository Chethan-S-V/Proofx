import { and, count, eq } from "drizzle-orm";
import {
  db,
  repositoryAnalyticsTable,
  repositoryBookmarksTable,
  repositoryForksTable,
  repositoryMembersTable,
  repositoriesTable,
  repositoryStarsTable,
  repositoryWatchersTable,
} from "../../db";

export type RepositoryAnalyticsSummary = {
  bookmarks: number;
  contributors: number;
  forks: number;
  proofImpact: number;
  proofSubmissions: number;
  recruiterViews: number;
  stars: number;
  trustImpact: number;
  views: number;
  watchers: number;
};

export const EMPTY_REPOSITORY_ANALYTICS: RepositoryAnalyticsSummary = {
  bookmarks: 0,
  contributors: 0,
  forks: 0,
  proofImpact: 0,
  proofSubmissions: 0,
  recruiterViews: 0,
  stars: 0,
  trustImpact: 0,
  views: 0,
  watchers: 0,
};

async function countRows(query: Promise<Array<{ value: number }>>) {
  const [result] = await query;
  return result?.value ?? 0;
}

export async function getRepositoryAnalytics(repositoryId: string): Promise<RepositoryAnalyticsSummary> {
  const [analytics] = await db
    .select()
    .from(repositoryAnalyticsTable)
    .where(eq(repositoryAnalyticsTable.repositoryId, repositoryId))
    .limit(1);

  const stars = await countRows(
    db.select({ value: count() }).from(repositoryStarsTable).where(eq(repositoryStarsTable.repositoryId, repositoryId))
  );
  const bookmarks = await countRows(
    db.select({ value: count() }).from(repositoryBookmarksTable).where(eq(repositoryBookmarksTable.repositoryId, repositoryId))
  );
  const contributors = await countRows(
    db.select({ value: count() }).from(repositoryMembersTable).where(eq(repositoryMembersTable.repositoryId, repositoryId))
  );
  const watchers = await countRows(
    db.select({ value: count() }).from(repositoryWatchersTable).where(eq(repositoryWatchersTable.repositoryId, repositoryId))
  );
  const forks = await countRows(
    db.select({ value: count() }).from(repositoryForksTable).where(eq(repositoryForksTable.parentRepositoryId, repositoryId))
  );

  return {
    bookmarks,
    contributors,
    forks,
    proofImpact: analytics?.proofImpact ?? 0,
    proofSubmissions: analytics?.proofSubmissions ?? 0,
    recruiterViews: analytics?.recruiterViews ?? 0,
    stars,
    trustImpact: analytics?.trustImpact ?? 0,
    views: analytics?.views ?? 0,
    watchers,
  };
}

export async function getRepositoryAnalyticsForOwner(ownerId: string): Promise<RepositoryAnalyticsSummary> {
  const repositories = await db
    .select({ id: repositoriesTable.id })
    .from(repositoriesTable)
    .where(and(eq(repositoriesTable.ownerId, ownerId), eq(repositoriesTable.isArchived, false)));

  if (repositories.length === 0) {
    return EMPTY_REPOSITORY_ANALYTICS;
  }

  const summaries = await Promise.all(repositories.map((repository) => getRepositoryAnalytics(repository.id)));

  return summaries.reduce<RepositoryAnalyticsSummary>(
    (total, summary) => ({
      bookmarks: total.bookmarks + summary.bookmarks,
      contributors: total.contributors + summary.contributors,
      forks: total.forks + summary.forks,
      proofImpact: total.proofImpact + summary.proofImpact,
      proofSubmissions: total.proofSubmissions + summary.proofSubmissions,
      recruiterViews: total.recruiterViews + summary.recruiterViews,
      stars: total.stars + summary.stars,
      trustImpact: total.trustImpact + summary.trustImpact,
      views: total.views + summary.views,
      watchers: total.watchers + summary.watchers,
    }),
    EMPTY_REPOSITORY_ANALYTICS
  );
}
