import { ArrowRight, BarChart2, Users, Lightbulb, MessageSquare, LucideIcon, Newspaper, TrendingUp, AlertTriangle, Clock, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Consultant Insight Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empower our consultants to share valuable insights, track utilization, and improve decision-making across client sites.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <div className="flex justify-center mb-16">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/login?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F">
              Submit Feedback <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>

        <ConsultantUpdates />
      </main>
    </div>
  );
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <Icon className="w-12 h-12 mb-4 text-blue-600" />
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const features = [
  {
    icon: MessageSquare,
    title: "Client Insights",
    description: "Share valuable observations and feedback from client sites."
  },
  {
    icon: TrendingUp,
    title: "Opportunity Tracking",
    description: "Identify and report on potential business opportunities."
  },
  {
    icon: AlertTriangle,
    title: "Issue Identification",
    description: "Flag potential problems early for proactive resolution."
  },
  {
    icon: Clock,
    title: "Utilization Monitoring",
    description: "Track and optimize consultant time allocation across projects."
  },
  {
    icon: Heart,
    title: "Well-being Check",
    description: "Monitor and support consultant well-being and satisfaction."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Foster knowledge sharing and teamwork across client sites."
  },
  {
    icon: Lightbulb,
    title: "Innovation Insights",
    description: "Capture and share innovative ideas and best practices."
  },
  {
    icon: BarChart2,
    title: "Data-Driven Decisions",
    description: "Provide key metrics to inform management strategy."
  }
];

const ConsultantUpdates = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <h2 className="text-2xl font-semibold p-6 bg-blue-600 text-white flex items-center">
      <Newspaper className="w-6 h-6 mr-2" />
      Latest Consultant Updates
    </h2>
    <div className="divide-y divide-gray-200">
      {updateItems.map((item, index) => (
        <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
          <p className="text-gray-600 mb-3">{item.summary}</p>
          <span className="text-blue-600 font-medium">{item.consultant}</span>
        </div>
      ))}
    </div>
  </div>
);

const updateItems = [
  {
    title: "New Integration Opportunity at FinCorp",
    summary: "Identified potential for streamlining data processes, estimated 20% efficiency increase.",
    consultant: "Alice Johnson"
  },
  {
    title: "Risk Management Concerns at TechFin",
    summary: "Observed outdated security protocols, recommending immediate review and update.",
    consultant: "Bob Smith"
  },
  {
    title: "Positive Team Morale at Project X",
    summary: "Team reports high satisfaction with current project progress and client interaction.",
    consultant: "Carol Zhang"
  },
  {
    title: "Utilization Alert: Data Science Team",
    summary: "Data science team nearing capacity, may need additional resources for upcoming projects.",
    consultant: "David Patel"
  }
];
