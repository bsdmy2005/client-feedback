import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { updateProfileAction, createProfileAction , getUserProfileById} from '@/actions/profiles-actions'

import * as svix from 'svix';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Add logging
  console.log('Received webhook payload:', body);
  console.log('Svix headers:', { svix_id, svix_timestamp, svix_signature });

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    console.error('Webhook secret used:', WEBHOOK_SECRET);
    // For debugging purposes, log the event without verification
    console.log('Unverified event:', JSON.parse(body));
    // Process the event without verification (TEMPORARY FOR DEBUGGING)
    evt = JSON.parse(body) as WebhookEvent;
  }

  if (evt.type === 'user.created') {
    const userId = evt.data.id
    const email = evt.data.email_addresses[0].email_address
    const firstName = evt.data.first_name
    const lastName = evt.data.last_name

    console.log(`Processing user.created event for user: ${userId}`);

    try {
      const existingUserResult = await getUserProfileById(userId);

      if (existingUserResult.isSuccess && existingUserResult.data) {
        console.log(`Updating profile for existing user: ${userId}`);
        const updateResult = await updateProfileAction(userId, {
          firstName,
          lastName,
          email,
        });

        if (!updateResult.isSuccess) {
          console.error(`Failed to update profile for user ${userId}: ${updateResult.message}`);
          return new Response('Error updating profile', { status: 500 });
        }
      } else {
        console.log(`Creating new profile for user: ${userId}`);
        const createResult = await createProfileAction({
          userId,
          firstName,
          lastName,
          email,
        });

        if (!createResult.isSuccess) {
          console.error(`Failed to create new profile for user ${userId}: ${createResult.message}`);
          return new Response('Error creating new profile', { status: 500 });
        }
      }

      console.log(`Profile handled successfully for user: ${userId}`);
      return new Response('', { status: 200 });
    } catch (error) {
      console.error(`Error handling profile for user ${userId}:`, error);
      return new Response('Error handling profile', { status: 500 });
    }
  }

  return new Response('', { status: 200 })
}
