import { groups, groupMembers, groupMessages } from "@/db/schema";

import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Group = InferSelectModel<typeof groups>;
export type GroupInsert = InferInsertModel<typeof groups>;

export type GroupMember = InferSelectModel<typeof groupMembers>;
export type GroupMemberInsert = InferInsertModel<typeof groupMembers>;

export type GroupMessage = InferSelectModel<typeof groupMessages>;
export type GroupMessageInsert = InferInsertModel<typeof groupMessages>;
