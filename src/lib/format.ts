import type { Condition } from '@/generated/prisma/enums';

// "R 1,529" / "R 799.50": the period decimal South African shoppers expect online
// (the en-ZA locale would print "R 799,50").
export const formatRand = (cents: number) =>
  `R ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

/** A Date `days` days before now (for "last 30 days" style queries). */
export const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

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
