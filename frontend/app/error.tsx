"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">
      <div className="bg-destructive/10 mb-4 flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive size-5" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm">
        An unexpected error occurred. Our team has been notified.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go home
        </Button>
      </div>
      {error.digest && (
        <p className="text-muted-foreground mt-6 font-mono text-xs">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
