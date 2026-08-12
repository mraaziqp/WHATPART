/**
 * WHATPART Marketplace — Catalog Seed Data
 * 
 * These are demo/seed catalog entries used for UI rendering.
 * In production, this data will be fetched from the Prisma/PostgreSQL
 * database via API routes or server components.
 * 
 * TODO: Replace static imports with API calls to /api/products, /api/vehicles, etc.
 */

export interface VehicleMake {
  id: string;
  name: string;
  logo: string;
}

export interface VehicleModel {
  id: string;
  makeId: string;
  name: string;
  years: number[];
  engines: string[];
}

export interface Product {
  id: string;
  title: string;
  oemNumber: string;
  category: string;
  subcategory: string;
  priceZAR: number;
  originalPriceZAR?: number;
  condition: 'New (OEM)' | 'New (Aftermarket)' | 'Refurbished' | 'Used (Grade A Scrap)';
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  sellerName: string;
  sellerLocation: string;
  sellerVerified: boolean;
  compatibleVehicles: string[];
  imageUrl: string;
  partSpecs: { [key: string]: string };
  expressDelivery: boolean;
  warranty: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  count: number;
  description: string;
  popularParts: string[];
}

export const VEHICLE_MAKES: VehicleMake[] = [
  { id: 'toyota', name: 'Toyota', logo: '🚗' },
  { id: 'vw', name: 'Volkswagen', logo: '🏎️' },
  { id: 'ford', name: 'Ford', logo: '🚙' },
  { id: 'bmw', name: 'BMW', logo: '⚡' },
  { id: 'mb', name: 'Mercedes-Benz', logo: '✨' },
  { id: 'nissan', name: 'Nissan', logo: '🚘' },
  { id: 'isuzu', name: 'Isuzu', logo: '🚚' },
  { id: 'hyundai', name: 'Hyundai', logo: '🚙' },
  { id: 'mazda', name: 'Mazda', logo: '🏎️' },
  { id: 'audi', name: 'Audi', logo: '⚡' },
];

export const VEHICLE_MODELS: VehicleModel[] = [
  {
    id: 'hilux',
    makeId: 'toyota',
    name: 'Hilux',
    years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2008, 2005],
    engines: ['2.8 GD-6 4x4 (150kW)', '2.4 GD-6 RB (110kW)', '4.0 V6 Legend (175kW)', '2.0 VVTi (102kW)', '3.0 D-4D 4x4 (120kW)'],
  },
  {
    id: 'fortuner',
    makeId: 'toyota',
    name: 'Fortuner',
    years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
    engines: ['2.8 GD-6 VX 4x4', '2.4 GD-6 RB Auto', '4.0 V6 4x4 Auto', '3.0 D-4D 4x4'],
  },
  {
    id: 'polo_vivo',
    makeId: 'vw',
    name: 'Polo Vivo',
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010],
    engines: ['1.4 Trendline (55kW)', '1.6 Comfortline (77kW)', '1.0 TSI GT (81kW)', '1.4 Hatch (63kW)'],
  },
  {
    id: 'golf',
    makeId: 'vw',
    name: 'Golf VII / VIII',
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2013],
    engines: ['2.0 TSI GTI (180kW)', '1.4 TSI Comfortline (110kW)', '2.0 TSI R 4Motion (228kW)', '2.0 TDI Highline (110kW)'],
  },
  {
    id: 'ranger',
    makeId: 'ford',
    name: 'Ranger',
    years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2012],
    engines: ['2.0 Bi-Turbo Wildtrak 4x4', '3.0 V6 EcoBoost Raptor', '3.2 TDCi XLT 4x4', '2.2 TDCi XL (118kW)'],
  },
  {
    id: 'bmw_3series',
    makeId: 'bmw',
    name: '3 Series (F30 / G20)',
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2012],
    engines: ['320i 2.0L Turbo (135kW)', '330i M Sport (190kW)', '320d Steptronic (140kW)', 'M340i xDrive (285kW)'],
  },
  {
    id: 'isuzu_dmax',
    makeId: 'isuzu',
    name: 'D-Max / KB Series',
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2013],
    engines: ['3.0 DDI V-Cross 4x4', '1.9 DDI LS High Ride', '300 LX 3.0 TD 4x4', '250 HO Fleetside'],
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'brakes',
    name: 'Braking Systems',
    iconName: 'Disc',
    count: 4850,
    description: 'Brake pads, rotors, calipers, ABS sensors & wear indicators',
    popularParts: ['Front Brake Pads', 'Vented Brake Discs', 'Brake Caliper Assembly', 'ABS Wheel Speed Sensor'],
  },
  {
    id: 'engine',
    name: 'Engine & Drivetrain',
    iconName: 'Cpu',
    count: 12400,
    description: 'Turbos, timing belt kits, water pumps, alternators & injectors',
    popularParts: ['Garrett Turbocharger', 'Complete Timing Belt Kit', 'High-Output Alternator', 'Common Rail Fuel Injectors'],
  },
  {
    id: 'suspension',
    name: 'Suspension & Steering',
    iconName: 'Layers',
    count: 3890,
    description: 'Shock absorbers, control arms, sway bar links & tie rods',
    popularParts: ['Heavy Duty Gas Shocks', 'Front Lower Control Arm', 'Power Steering Rack', 'Stabilizer Bar Links'],
  },
  {
    id: 'lighting',
    name: 'Headlights & Electrical',
    iconName: 'Zap',
    count: 6120,
    description: 'LED headlights, tail lamps, starters, batteries & relays',
    popularParts: ['LED Projector Headlight Assembly', 'Tail Light Lens', 'Starter Motor 12V', 'Automotive Battery 652'],
  },
  {
    id: 'cooling',
    name: 'Cooling & Heating',
    iconName: 'Thermometer',
    count: 2750,
    description: 'Radiators, intercoolers, thermostats & AC compressors',
    popularParts: ['Aluminum Core Radiator', 'Thermostat Housing Kit', 'AC Compressor Unit', 'Turbo Intercooler Assembly'],
  },
  {
    id: 'body',
    name: 'Body Panels & Mirrors',
    iconName: 'Shield',
    count: 8300,
    description: 'Bumpers, bonnets, side mirrors, fenders & grilles',
    popularParts: ['Front Bumper Cover', 'Power Folding Side Mirror', 'Steel Bonnet Assembly', 'Radiator Grille Chrome'],
  },
  {
    id: 'filters',
    name: 'Service Kits & Filters',
    iconName: 'Filter',
    count: 15400,
    description: 'Oil, air, fuel & cabin filter service bundles',
    popularParts: ['Major Service Filter Kit', 'High Flow Air Filter', 'Spin-On Oil Filter', 'Diesel Fuel Filter'],
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Brembo Ceramic Front Brake Pad Set (Heavy Duty)',
    oemNumber: 'OEM-04465-0K280',
    category: 'brakes',
    subcategory: 'Brake Pads',
    priceZAR: 1299,
    originalPriceZAR: 1550,
    condition: 'New (OEM)',
    rating: 4.9,
    reviewsCount: 128,
    inStock: true,
    stockCount: 14,
    sellerName: 'Germiston Auto Spares',
    sellerLocation: 'Germiston, Gauteng',
    sellerVerified: true,
    compatibleVehicles: ['Toyota Hilux 2.8 GD-6 (2016-2025)', 'Toyota Fortuner 2.8 GD-6 (2016-2025)'],
    imageUrl: 'https://images.unsplash.com/photo-1600706432520-7069cbd56733?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Material': 'Low-Metallic Ceramic', 'Axle': 'Front', 'Warranty': '24 Months / 40,000km' },
    expressDelivery: true,
    warranty: '2 Year Guarantee',
  },
  {
    id: 'prod-2',
    title: 'Garrett GT2056V Turbocharger Unit Complete',
    oemNumber: 'OEM-17201-11080',
    category: 'engine',
    subcategory: 'Turbos',
    priceZAR: 8950,
    originalPriceZAR: 11200,
    condition: 'New (OEM)',
    rating: 4.9,
    reviewsCount: 42,
    inStock: true,
    stockCount: 5,
    sellerName: 'Durban Turbo Specialists',
    sellerLocation: 'Pinetown, KZN',
    sellerVerified: true,
    compatibleVehicles: ['Toyota Hilux 2.8 GD-6 4x4 (2016-2024)', 'Toyota Land Cruiser Prado 2.8D'],
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Actuator': 'Electronic Wastegate', 'Cooling': 'Oil & Water Cooled', 'Boost Pressure': '1.8 Bar Max' },
    expressDelivery: true,
    warranty: '1 Year OEM Warranty',
  },
  {
    id: 'prod-3',
    title: 'Monroe Reflex Heavy Duty Front Shock Absorbers (Pair)',
    oemNumber: 'OEM-48510-0K550',
    category: 'suspension',
    subcategory: 'Shocks',
    priceZAR: 2450,
    originalPriceZAR: 2890,
    condition: 'New (Aftermarket)',
    rating: 4.8,
    reviewsCount: 89,
    inStock: true,
    stockCount: 8,
    sellerName: 'Cape Town Suspension Hub',
    sellerLocation: 'Paarden Eiland, Cape Town',
    sellerVerified: true,
    compatibleVehicles: ['Toyota Hilux 2.8 GD-6 4x4', 'Ford Ranger 3.2 TDCi Wildtrak'],
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Type': 'Gas Charged Twin Tube', 'Position': 'Front Left & Right', 'Lift Support': 'Stock Height' },
    expressDelivery: true,
    warranty: '3 Year Extended Warranty',
  },
  {
    id: 'prod-4',
    title: 'OEM LED Projector Headlight Assembly (Right Hand Side)',
    oemNumber: 'OEM-5G1-941-036',
    category: 'lighting',
    subcategory: 'Headlights',
    priceZAR: 4800,
    originalPriceZAR: 6200,
    condition: 'Used (Grade A Scrap)',
    rating: 4.7,
    reviewsCount: 31,
    inStock: true,
    stockCount: 2,
    sellerName: 'Pretoria Bumper & Light Scrap Yard',
    sellerLocation: 'Pretoria West, Gauteng',
    sellerVerified: true,
    compatibleVehicles: ['Volkswagen Golf 7.5 TSI / GTI (2017-2021)'],
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Condition Details': 'Grade A tested, clean lens, no broken brackets', 'Side': 'Right (Driver)', 'Bulbs': 'Included' },
    expressDelivery: false,
    warranty: '90 Day Yard Warranty',
  },
  {
    id: 'prod-5',
    title: 'Bosch High-Output 12V 140A Alternator Assembly',
    oemNumber: 'OEM-03L-903-023',
    category: 'engine',
    subcategory: 'Electrical',
    priceZAR: 3200,
    originalPriceZAR: 3750,
    condition: 'Refurbished',
    rating: 4.8,
    reviewsCount: 64,
    inStock: true,
    stockCount: 7,
    sellerName: 'Midrand Auto Electrical',
    sellerLocation: 'Midrand, Johannesburg',
    sellerVerified: true,
    compatibleVehicles: ['VW Polo Vivo 1.4 / 1.6', 'VW Polo 6R / 6C 1.2 TSI', 'Audi A3 1.4 TSI'],
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Amperage': '140 Amp', 'Voltage': '12V', 'Pulley Type': 'Freewheel 6-Rib' },
    expressDelivery: true,
    warranty: '1 Year Reman Guarantee',
  },
  {
    id: 'prod-6',
    title: 'Nissens Aluminum Core Radiator Assembly (Tropical Spec)',
    oemNumber: 'OEM-16400-0L360',
    category: 'cooling',
    subcategory: 'Radiators',
    priceZAR: 1850,
    originalPriceZAR: 2200,
    condition: 'New (Aftermarket)',
    rating: 4.9,
    reviewsCount: 53,
    inStock: true,
    stockCount: 11,
    sellerName: 'Radiator King SA',
    sellerLocation: 'Stikland, Bellville',
    sellerVerified: true,
    compatibleVehicles: ['Toyota Hilux 2.5 D-4D / 3.0 D-4D (2005-2015)', 'Toyota Fortuner 3.0 D-4D'],
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Core Thickness': '36mm HD Dual Row', 'Transmission': 'Manual & Auto Compatible', 'Material': 'Plastic/Aluminum' },
    expressDelivery: true,
    warranty: '2 Year Replacement Guarantee',
  },
  {
    id: 'prod-7',
    title: 'Sachs Dual Mass Flywheel & Heavy Duty Clutch Kit',
    oemNumber: 'OEM-03L-105-266',
    category: 'engine',
    subcategory: 'Clutch',
    priceZAR: 7650,
    originalPriceZAR: 8900,
    condition: 'New (OEM)',
    rating: 5.0,
    reviewsCount: 29,
    inStock: true,
    stockCount: 4,
    sellerName: 'Germiston Auto Spares',
    sellerLocation: 'Germiston, Gauteng',
    sellerVerified: true,
    compatibleVehicles: ['VW Amarok 2.0 BiTDI 4Motion', 'VW Transporter T5 / T6 2.0 TDI'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Diameter': '240mm', 'Includes': 'Flywheel, Pressure Plate, Clutch Disc, Release Bearing', 'Torque Capacity': '520 Nm' },
    expressDelivery: true,
    warranty: '2 Year Factory Warranty',
  },
  {
    id: 'prod-8',
    title: 'Full Service Filter Bundle (Oil, Air, Diesel Fuel & Cabin)',
    oemNumber: 'OEM-KIT-HILUX-GD6',
    category: 'filters',
    subcategory: 'Filter Kits',
    priceZAR: 890,
    originalPriceZAR: 1100,
    condition: 'New (OEM)',
    rating: 4.9,
    reviewsCount: 310,
    inStock: true,
    stockCount: 50,
    sellerName: 'OEM Direct SA',
    sellerLocation: 'Kempton Park, Gauteng',
    sellerVerified: true,
    compatibleVehicles: ['Toyota Hilux 2.8 GD-6 & 2.4 GD-6 (2016-2025)', 'Toyota Fortuner 2.8 / 2.4 GD-6'],
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    partSpecs: { 'Package Contents': 'Toyota OEM Oil Filter, High Flow Air Element, Water Separating Fuel Filter, Carbon Cabin Filter' },
    expressDelivery: true,
    warranty: '100% Fitment Guarantee',
  },
];

export const RECENT_QUOTES = [
  { id: 'WQ-9841', vehicle: '2019 Ford Ranger 3.2 TDCi', part: 'Transfer Case Motor Assembly', status: '3 Quotes Received', priceFromZAR: 4200, timeAgo: '12 mins ago', location: 'Durban' },
  { id: 'WQ-9840', vehicle: '2017 BMW 320i (F30)', part: 'Electronic Steering Rack Unit', status: '2 Quotes Received', priceFromZAR: 6500, timeAgo: '24 mins ago', location: 'Johannesburg' },
  { id: 'WQ-9839', vehicle: '2015 VW Polo 1.2 TSI', part: 'Complete Cylinder Head with Valves', status: '4 Quotes Received', priceFromZAR: 3800, timeAgo: '45 mins ago', location: 'Cape Town' },
];
