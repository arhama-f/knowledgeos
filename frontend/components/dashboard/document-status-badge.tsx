import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { stageLabel } from "@/lib/pipeline-stages";
import type { DocumentStatus, ProcessingStage } from "@/lib/types";

const VARIANTS: Record<
  DocumentStatus,
  { label: string; variant: "secondary" | "warning" | "success" | "destructive" }
> = {
  pending: { label: "Queued", variant: "secondary" },
  processing: { label: "Processing", variant: "warning" },
  ready: { label: "Ready", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
};

export function DocumentStatusBadge({
  status,
  stage,
}: {
  status: DocumentStatus;
  stage?: ProcessingStage | null;
}) {
  const config = VARIANTS[status];
  const label = status === "processing" && stage ? stageLabel(stage) || config.label : config.label;
  return (
    <Badge variant={config.variant} className="gap-1">
      {status === "processing" && <Loader2 className="size-3 animate-spin" />}
      {label}
    </Badge>
  );
}
