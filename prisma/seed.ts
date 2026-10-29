/**
 * Demo catalogue seed: generates parts from templates x common South African vehicles.
 * All seeded sellers are flagged isDemo so the storefront can hide them with one switch.
 * Part numbers use WHATPART catalogue numbers (WP-...) rather than inventing manufacturer numbers.
 * Refuses to run once a real (non-demo) seller exists, so it can never wipe live data.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type BrandTier, type Condition, type FuelType, type Prisma, type Seller, type SellerType } from '../src/generated/prisma/client.ts';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// Deterministic RNG so reseeding produces the same catalogue.
let rngState = 20261029;
const rand = () => ((rngState = (rngState * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => rand() - 0.5);
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const toPrice = (rands: number) => Math.max(49, Math.round(rands / 10) * 10 - 1) * 100; // R1,299-style endings

// ─── Vehicles ───────────────────────────────────────────────────────────────

type Cls = 'small' | 'medium' | 'bakkie' | 'premium';
type V = { make: string; model: string; generation?: string; engine: string; engineCode?: string; fuel: FuelType; kw?: number; from: number; to?: number };
type Family = { key: string; short: string; cls: Cls; genuine?: string; vehicles: V[] };

const FAMILIES: Family[] = [
  { key: 'hilux-gd6', short: 'Toyota Hilux / Fortuner GD-6 (2016+)', cls: 'bakkie', genuine: 'Toyota Genuine Parts', vehicles: [
    { make: 'Toyota', model: 'Hilux', generation: 'AN120', engine: '2.4 GD-6', engineCode: '2GD-FTV', fuel: 'DIESEL', kw: 110, from: 2016 },
    { make: 'Toyota', model: 'Hilux', generation: 'AN120', engine: '2.8 GD-6', engineCode: '1GD-FTV', fuel: 'DIESEL', kw: 150, from: 2016 },
    { make: 'Toyota', model: 'Fortuner', generation: 'AN160', engine: '2.8 GD-6', engineCode: '1GD-FTV', fuel: 'DIESEL', kw: 150, from: 2016 },
  ] },
  { key: 'hilux-d4d', short: 'Toyota Hilux / Fortuner D-4D (2005–2016)', cls: 'bakkie', genuine: 'Toyota Genuine Parts', vehicles: [
    { make: 'Toyota', model: 'Hilux', generation: 'AN20', engine: '2.5 D-4D', engineCode: '2KD-FTV', fuel: 'DIESEL', kw: 75, from: 2005, to: 2016 },
    { make: 'Toyota', model: 'Hilux', generation: 'AN20', engine: '3.0 D-4D', engineCode: '1KD-FTV', fuel: 'DIESEL', kw: 120, from: 2005, to: 2016 },
    { make: 'Toyota', model: 'Fortuner', generation: 'AN50', engine: '3.0 D-4D', engineCode: '1KD-FTV', fuel: 'DIESEL', kw: 120, from: 2005, to: 2015 },
  ] },
  { key: 'corolla-quest', short: 'Toyota Corolla Quest 1.8 (2014–2022)', cls: 'medium', genuine: 'Toyota Genuine Parts', vehicles: [
    { make: 'Toyota', model: 'Corolla Quest', engine: '1.8', fuel: 'PETROL', kw: 103, from: 2014, to: 2022 },
  ] },
  { key: 'corolla-cross', short: 'Toyota Corolla Cross 1.8 (2021+)', cls: 'medium', genuine: 'Toyota Genuine Parts', vehicles: [
    { make: 'Toyota', model: 'Corolla Cross', engine: '1.8', fuel: 'PETROL', kw: 103, from: 2021 },
    { make: 'Toyota', model: 'Corolla Cross', engine: '1.8 Hybrid', fuel: 'HYBRID', kw: 90, from: 2021 },
  ] },
  { key: 'starlet', short: 'Toyota Starlet 1.5 (2020+)', cls: 'small', genuine: 'Toyota Genuine Parts', vehicles: [
    { make: 'Toyota', model: 'Starlet', engine: '1.5', fuel: 'PETROL', kw: 77, from: 2020 },
  ] },
  { key: 'vivo', short: 'VW Polo Vivo 1.4 / 1.6 (2010+)', cls: 'small', genuine: 'VW Genuine Parts', vehicles: [
    { make: 'Volkswagen', model: 'Polo Vivo', generation: 'Mk1', engine: '1.6', fuel: 'PETROL', kw: 77, from: 2010, to: 2017 },
    { make: 'Volkswagen', model: 'Polo Vivo', generation: 'Mk2', engine: '1.4', fuel: 'PETROL', kw: 59, from: 2018 },
  ] },
  { key: 'polo-tsi', short: 'VW Polo 1.0 TSI (2018+)', cls: 'small', genuine: 'VW Genuine Parts', vehicles: [
    { make: 'Volkswagen', model: 'Polo', generation: 'AW', engine: '1.0 TSI', fuel: 'PETROL', kw: 70, from: 2018 },
  ] },
  { key: 'golf7', short: 'VW Golf 7 1.4 TSI / GTI (2013–2020)', cls: 'premium', genuine: 'VW Genuine Parts', vehicles: [
    { make: 'Volkswagen', model: 'Golf', generation: 'Mk7', engine: '1.4 TSI', fuel: 'PETROL', kw: 92, from: 2013, to: 2020 },
    { make: 'Volkswagen', model: 'Golf', generation: 'Mk7', engine: '2.0 TSI GTI', fuel: 'PETROL', kw: 169, from: 2013, to: 2020 },
  ] },
  { key: 'amarok', short: 'VW Amarok 2.0 BiTDI (2010–2022)', cls: 'bakkie', genuine: 'VW Genuine Parts', vehicles: [
    { make: 'Volkswagen', model: 'Amarok', generation: '2H', engine: '2.0 BiTDI', fuel: 'DIESEL', kw: 132, from: 2010, to: 2022 },
  ] },
  { key: 'ranger-t6', short: 'Ford Ranger / Everest 2.2 & 3.2 TDCi (2012–2022)', cls: 'bakkie', genuine: 'Ford Genuine Parts', vehicles: [
    { make: 'Ford', model: 'Ranger', generation: 'T6', engine: '2.2 TDCi', fuel: 'DIESEL', kw: 118, from: 2012, to: 2022 },
    { make: 'Ford', model: 'Ranger', generation: 'T6', engine: '3.2 TDCi', fuel: 'DIESEL', kw: 147, from: 2012, to: 2022 },
    { make: 'Ford', model: 'Everest', generation: 'UA', engine: '3.2 TDCi', fuel: 'DIESEL', kw: 147, from: 2016, to: 2022 },
  ] },
  { key: 'ranger-next', short: 'Ford Ranger 2.0 BiTurbo (2022+)', cls: 'bakkie', genuine: 'Ford Genuine Parts', vehicles: [
    { make: 'Ford', model: 'Ranger', generation: 'P703', engine: '2.0 BiTurbo', fuel: 'DIESEL', kw: 154, from: 2022 },
  ] },
  { key: 'ecosport', short: 'Ford EcoSport 1.0 EcoBoost (2013–2022)', cls: 'small', genuine: 'Ford Genuine Parts', vehicles: [
    { make: 'Ford', model: 'EcoSport', engine: '1.0 EcoBoost', fuel: 'PETROL', kw: 92, from: 2013, to: 2022 },
  ] },
  { key: 'np200', short: 'Nissan NP200 1.6 (2008–2021)', cls: 'small', genuine: 'Nissan Genuine Parts', vehicles: [
    { make: 'Nissan', model: 'NP200', engine: '1.6', fuel: 'PETROL', kw: 64, from: 2008, to: 2021 },
  ] },
  { key: 'navara', short: 'Nissan Navara D23 2.3 dCi (2017+)', cls: 'bakkie', genuine: 'Nissan Genuine Parts', vehicles: [
    { make: 'Nissan', model: 'Navara', generation: 'D23', engine: '2.3 dCi', fuel: 'DIESEL', kw: 140, from: 2017 },
  ] },
  { key: 'dmax', short: 'Isuzu D-Max 3.0 (2021+)', cls: 'bakkie', genuine: 'Isuzu Genuine Parts', vehicles: [
    { make: 'Isuzu', model: 'D-Max', generation: 'RG', engine: '3.0 TD', fuel: 'DIESEL', kw: 140, from: 2021 },
  ] },
  { key: 'kb250', short: 'Isuzu KB 250 D-Teq (2013–2020)', cls: 'bakkie', genuine: 'Isuzu Genuine Parts', vehicles: [
    { make: 'Isuzu', model: 'KB', generation: 'TF', engine: '250 D-Teq', fuel: 'DIESEL', kw: 100, from: 2013, to: 2020 },
  ] },
  { key: 'swift', short: 'Suzuki Swift 1.2 (2018+)', cls: 'small', vehicles: [
    { make: 'Suzuki', model: 'Swift', engine: '1.2', fuel: 'PETROL', kw: 61, from: 2018 },
  ] },
  { key: 'i20', short: 'Hyundai i20 1.4 (2015–2020)', cls: 'small', vehicles: [
    { make: 'Hyundai', model: 'i20', engine: '1.4', fuel: 'PETROL', kw: 74, from: 2015, to: 2020 },
  ] },
  { key: 'grand-i10', short: 'Hyundai Grand i10 1.2 (2014+)', cls: 'small', vehicles: [
    { make: 'Hyundai', model: 'Grand i10', engine: '1.2', fuel: 'PETROL', kw: 64, from: 2014 },
  ] },
  { key: 'kwid', short: 'Renault Kwid 1.0 (2016+)', cls: 'small', vehicles: [
    { make: 'Renault', model: 'Kwid', engine: '1.0', fuel: 'PETROL', kw: 50, from: 2016 },
  ] },
  { key: 'picanto', short: 'Kia Picanto 1.0 (2017+)', cls: 'small', vehicles: [
    { make: 'Kia', model: 'Picanto', engine: '1.0', fuel: 'PETROL', kw: 49, from: 2017 },
  ] },
  { key: 'jolion', short: 'Haval Jolion 1.5T (2021+)', cls: 'medium', vehicles: [
    { make: 'Haval', model: 'Jolion', engine: '1.5T', fuel: 'PETROL', kw: 105, from: 2021 },
  ] },
  { key: 'bmw-f30', short: 'BMW 320i F30 (2012–2019)', cls: 'premium', vehicles: [
    { make: 'BMW', model: '3 Series', generation: 'F30', engine: '320i', fuel: 'PETROL', kw: 135, from: 2012, to: 2019 },
  ] },
  { key: 'c-class', short: 'Mercedes-Benz C200 W205 (2014–2021)', cls: 'premium', vehicles: [
    { make: 'Mercedes-Benz', model: 'C-Class', generation: 'W205', engine: 'C200', fuel: 'PETROL', kw: 135, from: 2014, to: 2021 },
  ] },
];

const POPULAR_MAKES = new Set(['Toyota', 'Volkswagen', 'Ford', 'Nissan', 'Isuzu', 'Suzuki', 'Hyundai']);

// ─── Categories ─────────────────────────────────────────────────────────────

const CATEGORIES: { name: string; slug: string; icon: string; description: string; children: [string, string, string][] }[] = [
  { name: 'Brakes', slug: 'brakes', icon: 'Disc', description: 'Pads, discs, calipers and brake fluid', children: [['Brake Pads', 'brake-pads', 'brake-pads'], ['Brake Discs', 'brake-discs', 'brake-disc'], ['Brake Fluid', 'brake-fluid', 'brake-fluid']] },
  { name: 'Filters & Service', slug: 'filters-service', icon: 'Filter', description: 'Everything for a service at home or at your mechanic', children: [['Oil Filters', 'oil-filters', 'oil-filter'], ['Air Filters', 'air-filters', 'air-filter'], ['Fuel Filters', 'fuel-filters', 'fuel-filter'], ['Cabin Filters', 'cabin-filters', 'cabin-filter'], ['Service Kits', 'service-kits', 'service-kit'], ['Spark Plugs', 'spark-plugs', 'spark-plug'], ['Engine Oil', 'engine-oil', 'engine-oil']] },
  { name: 'Engine', slug: 'engine', icon: 'Cog', description: 'Timing kits, water pumps, glow plugs and more', children: [['Timing Kits', 'timing-kits', 'timing-kit'], ['Water Pumps', 'water-pumps', 'water-pump'], ['Glow Plugs', 'glow-plugs', 'glow-plug']] },
  { name: 'Electrical & Batteries', slug: 'electrical', icon: 'BatteryCharging', description: 'Batteries, alternators and starter motors', children: [['Batteries', 'batteries', 'battery'], ['Alternators', 'alternators', 'alternator'], ['Starter Motors', 'starter-motors', 'starter']] },
  { name: 'Suspension & Steering', slug: 'suspension', icon: 'MoveVertical', description: 'Shocks, control arms, links and CV joints', children: [['Shock Absorbers', 'shock-absorbers', 'shock'], ['Control Arms', 'control-arms', 'control-arm'], ['Stabiliser Links', 'stabiliser-links', 'stabiliser-link'], ['CV Joints', 'cv-joints', 'cv-joint']] },
  { name: 'Cooling', slug: 'cooling', icon: 'Thermometer', description: 'Radiators, thermostats and coolant', children: [['Radiators', 'radiators', 'radiator'], ['Thermostats', 'thermostats', 'thermostat'], ['Coolant', 'coolant', 'coolant']] },
  { name: 'Lighting & Body', slug: 'lighting-body', icon: 'Lightbulb', description: 'Headlights, mirrors and wiper blades', children: [['Headlights', 'headlights', 'headlight'], ['Side Mirrors', 'side-mirrors', 'mirror'], ['Wiper Blades', 'wiper-blades', 'wiper']] },
  { name: 'Clutch & Transmission', slug: 'clutch-transmission', icon: 'Settings2', description: 'Clutch kits and drivetrain parts', children: [['Clutch Kits', 'clutch-kits', 'clutch-kit']] },
];

// ─── Brands ─────────────────────────────────────────────────────────────────

const BRANDS: [string, BrandTier, string, number][] = [
  // name, tier, country, price multiplier
  ['Bosch', 'PREMIUM', 'Germany', 1.0], ['Brembo', 'PREMIUM', 'Italy', 1.3], ['Ferodo', 'PREMIUM', 'UK', 0.95], ['TRW', 'PREMIUM', 'Germany', 0.95],
  ['Mann-Filter', 'PREMIUM', 'Germany', 1.0], ['K&N', 'PREMIUM', 'USA', 1.6], ['NGK', 'PREMIUM', 'Japan', 1.0], ['Denso', 'PREMIUM', 'Japan', 1.05],
  ['Gates', 'PREMIUM', 'USA', 1.0], ['Continental', 'PREMIUM', 'Germany', 1.05], ['Febi Bilstein', 'VALUE', 'Germany', 0.85], ['Lemförder', 'PREMIUM', 'Germany', 1.1],
  ['Willard', 'PREMIUM', 'South Africa', 1.0], ['Exide', 'VALUE', 'South Africa', 0.9], ['Valeo', 'PREMIUM', 'France', 0.95], ['Monroe', 'PREMIUM', 'USA', 1.0],
  ['Gabriel', 'VALUE', 'South Africa', 0.85], ['Bilstein', 'PREMIUM', 'Germany', 1.45], ['GKN', 'PREMIUM', 'UK', 1.05], ['Nissens', 'VALUE', 'Denmark', 0.9],
  ['Wahler', 'VALUE', 'Germany', 0.9], ['Hella', 'PREMIUM', 'Germany', 1.1], ['Depo', 'VALUE', 'Taiwan', 0.7], ['LuK', 'PREMIUM', 'Germany', 1.05],
  ['Sachs', 'PREMIUM', 'Germany', 1.0], ['Castrol', 'PREMIUM', 'UK', 1.0], ['Shell', 'PREMIUM', 'Netherlands', 0.95], ['Mobil', 'PREMIUM', 'USA', 1.0],
  ['Toyota Genuine Parts', 'GENUINE', 'Japan', 1.35], ['VW Genuine Parts', 'GENUINE', 'Germany', 1.4], ['Ford Genuine Parts', 'GENUINE', 'USA', 1.35],
  ['Nissan Genuine Parts', 'GENUINE', 'Japan', 1.3], ['Isuzu Genuine Parts', 'GENUINE', 'Japan', 1.3],
];
const BRAND_MULT = Object.fromEntries(BRANDS.map(([n, , , m]) => [n, m]));

// ─── Part templates ─────────────────────────────────────────────────────────

const CLASS_MULT: Record<Cls, number> = { small: 1, medium: 1.25, bakkie: 1.6, premium: 2.1 };
const BATTERY: Record<Cls, string> = { small: '619', medium: '646', bakkie: '652', premium: '668 AGM' };

type Template = {
  sub: string; noun: string; img: string; brands: string[]; genuine?: boolean; base: number;
  fuel?: FuelType[]; only?: string[]; position?: string; used?: boolean; reman?: boolean;
  specs: (f: Family) => Record<string, string>; desc: string;
};

const T: Template[] = [
  { sub: 'brake-pads', noun: 'Front Brake Pad Set', img: 'brake-pads', brands: ['Bosch', 'Ferodo', 'Brembo', 'TRW'], genuine: true, base: 620, position: 'Front',
    specs: () => ({ Axle: 'Front', Contents: '4 pads', 'Wear indicator': 'Included', Compound: pick(['Low-metallic', 'Ceramic', 'Semi-metallic']) }),
    desc: 'Complete front axle pad set engineered for quiet, consistent stopping in South African stop-start traffic and on long gravel roads. Replace pads in axle sets and inspect discs at the same time.' },
  { sub: 'brake-discs', noun: 'Front Brake Disc Pair (Vented)', img: 'brake-disc', brands: ['Brembo', 'Bosch', 'TRW'], base: 1100, position: 'Front',
    specs: () => ({ Axle: 'Front', Contents: '2 discs', Type: 'Vented', Coating: 'Anti-corrosion' }),
    desc: 'Precision-machined vented discs sold as an axle pair. The anti-corrosion coating protects the hub area. Always fit new pads with new discs.' },
  { sub: 'oil-filters', noun: 'Oil Filter', img: 'oil-filter', brands: ['Mann-Filter', 'Bosch'], genuine: true, base: 110,
    specs: () => ({ Type: pick(['Spin-on', 'Cartridge']), 'Service interval': 'Every oil change' }),
    desc: 'High-efficiency oil filter that traps fine particles to protect bearings, turbochargers and cams. Replace at every oil change.' },
  { sub: 'air-filters', noun: 'Air Filter', img: 'air-filter', brands: ['Mann-Filter', 'Bosch', 'K&N'], base: 240,
    specs: () => ({ Type: 'Panel', 'Dust conditions': 'Suitable for gravel roads' }),
    desc: 'Engine air filter with high dust-holding capacity, important for vehicles that see dirt and gravel roads. Check at every service, replace sooner in dusty conditions.' },
  { sub: 'fuel-filters', noun: 'Diesel Fuel Filter', img: 'fuel-filter', brands: ['Mann-Filter', 'Bosch'], genuine: true, base: 360, fuel: ['DIESEL'],
    specs: () => ({ 'Water separator': 'Yes', Fuel: 'Diesel' }),
    desc: 'Diesel fuel filter with water separation to protect common-rail injectors and pumps from contaminated fuel.' },
  { sub: 'cabin-filters', noun: 'Cabin (Pollen) Filter', img: 'cabin-filter', brands: ['Mann-Filter', 'Bosch'], base: 180,
    specs: () => ({ Type: pick(['Particle', 'Activated carbon']) }),
    desc: 'Keeps dust, pollen and odours out of the cabin and helps the aircon work efficiently.' },
  { sub: 'service-kits', noun: 'Major Service Filter Kit', img: 'service-kit', brands: ['Mann-Filter', 'Bosch'], base: 640,
    specs: (f) => ({ Contents: f.vehicles[0].fuel === 'DIESEL' ? 'Oil, air, fuel and cabin filter' : 'Oil, air and cabin filter' }),
    desc: 'Every filter you need for a major service, matched to your vehicle and boxed together.' },
  { sub: 'spark-plugs', noun: 'Spark Plug Set (x4)', img: 'spark-plug', brands: ['NGK', 'Bosch', 'Denso'], base: 300, fuel: ['PETROL', 'HYBRID'],
    specs: () => ({ Contents: '4 plugs', Electrode: pick(['Iridium', 'Platinum', 'Nickel']) }),
    desc: 'Set of spark plugs for reliable starting, smooth idle and good fuel economy.' },
  { sub: 'glow-plugs', noun: 'Glow Plug Set (x4)', img: 'glow-plug', brands: ['Bosch', 'NGK'], base: 920, fuel: ['DIESEL'],
    specs: () => ({ Contents: '4 plugs', Voltage: '12V', Type: 'Fast-heat' }),
    desc: 'Fast-heating glow plugs for easy cold starts on winter mornings in Gauteng and the Free State.' },
  { sub: 'timing-kits', noun: 'Timing Belt Kit', img: 'timing-kit', brands: ['Gates', 'Continental'], base: 1350, only: ['vivo', 'hilux-d4d', 'amarok', 'polo-tsi'],
    specs: () => ({ Contents: 'Belt, tensioner, idler', 'Replace with': 'Water pump recommended' }),
    desc: 'Complete timing belt kit. A failed timing belt can destroy an engine, so replace at the manufacturer interval.' },
  { sub: 'water-pumps', noun: 'Water Pump', img: 'water-pump', brands: ['Gates', 'Febi Bilstein'], base: 820,
    specs: () => ({ Gasket: 'Included', Impeller: pick(['Metal', 'Composite']) }),
    desc: 'Replacement water pump with gasket. Leaks or bearing noise from the pump area are common signs of wear.' },
  { sub: 'batteries', noun: 'Car Battery', img: 'battery', brands: ['Willard', 'Exide'], base: 1350,
    specs: (f) => ({ 'Battery code': BATTERY[f.cls], Voltage: '12V', Type: f.cls === 'premium' ? 'AGM start-stop' : 'Maintenance-free' }),
    desc: 'Maintenance-free battery with strong cold-cranking performance. Bring your old battery back for recycling.' },
  { sub: 'alternators', noun: 'Alternator', img: 'alternator', brands: ['Bosch', 'Valeo'], base: 3800, reman: true, used: true,
    specs: () => ({ Voltage: '14V', Pulley: 'Included' }),
    desc: 'Alternator that keeps your battery charged and electrics running. Warning lights, dim headlights or a flat battery can mean the alternator is failing.' },
  { sub: 'starter-motors', noun: 'Starter Motor', img: 'starter', brands: ['Bosch', 'Valeo'], base: 3100, reman: true, used: true,
    specs: () => ({ Voltage: '12V', Rotation: 'Clockwise' }),
    desc: 'Starter motor. Clicking or slow cranking with a healthy battery usually points to a worn starter.' },
  { sub: 'shock-absorbers', noun: 'Front Shock Absorber Pair', img: 'shock', brands: ['Monroe', 'Gabriel', 'Bilstein'], base: 1300, position: 'Front',
    specs: () => ({ Axle: 'Front', Contents: '2 shocks', Type: pick(['Gas', 'Twin-tube gas', 'Monotube']) }),
    desc: 'Front shock absorbers sold as a pair for balanced handling on tar, gravel and potholes.' },
  { sub: 'control-arms', noun: 'Front Lower Control Arm', img: 'control-arm', brands: ['Lemförder', 'Febi Bilstein'], base: 1200, position: 'Front Left',
    specs: () => ({ Position: 'Front lower left', 'Ball joint': 'Included', Bushes: 'Pressed in' }),
    desc: 'Lower control arm with ball joint and bushes fitted. Clunks over bumps or uneven tyre wear are common signs of worn arms.' },
  { sub: 'stabiliser-links', noun: 'Front Stabiliser Link', img: 'stabiliser-link', brands: ['Febi Bilstein', 'Lemförder'], base: 360, position: 'Front',
    specs: () => ({ Position: 'Front, left or right', Nuts: 'Included' }),
    desc: 'Front anti-roll bar link. A knocking noise over speed bumps is the classic symptom of a worn link.' },
  { sub: 'cv-joints', noun: 'Outer CV Joint Kit', img: 'cv-joint', brands: ['GKN', 'Febi Bilstein'], base: 920,
    specs: () => ({ Position: 'Outer', Contents: 'Joint, boot, grease, clamps' }),
    desc: 'Outer CV joint kit with boot and grease. Clicking when turning sharply means the joint needs replacing.' },
  { sub: 'radiators', noun: 'Radiator', img: 'radiator', brands: ['Denso', 'Nissens'], base: 2300,
    specs: () => ({ Core: 'Aluminium', Tanks: 'Plastic' }),
    desc: 'Direct-fit replacement radiator. Overheating, coolant leaks or a blocked core mean it is time to replace.' },
  { sub: 'thermostats', noun: 'Thermostat with Gasket', img: 'thermostat', brands: ['Gates', 'Wahler'], base: 400,
    specs: () => ({ 'Opening temp': `${pick([82, 88, 92])}°C`, Gasket: 'Included' }),
    desc: 'Thermostat with gasket. A stuck thermostat causes overheating or an engine that never warms up.' },
  { sub: 'headlights', noun: 'Headlight Assembly (Left)', img: 'headlight', brands: ['Hella', 'Depo'], base: 2500, position: 'Left', used: true,
    specs: () => ({ Side: 'Left (passenger side in SA)', Bulbs: 'Not included' }),
    desc: 'Complete headlight assembly. Restores light output and clears a failed roadworthy test caused by cracked or yellowed lenses.' },
  { sub: 'side-mirrors', noun: 'Side Mirror (Right, Electric)', img: 'mirror', brands: ['Depo'], base: 1050, position: 'Right', used: true,
    specs: () => ({ Side: 'Right (driver side in SA)', Adjustment: 'Electric', Finish: 'Primed, ready to paint' }),
    desc: 'Electric side mirror, primed ready for colour matching.' },
  { sub: 'wiper-blades', noun: 'Wiper Blade Set', img: 'wiper', brands: ['Bosch', 'Valeo'], base: 280,
    specs: () => ({ Contents: 'Driver and passenger blades', Type: 'Flat (aerotwin)' }),
    desc: 'Pair of flat wiper blades sized for your windscreen. Replace yearly, the SA sun hardens rubber quickly.' },
  { sub: 'clutch-kits', noun: 'Clutch Kit (3-piece)', img: 'clutch-kit', brands: ['LuK', 'Sachs', 'Valeo'], base: 2500,
    specs: () => ({ Contents: 'Pressure plate, clutch plate, release bearing' }),
    desc: 'Three-piece clutch kit. Slipping, a high biting point or juddering on pull-away are signs of a worn clutch.' },
];

const UNIVERSAL: { title: string; sub: string; brand: string; img: string; price: number; specs: Record<string, string>; desc: string }[] = [
  { title: 'Castrol EDGE 5W-30 Fully Synthetic Engine Oil 5L', sub: 'engine-oil', brand: 'Castrol', img: 'engine-oil', price: 849, specs: { Viscosity: '5W-30', Volume: '5 litres', Type: 'Fully synthetic' }, desc: 'Fully synthetic engine oil for modern petrol and diesel engines. Check your owner\'s manual for the required specification.' },
  { title: 'Shell Helix HX7 10W-40 Engine Oil 5L', sub: 'engine-oil', brand: 'Shell', img: 'engine-oil', price: 579, specs: { Viscosity: '10W-40', Volume: '5 litres', Type: 'Synthetic technology' }, desc: 'Synthetic-technology oil for older petrol and diesel engines.' },
  { title: 'Mobil Delvac MX 15W-40 Diesel Engine Oil 5L', sub: 'engine-oil', brand: 'Mobil', img: 'engine-oil', price: 619, specs: { Viscosity: '15W-40', Volume: '5 litres', Type: 'Mineral, heavy-duty diesel' }, desc: 'Heavy-duty diesel oil, popular for older bakkies and workhorses.' },
  { title: 'Castrol Magnatec 10W-40 Engine Oil 5L', sub: 'engine-oil', brand: 'Castrol', img: 'engine-oil', price: 649, specs: { Viscosity: '10W-40', Volume: '5 litres', Type: 'Part synthetic' }, desc: 'Part synthetic oil with start-up protection.' },
  { title: 'Bosch DOT 4 Brake Fluid 500ml', sub: 'brake-fluid', brand: 'Bosch', img: 'brake-fluid', price: 129, specs: { Standard: 'DOT 4', Volume: '500 ml' }, desc: 'DOT 4 brake fluid. Brake fluid absorbs water over time and should be replaced every two years.' },
  { title: 'Castrol React DOT 4 Brake Fluid 1L', sub: 'brake-fluid', brand: 'Castrol', img: 'brake-fluid', price: 219, specs: { Standard: 'DOT 4', Volume: '1 litre' }, desc: 'High boiling point DOT 4 brake fluid.' },
  { title: 'Castrol Radicool SF Coolant Concentrate 5L', sub: 'coolant', brand: 'Castrol', img: 'coolant', price: 459, specs: { Type: 'OAT long-life', Volume: '5 litres', Mix: '50/50 with water' }, desc: 'Long-life coolant concentrate that protects against overheating and corrosion.' },
  { title: 'Shell Ready-to-Use Coolant 5L', sub: 'coolant', brand: 'Shell', img: 'coolant', price: 329, specs: { Type: 'Pre-mixed', Volume: '5 litres' }, desc: 'Pre-mixed coolant, pour straight into the expansion tank.' },
];

// ─── Sellers ────────────────────────────────────────────────────────────────

const SELLERS: { name: string; type: SellerType; city: string; province: string; about: string; dispatch: number }[] = [
  { name: 'WHATPART Direct', type: 'WHATPART', city: 'Johannesburg', province: 'Gauteng', about: 'Stock held and shipped by WHATPART.', dispatch: 1 },
  { name: 'Germiston Auto Spares', type: 'SPARES_SHOP', city: 'Germiston', province: 'Gauteng', about: 'Family-run spares shop serving the East Rand.', dispatch: 1 },
  { name: 'Cape Parts Hub', type: 'SPARES_SHOP', city: 'Bellville', province: 'Western Cape', about: 'Western Cape spares for passenger cars and bakkies.', dispatch: 1 },
  { name: 'Durban Motor Spares', type: 'SPARES_SHOP', city: 'Pinetown', province: 'KwaZulu-Natal', about: 'KZN parts supplier.', dispatch: 2 },
  { name: 'OEM Direct Importers', type: 'IMPORTER', city: 'Kempton Park', province: 'Gauteng', about: 'Importer of OE-quality parts.', dispatch: 2 },
  { name: 'Bloem Bakkie Spares', type: 'SPARES_SHOP', city: 'Bloemfontein', province: 'Free State', about: 'Bakkie and 4x4 specialists.', dispatch: 2 },
  { name: 'Gqeberha Diesel Centre', type: 'SPARES_SHOP', city: 'Gqeberha', province: 'Eastern Cape', about: 'Diesel engine parts.', dispatch: 2 },
  { name: 'Midrand Salvage & Spares', type: 'SALVAGE_YARD', city: 'Midrand', province: 'Gauteng', about: 'Tested used parts from accident-damaged vehicles.', dispatch: 2 },
];

async function main() {
  const realSellers = await db.seller.count({ where: { isDemo: false } });
  if (realSellers > 0) throw new Error(`Refusing to seed: ${realSellers} real seller(s) exist.`);

  console.log('Clearing demo catalogue…');
  await db.$transaction([
    db.deal.deleteMany(), db.cartItem.deleteMany(), db.offer.deleteMany(), db.fitment.deleteMany(),
    db.productImage.deleteMany(), db.review.deleteMany(), db.wishlistItem.deleteMany(), db.product.deleteMany(),
    db.garageVehicle.deleteMany(), db.vehicle.deleteMany(), db.vehicleModel.deleteMany(), db.make.deleteMany(),
    db.category.deleteMany({ where: { parentId: { not: null } } }), db.category.deleteMany(), db.brand.deleteMany(),
    db.seller.deleteMany({ where: { isDemo: true } }),
  ]);

  // Vehicles
  const familyVehicleIds: Record<string, string[]> = {};
  const familyFuel: Record<string, FuelType[]> = {};
  const makeIds: Record<string, string> = {};
  const modelIds: Record<string, string> = {};
  for (const f of FAMILIES) {
    familyVehicleIds[f.key] = [];
    familyFuel[f.key] = [...new Set(f.vehicles.map((v) => v.fuel))];
    for (const v of f.vehicles) {
      makeIds[v.make] ??= (await db.make.create({ data: { name: v.make, slug: slugify(v.make), popular: POPULAR_MAKES.has(v.make) } })).id;
      const mk = `${v.make}|${v.model}`;
      modelIds[mk] ??= (await db.vehicleModel.create({ data: { makeId: makeIds[v.make], name: v.model, slug: slugify(v.model) } })).id;
      const veh = await db.vehicle.create({
        data: { modelId: modelIds[mk], generation: v.generation, engine: v.engine, engineCode: v.engineCode, fuel: v.fuel, powerKw: v.kw, yearFrom: v.from, yearTo: v.to },
      });
      familyVehicleIds[f.key].push(veh.id);
    }
  }
  console.log(`Vehicles: ${Object.values(familyVehicleIds).flat().length}`);

  // Categories
  const catIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const parent = await db.category.create({ data: { name: c.name, slug: c.slug, icon: c.icon, description: c.description, sortOrder: i } });
    for (const [j, [name, slug, img]] of c.children.entries()) {
      catIds[slug] = (await db.category.create({ data: { name, slug, parentId: parent.id, sortOrder: j, image: `/parts/${img}.svg` } })).id;
    }
  }

  // Brands
  const brandIds: Record<string, string> = {};
  for (const [name, tier, country] of BRANDS) {
    brandIds[name] = (await db.brand.create({ data: { name, slug: slugify(name), tier, country } })).id;
  }

  // Sellers
  const sellers: Seller[] = [];
  for (const s of SELLERS) {
    sellers.push(await db.seller.create({
      data: { name: s.name, slug: slugify(s.name), type: s.type, city: s.city, province: s.province, about: s.about, verified: true, status: 'ACTIVE', isDemo: true },
    }));
  }
  const newSellers = sellers.filter((s) => s.type !== 'SALVAGE_YARD');
  const salvage = sellers.find((s) => s.type === 'SALVAGE_YARD')!;
  const dispatchOf = (id: string) => SELLERS[sellers.findIndex((s) => s.id === id)].dispatch;

  // Products
  type Row = { product: Prisma.ProductCreateManyInput & { id: string }; image: string; vehicles: string[]; position?: string; offers: { sellerId: string; condition: Condition; priceCents: number; compareAtCents?: number; stock: number; warrantyMonths: number; dispatchDays: number }[] };
  const rows: Row[] = [];
  const seenSlugs = new Set<string>();
  let seq = 1000;

  const addRow = (title: string, sub: string, brand: string, img: string, priceCents: number, specs: Record<string, string>, desc: string, vehicles: string[], opts: { universal?: boolean; position?: string; used?: boolean; reman?: boolean }) => {
    seq += 1;
    let slug = slugify(title);
    if (seenSlugs.has(slug)) slug = `${slug}-${seq}`;
    seenSlugs.add(slug);
    const id = `prd_${seq}`;
    const offers: Row['offers'] = [];
    const isGenuine = brand.includes('Genuine');
    const offerSellers = shuffle(newSellers).slice(0, 1 + Math.floor(rand() * 3));
    for (const [i, s] of offerSellers.entries()) {
      const p = i === 0 ? priceCents : toPrice((priceCents / 100) * (1 + 0.03 + rand() * 0.1));
      offers.push({
        sellerId: s.id, condition: isGenuine ? 'NEW_GENUINE' : 'NEW_AFTERMARKET', priceCents: p,
        compareAtCents: rand() < 0.25 ? toPrice((p / 100) * (1.15 + rand() * 0.15)) : undefined,
        stock: rand() < 0.08 ? 0 : 2 + Math.floor(rand() * 40), warrantyMonths: isGenuine ? 12 : pick([6, 12, 12, 24]), dispatchDays: dispatchOf(s.id),
      });
    }
    if (opts.reman && rand() < 0.6) {
      offers.push({ sellerId: pick(newSellers).id, condition: 'REMANUFACTURED', priceCents: toPrice((priceCents / 100) * 0.62), stock: 1 + Math.floor(rand() * 6), warrantyMonths: 12, dispatchDays: 2 });
    }
    if (opts.used && rand() < 0.6) {
      offers.push({ sellerId: salvage.id, condition: 'USED', priceCents: toPrice((priceCents / 100) * 0.45), stock: 1, warrantyMonths: 3, dispatchDays: 2 });
    }
    rows.push({
      product: {
        id, slug, title, description: desc, categoryId: catIds[sub], brandId: brandIds[brand],
        partNumber: `WP-${sub.slice(0, 3).toUpperCase()}-${seq}`, oemNumbers: [], specs, universal: !!opts.universal,
      },
      image: img, vehicles, position: opts.position, offers,
    });
  };

  for (const t of T) {
    for (const f of FAMILIES) {
      if (t.only && !t.only.includes(f.key)) continue;
      if (t.fuel && !familyFuel[f.key].some((fu) => t.fuel!.includes(fu))) continue;
      const vehicles = t.fuel
        ? familyVehicleIds[f.key].filter((_, i) => t.fuel!.includes(f.vehicles[i].fuel))
        : familyVehicleIds[f.key];
      let brands = t.brands.filter((b) => b !== 'Bilstein' || f.cls === 'bakkie');
      brands = shuffle(brands).slice(0, Math.min(2, brands.length));
      if (t.genuine && f.genuine) brands.push(f.genuine);
      for (const brand of brands) {
        const price = toPrice(t.base * CLASS_MULT[f.cls] * BRAND_MULT[brand] * (0.9 + rand() * 0.2));
        const title = `${brand} ${t.noun} – ${f.short}`;
        addRow(title, t.sub, brand, t.img, price, { Brand: brand, ...t.specs(f) }, t.desc, vehicles, { position: t.position, used: t.used, reman: t.reman });
      }
    }
  }
  for (const u of UNIVERSAL) {
    addRow(u.title, u.sub, u.brand, u.img, toPrice(u.price), { Brand: u.brand, ...u.specs }, u.desc, [], { universal: true });
  }

  console.log(`Creating ${rows.length} products…`);
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    await db.product.createMany({ data: chunk.map((r) => r.product) });
    await db.productImage.createMany({
      data: chunk.map((r) => ({ productId: r.product.id, url: `/parts/${r.image}.svg`, alt: r.product.title as string, sortOrder: 0 })),
    });
    await db.fitment.createMany({
      data: chunk.flatMap((r) => r.vehicles.map((vehicleId) => ({ productId: r.product.id, vehicleId, position: r.position ?? null }))),
    });
    await db.offer.createMany({ data: chunk.flatMap((r) => r.offers.map((o) => ({ productId: r.product.id, ...o }))) });
  }

  // Deals: a rotating set of discounted offers
  const dealOffers = shuffle(await db.offer.findMany({ where: { stock: { gt: 0 }, condition: { in: ['NEW_AFTERMARKET', 'NEW_GENUINE'] } }, select: { id: true, priceCents: true } })).slice(0, 16);
  const now = Date.now();
  await db.deal.createMany({
    data: dealOffers.map((o) => ({ offerId: o.id, label: 'Daily Deal', priceCents: toPrice((o.priceCents / 100) * 0.8), startsAt: new Date(now - 86400000), endsAt: new Date(now + 7 * 86400000) })),
  });

  const counts = { products: await db.product.count(), offers: await db.offer.count(), fitments: await db.fitment.count(), deals: await db.deal.count() };
  console.log('Seeded', counts);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
