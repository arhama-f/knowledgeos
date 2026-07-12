"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/lib/hooks/use-api-keys";
import { apiKeySchema, type ApiKeyInput } from "@/lib/schemas";

export default function ApiKeysPage() {
  const { data: keys, isLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const [open, setOpen] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiKeyInput>({ resolver: zodResolver(apiKeySchema) });

  const onSubmit = async (values: ApiKeyInput) => {
    const result = await createKey.mutateAsync(values.name);
    setNewSecret(result.secret);
    reset();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <PageHeader
        title="API keys"
        description="Use API keys to call KnowledgeOS from your own systems and integrations."
        action={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setNewSecret(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New API key
              </Button>
            </DialogTrigger>
            <DialogContent>
              {newSecret ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Your new API key</DialogTitle>
                    <DialogDescription>
                      Copy it now — you won&apos;t be able to see it again.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-muted flex items-center gap-2 rounded-md border p-3 font-mono text-sm">
                    <span className="flex-1 truncate">{newSecret}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Copy API key"
                      onClick={() => {
                        navigator.clipboard.writeText(newSecret);
                        toast.success("API key copied to clipboard");
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setOpen(false)}>Done</Button>
                  </DialogFooter>
                </>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Create API key</DialogTitle>
                    <DialogDescription>
                      Give it a name so you remember what it&apos;s used for.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="e.g. Internal wiki sync" {...register("name")} />
                    {errors.name && (
                      <p className="text-destructive text-sm">{errors.name.message}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createKey.isPending}>
                      {createKey.isPending ? "Creating…" : "Create key"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        {isLoading ? (
          <CardContent className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        ) : keys && keys.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {key.key_prefix}…
                  </TableCell>
                  <TableCell>
                    {key.revoked_at ? (
                      <span className="text-muted-foreground">Revoked</span>
                    ) : (
                      <span className="text-success">Active</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!key.revoked_at && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Revoke ${key.name}`}
                        onClick={() => revokeKey.mutate(key.id)}
                        disabled={revokeKey.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent>
            <EmptyState icon={KeyRound} title="No API keys yet." />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
