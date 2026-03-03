import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => (
  <div className="container py-6 md:py-10 pb-24 md:pb-10">
    {/* Profile header */}
    <div className="flex items-center gap-4 mb-8">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div>
        <Skeleton className="h-6 w-36 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="glass border-border/50">
          <CardContent className="p-4">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-7 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Goal card */}
    <Card className="glass border-border/50 mb-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-2.5 w-full mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>

    {/* Quick actions */}
    <div className="flex gap-2 mb-6">
      <Skeleton className="h-8 w-28 rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-28 rounded-md" />
    </div>

    {/* Tabs + tip history */}
    <Skeleton className="h-9 w-64 rounded-md mb-4" />
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default DashboardSkeleton;
