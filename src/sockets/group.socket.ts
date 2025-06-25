import { Server, Socket } from "socket.io";
import { db } from "@/config/database";
import { groups, groupMembers, groupMessages } from "@/db/schema";
import { logger } from "@/config/logger";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

// Define group message schema for validation
const groupMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  groupId: z.number().int().positive(),
});

// Types for group messages
interface GroupMessagePayload {
  content: string;
  groupId: number;
}

interface GroupMessageResponse {
  id: number;
  content: string;
  groupId: number;
  senderId: number;
  sentAt: Date;
}

// Setup group message handlers
export const setupGroupMessageHandlers = (io: Server, socket: Socket): void => {
  // Handle joining group rooms for real-time updates
  socket.on("group:join", async (groupId: number, callback) => {
    try {
      logger.info("group:join", groupId);
      const userId = socket.user?.id;

      if (!userId) {
        throw new Error("User ID not found in socket");
      }

      // Check if user is a member of the group
      const member = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.userId, userId),
          eq(groupMembers.groupId, groupId)
        ),
      });

      if (!member) {
        throw new Error("User is not a member of this group");
      }

      // Join the group's socket room
      socket.join(`group:${groupId}`);

      // Send success callback if provided
      if (callback) {
        callback({ success: true });
      }

      logger.info(`User ${userId} joined group ${groupId} socket room`);
    } catch (error) {
      logger.error("Error joining group socket room:", error);

      // Send error callback if provided
      if (callback) {
        callback({
          success: false,
          error: "Failed to join group room",
        });
      }
    }
  });

  // Handle leaving group rooms
  socket.on("group:leave", async (groupId: number, callback) => {
    try {
      const userId = socket.user?.id;

      if (!userId) {
        throw new Error("User ID not found in socket");
      }

      // Leave the group's socket room
      socket.leave(`group:${groupId}`);

      // Send success callback if provided
      if (callback) {
        callback({ success: true });
      }

      logger.info(`User ${userId} left group ${groupId} socket room`);
    } catch (error) {
      logger.error("Error leaving group socket room:", error);

      // Send error callback if provided
      if (callback) {
        callback({
          success: false,
          error: "Failed to leave group room",
        });
      }
    }
  });

  // Handle sending group messages
  socket.on(
    "group-message:send",
    async (data: GroupMessagePayload, callback) => {
      try {
        // Payloads from some clients may be sent as strings; parse if needed.
        const payload = typeof data === "string" ? JSON.parse(data) : data;

        // Validate message data
        const validatedData = groupMessageSchema.parse(payload);

        const { content, groupId } = validatedData;
        const senderId = socket.user?.id;

        if (!senderId) {
          throw new Error("User ID not found in socket");
        }

        // Check if user is a member of the group
        const member = await db.query.groupMembers.findFirst({
          where: and(
            eq(groupMembers.userId, senderId),
            eq(groupMembers.groupId, groupId)
          ),
        });

        if (!member) {
          throw new Error("User is not a member of this group");
        }

        // Store message in database
        const [newMessage] = await db
          .insert(groupMessages)
          .values({
            content,
            groupId,
            senderId,
            sentAt: new Date(),
          })
          .returning();

        if (!newMessage) {
          throw new Error("Failed to create group message");
        }

        // Prepare response object
        const messageResponse: GroupMessageResponse = {
          id: newMessage.id,
          content: newMessage.content,
          groupId: newMessage.groupId,
          senderId: newMessage.senderId,
          sentAt: newMessage.sentAt,
        };

        // Broadcast to all other members in the group room
        socket
          .to(`group:${groupId}`)
          .emit("group-message:received", messageResponse);

        // Send success callback if provided
        if (callback) {
          callback({ success: true, message: messageResponse });
        }

        logger.info(
          `Group message sent to group ${groupId} by user ${senderId}`
        );
      } catch (error) {
        logger.error("Error sending group message:", error);

        // Send error callback if provided
        if (callback) {
          callback({
            success: false,
            error:
              error instanceof z.ZodError
                ? "Invalid message data"
                : "Failed to send group message",
          });
        }
      }
    }
  );
};
