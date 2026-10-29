import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { getSelectedVehicle, getVehicleTree } from '@/lib/vehicle';
import { VehiclePicker } from '@/components/vehicle/VehiclePicker';
import { GarageCard } from './GarageCard';

export const metadata = { title: 'My Garage', robots: { index: false } };

export default async function GaragePage() {
  const user = await requireUser('/account/garage');
  const [garage, selected, tree] = await Promise.all([
    db.garageVehicle.findMany({
      where: { userId: user.id },
      include: { vehicle: { include: { model: { include: { make: true } } } } },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    }),
    getSelectedVehicle(),
    getVehicleTree(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">My Garage</h2>
        <p className="text-sm text-slate-600">Save every vehicle you look after and switch between them in one tap. Vehicles you select while signed in are saved here automatically.</p>
      </div>
      {garage.length > 0 && (
        <ul className="space-y-3">
          {garage.map((g) => (
            <GarageCard
              key={g.id}
              id={g.id}
              vehicleId={g.vehicleId}
              year={g.year}
              label={`${g.vehicle.model.make.name} ${g.vehicle.model.name} ${g.vehicle.engine}`}
              nickname={g.nickname}
              vin={g.vin}
              active={selected?.id === g.vehicleId && selected.year === g.year}
            />
          ))}
        </ul>
      )}
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">{garage.length ? 'Add another vehicle' : 'Add your first vehicle'}</h3>
        <VehiclePicker tree={tree} />
      </div>
    </div>
  );
}
