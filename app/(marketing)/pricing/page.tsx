"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { initializePaystackTransaction } from "@/actions/paystack-actions";
import { useToast } from "@/components/ui/use-toast";

export default function PricingPage() {
  const { userId } = useAuth();
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PricingCard
          title="Monthly Plan"
          price="₦5000"
          description="Billed monthly"
          buttonText="Subscribe Monthly"
          amount={5000}
          userId={userId}
        />
        <PricingCard
          title="Yearly Plan"
          price="₦50000"
          description="Billed annually"
          buttonText="Subscribe Yearly"
          amount={50000}
          userId={userId}
        />
      </div>
    </div>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  buttonText: string;
  amount: number;
  userId: string | null | undefined;
}

function PricingCard({ title, price, description, buttonText, amount, userId }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await initializePaystackTransaction("user@example.com", amount, userId);
      if (result.isSuccess && result.data) {
        window.location.href = result.data.authorization_url;
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to initialize payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <p className="text-4xl font-bold">{price}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={isLoading || !userId}
        >
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
