import { FeedbackDashboard } from "@/components/admin/FeedbackDashboard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Dashboard</h1>
      <FeedbackDashboard />
    </div>
  );
}