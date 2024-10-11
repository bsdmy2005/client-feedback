import { getProfileByUserIdAction } from "@/actions/profiles-actions";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/utilities/providers";
import { createProfile } from "@/db/queries/profiles-queries";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { isAdmin } from "@/db/queries/profiles-queries";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ES client feedback",
  description: "ES client feedback"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();
  let userIsAdmin = false;

  if (userId) {
    const res = await getProfileByUserIdAction(userId);
    if (!res.data) {
      await createProfile({ userId });
    } else {
      userIsAdmin = await isAdmin(userId);
    }
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Providers
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <Header isAdmin={userIsAdmin} />
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
