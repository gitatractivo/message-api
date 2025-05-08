import bcrypt from "bcrypt";
import { logger } from "@/config/logger";

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash password with the generated salt
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error("Error hashing password:", error);
    throw new Error("Password hashing failed");
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to check
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise resolving to boolean indicating if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error("Error comparing passwords:", error);
    throw new Error("Password comparison failed");
  }
};

/**
 * Generate a random verification token
 * @returns Random string token for email verification
 */
export const generateVerificationToken = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

/**
 * Generate a random reset password token
 * @returns Random string token for password reset
 */
export const generateResetToken = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
