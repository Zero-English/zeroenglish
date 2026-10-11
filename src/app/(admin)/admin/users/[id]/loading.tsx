import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UserDetailLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Hero Header Card skeleton */}
      <Card className="overflow-hidden border-border bg-card shadow-xs">
        <div className="h-20 sm:h-24 bg-muted/40" />
        <CardContent className="px-5 sm:px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full ring-4 ring-card" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>

          <div className="my-4 h-px bg-border/60" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5-KPI Bento Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="mt-3 space-y-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-5">
        <Skeleton className="h-9 w-80 rounded-lg" />

        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3.5 w-72 mt-1" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}