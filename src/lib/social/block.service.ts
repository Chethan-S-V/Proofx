import { and, eq } from "drizzle-orm";
import { db, userBlocksTable } from "../../db";

export async function blockUser(blockerId: string, blockedId: string, reason?: string) {
  if (blockerId === blockedId) throw new Error("You cannot block yourself.");
  await db.insert(userBlocksTable).values({ blockedId, blockerId, reason }).onConflictDoNothing();
}
export async function unblockUser(blockerId: string, blockedId: string) {
  await db.delete(userBlocksTable).where(and(eq(userBlocksTable.blockerId, blockerId), eq(userBlocksTable.blockedId, blockedId)));
}
export async function isBlockedBetween(firstUserId: string, secondUserId: string) {
  const rows = await db.select({ id: userBlocksTable.id }).from(userBlocksTable).where(and(eq(userBlocksTable.blockerId, firstUserId), eq(userBlocksTable.blockedId, secondUserId))).limit(1);
  if (rows.length) return true;
  const reverse = await db.select({ id: userBlocksTable.id }).from(userBlocksTable).where(and(eq(userBlocksTable.blockerId, secondUserId), eq(userBlocksTable.blockedId, firstUserId))).limit(1);
  return reverse.length > 0;
}
