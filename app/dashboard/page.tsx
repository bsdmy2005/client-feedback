import { getProfileByUserId } from "@/db/queries/profiles-queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeedbackDashboard } from "@/components/admin/FeedbackDashboard";

export default async function DashboardPage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Dashboard</h1>
      <FeedbackDashboard />
    </div>
  );
}