// Client-side setter for the selected-vehicle cookie read by lib/vehicle.ts.
export const VEHICLE_COOKIE = 'wp_vehicle';

export function setVehicleCookie(value: string | null) {
  document.cookie = value
    ? `${VEHICLE_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    : `${VEHICLE_COOKIE}=; path=/; max-age=0`;
}
