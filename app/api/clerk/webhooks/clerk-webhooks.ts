import { WebhookEvent } from "@clerk/nextjs/server";
import { updateProfileAction } from "@/actions/profiles-actions";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const evt = req.body as WebhookEvent;

  if (evt.type === "user.created") {
    const { id, first_name, last_name, email_addresses } = evt.data;
    const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);

    await updateProfileAction(id, {
      firstName: first_name || undefined,
      lastName: last_name || undefined,
      email: primaryEmail?.email_address || undefined,
    });
  }

  res.status(200).json({ message: "Webhook processed successfully" });
}