"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-6 py-20">
      <div className="bg-destructive/10 mb-4 flex size-10 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive size-4" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Something went wrong</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        {error.message || "An unexpected error occurred in this section."}
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={reset}>Try again</Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard">Go to overview</Link>
        </Button>
      </div>
    </div>
  );
}
