// swagger.ts

import { Express } from "express";
import { logger } from "./logger";
import { addSwaggerEndpoint } from "./swagger/shared.swagger";
import { userSpecs } from "./swagger/user.swagger";
import { adminSpecs } from "./swagger/admin.swagger";

export const setupSwagger = (app: Express): void => {
  try {
    // Setup both Swagger instances using the workaround
    addSwaggerEndpoint(app, [
      { key: "user", spec: userSpecs },
      { key: "admin", spec: adminSpecs },
    ]);

    logger.info("Swagger documentation initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Swagger documentation:", error);
  }
};
