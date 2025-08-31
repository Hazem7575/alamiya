import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EventTableSkeleton() {
  return (
    <Card className="shadow-card">
      <div className="p-6">
        {/* Search bar skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <div className="w-full">
            {/* Table header */}
            <div className="border-b border-border mb-4">
              <div className="flex py-3 px-4 gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            
            {/* Table rows */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex py-3 px-4 gap-4 items-center border-b border-border">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
