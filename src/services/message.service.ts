import { db } from "@/config/database";
import {
  messages,
  users,
  groups,
  groupMembers,
  groupMessages,
} from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
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
      const sender = await db.query.users.findFirst({
        where: eq(users.id, senderId),
      });

      if (!receiver || !sender) {
        throw new AppError("Receiver or sender not found", 404);
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
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          },
          receiver: {
            id: receiverId,
            firstName: receiver.firstName,
            lastName: receiver.lastName,
            email: receiver.email,
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
        where: or(
          and(
            eq(messages.senderId, userId),
            eq(messages.receiverId, otherUserId)
          ),
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, userId)
          )
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

  async markMessageAsRead(userId: number, otherUserId: number) {
    try {
      const message = await db.query.messages.findFirst({
        where: and(
          eq(messages.senderId, otherUserId),
          eq(messages.receiverId, userId)
        ),
      });

      if (!message) {
        return { message: "All messages are already read" };
      }

      // Check if user is authorized to mark the message as read
      if (message.receiverId !== userId) {
        throw new AppError(
          "You are not authorized to mark this message as read",
          403
        );
      }

      const updatedMessages = await db
        .update(messages)
        .set({ read: true })
        .where(
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, userId),
            eq(messages.read, false)
          )
        )
        .returning();

      return { message: updatedMessages };
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

  async getAllConversations(userId: number) {
    try {
      // Get all unique users that the current user has conversations with
      const conversations = await db.query.messages.findMany({
        where: or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        ),
        orderBy: [desc(messages.sentAt)],
        with: {
          sender: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          receiver: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Group conversations by the other user
      const conversationMap = new Map();
      conversations.forEach((message) => {
        const otherUserId =
          message.senderId === userId ? message.receiverId : message.senderId;
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            firstName:
              message.senderId === userId
                ? message.receiver.firstName
                : message.sender.firstName,
            lastName:
              message.senderId === userId
                ? message.receiver.lastName
                : message.sender.lastName,
            lastMessage: message.content,
            lastMessageTime: message.sentAt,
            email:
              message.senderId === userId
                ? message.receiver.email
                : message.sender.email,
            unreadCount: 0,
          });
        }
        // Update unread count if message is unread and receiver is current user
        if (!message.read && message.receiverId === userId) {
          const conversation = conversationMap.get(otherUserId);
          conversation.unreadCount++;
          conversationMap.set(otherUserId, conversation);
        }
      });

      return {
        conversations: Array.from(conversationMap.values()).sort(
          (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        ),
      };
    } catch (error) {
      logger.error("Failed to get conversations:", error);
      throw error;
    }
  }

  async deleteMessage(userId: number, messageId: number) {
    try {
      const message = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
      });

      if (!message) {
        throw new AppError("Message not found", 404);
      }

      // Check if user is authorized to delete the message
      if (message.senderId !== userId) {
        throw new AppError(
          "You are not authorized to delete this message",
          403
        );
      }

      await db.delete(messages).where(eq(messages.id, messageId));

      return { success: true, message: "Message deleted successfully" };
    } catch (error) {
      logger.error("Failed to delete message:", error);
      throw error;
    }
  }
}

export const messageService = new MessageService();
