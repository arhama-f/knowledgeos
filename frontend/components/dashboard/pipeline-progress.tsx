import { Check, Loader2 } from "lucide-react";

import { PIPELINE_STAGES, stageIndex } from "@/lib/pipeline-stages";
import { cn } from "@/lib/utils";
import type { ProcessingStage } from "@/lib/types";

export function PipelineProgress({ stage }: { stage: ProcessingStage | null }) {
  const currentIndex = stageIndex(stage);

  return (
    <ol className="space-y-2">
      {PIPELINE_STAGES.map((s, i) => {
        const done = currentIndex > i;
        const active = i === currentIndex;
        return (
          <li key={s.value} className="flex items-center gap-2.5 text-sm">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                done && "border-success bg-success/10 text-success",
                active && "border-primary text-primary",
                !done && !active && "border-input text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="size-3" />
              ) : active ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                i + 1
              )}
            </span>
            <span className={cn(active ? "text-foreground font-medium" : "text-muted-foreground")}>
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
