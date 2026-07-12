import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">
      <p className="text-muted-foreground text-sm font-mono mb-4">404</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
    </div>
  );
}
