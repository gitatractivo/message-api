import { Router } from "express";
import authRoutes from "./auth.routes";
import messageRoutes from "./message.routes";
import groupRoutes from "./group.routes";
import adminRoutes from "./admin.routes";
import userRoutes from "./user.routes";
import { authenticate, requireAdmin } from "@/middleware/auth.middleware";

// Create main router
const router = Router();

// only for testing check if env has dev env
// if (process.env.NODE_ENV === "development") {
//   router.use((req, res, next) => {
//     console.log("--------------------------------");
//     console.log("--------------------------------");
//     console.log(req.url);
//     console.log("--------------------------------");
//     next();
//   });
// }

// Apply auth routes - no authentication required
router.use("/auth", authRoutes);

// Apply message routes - authentication required
router.use("/messages", authenticate, messageRoutes);

// Apply group routes - authentication required
router.use("/groups", authenticate, groupRoutes);

// Apply user routes - authentication required
router.use("/users", authenticate, userRoutes);

// Apply admin routes
// Note: Login route doesn't require authentication, other routes do
router.use("/admin", adminRoutes);

export default router;
