"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/hooks/use-auth";
import type { MemberOut } from "@/lib/types";

function InviteDialog() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");

  const invite = useMutation({
    mutationFn: () => api.post("/members/invite", { email, role }),
    onSuccess: () => {
      toast.success(`Invitation sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpen(false);
      setEmail("");
      setRole("member");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send invitation");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="size-4" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Work email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "member" | "admin")}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="member">Member — can ask questions and view documents</option>
              <option value="admin">Admin — can upload, manage settings, and invite</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending} className="gap-2">
              {invite.isPending ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamPage() {
  const api = useApi();
  const { data: user } = useCurrentUser();
  const { data: members, isLoading } = useQuery<MemberOut[]>({
    queryKey: ["members"],
    queryFn: () => api.get<MemberOut[]>("/members"),
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <PageHeader
        title="Team"
        description="Members of your organization and their roles."
        action={isAdmin ? <InviteDialog /> : undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members ({members?.length ?? 0})</CardTitle>
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
