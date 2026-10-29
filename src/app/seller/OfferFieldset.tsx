'use client';

export function OfferFieldset({ errors = {} }: { errors?: Record<string, string> }) {
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, hint?: string) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className={`input ${errors[name] ? 'border-red-500' : ''}`} {...props} />
      {errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="mb-3 font-bold">Your offer</legend>
      <div>
        <label htmlFor="condition" className="label">Condition</label>
        <select id="condition" name="condition" className="input" defaultValue="NEW_AFTERMARKET">
          <option value="NEW_GENUINE">New, genuine (vehicle manufacturer)</option>
          <option value="NEW_AFTERMARKET">New, aftermarket</option>
          <option value="REMANUFACTURED">Remanufactured</option>
          <option value="USED">Used, tested</option>
        </select>
      </div>
      {field('price', 'Price (R, incl. everything)', { type: 'number', step: '0.01', min: '1', inputMode: 'decimal', required: true })}
      {field('compareAt', 'Was-price (optional)', { type: 'number', step: '0.01', min: '1', inputMode: 'decimal' }, 'Only if you genuinely sold it for more before.')}
      {field('stock', 'Quantity in stock', { type: 'number', min: '0', defaultValue: 1, required: true })}
      {field('warrantyMonths', 'Warranty (months)', { type: 'number', min: '0', max: '120', defaultValue: 6, required: true }, 'New parts carry at least the 6-month CPA warranty.')}
      {field('dispatchDays', 'Ships within (business days)', { type: 'number', min: '0', max: '30', defaultValue: 1, required: true })}
      {field('sku', 'Your stock code (optional)', { maxLength: 60 })}
      <div className="sm:col-span-2">
        <label htmlFor="notes" className="label">Notes for buyers (optional)</label>
        <textarea id="notes" name="notes" rows={2} maxLength={500} className="input" placeholder="e.g. Used: tested, minor scratches on housing. Includes mounting bolts." />
      </div>
    </fieldset>
  );
}
