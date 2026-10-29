'use client';

import { useState } from 'react';

export function ProductGallery({ images }: { images: { url: string; alt: string }[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  if (!current) return <div className="card aspect-square" />;
  return (
    <div className="space-y-3">
      <div className="card flex aspect-square items-center justify-center p-10">
        <img src={current.url} alt={current.alt} className="max-h-full w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Product photos">
          {images.map((img, i) => (
            <button
              key={img.url}
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={`size-16 shrink-0 rounded-lg border-2 bg-white p-1 ${i === active ? 'border-brand-500' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <img src={img.url} alt="" className="size-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
