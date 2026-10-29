import { getSessionUser } from '@/lib/session';
import { getSelectedVehicle } from '@/lib/vehicle';
import { db } from '@/lib/db';
import { CheckoutForm } from './CheckoutForm';

export const metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const [user, vehicle] = await Promise.all([getSessionUser(), getSelectedVehicle()]);
  // Include the VIN if the shopper saved one for this vehicle in their garage.
  const garage = user && vehicle
    ? await db.garageVehicle.findFirst({ where: { userId: user.id, vehicleId: vehicle.id, year: vehicle.year }, select: { vin: true } })
    : null;
  const vehicleNote = vehicle ? `${vehicle.year} ${vehicle.label}${garage?.vin ? `, VIN ${garage.vin}` : ''}` : '';
  return <CheckoutForm defaults={{ fullName: user?.name ?? '', email: user?.email ?? '', vehicleNote }} />;
}
