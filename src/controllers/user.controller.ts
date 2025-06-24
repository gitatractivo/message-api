import { Request, Response, NextFunction } from "express";
import { userService } from "@/services/user.service";
import { logger } from "@/config/logger";
import { SearchUsersInput } from "@/validators/user.validator";

class UserController {
  async searchUsers(
    req: Request<
      {},
      {},
      {},
      { query: string; limit?: string; offset?: string }
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const { query, limit, offset } = req.query;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await userService.searchUsers(
        query,
        limit ? parseInt(limit) : 20,
        offset ? parseInt(offset) : 0,
        userId
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to search users:", error);
      next(error);
    }
  }

  async getUserSuggestions(
    req: Request<{}, {}, {}, { limit?: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { limit } = req.query;
      const result = await userService.getUserSuggestions(
        userId,
        limit ? parseInt(limit) : 10
      );

      res.json(result);
    } catch (error) {
      logger.error("Failed to get user suggestions:", error);
      next(error);
    }
  }
}

export const userController = new UserController();
