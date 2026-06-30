"use client";

import { useState } from "react";
import { FolderKanban, Plus, Shield, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useCreateProject,
  useDeleteProject,
  useGrantPermission,
  useMembers,
  usePermissions,
  useProjects,
  useRevokePermission,
  useTeams,
} from "@/lib/hooks/use-admin";

const ROLES = ["viewer", "editor", "admin"] as const;

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const { data: teams } = useTeams();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [accessProjectId, setAccessProjectId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>
                Projects scope a set of documents to a specific team or audience.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HR Policies"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-team">Owning team (optional)</Label>
                <select
                  id="project-team"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm shadow-sm"
                >
                  <option value="">Org-wide (no specific team)</option>
                  {teams?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!name.trim() || createProject.isPending}
                onClick={() =>
                  createProject.mutate(
                    { name, team_id: teamId || null },
                    {
                      onSuccess: () => {
                        setName("");
                        setTeamId("");
                        setCreateOpen(false);
                      },
                    }
                  )
                }
              >
                {createProject.isPending ? "Creating…" : "Create project"}
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
          ) : projects && projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  {project.description && (
                    <p className="text-muted-foreground text-sm">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAccessProjectId(project.id)}
                  >
                    <Shield className="size-4" /> Access
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProject.mutate(project.id)}
                    disabled={deleteProject.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet."
              description="Documents stay org-wide until you scope them to a project."
            />
          )}
        </CardContent>
      </Card>

      <ProjectAccessDialog
        projectId={accessProjectId}
        onOpenChange={() => setAccessProjectId(null)}
      />
    </div>
  );
}

function ProjectAccessDialog({
  projectId,
  onOpenChange,
}: {
  projectId: string | null;
  onOpenChange: () => void;
}) {
  const { data: permissions } = usePermissions("project", projectId);
  const { data: members } = useMembers();
  const { data: teams } = useTeams();
  const grant = useGrantPermission();
  const revoke = useRevokePermission();

  const [subjectType, setSubjectType] = useState<"user" | "team">("user");
  const [subjectId, setSubjectId] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("viewer");

  return (
    <Dialog open={!!projectId} onOpenChange={(open) => !open && onOpenChange()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project access</DialogTitle>
          <DialogDescription>
            Grant specific users or teams a role on this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {permissions?.length ? (
            permissions.map((perm) => {
              const label =
                perm.subject_type === "user"
                  ? members?.find((m) => m.user_id === perm.subject_id)?.name ||
                    members?.find((m) => m.user_id === perm.subject_id)?.email
                  : teams?.find((t) => t.id === perm.subject_id)?.name;
              return (
                <div
                  key={perm.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {label || perm.subject_id}{" "}
                    <span className="text-muted-foreground">({perm.subject_type})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{perm.role}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revoke.mutate(perm.id)}
                      disabled={revoke.isPending}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-sm">No explicit grants yet.</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <select
            value={subjectType}
            onChange={(e) => {
              setSubjectType(e.target.value as "user" | "team");
              setSubjectId("");
            }}
            className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          >
            <option value="user">User</option>
            <option value="team">Team</option>
          </select>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          >
            <option value="">Select…</option>
            {subjectType === "user"
              ? members?.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name || m.email}
                  </option>
                ))
              : teams?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
          </select>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
            className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button
            disabled={!subjectId || !projectId || grant.isPending}
            onClick={() =>
              projectId &&
              grant.mutate(
                {
                  subject_type: subjectType,
                  subject_id: subjectId,
                  resource_type: "project",
                  resource_id: projectId,
                  role,
                },
                { onSuccess: () => setSubjectId("") }
              )
            }
          >
            Grant access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
