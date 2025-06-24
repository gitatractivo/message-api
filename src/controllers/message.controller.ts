import { Request, Response, NextFunction } from "express";
import { messageService } from "@/services/message.service";
import { logger } from "@/config/logger";
import {
  SendMessageInput,
  SendGroupMessageInput,
  GetDirectMessagesInput,
  GetGroupMessagesInput,
  MarkMessageReadInput,
  DeleteMessageInput,
} from "@/validators/message.validator";

class MessageController {
  async sendDirectMessage(
    req: Request<{}, {}, SendMessageInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const senderId = req.user?.id;
      const { receiverId, content } = req.body;

      if (!senderId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await messageService.sendDirectMessage(
        senderId,
        Number(receiverId),
        content
      );

      res.status(201).json(result);
    } catch (error) {
      logger.error("Failed to send direct message:", error);
      next(error);
    }
  }

  async sendGroupMessage(
    req: Request<{}, {}, SendGroupMessageInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const senderId = req.user?.id;
      const { groupId, content } = req.body;

      if (!senderId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await messageService.sendGroupMessage(
        senderId,
        Number(groupId),
        content
      );

      res.status(201).json(result);
    } catch (error) {
      logger.error("Failed to send group message:", error);
      next(error);
    }
  }

  async getDirectMessages(
    req: Request<
      {},
      {},
      {},
      GetDirectMessagesInput["query"]
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const { limit, offset,otherUserId } = req.query;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await messageService.getDirectMessages(
        userId,
        Number(otherUserId),
        Number(limit) || 50,
        Number(offset) || 0
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to get direct messages:", error);
      next(error);
    }
  }

  async getGroupMessages(
    req: Request<{}, {}, {}, GetGroupMessagesInput["query"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { groupId } = req.query;
      const { limit, offset } = req.query;

      const result = await messageService.getGroupMessages(
        Number(groupId),
        Number(limit) || 50,
        Number(offset) || 0
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to get group messages:", error);
      next(error);
    }
  }

  async markMessageAsRead(
    req: Request<{otherUserId:number}, {}, {}, {}>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const { otherUserId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await messageService.markMessageAsRead(
        userId,
        Number(otherUserId)
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to mark message as read:", error);
      next(error);
    }
  }

  async getUnreadMessageCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await messageService.getUnreadMessageCount(userId);

      res.json(result);
    } catch (error) {
      logger.error("Failed to get unread message count:", error);
      next(error);
    }
  }

  async getAllConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await messageService.getAllConversations(userId);

      res.json(result);
    } catch (error) {
      logger.error("Failed to get conversations:", error);
      next(error);
    }
  }

  async deleteMessage(
    req: Request<DeleteMessageInput["params"], {}, {}, {}>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await messageService.deleteMessage(
        userId,
        Number(messageId)
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to delete message:", error);
      next(error);
    }
  }
}

export const messageController = new MessageController();
