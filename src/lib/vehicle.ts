import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { db } from './db';
import { yearRange } from './format';
import { VEHICLE_COOKIE } from './vehicle-cookie';

export type VehicleTree = {
  id: string;
  name: string;
  models: { id: string; name: string; vehicles: { id: string; label: string; yearFrom: number; yearTo: number | null }[] }[];
}[];

export type SelectedVehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  engine: string;
  label: string; // "Toyota Hilux 2.8 GD-6"
};

// Read on every page (vehicle picker) but only changes when vehicles are added.
const loadVehicleTree = unstable_cache(async (): Promise<VehicleTree> => {
  const makes = await db.make.findMany({
    orderBy: [{ popular: 'desc' }, { name: 'asc' }],
    include: { models: { orderBy: { name: 'asc' }, include: { vehicles: { orderBy: [{ yearFrom: 'desc' }, { engine: 'asc' }] } } } },
  });
  return makes.map((m) => ({
    id: m.id,
    name: m.name,
    models: m.models.map((mo) => ({
      id: mo.id,
      name: mo.name,
      vehicles: mo.vehicles.map((v) => ({
        id: v.id,
        label: `${v.engine}${v.generation ? ` (${v.generation})` : ''} · ${yearRange(v.yearFrom, v.yearTo)}`,
        yearFrom: v.yearFrom,
        yearTo: v.yearTo,
      })),
    })),
  }));
}, ['vehicle-tree'], { revalidate: 3600, tags: ['vehicles'] });

export const getVehicleTree = cache(loadVehicleTree);

export const getSelectedVehicle = cache(async (): Promise<SelectedVehicle | null> => {
  const raw = (await cookies()).get(VEHICLE_COOKIE)?.value;
  if (!raw) return null;
  const [id, yearStr] = raw.split(':');
  const v = await db.vehicle.findUnique({ where: { id }, include: { model: { include: { make: true } } } });
  if (!v) return null;
  const year = Number(yearStr) || v.yearFrom;
  return {
    id: v.id,
    year,
    make: v.model.make.name,
    model: v.model.name,
    engine: v.engine,
    label: `${v.model.make.name} ${v.model.name} ${v.engine}`,
  };
});
