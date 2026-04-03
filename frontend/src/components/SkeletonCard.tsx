export default function SkeletonCard() {
  return (
    <div className="bg-white border border-ink-100 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full shimmer-bg" />
      <div className="pl-4 space-y-3">
        <div className="h-5 w-24 shimmer-bg rounded-sm" />
        <div className="h-4 w-3/4 shimmer-bg rounded-sm" />
        <div className="h-3 w-full shimmer-bg rounded-sm" />
        <div className="h-3 w-2/3 shimmer-bg rounded-sm" />
        <div className="pt-2 border-t border-ink-100 flex justify-between">
          <div className="h-3 w-16 shimmer-bg rounded-sm" />
          <div className="h-3 w-20 shimmer-bg rounded-sm" />
        </div>
      </div>
    </div>
  );
}
