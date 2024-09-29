"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { ClipboardCheckIcon, HomeIcon, BarChartIcon, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { isAdmin } from "@/db/queries/profiles-queries";
import { useEffect } from "react";

export default function Component() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        const adminStatus = await isAdmin(user.id);
        setUserIsAdmin(adminStatus);
      }
    };

    checkAdminStatus();
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ClipboardCheckIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">InsightPulse</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">Beta</Badge>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="hover:text-primary flex items-center space-x-2 text-lg font-medium text-foreground"
            >
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </Link>

            <SignedIn>
              <Link
                href="/feedback"
                className="hover:text-primary flex items-center space-x-2 text-lg font-medium text-foreground"
              >
                <ClipboardCheckIcon className="h-6 w-6" />
                <span>Submit Feedback</span>
              </Link>

              {userIsAdmin && (
                <Link
                  href="/admin"
                  className="hover:text-primary flex items-center space-x-2 text-lg font-medium text-foreground"
                >
                  <BarChartIcon className="h-6 w-6" />
                  <span>Admin</span>
                </Link>
              )}
            </SignedIn>
          </nav>

          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton>
                <Button variant="default">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <span className="text-sm font-medium text-foreground">
                Welcome, {user?.firstName || 'User'}
              </span>
              <SignOutButton>
                <Button variant="outline">Sign Out</Button>
              </SignOutButton>
            </SignedIn>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden bg-background border-t border-border p-4">
          <div className="space-y-6">
            <Link
              href="/"
              className="block hover:text-primary flex items-center space-x-2 text-lg text-foreground"
              onClick={toggleMenu}
            >
              <HomeIcon className="h-8 w-8" />
              <span>Home</span>
            </Link>
            <SignedIn>
              <Link
                href="/feedback"
                className="block hover:text-primary flex items-center space-x-2 text-lg text-foreground"
                onClick={toggleMenu}
              >
                <ClipboardCheckIcon className="h-8 w-8" />
                <span>Submit Feedback</span>
              </Link>
              {userIsAdmin && (
                <Link
                  href="/admin"
                  className="block hover:text-primary flex items-center space-x-2 text-lg text-foreground"
                  onClick={toggleMenu}
                >
                  <BarChartIcon className="h-8 w-8" />
                  <span>Admin</span>
                </Link>
              )}
            </SignedIn>
          </div>
        </nav>
      )}
    </header>
  );
}