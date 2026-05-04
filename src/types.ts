export type FuelCategory = 'HFO' | 'VLSFO' | 'MDO' | 'LUBE' | 'SLUDGE'| 'CUSTOM';

export interface Tank {
  id: string;
  name: string;
  category: FuelCategory;
  customLabel?: string; 
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
  CUSTOM: 'Custom',
};

export const FUEL_COLORS: Record<FuelCategory, string> = {
  HFO: 'bg-red-800',        // тёмно-красный
  VLSFO: 'bg-yellow-900',   // тёмно-коричневый
  MDO: 'bg-red-600',        // яркий красный
  LUBE: 'bg-yellow-500',    // жёлтый
  SLUDGE: 'bg-slate-500',   // серый
  CUSTOM: 'bg-violet-600',
};

export const FUEL_BORDER: Record<FuelCategory, string> = {
  HFO: 'border-red-800',
  VLSFO: 'border-yellow-900',
  MDO: 'border-red-500',
  LUBE: 'border-yellow-400',
  SLUDGE: 'border-slate-400',
  CUSTOM: 'border-violet-500',
};

export const DEFAULT_DENSITY: Record<FuelCategory, number> = {
  HFO: 0.991,
  VLSFO: 0.900,
  MDO: 0.875,
  LUBE: 0.900,
  SLUDGE: 1.000,
  CUSTOM: 0.900,
};



