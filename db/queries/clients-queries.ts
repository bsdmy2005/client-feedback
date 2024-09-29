import { db } from "@/db/db";
import { clientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getClients = async (userId: string) => {
  return await db.select().from(clientsTable).where(eq(clientsTable.id, userId));
};

export const createClient = async (userId: string, name: string) => {
  return await db.insert(clientsTable).values({ id: userId, name }).returning();
};

export const updateClient = async (userId: string, name: string) => {
  return await db
    .update(clientsTable)
    .set({ name })
    .where(eq(clientsTable.id, userId))
    .returning();
};

export const deleteClient = async (userId: string) => {
  return await db.delete(clientsTable).where(eq(clientsTable.id, userId)).returning();
};