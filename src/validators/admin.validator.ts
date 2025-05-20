import { z, TypeOf } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAdminInput:
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
 *         firstName: Admin
 *         lastName: User
 *         email: admin@example.com
 *         password: StrongAdminPass123!
 *         country: United States
 */
export const createAdminSchema = z.object({
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
 *     UpdateAdminInput:
 *       type: object
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
 *         country:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *       example:
 *         firstName: New Admin
 *         lastName: Name
 *         email: new.admin@example.com
 *         country: Canada
 */
export const updateAdminSchema = z.object({
  params: z.object({
    adminId: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50)
      .optional(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50)
      .optional(),
    email: z.string().email("Invalid email format").optional(),
    country: z
      .string()
      .min(2, "Country must be at least 2 characters")
      .max(100)
      .optional(),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangeAdminPasswordInput:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *       example:
 *         currentPassword: OldPassword123!
 *         newPassword: NewStrongPassword123!
 */
export const changeAdminPasswordSchema = z.object({
  params: z.object({
    adminId: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  }),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
      email: z.string().email().optional(),
      isVerified: z.boolean().optional(),
      isAdmin: z.boolean().optional(),
      // make sure that atleast one field is provided in body and convert this to actual zod validation keys not object keys
    })
    .refine((data) => data.email || data.firstName || data.lastName, {
      message: "At least one field must be provided",
    }),
  // make sure that atleast one field is provided in body
});

export const getUsersSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50)),
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 0)),
    search: z.string().optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    userId: z.string().transform((val) => parseInt(val, 10)),
  }),
});

//offset and limit maybe string or number convert it to number
export const getAdminsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional().default(50),
    search: z.string().optional(),
    offset: z.coerce.number().optional().default(0),
  }),
});

export const deleteAdminSchema = z.object({
  params: z.object({
    adminId: z.string().transform((val) => parseInt(val, 10)),
  }),
});

export const getAdminByIdSchema = z.object({
  params: z.object({
    adminId: z.string().transform((val) => parseInt(val, 10)),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminLoginInput:
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
 *         email: admin@example.com
 *         password: AdminPass123!
 */
export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export type AdminLoginInput = TypeOf<typeof adminLoginSchema>;

// Export types
export type CreateAdminInput = TypeOf<typeof createAdminSchema>;
export type UpdateAdminInput = TypeOf<typeof updateAdminSchema>;
export type ChangeAdminPasswordInput = TypeOf<typeof changeAdminPasswordSchema>;
export type UpdateUserInput = TypeOf<typeof updateUserSchema>;
export type GetUsersInput = TypeOf<typeof getUsersSchema>;
export type DeleteUserInput = TypeOf<typeof deleteUserSchema>;
export type GetAdminsInput = TypeOf<typeof getAdminsSchema>;
export type DeleteAdminInput = TypeOf<typeof deleteAdminSchema>;
export type GetAdminByIdInput = TypeOf<typeof getAdminByIdSchema>;
