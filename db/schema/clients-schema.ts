import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const clientsTable = pgTable("clients", {
  clientId: uuid("client_id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Client = typeof clientsTable.$inferSelect;
export type NewClient = typeof clientsTable.$inferInsert;

