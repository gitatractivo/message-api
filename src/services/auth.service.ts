import bcrypt from "bcryptjs";
import { db } from "@/config/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { emailService } from "./email.service";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";
import { generateToken } from "@/utils/token";
import { generateToken as generateJWTToken } from "@/utils/jwt.util";
import { User } from "@/models/user.model";

class AuthService {
  //set return type for all methods
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    country: string;
  }): Promise<{ user: Pick<User, "id" | "firstName" | "lastName" | "email" | "country" | "isVerified">; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, userData.email),
      });

      if (existingUser) {
        throw new AppError("Email already registered", 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create verification token
      const verificationToken = generateToken();

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          country: userData.country,
          verificationToken,
          resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        })
        .returning();

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);

      // Generate JWT token
      const token = generateJWTToken(user.id, user.email, "user");

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          country: user.country,
          isVerified: user.isVerified,
        },
        token,
        
      };
    } catch (error) {
      logger.error("Registration failed:", error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: Pick<User, "id" | "firstName" | "lastName" | "email" | "country" | "isVerified">; token: string }> {
    try {
      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
      }

      // Generate JWT token
      const token = generateJWTToken(user.id, user.email, "user");

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          country: user.country,
          isVerified: user.isVerified,
        },
        token,
      };
    } catch (error) {
      logger.error("Login failed:", error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      console.log(token);
      const user = await db.query.users.findFirst({
        where: eq(users.verificationToken, token),
      });
      console.log(user);
      if (
        !user ||
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new AppError("Invalid or expired verification token", 400);
      }
      
      // console.log(user.id,);
      await db
        .update(users)
        .set({
          isVerified: true,
          verificationToken: null,
          resetPasswordExpires: null,
        })
        .where(eq(users.id, user.id));

      console.log("Email verified successfully");
      // Send welcome email
      // await emailService.sendWelcomeEmail(user.email, user.firstName);

      //return a dom page with a a message that email is verified successfully

      return { message: "Email verified successfully" };
    } catch (error) {
      logger.error("Email verification failed:", error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        throw new AppError("No user found with this email", 404);
      }

      const resetToken = generateToken();

      await db
        .update(users)
        .set({
          resetPasswordToken: resetToken,
          resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        })
        .where(eq(users.id, user.id));

      await emailService.sendPasswordResetEmail(email, resetToken);

      return { message: "Password reset email sent" };
    } catch (error) {
      logger.error("Forgot password failed:", error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.resetPasswordToken, token),
      });

      if (
        !user ||
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new AppError("Invalid or expired reset token", 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db
        .update(users)
        .set({
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        })
        .where(eq(users.id, user.id));

      return { message: "Password reset successful" };
    } catch (error) {
      logger.error("Password reset failed:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
