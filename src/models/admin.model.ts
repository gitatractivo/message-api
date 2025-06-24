import { users } from "@/db/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Admin = InferSelectModel<typeof users>;
export type AdminInsert = InferInsertModel<typeof users>;
