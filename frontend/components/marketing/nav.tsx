"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks/use-auth";

export function MarketingNav() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex size-7 items-center justify-center rounded-md text-sm font-bold text-white"
            style={{ background: "oklch(0.51 0.24 276)" }}
          >
            K
          </div>
          <span className="font-semibold tracking-tight">KnowledgeOS</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link
            href="/#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && !user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" className="gap-1.5" asChild>
                <Link href="/sign-up">
                  Get started <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
          {!isLoading && user && (
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/dashboard">
                Dashboard <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
