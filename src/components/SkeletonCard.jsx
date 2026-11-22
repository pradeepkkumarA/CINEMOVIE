export default function SkeletonCard() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl" aria-hidden="true">
      <div className="shimmer aspect-[2/3] w-full" />
      <div className="space-y-2 p-3">
        <div className="shimmer h-4 w-4/5 rounded" />
        <div className="flex justify-between">
          <div className="shimmer h-3 w-10 rounded" />
          <div className="shimmer h-3 w-16 rounded" />
        </div>
        <div className="flex gap-1 pt-1">
          <div className="shimmer h-4 w-14 rounded-full" />
          <div className="shimmer h-4 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}
