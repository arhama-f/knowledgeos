"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useCurrentUser, useInvalidateAuth } from "@/lib/hooks/use-auth";
import { useOrganization } from "@/lib/hooks/use-organization";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/ask", label: "Ask", icon: MessageSquare },
  { href: "/dashboard/team", label: "Team", icon: Users },
];

const SETTINGS_NAV = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/api-keys", label: "API Keys", icon: KeyRound },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: authUser } = useCurrentUser();
  const { data: org } = useOrganization();
  const invalidate = useInvalidateAuth();
  const isAdmin = authUser?.role === "admin";

  async function handleSignOut() {
    await signOut();
    await invalidate();
    router.push("/");
  }

  return (
    <aside className="bg-card flex h-full w-64 shrink-0 flex-col border-r">
      {/* Org header */}
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        {org?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={org.logo_url}
            alt={org.name}
            width={28}
            height={28}
            className="size-7 rounded-md object-cover"
          />
        ) : (
          <div
            className={cn(
              "text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-bold",
              !org?.primary_color && "bg-primary"
            )}
            style={org?.primary_color ? { backgroundColor: org.primary_color } : undefined}
          >
            {(org?.name ?? "K")[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">
            {org?.name || "KnowledgeOS"}
          </p>
          {org?.plan && (
            <p className="text-muted-foreground truncate text-[10px] capitalize">{org.plan}</p>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-muted-foreground mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest">
            Workspace
          </p>
          <div className="space-y-0.5">
            {SETTINGS_NAV.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname?.startsWith("/dashboard/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <ShieldCheck className="size-4" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {(authUser?.name ?? authUser?.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{authUser?.name ?? authUser?.email}</p>
            <p className="text-muted-foreground truncate text-xs capitalize">{authUser?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
