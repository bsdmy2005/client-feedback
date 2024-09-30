"use server"

import { ActionResult } from "@/types/actions/actions-types";
import { getAllClients, createClient, updateClient, deleteClient , getClientByName} from "@/db/queries/clients-queries";
import { revalidatePath } from "next/cache";

export async function getAllClientsAction(): Promise<ActionResult<any>> {
  try {
    const clients = await getAllClients();
    const clientsData = clients.map(client => ({
      clientId: client.clientId,
      name: client.name,
      description: client.description
    }));
    return { isSuccess: true, message: "Clients fetched successfully", data: clientsData };
  } catch (error) {
    return { isSuccess: false, message: "Failed to fetch clients" };
  }
}

export async function createClientAction(name: string, description: string): Promise<ActionResult<any>> {
  try {
    console.log("Attempting to create client with name:", name);
    const existingClient = await getClientByName(name);
    console.log("Existing client check result:", existingClient);
    if (existingClient[0]?.name === name) { //compare name with existing client name
      console.log("Client already exists:", existingClient[0]?.name);
      return { isSuccess: false, message: "A client with this name already exists" };
    }
    const newClient = await createClient(name, description);
    console.log("New client created:", newClient);
    revalidatePath("/");
    return { isSuccess: true, message: "Client created successfully", data: newClient };
  } catch (error) {
    console.error("Error in createClientAction:", error);
    return { isSuccess: false, message: "Failed to create client" };
  }
}

export async function updateClientAction(currentName: string, newName: string, description: string) {
  try {
    const updatedClient = await updateClient(currentName, newName, description);
    
    if (updatedClient.length === 0) {
      return { isSuccess: false, message: "Client not found" };
    }
    
    return { isSuccess: true, data: updatedClient[0] };
  } catch (error) {
    console.error("Error updating client:", error);
    return { isSuccess: false, message: "Failed to update client" };
  }
}

export async function deleteClientAction(name: string): Promise<ActionResult<any>> {
  try {
    const deletedClient = await deleteClient(name);
    revalidatePath("/");
    return { isSuccess: true, message: "Client deleted successfully", data: deletedClient };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete client" };
  }
}