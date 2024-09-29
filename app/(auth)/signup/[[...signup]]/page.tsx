"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { theme } = useTheme();
  const router = useRouter();

  
  return (
    <SignUp
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
      forceRedirectUrl="/"
      
    />
  );
}

