import { db } from "@/db/db";
import { clientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";



export const createClient = async (name: string, description: string) => {
  return await db.insert(clientsTable).values({ name, description }).returning();
};

export async function updateClient(name: string, newName: string, description: string) {
  const existingClient = await getClientByName(name);
  
  if (existingClient.length === 0) {
    throw new Error("Client not found");
  }

  const clientToUpdate = existingClient[0];

  return await db.update(clientsTable)
    .set({ name: newName, description })
    .where(eq(clientsTable.clientId, clientToUpdate.clientId))
    .returning();
}

export const getAllClients = async () => {
  return await db.select().from(clientsTable);
};

export const deleteClient = async (name: string) => {
  return await db.delete(clientsTable).where(eq(clientsTable.name, name)).returning();
};

export const getClientByName = async (name: string) => {
  const result = await db.select().from(clientsTable).where(eq(clientsTable.name, name));
  console.log("getClientByName result:", result);
  return result;
};
