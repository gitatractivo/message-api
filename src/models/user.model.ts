import { users } from "@/db/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
