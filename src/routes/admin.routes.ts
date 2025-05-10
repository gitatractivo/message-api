import { Router } from "express";
import { adminController } from "@/controllers/admin.controller";
import { authenticate, requireAdmin } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validation.middleware";
import {
  updateUserSchema,
  deleteUserSchema,
  getUsersSchema,
  adminLoginSchema,
} from "@/validators/admin.validator";

const router = Router();

// Public routes (no authentication required)
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login as admin
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         email:
 *                           type: string
 *                           example: admin@example.com
 *                         country:
 *                           type: string
 *                           example: United States
 *                         isVerified:
 *                           type: boolean
 *                           example: true
 *                         isAdmin:
 *                           type: boolean
 *                           example: true
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", validateRequest(adminLoginSchema), adminController.login);

// Protected routes (require authentication and admin privileges)
router.use(authenticate, requireAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [User Management]
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
 *     tags: [User Management]
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
 *     tags: [User Management]
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
 *     tags: [User Management]
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
router.get("/stats", adminController.getSystemStats);

/**
 * @swagger
 * /api/admin/{adminId}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the admin to retrieve
 *     responses:
 *       200:
 *         description: Admin details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.get("/:adminId", adminController.getAdminById);

/**
 * @swagger
 * /api/admin/{adminId}:
 *   put:
 *     summary: Update admin details
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the admin to update
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
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.put("/:adminId", adminController.updateAdmin);

/**
 * @swagger
 * /api/admin/{adminId}:
 *   delete:
 *     summary: Delete an admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the admin to delete
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.delete("/:adminId", adminController.deleteAdmin);

/**
 * @swagger
 * /api/admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - country
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               country:
 *                 type: string
 *                 example: "United States"
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         email:
 *                           type: string
 *                           example: admin@example.com
 *                         country:
 *                           type: string
 *                           example: United States
 *                         isVerified:
 *                           type: boolean
 *                           example: true
 *                         isAdmin:
 *                           type: boolean
 *                           example: true
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.post("/", adminController.createAdmin);

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of admins to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of admins to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering admins
 *     responses:
 *       200:
 *         description: List of admins
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get("/", adminController.getAllAdmins);

export default router;
