"use client";

import { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";

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
import { useCreateDepartment, useDeleteDepartment, useDepartments } from "@/lib/hooks/use-admin";

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> New department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create department</DialogTitle>
              <DialogDescription>
                Departments group teams under a top-level org unit (e.g. Engineering, Sales).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="department-name">Name</Label>
              <Input
                id="department-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>
            <DialogFooter>
              <Button
                disabled={!name.trim() || createDepartment.isPending}
                onClick={() =>
                  createDepartment.mutate(
                    { name },
                    {
                      onSuccess: () => {
                        setName("");
                        setOpen(false);
                      },
                    }
                  )
                }
              >
                {createDepartment.isPending ? "Creating…" : "Create department"}
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
          ) : departments && departments.length > 0 ? (
            departments.map((department) => (
              <div
                key={department.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{department.name}</p>
                  {department.description && (
                    <p className="text-muted-foreground text-sm">{department.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteDepartment.mutate(department.id)}
                  disabled={deleteDepartment.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Building2}
              title="No departments yet."
              description="Teams stay ungrouped until you add one."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
