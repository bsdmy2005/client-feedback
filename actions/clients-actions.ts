import { ActionResult } from "@/types/actions/actions-types";
import { getClients, createClient, updateClient, deleteClient } from "@/db/queries/clients-queries";
import { revalidatePath } from "next/cache";

export async function getClientsAction(userId: string): Promise<ActionResult<any>> {
  try {
    const clients = await getClients(userId);
    return { isSuccess: true, message: "Clients fetched successfully", data: clients };
  } catch (error) {
    return { isSuccess: false, message: "Failed to fetch clients" };
  }
}

export async function createClientAction(userId: string, name: string): Promise<ActionResult<any>> {
  try {
    const newClient = await createClient(userId, name);
    revalidatePath("/");
    return { isSuccess: true, message: "Client created successfully", data: newClient };
  } catch (error) {
    return { isSuccess: false, message: "Failed to create client" };
  }
}

export async function updateClientAction(userId: string, name: string): Promise<ActionResult<any>> {
  try {
    const updatedClient = await updateClient(userId, name);
    revalidatePath("/");
    return { isSuccess: true, message: "Client updated successfully", data: updatedClient };
  } catch (error) {
    return { isSuccess: false, message: "Failed to update client" };
  }
}

export async function deleteClientAction(userId: string): Promise<ActionResult<any>> {
  try {
    const deletedClient = await deleteClient(userId);
    revalidatePath("/");
    return { isSuccess: true, message: "Client deleted successfully", data: deletedClient };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete client" };
  }
}