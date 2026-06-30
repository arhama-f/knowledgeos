"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/lib/hooks/use-admin";

export default function AuditLogPage() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : logs && logs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.resource_type}
                    {log.resource_id ? ` · ${log.resource_id.slice(0, 8)}` : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.ip_address || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground p-6 text-center text-sm">
            No audit events recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
