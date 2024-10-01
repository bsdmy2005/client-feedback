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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { PencilIcon, TrashIcon } from "lucide-react"

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
      const result = await createClientAction(name, description)
      if (result.isSuccess) {
        setName("")
        setDescription("")
        fetchClients()
        router.refresh()
      } else {
        setError(result.message || "Failed to create client")
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setError("An unexpected error occurred while creating the client")
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return

    setError(null)
    try {
      const result = await updateClientAction(editingClient.id, editingClient.name, editingClient.description)
      if (result.isSuccess) {
        setIsDialogOpen(false)
        fetchClients()
        router.refresh()
      } else {
        setError(result.message || "Failed to update client")
      }
    } catch (error) {
      console.error("Error in handleUpdate:", error)
      setError("An unexpected error occurred while updating the client")
    }
  }

  const handleDelete = async (id: string) => {
    // Implement delete functionality
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Client</TabsTrigger>
          <TabsTrigger value="view">View Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Client</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Client Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Client</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Existing Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
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
                            <div className="flex space-x-2">
                              <Button onClick={() => handleEdit(client)} size="sm" variant="outline">
                                <PencilIcon className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button onClick={() => handleDelete(client.id)} size="sm" variant="destructive">
                                <TrashIcon className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Client Name</Label>
              <Input
                id="editName"
                type="text"
                placeholder="Client Name"
                value={editingClient?.name || ""}
                onChange={(e) => setEditingClient(prev => prev ? {...prev, name: e.target.value} : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Input
                id="editDescription"
                type="text"
                placeholder="Description"
                value={editingClient?.description || ""}
                onChange={(e) => setEditingClient(prev => prev ? {...prev, description: e.target.value} : null)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Client
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  )
}