import { Skeleton } from '@/components/ui/skeleton';

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton 
          key={i}
          className="h-14 w-[80%]"
          style={{
            marginLeft: i % 2 === 0 ? 'auto' : '0'
          }}
        />
      ))}
    </div>
  );
}
