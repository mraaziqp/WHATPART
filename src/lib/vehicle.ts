import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { db } from './db';
import { yearRange } from './format';

export const VEHICLE_COOKIE = 'wp_vehicle';

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

export const getVehicleTree = cache(async (): Promise<VehicleTree> => {
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
});

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
