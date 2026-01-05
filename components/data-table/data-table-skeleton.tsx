import { Skeleton } from "@/components/ui/skeleton"

interface DataTableSkeletonProps {
  rowCount?: number
  showToolbar?: boolean
  showHeader?: boolean
}

export function DataTableSkeleton({
  rowCount = 5,
  showToolbar = true,
  showHeader = true,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {showToolbar && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[150px] lg:w-[250px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
      )}
      <div className="rounded-md border">
        {showHeader && (
          <div className="h-12 border-b px-4 flex items-center bg-muted/50">
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="h-16 border-b px-4 flex items-center last:border-0">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
