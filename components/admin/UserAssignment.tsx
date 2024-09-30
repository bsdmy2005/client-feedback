"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserIcon, FileTextIcon } from "lucide-react"

export function UserAssignment() {
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // Mock data (replace with actual data fetching)
  const users = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
  ]
  const templates = [
    { id: "1", name: "Customer Satisfaction Survey" },
    { id: "2", name: "Product Feedback Form" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement user assignment logic
    console.log("Assigning user to template:", { selectedUser, selectedTemplate })
    setSelectedUser("")
    setSelectedTemplate("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user">Select User</Label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger id="user" className="w-full">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {user.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="template">Select Template</Label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger id="template" className="w-full">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center">
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  {template.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Assign User to Template
      </Button>
    </form>
  )
}