import { messages } from "@/db/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Message = InferSelectModel<typeof messages>;
export type MessageInsert = InferInsertModel<typeof messages>;
