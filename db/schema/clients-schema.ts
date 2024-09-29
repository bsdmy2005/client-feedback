import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const clientsTable = pgTable("clients", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});