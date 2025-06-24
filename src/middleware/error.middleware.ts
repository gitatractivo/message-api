import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";
import { logger } from "@/config/logger";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public stack = ""
  ) {
    super(message);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Global error handling middleware
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("Error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      status: "fail",
      message: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      status: "fail",
      message: "Token expired",
    });
    return;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
    return;
  }

  // Handle other errors
  res.status(500).json({
    status: "error",
    message:err.message,
  });
};

// Function to handle async errors
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
