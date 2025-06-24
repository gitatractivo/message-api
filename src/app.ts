import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { logRequest, logger } from "./config/logger";
import { setupSwagger } from "./config/swagger";
import { checkDatabaseConnection } from "./config/database";
import { errorMiddleware } from "@/middleware/error.middleware";
import { setupRateLimiter } from "@/middleware/rateLimiter.middleware";
import routes from "./routes";

// Create Express application
const app: Express = express();

// Apply global middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS configuration
app.use(compression()); // Response compression

app.use(express.json()); // Parse JSON request bodies

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(logRequest); // Request logging

// Apply rate limiting
setupRateLimiter(app);

// Register API routes
app.use("/api", routes);

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get("/health", async (req, res) => {
  const dbStatus = await checkDatabaseConnection();

  if (dbStatus) {
    return res.status(200).json({
      status: "ok",
      timestamp: new Date(),
      services: {
        database: "up",
        api: "up",
      },
    });
  } else {
    return res.status(500).json({
      status: "error",
      timestamp: new Date(),
      services: {
        database: "down",
        api: "up",
      },
    });
  }
});

// Global error handling middleware
app.use(errorMiddleware);

// Handle unmatched routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
});

// Log any unhandled rejections
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection:", reason);
});

export default app;
