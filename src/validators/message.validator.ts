import { z, TypeOf, coerce } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     SendMessageInput:
 *       type: object
 *       required:
 *         - content
 *         - receiverId
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *         receiverId:
 *           type: integer
 *           minimum: 1
 *       example:
 *         content: Hello, how are you?
 *         receiverId: 5
 */
export const sendMessageSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Message content cannot be empty")
      .max(2000, "Message content is too long"),
    receiverId: z.coerce
      .number()
      .int()
      .positive("Receiver ID must be a positive integer"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     MarkMessageReadInput:
 *       type: object
 *       required:
 *         - messageId
 *       properties:
 *         messageId:
 *           type: integer
 *           minimum: 1
 *       example:
 *         messageId: 42
 */
export const markMessageReadSchema = z.object({
  params: z.object({
    otherUserId: z.coerce
      .number()
      .int()
      .positive("Other User ID must be a positive integer"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     MessageQueryParams:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           minimum: 1
 *           description: Filter messages by user ID (sender or receiver)
 *         unreadOnly:
 *           type: boolean
 *           description: Filter to show only unread messages
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           description: Number of messages to return per page
 *         offset:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Number of messages to skip
 *       example:
 *         userId: 5
 *         unreadOnly: true
 *         limit: 10
 *         offset: 0
 */
export const messageQuerySchema = z.object({
  query: z.object({
    userId: z.coerce
      .number()
      .int()
      .positive("User ID must be a positive integer")
      .optional(),
    unreadOnly: z.boolean().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

//schema for sending group message
export const sendGroupMessageSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Message content cannot be empty")
      .max(2000, "Message content is too long"),
    groupId: z.number().int().positive("Group ID must be a positive integer"),
  }),
});

//schema for get direct messages
export const getDirectMessagesSchema = z.object({
  query: z.object({
    userId: z.coerce
      .number()
      .int()
      .positive("User ID must be a positive integer")
      .optional(),
    otherUserId: z.coerce
      .number()
      .int()
      .positive("Other user ID must be a positive integer")
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

//schema for get group messages
export const getGroupMessagesSchema = z.object({
  query: z.object({
    groupId: z.coerce
      .number()
      .int()
      .positive("Group ID must be a positive integer")
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

//schema for delete message
export const deleteMessageSchema = z.object({
  params: z.object({
    messageId: z.coerce
      .number()
      .int()
      .positive("Message ID must be a positive integer"),
  }),
});

// Export types
export type SendMessageInput = TypeOf<typeof sendMessageSchema>;
export type MarkMessageReadInput = TypeOf<typeof markMessageReadSchema>;
export type MessageQueryInput = TypeOf<typeof messageQuerySchema>;
export type SendGroupMessageInput = TypeOf<typeof sendGroupMessageSchema>;
export type GetDirectMessagesInput = TypeOf<typeof getDirectMessagesSchema>;
export type GetGroupMessagesInput = TypeOf<typeof getGroupMessagesSchema>;
export type DeleteMessageInput = TypeOf<typeof deleteMessageSchema>;
