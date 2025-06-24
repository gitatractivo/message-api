import { TypeOf, z } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - country
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *         country:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         password: SecurePass123!
 *         country: United States
 */
export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    country: z
      .string()
      .min(2, "Country must be at least 2 characters")
      .max(100),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *       example:
 *         email: john.doe@example.com
 *         password: SecurePass123!
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyEmailInput:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *       example:
 *         token: abc123def456
 */
export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ForgotPasswordInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *       example:
 *         email: john.doe@example.com
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - token
 *         - password
 *       properties:
 *         token:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *       example:
 *         token: abc123def456
 *         password: NewSecurePass123!
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  }),
});

// Export types
export type RegisterInput = TypeOf<typeof registerSchema>;
export type LoginInput = TypeOf<typeof loginSchema>;
export type VerifyEmailInput = TypeOf<typeof verifyEmailSchema>;
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>;
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;

