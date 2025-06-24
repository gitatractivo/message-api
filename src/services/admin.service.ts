import { db } from "@/config/database";
import { users, groups, messages } from "@/db/schema";
import { eq, like, and, not, or, sql } from "drizzle-orm";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";
import { generateToken as generateJWTToken } from "@/utils/jwt.util";
import bcrypt from "bcryptjs";
import { User } from "@/models/user.model";

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
    country: string;
  }): Promise<{
    admin: Pick<
      User,
      | "id"
      | "email"
      | "firstName"
      | "lastName"
      | "country"
      | "isVerified"
      | "isAdmin"
    >;
    token: string;
  }> {
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, adminData.email),
      });

      if (existingUser) {
        throw new AppError("Email already registered", 400);
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 12);

      const [admin] = await db
        .insert(users)
        .values({
          ...adminData,
          password: hashedPassword,
          isVerified: true,
          isAdmin: true,
        })
        .returning({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          country: users.country,
          isVerified: users.isVerified,
          isAdmin: users.isAdmin,
        });

      // Generate JWT token
      const token = generateJWTToken(admin.id, admin.email, "admin");

      return {
        admin,
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
  async getAllAdmins(
    limit: number,
    offset: number,
    search: string
  ): Promise<{
    admins: Pick<
      User,
      | "id"
      | "email"
      | "firstName"
      | "lastName"
      | "country"
      | "isVerified"
      | "isAdmin"
    >[];
  }> {
    try {
      const allAdmins = await db.query.users.findMany({
        where: and(
          eq(users.isAdmin, true),
          search ? like(users.firstName, `%${search}%`) : undefined
        ),
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          country: true,
          isVerified: true,
          isAdmin: true,
        },
        limit,
        offset,
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
  async getAdminById(adminId: number): Promise<{
    admin: Pick<
      User,
      | "id"
      | "email"
      | "firstName"
      | "lastName"
      | "country"
      | "isVerified"
      | "isAdmin"
    >;
  }> {
    try {
      const admin = await db.query.users.findFirst({
        where: eq(users.id, adminId),
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          country: true,
          isVerified: true,
          isAdmin: true,
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
      country?: string;
    }
  ): Promise<{
    admin: Pick<
      User,
      | "id"
      | "email"
      | "firstName"
      | "lastName"
      | "country"
      | "isVerified"
      | "isAdmin"
    >;
  }> {
    try {
      const admin = await db.query.users.findFirst({
        where: eq(users.id, adminId),
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      const [updatedAdmin] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, adminId))
        .returning({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          country: users.country,
          isVerified: users.isVerified,
          isAdmin: users.isAdmin,
        });

      return {
        admin: updatedAdmin,
      };
    } catch (error) {
      logger.error("Admin update failed:", error);
      throw error;
    }
  }

  /**
   * Delete an admin
   */
  async deleteAdmin(adminId: number): Promise<{ message: string }> {
    try {
      const admin = await db.query.users.findFirst({
        where: eq(users.id, adminId),
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      await db.delete(users).where(eq(users.id, adminId));

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
  ): Promise<Pick<
    User,
    | "id"
    | "email"
    | "firstName"
    | "lastName"
    | "country"
    | "isVerified"
    | "isAdmin"
  > | null> {
    try {
      const admin = await db.query.users.findFirst({
        where: eq(users.email, email),
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          country: true,
          isVerified: true,
          isAdmin: true,
          password: true,
        },
      });

      if (!admin) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return null;
      }

      // Remove password from the returned object
      const { password: _, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    } catch (error) {
      logger.error("Error verifying admin credentials:", error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(
    limit: number,
    offset: number,
    search?: string
  ): Promise<{
    users: Pick<
      User,
      | "id"
      | "email"
      | "firstName"
      | "lastName"
      | "country"
      | "isVerified"
      | "isAdmin"
    >[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    try {
      const query = db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          country: users.country,
          isVerified: users.isVerified,
          isAdmin: users.isAdmin,
        })
        .from(users)
        .where(
          and(
            not(eq(users.isAdmin, true)),
            search
              ? or(
                  like(users.email, `%${search}%`),
                  like(users.firstName, `%${search}%`),
                  like(users.lastName, `%${search}%`)
                )
              : undefined
          )
        )
        .limit(limit)
        .offset(offset);

      const allUsers = await query;

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(not(eq(users.isAdmin, true)));

      return {
        users: allUsers,
        pagination: {
          limit,
          offset,
          total: Number(count),
        },
      };
    } catch (error) {
      logger.error("Failed to fetch users:", error);
      throw error;
    }
  }

  /**
   * Update a user
   */
  async updateUser(
    userId: number,
    updateData: Partial<User>
  ): Promise<{
    user: Pick<
      User,
      | "id"
      | "email"
      | "firstName"
      | "lastName"
      | "country"
      | "isVerified"
      | "isAdmin"
    >;
  }> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          country: users.country,
          isVerified: users.isVerified,
          isAdmin: users.isAdmin,
        });

      if (!updatedUser) {
        throw new AppError("User not found", 404);
      }

      return {
        user: updatedUser,
      };
    } catch (error) {
      logger.error("User update failed:", error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    try {
      const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, userId))
        .returning();

      if (!deletedUser) {
        throw new AppError("User not found", 404);
      }

      return { message: "User deleted successfully" };
    } catch (error) {
      logger.error("User deletion failed:", error);
      throw error;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalGroups: number;
    totalMessages: number;
    activeUsers: number;
  }> {
    try {
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

      return {
        totalUsers: totalUsers.count,
        totalGroups: totalGroups.count,
        totalMessages: totalMessages.count,
        activeUsers: activeUsers.count,
      };
    } catch (error) {
      logger.error("Failed to fetch system stats:", error);
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
  ): Promise<{ message: string }> {
    try {
      const admin = await db.query.users.findFirst({
        where: eq(users.id, adminId),
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
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, adminId));

      return { message: "Password updated successfully" };
    } catch (error) {
      logger.error("Password change failed:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
