"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMembers } from "@/lib/hooks/use-admin";

export default function MembersPage() {
  const { data: members, isLoading } = useMembers();

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : members && members.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">{member.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground p-6 text-center text-sm">No members yet.</p>
        )}
      </CardContent>
      <p className="text-muted-foreground px-6 pb-4 text-xs">
        Roles are managed via Team → invite/role controls (powered by Clerk) and sync here
        automatically.
      </p>
    </Card>
  );
}
