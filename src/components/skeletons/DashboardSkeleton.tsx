import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header Skeleton */}


        {/* Main Content Skeleton */}
        <Card className="!shadow-none border-none">
          <div className="p-6">
            {/* Search and filters */}
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="ml-auto h-10 w-32" />
            </div>

            {/* Table content */}
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
