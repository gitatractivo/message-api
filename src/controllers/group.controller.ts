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
}

export const groupController = new GroupController();
