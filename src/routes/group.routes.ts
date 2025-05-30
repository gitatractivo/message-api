import { Router } from "express";
import { groupController } from "@/controllers/group.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validation.middleware";
import {
  createGroupSchema,
  updateGroupSchema,
  addGroupMemberSchema,
  removeGroupMemberSchema,
  makeGroupAdminSchema,
  removeGroupAdminSchema,
  leaveGroupSchema,
  editGroupMessageSchema,
  deleteGroupMessageSchema,
  markGroupMessageReadSchema,
  getGroupMessagesSchema,
  groupMessageSchema,
} from "@/validators/group.validator";
import type { Request } from "express";
import type { z } from "zod";

type CreateGroupRequest = Request<
  {},
  {},
  z.infer<typeof createGroupSchema>["body"]
>;
type UpdateGroupRequest = Request<
  { groupId: string },
  {},
  z.infer<typeof updateGroupSchema>["body"]
>;
type AddMemberRequest = Request<
  { groupId: string },
  {},
  z.infer<typeof addGroupMemberSchema>["body"]
>;
type RemoveMemberRequest = Request<
  { groupId: string },
  {},
  z.infer<typeof removeGroupMemberSchema>["body"]
>;
type GetGroupRequest = Request<{ groupId: string }>;
type GetGroupMembersRequest = Request<{ groupId: string }>;
type MakeGroupAdminInput = Request<{ groupId: string }, {}, { userId: number }>;
type RemoveGroupAdminInput = Request<
  { groupId: string },
  {},
  { userId: number }
>;
type LeaveGroupInput = Request<{ groupId: string }>;
type EditGroupMessageInput = Request<
  { messageId: string },
  {},
  { content: string }
>;
type DeleteGroupMessageInput = Request<{ messageId: string }>;
type MarkGroupMessageReadInput = Request<{ messageId: string }>;
type GetGroupMessagesInput = Request<
  { groupId: string },
  {},
  {},
  { limit?: number; offset?: number }
>;

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management endpoints
 */

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               description:
 *                 type: string
 *                 description: Description of the group
 *     responses:
 *       201:
 *         description: Group created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authenticate,
  validateRequest(createGroupSchema),
  (req: CreateGroupRequest, res, next) =>
    groupController.createGroup(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   patch:
 *     summary: Update a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the group
 *               description:
 *                 type: string
 *                 description: New description of the group
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:groupId",
  authenticate,
  validateRequest(updateGroupSchema),
  (req: UpdateGroupRequest, res, next) =>
    groupController.updateGroup(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group to delete
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.delete("/:groupId", authenticate, (req: GetGroupRequest, res, next) =>
  groupController.deleteGroup(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   post:
 *     summary: Add a member to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to add
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: User is already a member
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group or user not found
 *       500:
 *         description: Server error
 */
router.post(
  "/:groupId/members",
  authenticate,
  validateRequest(addGroupMemberSchema),
  (req: AddMemberRequest, res, next) =>
    groupController.addMember(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   delete:
 *     summary: Remove a member from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot remove the group creator
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:groupId/members",
  authenticate,
  validateRequest(removeGroupMemberSchema),
  (req: RemoveMemberRequest, res, next) =>
    groupController.removeMember(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   get:
 *     summary: Get all members of a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: List of group members
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/:groupId/members",
  authenticate,
  (req: GetGroupMembersRequest, res, next) =>
    groupController.getGroupMembers(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     summary: Get a specific group by ID
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: Group details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get("/:groupId", authenticate, (req: GetGroupRequest, res, next) =>
  groupController.getGroupById(req, res, next)
);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all groups
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, (req, res, next) =>
  groupController.getAllGroups(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/admin:
 *   post:
 *     summary: Make a user a group admin
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to make admin
 *     responses:
 *       200:
 *         description: User made admin successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only group admins can make other users admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/:groupId/admin",
  authenticate,
  validateRequest(makeGroupAdminSchema),
  (req: MakeGroupAdminInput, res, next) =>
    groupController.makeGroupAdmin(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/admin:
 *   delete:
 *     summary: Remove a user's admin status
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the admin to remove
 *     responses:
 *       200:
 *         description: Admin status removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only group admins can remove other admins
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:groupId/admin",
  authenticate,
  validateRequest(removeGroupAdminSchema),
  (req: RemoveGroupAdminInput, res, next) =>
    groupController.removeGroupAdmin(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: Successfully left the group
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not a member of the group
 *       500:
 *         description: Server error
 */
router.post(
  "/:groupId/leave",
  authenticate,
  validateRequest(leaveGroupSchema),
  (req: LeaveGroupInput, res, next) =>
    groupController.leaveGroup(req, res, next)
);

/**
 * @swagger
 * /api/groups/messages/{messageId}:
 *   patch:
 *     summary: Edit a group message
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: New message content
 *     responses:
 *       200:
 *         description: Message edited successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only edit own messages
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/messages/:messageId",
  authenticate,
  validateRequest(editGroupMessageSchema),
  (req: Request<{ messageId: string }, {}, { content: string }>, res, next) =>
    groupController.editGroupMessage(req, res, next)
);

/**
 * @swagger
 * /api/groups/messages/{messageId}:
 *   delete:
 *     summary: Delete a group message
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only delete own messages or must be group admin
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/messages/:messageId",
  authenticate,
  validateRequest(deleteGroupMessageSchema),
  (req: Request<{ messageId: string }>, res, next) =>
    groupController.deleteGroupMessage(req, res, next)
);

/**
 * @swagger
 * /api/groups/messages/{messageId}/read:
 *   post:
 *     summary: Mark a group message as read
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a member of the group
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.post(
  "/messages/:messageId/read",
  authenticate,
  validateRequest(markGroupMessageReadSchema),
  (req: Request<{ messageId: string }>, res, next) =>
    groupController.markGroupMessageAsRead(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/messages:
 *   get:
 *     summary: Get all messages from a group
 *     tags: [Groups]
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
 *       403:
 *         description: Not a member of the group
 *       500:
 *         description: Server error
 */
router.get(
  "/:groupId/messages",
  authenticate,
  validateRequest(getGroupMessagesSchema),
  (
    req: Request<
      { groupId: string },
      {},
      {},
      { limit?: number; offset?: number }
    >,
    res,
    next
  ) => groupController.getGroupMessages(req, res, next)
);

/**
 * @swagger
 * /api/groups/{groupId}/messages:
 *   post:
 *     summary: Send a message to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
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
  "/:groupId/messages",
  authenticate,
  validateRequest(groupMessageSchema),
  (req: Request<{ groupId: string }, {}, { content: string }>, res, next) =>
    groupController.sendGroupMessage(req, res, next)
);

export default router;
