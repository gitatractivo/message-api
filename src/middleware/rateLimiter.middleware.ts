import { Express } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "@/config/logger";

// Configure different rate limits
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },

  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts, please try again after an hour.",
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Special limiter for user registration
const registrationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP to 5 signup attempts per day
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many registration attempts, please try again tomorrow.",
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// API-specific limiter for message sending
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many messages, please slow down." },
  handler: (req, res, _next, options) => {
    logger.warn(`Message rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

export const setupRateLimiter = (app: Express): void => {
  app.use(standardLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", registrationLimiter);
  app.use("/api/messages", messageLimiter);

  logger.info("Rate limiters configured successfully");
};
