"use client";

import { useApi } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { MemberOut } from "@/lib/types";

export default function TeamPage() {
  const api = useApi();
  const { data: members, isLoading } = useQuery<MemberOut[]>({
    queryKey: ["members"],
    queryFn: () => api.get<MemberOut[]>("/members"),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <PageHeader
        title="Team"
        description="Members of your organization and their roles."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y">
              {members?.map((m) => (
                <li key={String(m.user_id)} className="flex items-center gap-3 py-3">
                  <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {(m.name ?? m.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name ?? m.email}</p>
                    {m.name && <p className="text-muted-foreground truncate text-xs">{m.email}</p>}
                  </div>
                  <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-xs capitalize">
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
