import { z, TypeOf } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateGroupInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *       example:
 *         name: Project Team
 *         description: Group for discussing project updates and tasks
 */
export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Group name must be at least 3 characters")
      .max(100),
    description: z.string().max(500).optional(),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateGroupInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *       example:
 *         name: Updated Project Team
 *         description: Updated description for the project team group
 */
export const updateGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Group name must be at least 3 characters")
      .max(100)
      .optional(),
    description: z.string().max(500).optional(),
  }),
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     AddGroupMemberInput:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: integer
 *           minimum: 1
 *       example:
 *         userId: 5
 */
export const addGroupMemberSchema = z.object({
  body: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     RemoveGroupMemberInput:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: integer
 *           minimum: 1
 *       example:
 *         userId: 5
 */
export const removeGroupMemberSchema = z.object({
  body: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupMessageInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *       example:
 *         content: This is a message to the group
 */
export const groupMessageSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Message content cannot be empty")
      .max(2000, "Message content is too long"),
  }),
});

//schema fo delete group
export const deleteGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

//schema for get group members
export const getGroupMembersSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

// Export types
export type CreateGroupInput = TypeOf<typeof createGroupSchema>;
export type UpdateGroupInput = TypeOf<typeof updateGroupSchema>;
export type AddGroupMemberInput = TypeOf<typeof addGroupMemberSchema>;
export type RemoveGroupMemberInput = TypeOf<typeof removeGroupMemberSchema>;
export type GroupMessageInput = TypeOf<typeof groupMessageSchema>;
export type DeleteGroupInput = TypeOf<typeof deleteGroupSchema>;
export type GetGroupMembersInput = TypeOf<typeof getGroupMembersSchema>;

//schema for get group by id
export const getGroupByIdSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

//schema for get all groups
export const getAllGroupsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
  }),
});

// Export types
export type GetAllGroupsInput = TypeOf<typeof getAllGroupsSchema>;
export type GetGroupByIdInput = TypeOf<typeof getGroupByIdSchema>;

//schema for making group admin
export const makeGroupAdminSchema = z.object({
  body: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

//schema for removing group admin
export const removeGroupAdminSchema = z.object({
  body: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

//schema for leaving group
export const leaveGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
});

//schema for editing group message
export const editGroupMessageSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Message content cannot be empty")
      .max(2000, "Message content is too long"),
  }),
  params: z.object({
    messageId: z.string().min(1, "Message ID is required"),
  }),
});

//schema for deleting group message
export const deleteGroupMessageSchema = z.object({
  params: z.object({
    messageId: z.string().min(1, "Message ID is required"),
  }),
});

//schema for marking group message as read
export const markGroupMessageReadSchema = z.object({
  params: z.object({
    messageId: z.string().min(1, "Message ID is required"),
  }),
});

// Export types
export type MakeGroupAdminInput = TypeOf<typeof makeGroupAdminSchema>;
export type RemoveGroupAdminInput = TypeOf<typeof removeGroupAdminSchema>;
export type LeaveGroupInput = TypeOf<typeof leaveGroupSchema>;
export type EditGroupMessageInput = TypeOf<typeof editGroupMessageSchema>;
export type DeleteGroupMessageInput = TypeOf<typeof deleteGroupMessageSchema>;
export type MarkGroupMessageReadInput = TypeOf<
  typeof markGroupMessageReadSchema
>;

//schema for get group messages
export const getGroupMessagesSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

// Export types
export type GetGroupMessagesInput = TypeOf<typeof getGroupMessagesSchema>;
