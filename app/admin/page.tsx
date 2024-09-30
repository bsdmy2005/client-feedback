import { getProfileByUserId } from "@/db/queries/profiles-queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminBoard from "@/components/admin/adminboard";
export default async function NotesPage() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/login");
  }

  const profile = await getProfileByUserId(userId);

  if (!profile) {
    return redirect("/signup");
  }

  if (profile.role !== "admin") {
    return redirect("/feedback");
  }

 

  return <AdminBoard />;
}