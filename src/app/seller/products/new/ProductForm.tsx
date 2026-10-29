'use client';

import { useActionState, useMemo, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { createProduct, type FormState } from '../../actions';
import { OfferFieldset } from '../../OfferFieldset';

type Props = {
  categories: { id: string; name: string; children: { id: string; name: string }[] }[];
  brands: string[];
  vehicles: { id: string; make: string; label: string }[];
};

export function ProductForm({ categories, brands, vehicles }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(createProduct, {});
  const err = state.fieldErrors ?? {};
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [universal, setUniversal] = useState(false);
  const [filter, setFilter] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const shown = useMemo(() => {
    const f = filter.toLowerCase();
    return vehicles.filter((v) => !f || `${v.make} ${v.label}`.toLowerCase().includes(f));
  }, [vehicles, filter]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadError('');
    const body = new FormData();
    [...files].slice(0, 8 - images.length).forEach((f) => body.append('files', f));
    const res = await fetch('/api/uploads', { method: 'POST', body });
    const data = await res.json().catch(() => ({ error: 'Upload failed' }));
    setUploading(false);
    if (!res.ok) return setUploadError(data.error ?? 'Upload failed');
    setImages((cur) => [...cur, ...data.urls].slice(0, 8));
  };

  const toggle = (id: string) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className={`input ${err[name] ? 'border-red-500' : ''}`} {...props} />
      {err[name] && <p className="mt-1 text-xs text-red-600">{err[name]}</p>}
    </div>
  );

  return (
    <form action={action} className="space-y-6">
      <section className="card space-y-4 p-5">
        <h3 className="font-bold">The part</h3>
        {field('title', 'Title', { placeholder: 'e.g. Bosch Front Brake Pad Set – Toyota Hilux 2.8 GD-6 (2016+)', maxLength: 160 })}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brand" className="label">Brand</label>
            <input id="brand" name="brand" list="brand-list" className={`input ${err.brand ? 'border-red-500' : ''}`} />
            <datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist>
            {err.brand && <p className="mt-1 text-xs text-red-600">{err.brand}</p>}
          </div>
          <div>
            <label htmlFor="categoryId" className="label">Category</label>
            <select id="categoryId" name="categoryId" className={`input ${err.categoryId ? 'border-red-500' : ''}`} defaultValue="">
              <option value="" disabled>Choose…</option>
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>{c.children.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}</optgroup>
              ))}
            </select>
            {err.categoryId && <p className="mt-1 text-xs text-red-600">{err.categoryId}</p>}
          </div>
          {field('partNumber', 'Manufacturer part number', { maxLength: 60 })}
          {field('oemNumbers', 'OEM cross-reference numbers (optional, comma separated)', { maxLength: 300 })}
        </div>
        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" name="description" rows={4} maxLength={4000} className={`input ${err.description ? 'border-red-500' : ''}`} placeholder="What it is, what’s in the box, fitting notes." />
          {err.description && <p className="mt-1 text-xs text-red-600">{err.description}</p>}
        </div>
        <div>
          <label htmlFor="specs" className="label">Specifications (optional, one per line as Name: Value)</label>
          <textarea id="specs" name="specs" rows={3} maxLength={2000} className="input font-mono text-xs" placeholder={'Axle: Front\nContents: 4 pads'} />
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="font-bold">Photos</h3>
        <p className="text-sm text-slate-600">Clear photos of the actual part on a plain background. Up to 8.</p>
        <div className="flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative size-24 rounded-lg border border-slate-200 bg-white p-1">
              <img src={url} alt="" className="size-full object-contain" />
              <input type="hidden" name="images" value={url} />
              <button type="button" onClick={() => setImages((cur) => cur.filter((u) => u !== url))} className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-0.5 text-white" aria-label="Remove photo"><X className="size-3.5" /></button>
            </div>
          ))}
          {images.length < 8 && (
            <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-500">
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
              {uploading ? 'Uploading…' : 'Add photos'}
              <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files)} />
            </label>
          )}
        </div>
        {(uploadError || err.images) && <p className="text-xs text-red-600">{uploadError || err.images}</p>}
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="font-bold">Fits these vehicles</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="universal" checked={universal} onChange={(e) => setUniversal(e.target.checked)} className="size-4 accent-brand-600" />
          Universal part (fits any vehicle, e.g. oil, fluids, tools)
        </label>
        {!universal && (
          <>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter vehicles, e.g. Hilux" className="input" />
            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
              {shown.map((v) => (
                <label key={v.id} className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-0 hover:bg-slate-50">
                  <input type="checkbox" name="vehicleIds" value={v.id} checked={picked.has(v.id)} onChange={() => toggle(v.id)} className="size-4 accent-brand-600" />
                  <span className="font-medium">{v.make}</span> {v.label}
                </label>
              ))}
            </div>
            {/* keep selections that are filtered out of view */}
            {[...picked].filter((id) => !shown.some((v) => v.id === id)).map((id) => <input key={id} type="hidden" name="vehicleIds" value={id} />)}
            <p className="text-xs text-slate-500">{picked.size} selected. Missing a vehicle? Contact us and we’ll add it.</p>
            {err.vehicleIds && <p className="text-xs text-red-600">{err.vehicleIds}</p>}
          </>
        )}
      </section>

      <section className="card p-5"><OfferFieldset errors={err} /></section>

      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending || uploading} className="btn-primary w-full py-3 text-base">
        {pending && <Loader2 className="size-5 animate-spin" />} Add part and publish listing
      </button>
    </form>
  );
}
