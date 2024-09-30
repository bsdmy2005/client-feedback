import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients-schema";

export const globalEnum = pgEnum("global", ["true", "false"]);


export const questionsTable = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type", { enum: ['free_text', 'multiple_choice', 'drop_down'] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  global: globalEnum("global").default("true").notNull(),
});

export type InsertQuestion = typeof questionsTable.$inferInsert;
export type SelectQuestion = typeof questionsTable.$inferSelect;

