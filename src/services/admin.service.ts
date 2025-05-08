import { db } from "@/config/database";
import { admins } from "@/db/schema";
import { eq, like } from "drizzle-orm";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";
import { generateToken as generateJWTToken } from "@/utils/jwt.util";
import bcrypt from "bcryptjs";
import { Admin } from "@/models/admin.model";

/**
 * Admin service for managing admin operations
 */
export class AdminService {
  /**
   * Create a new admin (only existing admins can create new admins)
   */
  async createAdmin(adminData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
      // Check if admin already exists
      const existingAdmin = await db.query.admins.findFirst({
        where: eq(admins.email, adminData.email),
      });

      if (existingAdmin) {
        throw new AppError("Email already registered", 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 12);

      // Create admin
      const [admin] = await db
        .insert(admins)
        .values({
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: adminData.email,
          password: hashedPassword,
        })
        .returning();

      // Generate JWT token
      const token = generateJWTToken(admin.id, admin.email, "admin");

      return {
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
        },
        token,
      };
    } catch (error) {
      logger.error("Admin creation failed:", error);
      throw error;
    }
  }

  /**
   * Get all admins
   */
  async getAllAdmins(limit: number, offset: number, search: string) {
    try {
      const allAdmins = await db.query.admins.findMany({
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        limit,
        offset,
        where: search ? like(admins.firstName, `%${search}%`) : undefined,
      });

      return { admins: allAdmins };
    } catch (error) {
      logger.error("Failed to fetch admins:", error);
      throw error;
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(adminId: number) {
    try {
      const admin = await db.query.admins.findFirst({
        where: eq(admins.id, adminId),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      return { admin };
    } catch (error) {
      logger.error("Failed to fetch admin:", error);
      throw error;
    }
  }

  /**
   * Update an admin
   */
  async updateAdmin(
    adminId: number,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
    }
  ) {
    try {
      const admin = await db.query.admins.findFirst({
        where: eq(admins.id, adminId),
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      const [updatedAdmin] = await db
        .update(admins)
        .set(updateData)
        .where(eq(admins.id, adminId))
        .returning();

      return {
        admin: {
          id: updatedAdmin.id,
          firstName: updatedAdmin.firstName,
          lastName: updatedAdmin.lastName,
          email: updatedAdmin.email,
        },
      };
    } catch (error) {
      logger.error("Admin update failed:", error);
      throw error;
    }
  }

  /**
   * Delete an admin
   */
  async deleteAdmin(adminId: number) {
    try {
      const admin = await db.query.admins.findFirst({
        where: eq(admins.id, adminId),
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      await db.delete(admins).where(eq(admins.id, adminId));

      return { message: "Admin deleted successfully" };
    } catch (error) {
      logger.error("Admin deletion failed:", error);
      throw error;
    }
  }

  /**
   * Verify admin credentials
   */
  async verifyAdminCredentials(
    email: string,
    password: string
  ): Promise<Admin | null> {
    try {
      const admin = await db.query.admins.findFirst({
        where: eq(admins.email, email),
      });

      if (!admin) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return null;
      }

      return admin;
    } catch (error) {
      logger.error("Error verifying admin credentials:", error);
      throw error;
    }
  }

  /**
   * Change admin password
   */
  async changePassword(
    adminId: number,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const admin = await db.query.admins.findFirst({
        where: eq(admins.id, adminId),
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        admin.password
      );

      if (!isPasswordValid) {
        throw new AppError("Current password is incorrect", 401);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db
        .update(admins)
        .set({ password: hashedPassword })
        .where(eq(admins.id, adminId));

      return { message: "Password updated successfully" };
    } catch (error) {
      logger.error("Password change failed:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
