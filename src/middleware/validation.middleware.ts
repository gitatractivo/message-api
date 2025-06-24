import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "@/utils/appError";
import { logger } from "@/config/logger";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug(`Validating request for ${req.method} ${req.url} ${schema}`);
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      logger.debug(`Validation passed for ${req.method} ${req.url} ${schema}`);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // console.log(error);
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(new AppError("Validation failed", 400, errors));
      } else {
        logger.error("Validation error:", error);
        next(error);
      }
    }
  };
};
