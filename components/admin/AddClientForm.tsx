"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClientAction, getAllClientsAction, updateClientAction } from "@/actions/clients-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Client {
  id: string
  name: string
  description: string
}

export function AddClientForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAllClientsAction()
      if (result.isSuccess && Array.isArray(result.data)) {
        setClients(result.data)
      } else {
        setError(result.message || "Failed to fetch clients")
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error)
      setError("An unexpected error occurred while fetching clients")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      let result;
      if (editingClient) {
        console.log("Updating client:", editingClient.name, name, description);
        result = await updateClientAction(editingClient.name, name, description)
      } else {
        console.log("Creating new client:", name, description);
        result = await createClientAction(name, description)
      }
      console.log("Action result:", result);
      if (result.isSuccess) {
        setName("")
        setDescription("")
        setEditingClient(null)
        fetchClients()
        router.refresh()
      } else {
        console.error("Failed result:", result);
        setError(result.message || "Failed to create/update client")
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("An unexpected error occurred while creating/updating the client")
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setName(client.name)
    setDescription(client.description)
  }

  const handleCancelEdit = () => {
    setEditingClient(null)
    setName("")
    setDescription("")
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Client Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Button type="submit">{editingClient ? "Update Client" : "Add Client"}</Button>
        {editingClient && (
          <Button type="button" onClick={handleCancelEdit} variant="outline">
            Cancel Edit
          </Button>
        )}
      </form>
      
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Clients</h2>
        {isLoading ? (
          <div>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div>No clients found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.description}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(client)} variant="outline">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}