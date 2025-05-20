import { db } from "@/config/database";
import { users, messages } from "@/db/schema";
import { eq, or, like, and, desc, sql, ne } from "drizzle-orm";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";

class UserService {
  async searchUsers(
    query: string,
    limit = 20,
    offset = 0,
    currentUserId: number
  ) {
    try {
      const searchResults = await db.query.users.findMany({
        where: and(
          or(
            like(users.firstName, `%${query}%`),
            like(users.lastName, `%${query}%`),
            like(users.email, `%${query}%`)
          ),
          ne(users.id, currentUserId), // Exclude current user
          eq(users.isAdmin, false) // Exclude admin users
        ),
        limit,
        offset,
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      return { users: searchResults };
    } catch (error) {
      logger.error("Failed to search users:", error);
      throw error;
    }
  }

  async getUserSuggestions(userId: number, limit = 10) {
    try {
      // Get users who have interacted with the current user
      const interactedUsers = await db.query.messages.findMany({
        where: or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        ),
        columns: {
          senderId: true,
          receiverId: true,
        },
      });

      // Get unique user IDs from interactions
      const interactedUserIds = new Set(
        interactedUsers.flatMap((msg) => [msg.senderId, msg.receiverId])
      );

      // Remove current user from the set
      interactedUserIds.delete(userId);

      // Get users who haven't interacted with the current user
      const suggestions = await db.query.users.findMany({
        where: and(
          sql`${users.id} != ${userId}`,
          sql`${users.id} NOT IN (${Array.from(interactedUserIds)})`
        ),
        limit,
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: [desc(users.createdAt)],
      });

      return { suggestions };
    } catch (error) {
      logger.error("Failed to get user suggestions:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
