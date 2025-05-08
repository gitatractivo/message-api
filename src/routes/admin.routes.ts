import { Router } from "express";
import { adminController } from "@/controllers/admin.controller";
import { authenticate, requireAdmin } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validation.middleware";
import {
  updateUserSchema,
  deleteUserSchema,
  getUsersSchema,
} from "@/validators/admin.validator";

const router = Router();

//routes to create admin
router.post("/",  adminController.createAdmin);

//routes to get all admins
router.get("/",  adminController.getAllAdmins);

//routes to get admin by id
router.get(
  "/:adminId",

  adminController.getAdminById
);

//routes to update admin
router.put(
  "/:adminId",

  adminController.updateAdmin
);

//routes to delete admin
router.delete(
  "/:adminId",

  adminController.deleteAdmin
);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of users to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get(
  "/users",

  validateRequest(getUsersSchema),

  adminController.getAllUsers
);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   patch:
 *     summary: Update a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isVerified:
 *                 type: boolean
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/users/:userId",

  validateRequest(updateUserSchema),

  adminController.updateUser
);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/users/:userId",

  validateRequest(deleteUserSchema),
  adminController.deleteUser
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalGroups:
 *                   type: integer
 *                 totalMessages:
 *                   type: integer
 *                 activeUsers:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get(
  "/stats",

  adminController.getSystemStats
);

export default router;
