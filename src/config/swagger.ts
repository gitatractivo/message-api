import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { logger } from "./logger";

// Base Swagger documentation options
const baseOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Secure Messaging API",
      version: "1.0.0",
      description: "REST API with user/admin roles and WebSocket messaging",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

// User-specific Swagger documentation
const userSwaggerOptions = {
  ...baseOptions,
  swaggerDefinition: {
    ...baseOptions.swaggerDefinition,
    info: {
      ...baseOptions.swaggerDefinition.info,
      title: "User Messaging API",
      description: "User endpoints for messaging application",
    },
    tags: [
      { name: "Authentication", description: "User authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Messages", description: "Direct messaging endpoints" },
      {
        name: "Groups",
        description: "Group management and messaging endpoints",
      },
    ],
  },
};

// Admin-specific Swagger documentation
const adminSwaggerOptions = {
  ...baseOptions,
  swaggerDefinition: {
    ...baseOptions.swaggerDefinition,
    info: {
      ...baseOptions.swaggerDefinition.info,
      title: "Admin Messaging API",
      description: "Admin endpoints for messaging application",
    },
    tags: [
      { name: "Authentication", description: "Admin authentication endpoints" },
      { name: "Admins", description: "Admin management endpoints" },
      { name: "User Management", description: "User administration endpoints" },
      { name: "System", description: "System management endpoints" },
    ],
  },
};

// Generate Swagger specifications
const userSpecs = swaggerJsdoc(userSwaggerOptions);
const adminSpecs = swaggerJsdoc(adminSwaggerOptions);

// Setup function to configure Swagger routes
export const setupSwagger = (app: Express): void => {
  try {
    // User Swagger UI at /api/docs/user
    app.use(
      "/api/docs/user",
      swaggerUi.serve,
      swaggerUi.setup(userSpecs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
      })
    );

    // Admin Swagger UI at /api/docs/admin
    app.use(
      "/api/docs/admin",
      swaggerUi.serve,
      swaggerUi.setup(adminSpecs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
      })
    );

    logger.info("Swagger documentation initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Swagger documentation:", error);
  }
};
