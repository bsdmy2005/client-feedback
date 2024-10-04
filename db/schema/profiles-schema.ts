import { pgEnum, pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const membershipEnum = pgEnum("membership", ["free", "pro"]);
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  membership: membershipEnum("membership").notNull().default("free"),
  role: roleEnum("role").notNull().default("user"),
  lastPaymentAmount: numeric("last_payment_amount"),
  lastPaymentDate: timestamp("last_payment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
