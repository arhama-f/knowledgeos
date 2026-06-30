"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/admin/members", label: "Members" },
  { href: "/dashboard/admin/departments", label: "Departments" },
  { href: "/dashboard/admin/teams", label: "Teams" },
  { href: "/dashboard/admin/projects", label: "Projects" },
  { href: "/dashboard/admin/audit-log", label: "Audit log" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6">
        <PageHeader
          title="Admin"
          description="Manage teams, projects, access, and your organization's audit trail."
        />
      </div>
      <div className="mb-6 flex gap-1 border-b">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
