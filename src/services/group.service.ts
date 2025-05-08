import { db } from "@/config/database";
import { groups, groupMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

      // Create group
      const [group] = await db
        .insert(groups)
        .values({
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
        })
        .returning();

      // Add creator as admin member
      await db.insert(groupMembers).values({
        groupId: group.id,
        userId: data.createdBy,
      });

      return {
        group: {
          ...group,
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

      await db.delete(groups).where(eq(groups.id, groupId));

      return { message: "Group deleted successfully" };
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
}

export const groupService = new GroupService();
