import { Request, Response, NextFunction } from "express";
import { adminService } from "@/services/admin.service";
import { logger } from "@/config/logger";
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
      const { firstName, lastName, email, password, country } = req.body;

      const result = await adminService.createAdmin({
        firstName,
        lastName,
        email,
        password,
        country,
      });

      res.status(201).json({
        status: "success",
        data: result,
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
      const { firstName, lastName, email, country } = req.body;

      const result = await adminService.updateAdmin(Number(adminId), {
        firstName,
        lastName,
        email,
        country,
      });

      res.status(200).json({
        status: "success",
        data: result,
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

      const result = await adminService.getAllAdmins(
        Number(limit),
        Number(offset),
        search as string
      );

      res.status(200).json({
        status: "success",
        data: result,
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

      const result = await adminService.getAdminById(Number(adminId));

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const search = req.query.search as string | undefined;

    const result = await adminService.getAllUsers(limit, offset, search);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const updateData = req.body;

    const result = await adminService.updateUser(userId, updateData);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    const result = await adminService.deleteUser(userId);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  getSystemStats = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getSystemStats();

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

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
          admin,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
