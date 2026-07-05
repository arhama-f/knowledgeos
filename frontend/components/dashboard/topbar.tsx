"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/documents": "Documents",
  "/dashboard/ask": "Ask",
  "/dashboard/team": "Team",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/api-keys": "API Keys",
  "/dashboard/admin": "Admin",
};

export function DashboardTopBar() {
  const pathname = usePathname();
  const label = ROUTE_LABELS[pathname] ?? "Dashboard";
  const isRoot = pathname === "/dashboard";

  const openPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
      {isRoot ? (
        <span className="text-sm font-medium">{label}</span>
      ) : (
        <nav className="flex items-center gap-1.5 text-sm">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="text-muted-foreground/50 size-3.5" />
          <span className="font-medium">{label}</span>
        </nav>
      )}

      <button
        onClick={openPalette}
        className="border-input text-muted-foreground hover:border-ring flex items-center gap-2 rounded-md border bg-transparent px-3 py-1.5 text-xs transition-colors"
      >
        <Search className="size-3" />
        Search…
        <kbd className="bg-muted ml-1 rounded px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>
    </header>
  );
}
