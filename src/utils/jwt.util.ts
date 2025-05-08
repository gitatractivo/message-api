import jwt from "jsonwebtoken";
import { logger } from "@/config/logger";

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION || "86400", 10);

export const generateToken = (
  id: number,
  email: string,
  role: "user" | "admin"
): string => {
  try {
    return jwt.sign(
      { id, email, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION } // 24 hours by default
    );
  } catch (error) {
    logger.error("Error generating JWT token:", error);
    throw new Error("Token generation failed");
  }
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.error("Error verifying JWT token:", error);
    return null;
  }
};
