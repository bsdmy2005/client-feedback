import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients-schema";
import { profilesTable } from "./profiles-schema";

export const adhocFeedbackTable = pgTable("adhoc_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  clientId: uuid("client_id").references(() => clientsTable.clientId),
  conversation: jsonb("conversation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AdhocFeedback = typeof adhocFeedbackTable.$inferSelect;
export type NewAdhocFeedback = typeof adhocFeedbackTable.$inferInsert;

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AdhocFeedbackWithClientName = {
  id: string;
  clientName: string;
  conversation: Message[];
  createdAt: Date;
  updatedAt: Date;
};

// Add this new type for the query result


