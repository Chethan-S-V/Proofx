import { desc, eq, sql } from "drizzle-orm";
import { db, organizationFollowsTable, organizationMembersTable, organizationPostsTable, organizationsTable, repositoriesTable, repositoryActivityTable } from "../../db";

export async function getDashboardSnapshot(userId: string) {
  const [events, challenges, repositoryActivity, organizations, follows, memberships, repositoryCount] = await Promise.all([
    db.select({ createdAt: organizationPostsTable.createdAt, id: organizationPostsTable.id, title: organizationPostsTable.title, updatedAt: organizationPostsTable.updatedAt }).from(organizationPostsTable).where(eq(organizationPostsTable.type, "event_announcement")).orderBy(desc(organizationPostsTable.updatedAt)).limit(4),
    db.select({ createdAt: organizationPostsTable.createdAt, id: organizationPostsTable.id, title: organizationPostsTable.title }).from(organizationPostsTable).where(eq(organizationPostsTable.type, "challenge_announcement")).orderBy(desc(organizationPostsTable.createdAt)).limit(4),
    db.select({ createdAt: repositoryActivityTable.createdAt, id: repositoryActivityTable.id, message: repositoryActivityTable.message, type: repositoryActivityTable.type }).from(repositoryActivityTable).where(eq(repositoryActivityTable.actorId, userId)).orderBy(desc(repositoryActivityTable.createdAt)).limit(12),
    db.select({ technologies: organizationsTable.technologies }).from(organizationsTable).orderBy(desc(organizationsTable.updatedAt)).limit(20),
    db.select({ createdAt: organizationFollowsTable.createdAt }).from(organizationFollowsTable).where(eq(organizationFollowsTable.userId, userId)).orderBy(desc(organizationFollowsTable.createdAt)).limit(6),
    db.select({ createdAt: organizationMembersTable.createdAt }).from(organizationMembersTable).where(eq(organizationMembersTable.userId, userId)).orderBy(desc(organizationMembersTable.createdAt)).limit(6),
    db.select({ count: sql<number>`count(*)::int` }).from(repositoriesTable).where(eq(repositoriesTable.ownerId, userId)),
  ]);
  const trends = [...new Set(organizations.flatMap((organization) => organization.technologies))].slice(0, 8);
  const activity = [
    ...repositoryActivity.map((item) => ({ createdAt: item.createdAt, id: item.id, label: item.message, type: item.type })),
    ...follows.map((item, index) => ({ createdAt: item.createdAt, id: `follow-${index}`, label: "Followed an organization", type: "new follower" })),
    ...memberships.map((item, index) => ({ createdAt: item.createdAt, id: `membership-${index}`, label: "Joined an organization", type: "organization joined" })),
  ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, 12);
  return { activity, challenges, events, snapshot: { connections: follows.length, organizations: memberships.length, repositories: repositoryCount[0]?.count ?? 0 }, trends };
}
