import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "@/config/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/config/logger";
import { ApiError } from "@/utils/ApiError";

// Extend Express Request to include user information
declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
    }
    interface Locals {
      user?: typeof users.$inferSelect;
    }
  }
}

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
    };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // console.log(user);
    // Store user in both req.user and res.locals
    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid token"));
    } else {
      next(error);
    }
  }
};

// Middleware to check if user is verified
export const requireVerifiedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user;

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!user.isVerified) {
      throw new ApiError(403, "Email verification required");
    }


    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is admin
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!user.isAdmin) {
      throw new ApiError(403, "Admin privileges required");
    }

    console.log("Admin verified");

    next();
  } catch (error) {
    next(error);
  }
};

// Refresh token middleware
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as {
      id: number;
    };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // Generate new access token
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    // Store user in both req.user and res.locals
    req.user = user;
    res.locals.user = user;

    // Set new access token in response header
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid refresh token"));
    } else {
      next(error);
    }
  }
};
