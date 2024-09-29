import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const membershipEnum = pgEnum("membership", ["free", "pro"]);
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  membership: membershipEnum("membership").notNull().default("pro"),
  role: roleEnum("role").notNull().default("admin"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
