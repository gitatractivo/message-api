import { Router } from "express";
import authRoutes from "./auth.routes";
import messageRoutes from "./message.routes";
import groupRoutes from "./group.routes";
import adminRoutes from "./admin.routes";
import { authenticate, requireAdmin } from "@/middleware/auth.middleware";

// Create main router
const router = Router();

// Apply auth routes - no authentication required
router.use("/auth", authRoutes);

// Apply message routes - authentication required
router.use("/messages", authenticate, messageRoutes);

// Apply group routes - authentication required
router.use("/groups", authenticate, groupRoutes);

// Apply admin routes
// Note: Login route doesn't require authentication, other routes do
router.use("/admin", adminRoutes);

export default router;
