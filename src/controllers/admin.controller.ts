import { Request, Response, NextFunction } from "express";
import { adminService } from "@/services/admin.service";
import { logger } from "@/config/logger";
import { db } from "@/config/database";
import { users, groups, messages } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  CreateAdminInput,
  UpdateAdminInput,
  ChangeAdminPasswordInput,
  UpdateUserInput,
  GetUsersInput,
  DeleteUserInput,
  DeleteAdminInput,
  GetAdminsInput,
  GetAdminByIdInput,
  AdminLoginInput,
} from "@/validators/admin.validator";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/ApiError";
import { generateToken } from "@/utils/jwt.util";

/**
 * Admin controller for managing admin operations
 */
class AdminController {
  async createAdmin(
    req: Request<{}, {}, CreateAdminInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const admin = await adminService.createAdmin({
        firstName,
        lastName,
        email,
        password,
      });

      res.status(201).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAdmin(
    req: Request<UpdateAdminInput["params"], {}, UpdateAdminInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { adminId } = req.params;
      const { firstName, lastName, email } = req.body;

      const admin = await adminService.updateAdmin(Number(adminId), {
        firstName,
        lastName,
        email,
      });

      res.status(200).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request<
      ChangeAdminPasswordInput["params"],
      {},
      ChangeAdminPasswordInput["body"]
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { adminId } = req.params;
      const { currentPassword, newPassword } = req.body;

      const result = await adminService.changePassword(
        Number(adminId),
        currentPassword,
        newPassword
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAdmin(
    req: Request<DeleteAdminInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { adminId } = req.params;

      const result = await adminService.deleteAdmin(Number(adminId));

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmins(
    req: Request<{}, {}, {}, GetAdminsInput["query"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { limit = 50, offset = 0, search } = req.query;

      const admins = await adminService.getAllAdmins(
        Number(limit),
        Number(offset),
        search as string
      );

      res.status(200).json({
        status: "success",
        data: admins,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminById(
    req: Request<GetAdminByIdInput["params"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { adminId } = req.params;

      const admin = await adminService.getAdminById(Number(adminId));

      res.status(200).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.query);
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const search = req.query.search as string | undefined;

    console.log(limit, offset, search);
    const query = db.select().from(users).limit(limit).offset(offset);
    console.log(query);
    if (search) {
      query.where(
        eq(users.email, search) ||
          eq(users.firstName, search) ||
          eq(users.lastName, search)
      );
    }

    const allUsers = await query;

    res.status(200).json({
      status: "success",
      data: {
        users: allUsers,
        pagination: {
          limit,
          offset,
          total: allUsers.length,
        },
      },
    });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const updateData = req.body;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedUser) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        message: "User deleted successfully",
      },
    });
  });

  getSystemStats = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const [totalUsers] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const [totalGroups] = await db
        .select({ count: sql<number>`count(*)` })
        .from(groups);

      const [totalMessages] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages);

      const [activeUsers] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isVerified, true));

      res.status(200).json({
        status: "success",
        data: {
          totalUsers: totalUsers.count,
          totalGroups: totalGroups.count,
          totalMessages: totalMessages.count,
          activeUsers: activeUsers.count,
        },
      });
    }
  );

  async login(
    req: Request<{}, {}, AdminLoginInput["body"]>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;

      const admin = await adminService.verifyAdminCredentials(email, password);
      if (!admin) {
        throw new ApiError(401, "Invalid credentials");
      }

      const token = generateToken(admin.id, admin.email, "admin");

      res.status(200).json({
        status: "success",
        data: {
          admin: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
