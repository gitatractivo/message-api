import { Request } from "express";

// Extend Express Request to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: "user" | "admin";
      };
    }
  }
}
