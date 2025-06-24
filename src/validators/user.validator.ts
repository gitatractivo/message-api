import { z, TypeOf } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchUsersQuery:
 *       type: object
 *       properties:
 *         query:
 *           type: string
 *           description: Search query (name or email)
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           description: Maximum number of users to return
 *         offset:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Number of users to skip
 */
export const searchUsersSchema = z.object({
  query: z.object({
    query: z
      .string({ required_error: "Search query cannot be empty" })
      .min(1, "Search query cannot be empty"),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

// Export types
export type SearchUsersInput = TypeOf<typeof searchUsersSchema>;
