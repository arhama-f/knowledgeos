import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-12 text-center", className)}>
      {Icon && <Icon className="text-muted-foreground/40 size-8" />}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  );
}
