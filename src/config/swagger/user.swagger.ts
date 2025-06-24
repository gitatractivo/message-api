// user.swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { logger } from "../logger";

const userSwaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "User Messaging API",
      version: "1.0.0",
      description: "User endpoints for messaging application",
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
      { name: "Authentication", description: "User authentication endpoints" },
      
      { name: "Messages", description: "Direct messaging endpoints" },
      {
        name: "Groups",
        description: "Group management and messaging endpoints",
      },
    ],
  },
  apis: [
    "./src/routes/auth.routes.ts",
    "./src/routes/message.routes.ts",
    "./src/routes/group.routes.ts",
    "./src/routes/user.routes.ts",
  ],
};

export const userSpecs = swaggerJsdoc(userSwaggerOptions);

export const setupUserSwagger = (app: Express): void => {
  try {
    // Serve the Swagger JSON
    app.get("/api/docs/user/swagger.json", (req, res) => {
      res.json(userSpecs);
    });

    // Setup Swagger UI
    app.use(
      "/api/docs/user",
      swaggerUi.serve,
      swaggerUi.setup(userSpecs, {
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

    logger.info("User Swagger documentation initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize User Swagger documentation:", error);
  }
};
