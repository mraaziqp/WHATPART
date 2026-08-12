import type React from 'react';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800 rounded-xl animate-pulse ${className}`} />
);

export const GridSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-8 w-32" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <SkeletonBlock className="h-48 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
            <SkeletonBlock className="h-6 w-1/3" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const QuoteFormSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
    <div className="text-center space-y-4">
      <SkeletonBlock className="h-10 w-64 mx-auto" />
      <SkeletonBlock className="h-4 w-96 mx-auto" />
    </div>
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-6">
      <SkeletonBlock className="h-6 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
        ))}
      </div>
      <SkeletonBlock className="h-24 w-full" />
    </div>
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
      <SkeletonBlock className="h-32 w-full" />
    </div>
    <SkeletonBlock className="h-14 w-full" />
  </div>
);
