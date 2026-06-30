"use client";

import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  useAddTeamMember,
  useCreateTeam,
  useDeleteTeam,
  useDepartments,
  useMembers,
  useTeamMembers,
  useTeams,
} from "@/lib/hooks/use-admin";

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const { data: departments } = useDepartments();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [managingTeam, setManagingTeam] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> New team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create team</DialogTitle>
              <DialogDescription>
                Teams group employees and can own projects with scoped access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="team-name">Name</Label>
                <Input
                  id="team-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Backend"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team-department">Department (optional)</Label>
                <select
                  id="team-department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm shadow-sm"
                >
                  <option value="">No department</option>
                  {departments?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!name.trim() || createTeam.isPending}
                onClick={() =>
                  createTeam.mutate(
                    { name, department_id: departmentId || null },
                    {
                      onSuccess: () => {
                        setName("");
                        setDepartmentId("");
                        setCreateOpen(false);
                      },
                    }
                  )
                }
              >
                {createTeam.isPending ? "Creating…" : "Create team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="space-y-2 p-6">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : teams && teams.length > 0 ? (
            teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  {team.description && (
                    <p className="text-muted-foreground text-sm">{team.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setManagingTeam(team.id)}>
                    <Users className="size-4" /> Members
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTeam.mutate(team.id)}
                    disabled={deleteTeam.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={Users} title="No teams yet." />
          )}
        </CardContent>
      </Card>

      <TeamMembersDialog teamId={managingTeam} onOpenChange={() => setManagingTeam(null)} />
    </div>
  );
}

function TeamMembersDialog({
  teamId,
  onOpenChange,
}: {
  teamId: string | null;
  onOpenChange: () => void;
}) {
  const { data: teamMembers } = useTeamMembers(teamId);
  const { data: members } = useMembers();
  const addMember = useAddTeamMember(teamId ?? "");
  const [selectedUserId, setSelectedUserId] = useState("");

  const availableMembers = members?.filter(
    (m) => !teamMembers?.some((tm) => tm.user_id === m.user_id)
  );

  return (
    <Dialog open={!!teamId} onOpenChange={(open) => !open && onOpenChange()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team members</DialogTitle>
          <DialogDescription>Add or review who belongs to this team.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {teamMembers?.length ? (
            teamMembers.map((tm) => {
              const member = members?.find((m) => m.user_id === tm.user_id);
              return (
                <div
                  key={tm.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>{member?.name || member?.email || tm.user_id}</span>
                  <span className="text-muted-foreground text-xs">{tm.role}</span>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-sm">No members yet.</p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm shadow-sm"
          >
            <option value="">Select a member…</option>
            {availableMembers?.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name || m.email || m.user_id}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!selectedUserId || addMember.isPending}
            onClick={() =>
              addMember.mutate(
                { user_id: selectedUserId },
                { onSuccess: () => setSelectedUserId("") }
              )
            }
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
