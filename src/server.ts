import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app";
import { logger } from "./config/logger";
import { setupSocketIO } from "@/sockets";
import { checkDatabaseConnection } from "./config/database";

// Load environment variables
dotenv.config();

// Get port from environment variables
const PORT = parseInt(process.env.PORT || "3000", 10);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Configure CORS for WebSocket
    methods: ["GET", "POST"],
  },
});

// Start the server
const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      logger.error("Failed to connect to database. Server startup aborted.");
      process.exit(1);
    }

    // Initialize WebSocket server
    setupSocketIO(io);

    // Start the HTTP server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(
        `User API docs available at http://localhost:${PORT}/api/docs/user`
      );
      logger.info(
        `Admin API docs available at http://localhost:${PORT}/api/docs/admin`
      );
    });

    // Handle server errors
    server.on("error", (error) => {
      logger.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received. Shutting down gracefully.");
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
});

// Start the server
startServer();
