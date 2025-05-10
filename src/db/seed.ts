import { db } from "@/config/database";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { logger } from "@/config/logger";

async function seed() {
  try {
    // Check if default admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@example.com"),
    });

    if (existingAdmin) {
      logger.info("Default admin already exists");
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash("admin123", 12);

    await db.insert(users).values({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: hashedPassword,
      country: "US", // Default country
      isVerified: true, // Admin is pre-verified
      isAdmin: true, // Set admin flag
    });

    logger.info("Default admin created successfully");
  } catch (error) {
    logger.error("Error seeding default admin:", error);
    throw error;
  }
}

// Run seeder
seed()
  .then(() => {
    logger.info("Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Seeding failed:", error);
    process.exit(1);
  });
