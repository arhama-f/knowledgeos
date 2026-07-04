"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks/use-auth";

export function MarketingNav() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-bold">
            K
          </div>
          <span className="font-semibold tracking-tight">KnowledgeOS</span>
        </Link>
        <nav className="text-muted-foreground hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/#how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {!isLoading && !user && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
          {!isLoading && user && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
