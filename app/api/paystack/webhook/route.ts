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
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
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