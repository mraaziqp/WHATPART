const Bar = ({ className }: { className: string }) => <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading parts">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-square animate-pulse bg-slate-100" />
          <div className="space-y-2 p-3">
            <Bar className="h-3 w-16" />
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-2/3" />
            <Bar className="mt-3 h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultsPageSkeleton() {
  return (
    <div className="container-page py-6">
      <Bar className="mb-5 h-7 w-64" />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-3 lg:block">{Array.from({ length: 8 }, (_, i) => <Bar key={i} className="h-4 w-full" />)}</div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="container-page py-6" aria-busy="true" aria-label="Loading part">
      <Bar className="mb-4 h-4 w-48" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_330px]">
        <div className="card aspect-square animate-pulse bg-slate-100" />
        <div className="space-y-3">
          <Bar className="h-4 w-24" />
          <Bar className="h-7 w-full" />
          <Bar className="h-7 w-3/4" />
          <Bar className="mt-4 h-20 w-full" />
          <Bar className="h-32 w-full" />
        </div>
        <div className="card space-y-3 p-5">
          <Bar className="h-9 w-32" />
          <Bar className="h-4 w-40" />
          <Bar className="h-4 w-48" />
          <Bar className="mt-4 h-12 w-full" />
          <Bar className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
