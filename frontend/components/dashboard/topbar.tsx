"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContents } from "@/components/dashboard/sidebar";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  const openPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="text-muted-foreground hover:text-foreground rounded-md p-1 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent>
            <SidebarContents onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

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
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={openPalette}
          className="border-input text-muted-foreground hover:border-ring flex items-center gap-2 rounded-md border bg-transparent px-3 py-1.5 text-xs transition-colors"
        >
          <Search className="size-3" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="bg-muted ml-1 rounded px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
          className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </button>
      </div>
    </header>
  );
}
