import { Skeleton } from '@/components/ui/skeleton';

const CampCardSkeleton = () => {
  return (
    <div className="card-camp">
      {/* Image skeleton */}
      <Skeleton className="aspect-[4/3] rounded-none" />
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Highlights */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* Rating & Distance */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

export default CampCardSkeleton;
