import { Router } from "express";
import { messageController } from "@/controllers/message.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validation.middleware";
import {
  sendMessageSchema,
  markMessageReadSchema,
  messageQuerySchema,
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

  validateRequest(sendMessageSchema),

  messageController.sendDirectMessage
);

/**
 * @swagger
 * /api/messages/group:
 *   post:
 *     summary: Send a message to a group
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
 *               - groupId
 *               - content
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: ID of the group
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a member of the group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post(
  "/group",

  validateRequest(sendMessageSchema),

  messageController.sendGroupMessage
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
 *       - in: path
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

  validateRequest(messageQuerySchema),

  messageController.getDirectMessages
);

/**
 * @swagger
 * /api/messages/group/{groupId}:
 *   get:
 *     summary: Get messages from a group
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
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
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get(
  "/group/:groupId",

  validateRequest(messageQuerySchema),

  messageController.getGroupMessages
);

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   patch:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
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
  "/:messageId/read",

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
router.get("/unread/count", (req, res, next) =>
  messageController.getUnreadMessageCount(req, res, next)
);

export default router;
