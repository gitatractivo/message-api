import { db } from "@/config/database";
import {
  messages,
  users,
  groups,
  groupMembers,
  groupMessages,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";

class MessageService {
  async sendDirectMessage(
    senderId: number,
    receiverId: number,
    content: string
  ) {
    try {
      // Check if receiver exists
      const receiver = await db.query.users.findFirst({
        where: eq(users.id, receiverId),
      });

      if (!receiver) {
        throw new AppError("Receiver not found", 404);
      }

      // Create message
      const [message] = await db
        .insert(messages)
        .values({
          content,
          senderId,
          receiverId,
          read: false,
        })
        .returning();

      return {
        message: {
          ...message,
          sender: {
            id: senderId,
            firstName: (
              await db.query.users.findFirst({ where: eq(users.id, senderId) })
            )?.firstName,
            lastName: (
              await db.query.users.findFirst({ where: eq(users.id, senderId) })
            )?.lastName,
          },
          receiver: {
            id: receiverId,
            firstName: receiver.firstName,
            lastName: receiver.lastName,
          },
        },
      };
    } catch (error) {
      logger.error("Failed to send direct message:", error);
      throw error;
    }
  }

  async sendGroupMessage(senderId: number, groupId: number, content: string) {
    try {
      // Check if group exists
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });

      if (!group) {
        throw new AppError("Group not found", 404);
      }

      // Check if sender is a member of the group
      const isMember = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.userId, senderId),
          eq(groupMembers.groupId, groupId)
        ),
      });

      if (!isMember) {
        throw new AppError("You are not a member of this group", 403);
      }

      // Create message
      const [message] = await db
        .insert(groupMessages)
        .values({
          content,
          senderId,
          groupId,
        })
        .returning();

      return {
        message: {
          ...message,
          sender: {
            id: senderId,
            firstName: (
              await db.query.users.findFirst({ where: eq(users.id, senderId) })
            )?.firstName,
            lastName: (
              await db.query.users.findFirst({ where: eq(users.id, senderId) })
            )?.lastName,
          },
          group: {
            id: groupId,
            name: group.name,
          },
        },
      };
    } catch (error) {
      logger.error("Failed to send group message:", error);
      throw error;
    }
  }

  async getDirectMessages(
    userId: number,
    otherUserId: number,
    limit = 50,
    offset = 0
  ) {
    try {
      const directMessages = await db.query.messages.findMany({
        where: and(
          eq(messages.senderId, userId),
          eq(messages.receiverId, otherUserId)
        ),
        orderBy: [desc(messages.sentAt)],
        limit,
        offset,
      });

      return { messages: directMessages };
    } catch (error) {
      logger.error("Failed to fetch direct messages:", error);
      throw error;
    }
  }

  async getGroupMessages(groupId: number, limit = 50, offset = 0) {
    try {
      const messages = await db.query.groupMessages.findMany({
        where: eq(groupMessages.groupId, groupId),
        orderBy: [desc(groupMessages.sentAt)],
        limit,
        offset,
      });

      return { messages };
    } catch (error) {
      logger.error("Failed to fetch group messages:", error);
      throw error;
    }
  }

  async markMessageAsRead(userId: number, messageId: number) {
    try {
      const message = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
      });

      if (!message) {
        throw new AppError("Message not found", 404);
      }

      // Check if user is authorized to mark the message as read
      if (message.receiverId !== userId) {
        throw new AppError(
          "You are not authorized to mark this message as read",
          403
        );
      }

      const [updatedMessage] = await db
        .update(messages)
        .set({ read: true })
        .where(eq(messages.id, messageId))
        .returning();

      return { message: updatedMessage };
    } catch (error) {
      logger.error("Failed to mark message as read:", error);
      throw error;
    }
  }

  async getUnreadMessageCount(userId: number) {
    try {
      const unreadMessages = await db.query.messages.findMany({
        where: and(eq(messages.receiverId, userId), eq(messages.read, false)),
      });

      return { count: unreadMessages.length };
    } catch (error) {
      logger.error("Failed to get unread message count:", error);
      throw error;
    }
  }
}

export const messageService = new MessageService();
