import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients-schema";

export const globalEnum = pgEnum("global", ["true", "false"]);

export const questionThemeEnum = pgEnum("question_theme", [
  "competition",
  "environment",
  "personal",
  "bus_dev"
]);

export const questionsTable = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type", { enum: ['free_text', 'multiple_choice', 'drop_down'] }).notNull(),
  questionTheme: questionThemeEnum("question_theme").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  global: globalEnum("global").default("true").notNull(),
  clientId: uuid("client_id").references(() => clientsTable.clientId),
});

export type InsertQuestion = typeof questionsTable.$inferInsert;
export type SelectQuestion = typeof questionsTable.$inferSelect;

