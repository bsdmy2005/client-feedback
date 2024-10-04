"use server"

import { ActionResult } from "@/types/actions/actions-types";
import { updateProfile } from "@/db/queries/profiles-queries";
import { updateMembershipAction, updateLastPaymentAction } from "@/actions/profiles-actions";

// Remove this line as it's causing the window reference error
// const Paystack = require('paystack-js');
// const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

export async function initializePaystackTransaction(email: string, amount: number, userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/webhook`, {
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
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify transaction');
    }

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      const userId = data.data.metadata.userId;
      const amount = data.data.amount / 100; // Convert back to main currency unit

      // Update user's membership to 'pro'
      const membershipResult = await updateMembershipAction(userId, 'pro');
      if (!membershipResult.isSuccess) {
        throw new Error('Failed to update membership');
      }

      // Update last payment information
      const paymentResult = await updateLastPaymentAction(userId, amount, new Date());
      if (!paymentResult.isSuccess) {
        throw new Error('Failed to update last payment information');
      }

      return { isSuccess: true, message: "Payment verified and profile updated successfully", data: data.data };
    } else {
      return { isSuccess: false, message: "Payment verification failed" };
    }
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error);
    return { isSuccess: false, message: "An error occurred while verifying the transaction" };
  }
}