import { Skeleton } from "@/components/ui/skeleton";

export default function AskLoading() {
  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      <aside className="hidden w-64 shrink-0 border-r lg:flex lg:flex-col">
        <div className="p-4">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-1 px-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
