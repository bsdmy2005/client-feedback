# Paystack Integration Guide

This guide provides step-by-step instructions for integrating Paystack payment gateway into a Next.js application with TypeScript.

## Prerequisites

- Next.js project with TypeScript
- Paystack account and API keys
- Environment variables set up

## Step 1: Environment Setup

Add the following to your `.env.local` file:

PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Change for production

## Step 2: Create Paystack Actions

Create a file `actions/paystack-actions.ts` with the following content:

typescript
"use server"
import { ActionResult } from "@/types/actions/actions-types";
import { updateProfile } from "@/db/queries/profiles-queries";
export async function initializePaystackTransaction(email: string, amount: number, userId: string) {
try {
const response = await fetch(${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/webhook, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ email, amount, userId }),
});
if (!response.ok) {
throw new Error('Failed to initialize transaction');
}
const data = await response.json();
return { isSuccess: true, data };
} catch (error) {
console.error('Error initializing Paystack transaction:', error);
return { isSuccess: false, message: 'Failed to initialize transaction' };
}
}
export async function verifyPaystackTransaction(reference: string): Promise<ActionResult<any>> {
try {
const response = await fetch(https://api.paystack.co/transaction/verify/${reference}, {
headers: {
Authorization: Bearer ${process.env.PAYSTACK_SECRET_KEY},
},
});
if (!response.ok) {
throw new Error('Failed to verify transaction');
}
const data = await response.json();
if (data.status && data.data.status === 'success') {
const userId = data.data.metadata.userId;
const amount = data.data.amount / 100; // Convert back to main currency unit
// Update user's profile or handle the successful payment
await updateProfile(userId, {
// Update relevant fields, e.g., subscription status, balance, etc.
});
return { isSuccess: true, message: "Payment verified successfully", data: data.data };
} else {
return { isSuccess: false, message: "Payment verification failed" };
}
} catch (error) {
console.error("Error verifying Paystack transaction:", error);
return { isSuccess: false, message: "An error occurred while verifying the transaction" };
}
}

## Step 3: Create Paystack Webhook Handler

Create a file `app/api/paystack/webhook/route.ts` with the following content:

typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyPaystackTransaction } from '@/actions/paystack-actions';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
export async function POST(req: Request) {
const headersList = headers();
const paystackSignature = headersList.get('x-paystack-signature');
if (paystackSignature) {
// This is a webhook request
const body = await req.text();
try {
const event = JSON.parse(body);
if (event.event === 'charge.success') {
const result = await verifyPaystackTransaction(event.data.reference);
if (result.isSuccess) {
return new NextResponse('Webhook processed successfully', { status: 200 });
} else {
return new NextResponse('Failed to process webhook', { status: 400 });
}
}
return new NextResponse('Unhandled event type', { status: 400 });
} catch (err) {
console.error('Error processing Paystack webhook:', err);
return new NextResponse('Webhook error', { status: 400 });
}
} else {
// This is an initialization request
try {
const { email, amount, userId } = await req.json();
const response = await fetch('https://api.paystack.co/transaction/initialize', {
method: 'POST',
headers: {
Authorization: Bearer ${PAYSTACK_SECRET},
'Content-Type': 'application/json',
},
body: JSON.stringify({
email,
amount: amount 100, // Convert to kobo
metadata: {
userId,
},
}),
});
if (!response.ok) {
throw new Error('Failed to initialize transaction');
}
const data = await response.json();
return NextResponse.json(data.data);
} catch (error) {
console.error('Error initializing Paystack transaction:', error);
return NextResponse.json({ error: 'Failed to initialize transaction' }, { status: 500 });
}
}
}

## Step 4: Update Pricing Component

typescript
"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

## Step 5: Paystack Dashboard Setup

1. Log in to your Paystack dashboard.
2. Go to Settings > API Keys & Webhooks.
3. Copy your test secret key and add it to your `.env.local` file.
4. In the "Webhook URL" field, enter your webhook URL:
   - For production: `https://your-domain.com/api/paystack/webhook`
   - For development with ngrok: `https://your-ngrok-url.ngrok.io/api/paystack/webhook`
5. Save the changes.

## Step 6: Testing

1. Start your Next.js development server.
2. If testing locally, start ngrok and update your `NEXT_PUBLIC_APP_URL` in `.env.local`.
3. Navigate to your pricing page and attempt to make a payment.
4. Check the console for any errors and verify that the payment flow works as expected.

## Step 7: Handling Successful Payments

After a successful payment, you'll need to update the user's profile or subscription status. This is typically done in the `verifyPaystackTransaction` function in `actions/paystack-actions.ts`. Make sure to implement the logic to update the user's status in your database.

## Step 8: Error Handling and User Feedback

Implement proper error handling throughout the payment process and provide clear feedback to the user. Use the `toast` component or a similar notification system to inform users about the status of their payment.

## Step 9: Security Considerations

- Always use HTTPS for your webhook endpoint.
- Validate the Paystack signature in your webhook handler to ensure the request is coming from Paystack.
- Keep your Paystack secret key secure and never expose it to the client-side.

## Notes

- Always use the test API keys for development and testing.
- When ready for production, switch to live API keys and update your webhook URL.
- Consider implementing additional security measures, such as validating the Paystack signature in your webhook handler.
- Regularly monitor your Paystack dashboard for transaction details and any potential issues.

#flow description

Certainly! Let's break down the Paystack webhook flow and how it interacts with your app in detail:
Payment Initiation:
A user selects a plan on your pricing page.
Your app calls initializePaystackTransaction in actions/paystack-actions.ts.
This function sends a POST request to your /api/paystack/webhook endpoint.
The endpoint then initializes a transaction with Paystack and returns an authorization URL.
The user is redirected to this Paystack-hosted payment page.
Payment Processing:
The user completes the payment on Paystack's platform.
Paystack processes the payment and updates the transaction status.
Webhook Notification:
Upon successful payment, Paystack sends a POST request to your webhook URL (https://1234-abcd-5678-efgh.ngrok.io/api/paystack/webhook).
This request includes a payload with transaction details and an 'x-paystack-signature' header for verification.
Webhook Handling:
Your app/api/paystack/webhook/route.ts receives this POST request.
It first checks for the presence of the 'x-paystack-signature' header to distinguish between webhook notifications and initialization requests.
Signature Verification (recommended, but not implemented in current code):
You should verify the Paystack signature to ensure the request is genuinely from Paystack.
Event Processing:
The webhook handler parses the event data from the request body.
It checks the event type, focusing on 'charge.success' events.
Transaction Verification:
For 'charge.success' events, your app calls verifyPaystackTransaction with the transaction reference.
This function makes a direct API call to Paystack to double-check the transaction status.
Database Update:
If the verification is successful, your app updates the user's profile or subscription status in your database.
This is done in the verifyPaystackTransaction function, which calls updateProfile.
Response to Paystack:
Your webhook handler sends a response back to Paystack:
200 status if processed successfully
400 status if there was an error or unhandled event type
User Notification:
Although not explicitly shown in the current code, you should implement a way to notify the user of the successful payment, perhaps through a success page redirect or an email notification.
Key Points:
The webhook ensures real-time updates even if the user closes their browser after payment.
It allows for asynchronous processing of payments, improving user experience.
The double verification (webhook + API call) provides an extra layer of security.
Your app should be idempotent in handling webhooks, as Paystack may send multiple notifications for the same event.
To enhance this flow:
1. Implement signature verification in your webhook handler.
Add logging for all webhook events for debugging and auditing.
Implement proper error handling and retries for failed database updates.
Consider adding a queue system for processing webhooks if you expect high volume.
