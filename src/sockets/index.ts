import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { logger } from "@/config/logger";
import { setupDirectMessageHandlers } from "./message.socket";
import { setupGroupMessageHandlers } from "./group.socket";
import { SocketUser } from "@/types/socket.types";

// Authenticate socket connection using JWT
const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new Error("Authentication error: Token required"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_jwt_secret"
    ) as SocketUser;
    socket.user = decoded;
    next();
  } catch (error) {
    logger.error("Socket authentication error:", error);
    next(new Error("Authentication error: Invalid token"));
  }
};

// Socket.IO main setup function
export const setupSocketIO = (io: Server): void => {
  // Use authentication middleware
  io.use(authenticateSocket);

  // Handle new connections
  io.on("connection", (socket: Socket) => {
    const userId = socket.user?.id;

    if (userId) {
      logger.info(`User ${userId} connected to WebSocket`);

      // Join user's private room for direct messages
      socket.join(`user:${userId}`);

      // Setup direct messaging handlers
      setupDirectMessageHandlers(io, socket);

      // Setup group messaging handlers
      setupGroupMessageHandlers(io, socket);

      // Handle disconnection
      socket.on("disconnect", () => {
        logger.info(`User ${userId} disconnected from WebSocket`);
      });
    } else {
      // This should not happen due to middleware, but handle it anyway
      logger.warn("Unauthenticated socket connection attempt");
      socket.disconnect(true);
    }
  });
};
