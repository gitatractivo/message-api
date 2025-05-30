import { db } from "@/config/database";
import {
  groups,
  groupMembers,
  users,
  groupMessages,
  groupMessageReads,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";

class GroupService {
  async createGroup(data: {
    name: string;
    description?: string;
    createdBy: number;
  }) {
    try {
      // Check if creator exists
      const creator = await db.query.users.findFirst({
        where: eq(users.id, data.createdBy),
      });

      if (!creator) {
        throw new AppError("Creator not found", 404);
      }

      // Create group and add creator as admin member in a transaction
      const result = await db.transaction(async (tx) => {
        // Create group
        const [group] = await tx
          .insert(groups)
          .values({
            name: data.name,
            description: data.description,
            createdBy: data.createdBy,
          })
          .returning();

        // Add creator as admin member
        await tx.insert(groupMembers).values({
          groupId: group.id,
          userId: data.createdBy,
          isAdmin: true, // Set creator as admin
        });

        return group;
      });

      return {
        group: {
          ...result,
          creator: {
            id: creator.id,
            firstName: creator.firstName,
            lastName: creator.lastName,
          },
        },
      };
    } catch (error) {
      logger.error("Group creation failed:", error);
      throw error;
    }
  }

  async updateGroup(
    groupId: number,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    try {
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });

      if (!group) {
        throw new AppError("Group not found", 404);
      }

      const [updatedGroup] = await db
        .update(groups)
        .set(data)
        .where(eq(groups.id, groupId))
        .returning();

      return { group: updatedGroup };
    } catch (error) {
      logger.error("Group update failed:", error);
      throw error;
    }
  }

  async deleteGroup(groupId: number) {
    try {
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });

      if (!group) {
        throw new AppError("Group not found", 404);
      }

      // Delete all related records in a transaction
      await db.transaction(async (tx) => {
        // First delete all message reads for this group's messages
        await tx
          .delete(groupMessageReads)
          .where(
            eq(
              groupMessageReads.messageId,
              tx
                .select({ id: groupMessages.id })
                .from(groupMessages)
                .where(eq(groupMessages.groupId, groupId))
            )
          );

        // Then delete all messages
        await tx
          .delete(groupMessages)
          .where(eq(groupMessages.groupId, groupId));

        // Then delete all group members
        await tx.delete(groupMembers).where(eq(groupMembers.groupId, groupId));

        // Finally delete the group
        await tx.delete(groups).where(eq(groups.id, groupId));
      });

      return { message: "Group and all related data deleted successfully" };
    } catch (error) {
      logger.error("Group deletion failed:", error);
      throw error;
    }
  }

  async addMember(groupId: number, userId: number) {
    try {
      // Check if group exists
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });

      if (!group) {
        throw new AppError("Group not found", 404);
      }

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Check if user is already a member
      const existingMember = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (existingMember) {
        throw new AppError("User is already a member of this group", 400);
      }

      // Add member
      const [member] = await db
        .insert(groupMembers)
        .values({
          groupId,
          userId,
        })
        .returning();

      return { member };
    } catch (error) {
      logger.error("Failed to add member:", error);
      throw error;
    }
  }

  async removeMember(groupId: number, userId: number) {
    try {
      // Check if member exists
      const member = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (!member) {
        throw new AppError("Member not found", 404);
      }

      // Check if user is the creator
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });

      if (group?.createdBy === userId) {
        throw new AppError("Cannot remove the group creator", 403);
      }

      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, userId)
          )
        );

      return { message: "Member removed successfully" };
    } catch (error) {
      logger.error("Failed to remove member:", error);
      throw error;
    }
  }

  async getGroupMembers(groupId: number) {
    try {
      const members = await db.query.groupMembers.findMany({
        where: eq(groupMembers.groupId, groupId),
        with: {
          user: true,
        },
      });

      return {
        members: members.map((member) => ({
          id: member.id,
          joinedAt: member.joinedAt,
          user: {
            id: member.user.id,
            firstName: member.user.firstName,
            lastName: member.user.lastName,
            email: member.user.email,
          },
        })),
      };
    } catch (error) {
      logger.error("Failed to fetch group members:", error);
      throw error;
    }
  }

  async getGroupById(groupId: number) {
    try {
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!group) {
        throw new AppError("Group not found", 404);
      }

      return {
        group: {
          ...group,
          members: group.members.map((member) => ({
            id: member.id,
            joinedAt: member.joinedAt,
            user: {
              id: member.user.id,
              firstName: member.user.firstName,
              lastName: member.user.lastName,
              email: member.user.email,
            },
          })),
        },
      };
    } catch (error) {
      logger.error("Failed to fetch group:", error);
      throw error;
    }
  }

  async getAllGroups() {
    try {
      const allGroups = await db.query.groups.findMany({
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
      });

      return {
        groups: allGroups.map((group) => ({
          ...group,
          members: group.members.map((member) => ({
            id: member.id,
            joinedAt: member.joinedAt,
            user: {
              id: member.user.id,
              firstName: member.user.firstName,
              lastName: member.user.lastName,
              email: member.user.email,
            },
          })),
        })),
      };
    } catch (error) {
      logger.error("Failed to fetch groups:", error);
      throw error;
    }
  }

  async makeGroupAdmin(groupId: number, userId: number, adminId: number) {
    try {
      // Check if the user making the request is an admin
      const admin = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, adminId),
          eq(groupMembers.isAdmin, true)
        ),
      });

      if (!admin) {
        throw new AppError("Only group admins can make other users admin", 403);
      }

      // Check if target user is a member
      const member = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (!member) {
        throw new AppError("User is not a member of this group", 404);
      }

      // Update member to admin
      const [updatedMember] = await db
        .update(groupMembers)
        .set({ isAdmin: true })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, userId)
          )
        )
        .returning();

      return { member: updatedMember };
    } catch (error) {
      logger.error("Failed to make group admin:", error);
      throw error;
    }
  }

  async removeGroupAdmin(groupId: number, userId: number, adminId: number) {
    try {
      // Check if the user making the request is an admin
      const admin = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, adminId),
          eq(groupMembers.isAdmin, true)
        ),
      });

      if (!admin) {
        throw new AppError("Only group admins can remove other admins", 403);
      }

      // Check if target user is an admin
      const member = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId),
          eq(groupMembers.isAdmin, true)
        ),
      });

      if (!member) {
        throw new AppError("User is not an admin of this group", 404);
      }

      // Check if trying to remove the last admin
      const admins = await db.query.groupMembers.findMany({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.isAdmin, true)
        ),
      });

      if (admins.length <= 1) {
        throw new AppError("Cannot remove the last admin of the group", 400);
      }

      // Remove admin status
      const [updatedMember] = await db
        .update(groupMembers)
        .set({ isAdmin: false })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, userId)
          )
        )
        .returning();

      return { member: updatedMember };
    } catch (error) {
      logger.error("Failed to remove group admin:", error);
      throw error;
    }
  }

  async leaveGroup(groupId: number, userId: number) {
    try {
      // Check if user is a member
      const member = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (!member) {
        throw new AppError("You are not a member of this group", 404);
      }

      // Check if trying to leave as last admin
      if (member.isAdmin) {
        const admins = await db.query.groupMembers.findMany({
          where: and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.isAdmin, true)
          ),
        });

        if (admins.length <= 1) {
          throw new AppError(
            "Cannot leave the group as the last admin. Please assign another admin first.",
            400
          );
        }
      }

      // Remove member
      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, userId)
          )
        );

      return { message: "Successfully left the group" };
    } catch (error) {
      logger.error("Failed to leave group:", error);
      throw error;
    }
  }

  async editGroupMessage(messageId: number, content: string, userId: number) {
    try {
      const message = await db.query.groupMessages.findFirst({
        where: eq(groupMessages.id, messageId),
      });

      if (!message) {
        throw new AppError("Message not found", 404);
      }

      if (message.senderId !== userId) {
        throw new AppError("You can only edit your own messages", 403);
      }

      const [updatedMessage] = await db
        .update(groupMessages)
        .set({ content, updatedAt: new Date() })
        .where(eq(groupMessages.id, messageId))
        .returning();

      return { message: updatedMessage };
    } catch (error) {
      logger.error("Failed to edit group message:", error);
      throw error;
    }
  }

  async deleteGroupMessage(messageId: number, userId: number) {
    try {
      const message = await db.query.groupMessages.findFirst({
        where: eq(groupMessages.id, messageId),
      });

      if (!message) {
        throw new AppError("Message not found", 404);
      }

      // Check if user is message sender or group admin
      const isAdmin = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, message.groupId),
          eq(groupMembers.userId, userId),
          eq(groupMembers.isAdmin, true)
        ),
      });

      if (message.senderId !== userId && !isAdmin) {
        throw new AppError(
          "You can only delete your own messages or must be a group admin",
          403
        );
      }

      await db.delete(groupMessages).where(eq(groupMessages.id, messageId));

      return { message: "Message deleted successfully" };
    } catch (error) {
      logger.error("Failed to delete group message:", error);
      throw error;
    }
  }

  async markGroupMessageAsRead(messageId: number, userId: number) {
    try {
      const message = await db.query.groupMessages.findFirst({
        where: eq(groupMessages.id, messageId),
      });

      if (!message) {
        throw new AppError("Message not found", 404);
      }

      // Check if user is a member of the group
      const isMember = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, message.groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (!isMember) {
        throw new AppError("You are not a member of this group", 403);
      }

      // Check if already read
      const existingRead = await db.query.groupMessageReads.findFirst({
        where: and(
          eq(groupMessageReads.messageId, messageId),
          eq(groupMessageReads.userId, userId)
        ),
      });

      if (existingRead) {
        return { message: "Message already marked as read" };
      }

      // Mark as read
      const [read] = await db
        .insert(groupMessageReads)
        .values({
          messageId,
          userId,
        })
        .returning();

      return { read };
    } catch (error) {
      logger.error("Failed to mark group message as read:", error);
      throw error;
    }
  }

  async getGroupMessages(
    groupId: number,
    userId: number,
    limit = 50,
    offset = 0
  ) {
    try {
      // Check if user is a member
      const isMember = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (!isMember) {
        throw new AppError("You are not a member of this group", 403);
      }

      const messages = await db.query.groupMessages.findMany({
        where: eq(groupMessages.groupId, groupId),
        orderBy: [desc(groupMessages.sentAt)],
        limit,
        offset,
        with: {
          sender: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          reads: {
            where: eq(groupMessageReads.userId, userId),
          },
        },
      });

      return {
        messages: messages.map((message) => ({
          ...message,
          isRead: message.reads.length > 0,
        })),
      };
    } catch (error) {
      logger.error("Failed to fetch group messages:", error);
      throw error;
    }
  }

  async sendGroupMessage(groupId: number, userId: number, content: string) {
    try {
      // Check if group exists
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });

      if (!group) {
        throw new AppError("Group not found", 404);
      }

      // Check if user is a member of the group
      const isMember = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
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
          senderId: userId,
          groupId,
        })
        .returning();

      return {
        message: {
          ...message,
          sender: {
            id: userId,
            firstName: (
              await db.query.users.findFirst({ where: eq(users.id, userId) })
            )?.firstName,
            lastName: (
              await db.query.users.findFirst({ where: eq(users.id, userId) })
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
}

export const groupService = new GroupService();
