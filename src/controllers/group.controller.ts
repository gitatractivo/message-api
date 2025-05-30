import { Request, Response, NextFunction } from "express";
import { groupService } from "@/services/group.service";
import { logger } from "@/config/logger";
import {
  CreateGroupInput,
  UpdateGroupInput,
  AddGroupMemberInput,
  RemoveGroupMemberInput,
  DeleteGroupInput,
  GetGroupMembersInput,
  GetGroupByIdInput,
  GetAllGroupsInput,
  MakeGroupAdminInput,
  RemoveGroupAdminInput,
  LeaveGroupInput,
  EditGroupMessageInput,
  DeleteGroupMessageInput,
  MarkGroupMessageReadInput,
  GetGroupMessagesInput,
} from "@/validators/group.validator";

class GroupController {
  async createGroup(
    req: Request<{}, {}, CreateGroupInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, description } = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.createGroup({
        name,
        description,
        createdBy,
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error("Group creation failed:", error);
      next(error);
    }
  }

  async updateGroup(
    req: Request<UpdateGroupInput["params"], {}, UpdateGroupInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const { name, description } = req.body;

      const result = await groupService.updateGroup(Number(groupId), {
        name,
        description,
      });

      res.json(result);
    } catch (error) {
      logger.error("Group update failed:", error);
      next(error);
    }
  }

  async deleteGroup(
    req: Request<DeleteGroupInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;

      const result = await groupService.deleteGroup(Number(groupId));

      res.json(result);
    } catch (error) {
      logger.error("Group deletion failed:", error);
      next(error);
    }
  }

  async addMember(
    req: Request<
      AddGroupMemberInput["params"],
      {},
      AddGroupMemberInput["body"]
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;

      const result = await groupService.addMember(
        Number(groupId),
        Number(userId)
      );

      res.status(201).json(result);
    } catch (error) {
      logger.error("Failed to add member:", error);
      next(error);
    }
  }

  async removeMember(
    req: Request<
      RemoveGroupMemberInput["params"],
      {},
      RemoveGroupMemberInput["body"]
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;

      const result = await groupService.removeMember(
        Number(groupId),
        Number(userId)
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to remove member:", error);
      next(error);
    }
  }

  async getGroupMembers(
    req: Request<GetGroupMembersInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;

      const result = await groupService.getGroupMembers(Number(groupId));

      res.json(result);
    } catch (error) {
      logger.error("Failed to fetch group members:", error);
      next(error);
    }
  }

  async getGroupById(
    req: Request<GetGroupByIdInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;

      const result = await groupService.getGroupById(Number(groupId));

      res.json(result);
    } catch (error) {
      logger.error("Failed to fetch group:", error);
      next(error);
    }
  }

  async getAllGroups(
    req: Request<{}, {}, {}, GetAllGroupsInput["query"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await groupService.getAllGroups();

      res.json(result);
    } catch (error) {
      logger.error("Failed to fetch groups:", error);
      next(error);
    }
  }

  async makeGroupAdmin(
    req: Request<MakeGroupAdminInput["params"], {}, MakeGroupAdminInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.makeGroupAdmin(
        Number(groupId),
        Number(userId),
        adminId
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to make group admin:", error);
      next(error);
    }
  }

  async removeGroupAdmin(
    req: Request<RemoveGroupAdminInput["params"], {}, RemoveGroupAdminInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.removeGroupAdmin(
        Number(groupId),
        Number(userId),
        adminId
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to remove group admin:", error);
      next(error);
    }
  }

  async leaveGroup(
    req: Request<LeaveGroupInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.leaveGroup(Number(groupId), userId);

      res.json(result);
    } catch (error) {
      logger.error("Failed to leave group:", error);
      next(error);
    }
  }

  async editGroupMessage(
    req: Request<EditGroupMessageInput["params"], {}, EditGroupMessageInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.editGroupMessage(
        Number(messageId),
        content,
        userId
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to edit group message:", error);
      next(error);
    }
  }

  async deleteGroupMessage(
    req: Request<DeleteGroupMessageInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.deleteGroupMessage(
        Number(messageId),
        userId
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to delete group message:", error);
      next(error);
    }
  }

  async markGroupMessageAsRead(
    req: Request<MarkGroupMessageReadInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.markGroupMessageAsRead(
        Number(messageId),
        userId
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to mark group message as read:", error);
      next(error);
    }
  }

  async sendGroupMessage(
    req: Request<{ groupId: string }, {}, { content: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.sendGroupMessage(
        Number(groupId),
        userId,
        content
      );

      res.status(201).json(result);
    } catch (error) {
      logger.error("Failed to send group message:", error);
      next(error);
    }
  }

  async getGroupMessages(
    req: Request<{ groupId: string }, {}, {}, { limit?: number; offset?: number }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.params;
      const { limit, offset } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await groupService.getGroupMessages(
        Number(groupId),
        userId,
        Number(limit) || 50,
        Number(offset) || 0
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to fetch group messages:", error);
      next(error);
    }
  }
}

export const groupController = new GroupController();
