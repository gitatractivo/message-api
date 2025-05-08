import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";
import { logger } from "./logger";
import dotenv from "dotenv";

dotenv.config();


const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/messaging_db";


const pool = new Pool({
  connectionString,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

// Event handlers for pool
pool.on("connect", () => {
  logger.info("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  logger.error("PostgreSQL pool error:", err);
});

// Initialize Drizzle ORM with the connection pool and schema
export const db = drizzle(pool, { schema });

// Helper function to check database connection
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();
    logger.info("Database connection successful");
    return true;
  } catch (error) {
    logger.error("Database connection failed:", error);
    return false;
  }
};

// Close database connection on process termination
process.on("SIGINT", async () => {
  try {
    await pool.end();
    logger.info("Database connection pool closed");
    process.exit(0);
  } catch (err) {
    logger.error("Error closing database connection pool:", err);
    process.exit(1);
  }
});
