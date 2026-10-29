// Offline VIN decoding: manufacturer from the WMI (first 3 characters) and model year from
// position 10. Exact model/engine needs a licensed data source (e.g. TecDoc), so callers use
// this to pre-select the make and year and let the customer confirm the rest.

export const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export const normaliseVin = (vin: string) => vin.replace(/[\s-]/g, '').toUpperCase();

// WMI prefixes for makes in the catalogue. Longer prefixes win over shorter ones.
const WMI: [string, string, string][] = [
  // prefix, make, where built
  ['AHT', 'Toyota', 'South Africa (Prospecton)'],
  ['MR0', 'Toyota', 'Thailand'],
  ['MR1', 'Toyota', 'Thailand'],
  ['MR2', 'Toyota', 'Thailand'],
  ['JT', 'Toyota', 'Japan'],
  ['SB1', 'Toyota', 'United Kingdom'],
  ['NMT', 'Toyota', 'Turkey'],
  ['AAV', 'Volkswagen', 'South Africa (Kariega)'],
  ['WVW', 'Volkswagen', 'Germany'],
  ['WVG', 'Volkswagen', 'Germany'],
  ['WV1', 'Volkswagen', 'Germany (commercial)'],
  ['WV2', 'Volkswagen', 'Germany (commercial)'],
  ['AFA', 'Ford', 'South Africa (Silverton)'],
  ['MNA', 'Ford', 'Thailand'],
  ['MNB', 'Ford', 'Thailand'],
  ['WF0', 'Ford', 'Germany'],
  ['JN', 'Nissan', 'Japan'],
  ['MDH', 'Nissan', 'India'],
  ['VSK', 'Nissan', 'Spain'],
  ['MPA', 'Isuzu', 'Thailand'],
  ['JAA', 'Isuzu', 'Japan'],
  ['MA3', 'Suzuki', 'India'],
  ['JS', 'Suzuki', 'Japan'],
  ['MAL', 'Hyundai', 'India'],
  ['KMH', 'Hyundai', 'South Korea'],
  ['TMA', 'Hyundai', 'Czech Republic'],
  ['MEE', 'Renault', 'India'],
  ['VF1', 'Renault', 'France'],
  ['KNA', 'Kia', 'South Korea'],
  ['KNE', 'Kia', 'South Korea'],
  ['LGW', 'Haval', 'China'],
  ['WBA', 'BMW', 'Germany'],
  ['WBS', 'BMW', 'Germany (M)'],
  ['WDD', 'Mercedes-Benz', 'Germany'],
  ['WDB', 'Mercedes-Benz', 'Germany'],
  ['W1K', 'Mercedes-Benz', 'Germany'],
].sort((a, b) => b[0].length - a[0].length) as [string, string, string][];

// Position 10 year codes: digits 1-9 = 2001-2009, letters (no I, O, Q, U, Z) = 2010-2030.
const YEAR_LETTERS = 'ABCDEFGHJKLMNPRSTVWXY';

function modelYear(code: string): number | null {
  if (/[1-9]/.test(code)) return 2000 + Number(code);
  const i = YEAR_LETTERS.indexOf(code);
  if (i < 0) return null;
  const year = 2010 + i;
  return year <= new Date().getFullYear() + 1 ? year : year - 30;
}

export type DecodedVin = {
  vin: string;
  make: string | null;
  origin: string | null;
  /** Many non-North-American manufacturers don't encode the year reliably; treat as a hint. */
  likelyYear: number | null;
};

export function decodeVin(raw: string): DecodedVin | { error: string } {
  const vin = normaliseVin(raw);
  if (vin.length !== 17) return { error: `A VIN has 17 characters (you entered ${vin.length}).` };
  if (/[IOQ]/.test(vin)) return { error: 'VINs never contain the letters I, O or Q. Check for 1 and 0.' };
  if (!VIN_PATTERN.test(vin)) return { error: 'A VIN only contains letters and numbers.' };
  const hit = WMI.find(([prefix]) => vin.startsWith(prefix));
  return { vin, make: hit?.[1] ?? null, origin: hit?.[2] ?? null, likelyYear: modelYear(vin[9]) };
}
