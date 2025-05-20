// admin.swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { logger } from "../logger";

const adminSwaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Admin API",
      version: "1.0.0",
      description: "Admin management endpoints",
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
        url: "/",
        description: "API server",
      },
    ],
    tags: [
      { name: "Admin Auth", description: "Admin authentication endpoints" },
      { name: "Admin Management", description: "Admin CRUD operations" },
      { name: "User Management", description: "User administration endpoints" },
    ],
  },
  apis: ["./src/routes/admin.routes.ts"],
};

export const adminSpecs = swaggerJsdoc(adminSwaggerOptions);

export const setupAdminSwagger = (app: Express): void => {
  try {
    // Serve the Swagger JSON
    app.get("/api/docs/admin/swagger.json", (req, res) => {
      res.json(adminSpecs);
    });

    // Setup Swagger UI
    app.use(
      "/api/docs/admin",
      swaggerUi.serve,
      swaggerUi.setup(adminSpecs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: "none",
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
        },
      })
    );

    logger.info("Admin Swagger documentation initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Admin Swagger documentation:", error);
  }
};
