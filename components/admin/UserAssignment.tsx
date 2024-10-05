"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { UserIcon, FileTextIcon } from "lucide-react"
import { getAllProfilesAction } from "@/actions/profiles-actions"
import { getAllTemplates } from "@/actions/feedback-form-templates-actions"
import { createAssignmentAction, deleteAssignmentAction, getAllAssignmentsAction } from "@/actions/user-template-assignments-actions"
import { SelectProfile } from "@/db/schema/profiles-schema"
import { Template } from "@/db/schema/feedback-form-templates-schema"
import { UserTemplateAssignment } from "@/db/schema/user-template-assignments-schema"

export function UserAssignment() {
  const [users, setUsers] = useState<SelectProfile[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [assignments, setAssignments] = useState<UserTemplateAssignment[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])

  useEffect(() => {
    fetchUsers()
    fetchTemplates()
    fetchAssignments()
  }, [])

  const fetchUsers = async () => {
    const result = await getAllProfilesAction()
    if (result.isSuccess && result.data) {
      setUsers(result.data)
    }
  }

  const fetchTemplates = async () => {
    const result = await getAllTemplates()
    if (result.isSuccess && result.data) {
      setTemplates(result.data)
    }
  }

  const fetchAssignments = async () => {
    const result = await getAllAssignmentsAction()
    if (result.isSuccess && result.data) {
      setAssignments(result.data)
    }
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) ? prev.filter(id => id !== templateId) : [...prev, templateId]
    )
  }

  const handleAssign = async () => {
    for (const userId of selectedUsers) {
      for (const templateId of selectedTemplates) {
        await createAssignmentAction({ userId, templateId, userEmail: users.find(user => user.userId === userId)?.email || "" })
      }
    }
    fetchAssignments()
    setSelectedUsers([])
    setSelectedTemplates([])
  }

  const handleDelete = async (userId: string, templateId: string) => {
    await deleteAssignmentAction(userId, templateId)
    fetchAssignments()
  }

  const isAssigned = (userId: string, templateId: string) => {
    return assignments.some(a => a.userId === userId && a.templateId === templateId)
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex space-x-8">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div key={user.userId} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`user-${user.userId}`}
                  checked={selectedUsers.includes(user.userId)}
                  onCheckedChange={() => handleUserSelect(user.userId)}
                />
                <label htmlFor={`user-${user.userId}`} className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {user.firstName} {user.lastName}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-4">Templates</h2>
          <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`template-${template.id}`}
                  checked={selectedTemplates.includes(template.id)}
                  onCheckedChange={() => handleTemplateSelect(template.id)}
                />
                <label htmlFor={`template-${template.id}`} className="flex items-center">
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  {template.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button onClick={handleAssign} disabled={selectedUsers.length === 0 || selectedTemplates.length === 0}>
        Assign Selected
      </Button>
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Assignments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">User</th>
                {templates.map(template => (
                  <th key={template.id} className="border p-2">{template.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userId}>
                  <td className="border p-2">{user.firstName} {user.lastName}</td>
                  {templates.map(template => (
                    <td key={template.id} className="border p-2 text-center">
                      {isAssigned(user.userId, template.id) ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.userId, template.id)}
                        >
                          Unassign
                        </Button>
                      ) : (
                        "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}