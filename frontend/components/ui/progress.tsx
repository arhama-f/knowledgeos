import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all",
          clamped >= 100 ? "bg-destructive" : clamped >= 80 ? "bg-warning" : "bg-primary"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
