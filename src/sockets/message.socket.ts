import { Server, Socket } from "socket.io";
import { db } from "@/config/database";
import { messages } from "@/db/schema";
import { logger } from "@/config/logger";
import { z } from "zod";
import { and, eq, SQL } from "drizzle-orm";

// Define message schema for validation
const messageSchema = z.object({
  content: z.string().min(1).max(2000),
  receiverId: z.number().int().positive(),
});

// Types for messages
interface DirectMessagePayload {
  content: string;
  receiverId: number;
}

interface MessageResponse {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  sentAt: Date;
}

// Setup direct message handlers
export const setupDirectMessageHandlers = (
  io: Server,
  socket: Socket
): void => {
  // Handle sending direct messages
  socket.on(
    "direct-message:send",
    async (data: DirectMessagePayload, callback) => {
      try {
        // Validate message data
        const validatedData = messageSchema.parse(data);

        const { content, receiverId } = validatedData;
        const senderId = socket.user?.id;

        if (!senderId) {
          throw new Error("User ID not found in socket");
        }

        // Store message in database
        const [newMessage] = await db
          .insert(messages)
          .values({
            content,
            senderId,
            receiverId,
            sentAt: new Date(),
            read: false,
          })
          .returning();

        if (!newMessage) {
          throw new Error("Failed to create message");
        }

        // Prepare response object
        const messageResponse: MessageResponse = {
          id: newMessage.id,
          content: newMessage.content,
          senderId: newMessage.senderId,
          receiverId: newMessage.receiverId,
          sentAt: newMessage.sentAt,
        };

        // Emit to sender for confirmation
        socket.emit("direct-message:sent", messageResponse);

        // Emit to receiver if online
        io.to(`user:${receiverId}`).emit(
          "direct-message:received",
          messageResponse
        );

        // Send success callback if provided
        if (callback) {
          callback({ success: true, message: messageResponse });
        }

        logger.info(
          `Direct message sent from user ${senderId} to user ${receiverId}`
        );
      } catch (error) {
        logger.error("Error sending direct message:", error);

        // Send error callback if provided
        if (callback) {
          callback({
            success: false,
            error:
              error instanceof z.ZodError
                ? "Invalid message data"
                : "Failed to send message",
          });
        }
      }
    }
  );

  // Handle marking messages as read
  socket.on("direct-message:mark-read", async (messageId: number, callback) => {
    try {
      const userId = socket.user?.id;

      if (!userId) {
        throw new Error("User ID not found in socket");
      }

      // Update message in database
      const [updatedMessage] = await db
        .update(messages)
        .set({ read: true })
        .where(and(eq(messages.id, messageId), eq(messages.receiverId, userId)))
        .returning();

      if (!updatedMessage) {
        throw new Error("Message not found or not authorized");
      }

      // Send success callback if provided
      if (callback) {
        callback({ success: true });
      }

      logger.info(`Message ${messageId} marked as read by user ${userId}`);
    } catch (error) {
      logger.error("Error marking message as read:", error);

      // Send error callback if provided
      if (callback) {
        callback({
          success: false,
          error: "Failed to mark message as read",
        });
      }
    }
  });
};
