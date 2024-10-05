import { UserAssignment } from "@/components/admin/UserAssignment"

export default function UserAssignmentsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Template Assignments</h1>
      <UserAssignment />
    </div>
  )
}