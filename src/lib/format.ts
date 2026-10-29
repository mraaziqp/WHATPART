import type { Condition } from '@/generated/prisma/enums';

export const formatRand = (cents: number) =>
  `R ${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const yearRange = (from: number, to?: number | null) => (to ? `${from}–${to}` : `${from}+`);

type VehicleLike = {
  engine: string;
  generation?: string | null;
  yearFrom: number;
  yearTo?: number | null;
  model: { name: string; make: { name: string } };
};

export const vehicleLabel = (v: VehicleLike) =>
  `${v.model.make.name} ${v.model.name} ${v.engine} (${yearRange(v.yearFrom, v.yearTo)})`;

export const CONDITION_LABEL: Record<Condition, string> = {
  NEW_GENUINE: 'New · Genuine',
  NEW_AFTERMARKET: 'New · Aftermarket',
  REMANUFACTURED: 'Remanufactured',
  USED: 'Used · Tested',
};

export const dispatchLabel = (days: number) =>
  days <= 1 ? 'Ships within 24 hours' : `Ships in ${days} business days`;
