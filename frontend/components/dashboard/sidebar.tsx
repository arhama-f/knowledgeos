"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
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

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/ask", label: "Ask", icon: MessageSquare },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/api-keys", label: "API Keys", icon: KeyRound },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
      <div className="flex items-center gap-2 border-b px-5 py-4">
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
            K
          </div>
        )}
        <span className="font-semibold tracking-tight">{org?.name || "KnowledgeOS"}</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname?.startsWith("/dashboard/admin")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <ShieldCheck className="size-4" />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {(authUser?.name ?? authUser?.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{authUser?.name ?? authUser?.email}</p>
            <p className="text-muted-foreground truncate text-xs capitalize">{authUser?.role}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={handleSignOut} title="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
