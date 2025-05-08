import { admins } from "@/db/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Admin = InferSelectModel<typeof admins>;
export type AdminInsert = InferInsertModel<typeof admins>;
