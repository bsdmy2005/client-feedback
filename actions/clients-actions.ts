"use server"

import { ActionResult } from "@/types/actions/actions-types";
import { getAllClients, createClient, updateClient, deleteClient, getClientByName, getClientById } from "@/db/queries/clients-queries";
import { revalidatePath } from "next/cache";

export async function getAllClientsAction(): Promise<ActionResult<any>> {
  try {
    const clients = await getAllClients();
    const clientsData = clients.map(client => ({
      id: client.clientId,  // Make sure this is correct
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
    const existingClient = await getClientByName(name);
    if (existingClient[0]?.name === name) {
      return { isSuccess: false, message: "A client with this name already exists" };
    }
    const newClient = await createClient(name, description);
    revalidatePath("/");
    return { isSuccess: true, message: "Client created successfully", data: newClient };
  } catch (error) {
    console.error("Error in createClientAction:", error);
    return { isSuccess: false, message: "Failed to create client" };
  }
}

export async function updateClientAction(clientId: string, newName: string, description: string): Promise<ActionResult<any>> {
  try {
    const updatedClient = await updateClient(clientId, newName, description);
    
    if (!updatedClient || updatedClient.length === 0) {
      return { isSuccess: false, message: "Client not found" };
    }
    
    revalidatePath("/");
    return { isSuccess: true, message: "Client updated successfully", data: updatedClient[0] };
  } catch (error) {
    console.error("Error updating client:", error);
    return { isSuccess: false, message: "Failed to update client" };
  }
}

export async function deleteClientAction(clientId: number): Promise<ActionResult<any>> {
  try {
    const deletedClient = await deleteClient(clientId.toString());
    revalidatePath("/");
    return { isSuccess: true, message: "Client deleted successfully", data: deletedClient };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete client" };
  }
}

export async function getClientByIdAction(id: string): Promise<ActionResult<any>> {
  try {
    const client = await getClientById(id);
    return { isSuccess: true, message: "Client fetched successfully", data: client };
  } catch (error) {
    return { isSuccess: false, message: "Failed to fetch client" };
  }
}


export async function getClientByNameAction(name: string): Promise<ActionResult<any>> {
  try {
    const client = await getClientByName(name);
    return { isSuccess: true, message: "Client fetched successfully", data: client };
  } catch (error) {
    return { isSuccess: false, message: "Failed to fetch client" };
  }
}



