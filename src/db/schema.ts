import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  foreignKey,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }),
  resetPasswordToken: varchar("reset_password_token", { length: 255 }),
  resetPasswordExpires: timestamp("reset_password_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  groupMembers: many(groupMembers),
}));

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references((): AnyPgColumn => admins.id),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
});

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  messages: many(groupMessages),
}));

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .references(() => groups.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id")
    .references(() => users.id)
    .notNull(),
  receiverId: integer("receiver_id")
    .references(() => users.id)
    .notNull(),
  read: boolean("read").default(false).notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  groupId: integer("group_id")
    .references(() => groups.id)
    .notNull(),
  senderId: integer("sender_id")
    .references(() => users.id)
    .notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const groupMessageReads = pgTable("group_message_reads", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id")
    .references(() => groupMessages.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

export const groupMessagesRelations = relations(
  groupMessages,
  ({ one, many }) => ({
    group: one(groups, {
      fields: [groupMessages.groupId],
      references: [groups.id],
    }),
    sender: one(users, {
      fields: [groupMessages.senderId],
      references: [users.id],
    }),
    reads: many(groupMessageReads),
  })
);

export const groupMessageReadsRelations = relations(
  groupMessageReads,
  ({ one }) => ({
    message: one(groupMessages, {
      fields: [groupMessageReads.messageId],
      references: [groupMessages.id],
    }),
    user: one(users, {
      fields: [groupMessageReads.userId],
      references: [users.id],
    }),
  })
);
