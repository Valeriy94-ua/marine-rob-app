export type FuelCategory = 'HFO' | 'VLSFO' | 'MDO' | 'LUBE' | 'SLUDGE';

export interface Tank {
  id: string;
  name: string;
  category: FuelCategory;
  volumeM3: number;
  density: number;
  massT: number;
}

export interface BunkerEntry {
  id: string;
  date: string;
  category: FuelCategory;
  port: string;
  quantityT: number;
  density: number;
  note: string;
}

export interface ConsumptionEntry {
  id: string;
  date: string;
  category: FuelCategory;
  previousROB: number;
  currentROB: number;
  consumed: number;
}

export interface ContractData {
  totalDays: number;
  daysPassed: number;
  startDate: string;
  vesselName: string;
  rank: string;
}

export interface SalaryData {
  monthlySalary: number;
  currency: string;
  contractDays: number;
  daysPassed: number;
}

export interface SFOCEntry {
  id: string;
  date: string;
  meLoad: number;
  aeLoad: number;
  speed: number;
  hours: number;
  sfoc: number;
  meConsumption: number;
  totalConsumption: number;
}

export const FUEL_LABELS: Record<FuelCategory, string> = {
  HFO: 'HFO',
  VLSFO: 'VLSFO',
  MDO: 'MDO',
  LUBE: 'Lube Oils',
  SLUDGE: 'Sludge',
};

export const FUEL_COLORS: Record<FuelCategory, string> = {
  HFO: 'bg-orange-600',
  VLSFO: 'bg-amber-500',
  MDO: 'bg-teal-600',
  LUBE: 'bg-emerald-600',
  SLUDGE: 'bg-stone-600',
};

export const FUEL_BORDER: Record<FuelCategory, string> = {
  HFO: 'border-orange-500',
  VLSFO: 'border-amber-400',
  MDO: 'border-teal-500',
  LUBE: 'border-emerald-500',
  SLUDGE: 'border-stone-500',
};

export const DEFAULT_DENSITY: Record<FuelCategory, number> = {
  HFO: 0.991,
  VLSFO: 0.900,
  MDO: 0.875,
  LUBE: 0.900,
  SLUDGE: 1.000,
};



