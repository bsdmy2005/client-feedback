"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { UserIcon, FileTextIcon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getAllProfilesAction } from "@/actions/profiles-actions"
import { getAllTemplates } from "@/actions/feedback-form-templates-actions"
import { createAssignmentAction, deleteAssignmentAction, getAllAssignmentsAction } from "@/actions/user-template-assignments-actions"
import { SelectProfile } from "@/db/schema/profiles-schema"
import { Template } from "@/db/schema/feedback-form-templates-schema"
import { UserTemplateAssignment } from "@/db/schema/user-template-assignments-schema"
import { toast } from "@/components/ui/use-toast"

export function UserAssignment() {
  const [users, setUsers] = useState<SelectProfile[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [assignments, setAssignments] = useState<UserTemplateAssignment[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [assignedUsers, setAssignedUsers] = useState<Set<string>>(new Set())
  const [templateSearch, setTemplateSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")

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

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(templateSearch.toLowerCase())
    )
  }, [templates, templateSearch])

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
    )
  }, [users, userSearch])

  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplate(templateId)
    if (templateId) {
      const assigned = new Set(assignments
        .filter(a => a.templateId === templateId)
        .map(a => a.userId))
      setAssignedUsers(assigned)
    } else {
      setAssignedUsers(new Set())
    }
  }

  const handleUserAssignmentToggle = (userId: string) => {
    setAssignedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleSaveAssignments = async () => {
    if (!selectedTemplate) return

    const currentAssignments = assignments.filter(a => a.templateId === selectedTemplate)
    const currentUserIds = new Set(currentAssignments.map(a => a.userId))

    for (const userId of Array.from(assignedUsers)) {
      if (!currentUserIds.has(userId)) {
        await createAssignmentAction({
          userId,
          templateId: selectedTemplate,
          userEmail: users.find(u => u.userId === userId)?.email || ""
        })
      }
    }

    for (const assignment of currentAssignments) {
      if (!assignedUsers.has(assignment.userId)) {
        await deleteAssignmentAction(assignment.userId, assignment.templateId)
      }
    }

    await fetchAssignments()
    toast({ title: "Assignments updated successfully" })
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-8"
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="flex items-center space-x-2 py-2 hover:bg-gray-100 rounded-md px-2">
                <Checkbox
                  id={`template-${template.id}`}
                  checked={selectedTemplate === template.id}
                  onCheckedChange={() => handleTemplateSelect(selectedTemplate === template.id ? null : template.id)}
                />
                <label htmlFor={`template-${template.id}`} className="flex items-center flex-1 cursor-pointer">
                  <FileTextIcon className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="font-medium">{template.name}</span>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-8"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.userId} className="flex items-center space-x-2 py-2 hover:bg-gray-100 rounded-md px-2">
                <Checkbox
                  id={`user-${user.userId}`}
                  checked={assignedUsers.has(user.userId)}
                  onCheckedChange={() => handleUserAssignmentToggle(user.userId)}
                  disabled={!selectedTemplate}
                />
                <label htmlFor={`user-${user.userId}`} className="flex items-center flex-1 cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div>
        <Button 
          onClick={handleSaveAssignments} 
          disabled={!selectedTemplate}
          className="px-6 py-2"
        >
          Save Assignments
        </Button>
      </div>
    </div>
  )
}