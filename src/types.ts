export type FuelCategory = 'HFO' | 'VLSFO' | 'MDO' | 'LUBE' | 'SLUDGE' | 'CUSTOM';

export interface Tank {
  id: string;
  name: string;
  category: FuelCategory;
  volumeM3: number;
  density: number;
  massT: number;
  temperature?: number;
  customLabel?: string;
}

export const VCF_ALPHA: Record<FuelCategory, number> = {
  HFO: 0.00060,
  VLSFO: 0.00065,
  MDO: 0.00085,
  LUBE: 0.00070,
  SLUDGE: 0.00060,
  CUSTOM: 0.00060,
};

export function calcVCF(category: FuelCategory, tempC: number): number {
  const alpha = VCF_ALPHA[category] ?? 0.00060;
  const deltaT = tempC - 15;
  return 1 - alpha * deltaT;
}

export function calcMassWithTemp(volumeM3: number, density: number, category: FuelCategory, tempC: number): number {
  const vcf = calcVCF(category, tempC);
  return volumeM3 * vcf * density;
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
  engineType: 'ME' | 'AE';
  meMCR: number;
  aeMCR: number;
  meLoad: number;
  aeLoad: number;
  speed: number;
  hours: number;
  sfoc: number;
  meConsumption: number;
  aeConsumption: number;
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
  HFO: 'bg-red-800',
  VLSFO: 'bg-yellow-900',
  MDO: 'bg-red-600',
  LUBE: 'bg-yellow-500',
  SLUDGE: 'bg-slate-600',
  CUSTOM: 'bg-violet-600',
};

export const FUEL_BORDER: Record<FuelCategory, string> = {
  HFO: 'border-red-700',
  VLSFO: 'border-yellow-800',
  MDO: 'border-red-500',
  LUBE: 'border-yellow-400',
  SLUDGE: 'border-slate-500',
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
