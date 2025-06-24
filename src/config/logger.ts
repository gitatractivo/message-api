import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configure daily rotation file transport for errors
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m", // 20MB
  maxFiles: "14d", // Keep logs for 14 days
  format: logFormat,
});

// Configure daily rotation file transport for all logs
const combinedRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 20MB
  maxFiles: "14d", // Keep logs for 14 days
  format: logFormat,
});

// Create winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [errorRotateTransport, combinedRotateTransport],
});

// If we're not in production, also log to console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create a stream object for Morgan middleware
export const logStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

// Export a function to log HTTP requests
export const logRequest = (req: any, res: any, next: any): void => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userId: req.user?.id || "unauthenticated",
    userAgent: req.headers["user-agent"],
  });
  next();
};

export { logger };
