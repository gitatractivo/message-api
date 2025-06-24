import { Router } from "express";
import { messageController } from "@/controllers/message.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validation.middleware";
import {
  sendMessageSchema,
  markMessageReadSchema,
  messageQuerySchema,
  deleteMessageSchema,
} from "@/validators/message.validator";
import type { Request } from "express";
import type { z } from "zod";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management endpoints
 */

/**
 * @swagger
 * /api/messages/direct:
 *   post:
 *     summary: Send a direct message to a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: integer
 *                 description: ID of the message receiver
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receiver not found
 *       500:
 *         description: Server error
 */
router.post(
  "/direct",
  authenticate,
  validateRequest(sendMessageSchema),
  messageController.sendDirectMessage
);

/**
 * @swagger
 * /api/messages/direct/{otherUserId}:
 *   get:
 *     summary: Get direct messages between current user and another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the other user
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/direct/:otherUserId",
  authenticate,
  validateRequest(messageQuerySchema),
  messageController.getDirectMessages
);

/**
 * @swagger
 * /api/messages/{otherUserId}/read:
 *   patch:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message to mark as read
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to mark this message as read
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:otherUserId/read",
  authenticate,
  validateRequest(markMessageReadSchema),
  // @ts-ignore
  messageController.markMessageAsRead
);

/**
 * @swagger
 * /api/messages/unread/count:
 *   get:
 *     summary: Get count of unread messages for the current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Number of unread messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of unread messages
 *                   example: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/unread/count",
  authenticate,
  messageController.getUnreadMessageCount
);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations for the current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/conversations",
  authenticate,
  messageController.getAllConversations
);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Delete a message from conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this message
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:messageId",
  authenticate,
  validateRequest(deleteMessageSchema),
  // @ts-ignore
  messageController.deleteMessage
);

export default router;
