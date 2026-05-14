// All data stored in localStorage — per-device, no sync.
import type { Tank, BunkerEntry, ConsumptionEntry, ContractData, SalaryData } from './types';
import { calcMassWithTemp } from './types';
 
const KEY = {
  tanks: 'mrob_tanks', bunker: 'mrob_bunker', consumption: 'mrob_consumption',
  contract: 'mrob_contract', contractHistory: 'mrob_contract_history',
  salary: 'mrob_salary', adFree: 'mrob_ad_free',
};
 
function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : fallback; } catch { return fallback; }
}
function save(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)); }
export function uid(): string { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
 
// Tanks
export function getTanks(): Tank[] { return load(KEY.tanks, []); }
export function saveTank(tank: Omit<Tank,'id'|'massT'>): Tank {
  const temp = tank.temperature ?? 15;
  const massT = calcMassWithTemp(tank.volumeM3, tank.density, tank.category, temp);
  const t: Tank = { ...tank, id: uid(), massT };
  save(KEY.tanks, [...getTanks(), t]); return t;
}
export function updateTank(tank: Tank): Tank {
  const temp = tank.temperature ?? 15;
  const massT = calcMassWithTemp(tank.volumeM3, tank.density, tank.category, temp);
  const u = { ...tank, massT };
  save(KEY.tanks, getTanks().map(t => t.id === tank.id ? u : t)); return u;
}
export function deleteTank(id: string) { save(KEY.tanks, getTanks().filter(t => t.id !== id)); }
 
// Bunker
export function getBunker(): BunkerEntry[] { return load(KEY.bunker, []); }
export function saveBunker(entry: Omit<BunkerEntry,'id'>): BunkerEntry {
  const e: BunkerEntry = { ...entry, id: uid() };
  save(KEY.bunker, [e, ...getBunker()]); return e;
}
export function deleteBunker(id: string) { save(KEY.bunker, getBunker().filter(e => e.id !== id)); }
export function updateBunker(entry: BunkerEntry) { save(KEY.bunker, getBunker().map(e => e.id === entry.id ? entry : e)); }
 
// Consumption
export function getConsumption(): ConsumptionEntry[] { return load(KEY.consumption, []); }
export function saveConsumption(entry: Omit<ConsumptionEntry,'id'|'consumed'>): ConsumptionEntry {
  const consumed = entry.previousROB - entry.currentROB;
  const e: ConsumptionEntry = { ...entry, id: uid(), consumed };
  save(KEY.consumption, [e, ...getConsumption()]); return e;
}
export function deleteConsumption(id: string) { save(KEY.consumption, getConsumption().filter(e => e.id !== id)); }
export function updateConsumption(entry: ConsumptionEntry) { save(KEY.consumption, getConsumption().map(e => e.id === entry.id ? entry : e)); }
 
// Contract (active)
export function getContract(): ContractData { return load(KEY.contract, { totalDays:0, daysPassed:0, startDate:'', vesselName:'', rank:'' }); }
export function saveContract(d: ContractData) { save(KEY.contract, d); }
 
// Contract history (finished contracts)
export interface FinishedContract extends ContractData { id: string; finishedAt: string; }
export function getContractHistory(): FinishedContract[] { return load(KEY.contractHistory, []); }
export function addFinishedContract(d: ContractData): FinishedContract {
  const e: FinishedContract = { ...d, id: uid(), finishedAt: new Date().toISOString().slice(0,10) };
  save(KEY.contractHistory, [e, ...getContractHistory()]); return e;
}
export function deleteFinishedContract(id: string) { save(KEY.contractHistory, getContractHistory().filter(e => e.id !== id)); }
 
// Salary
export function getSalary(): SalaryData { return load(KEY.salary, { monthlySalary:0, currency:'USD', contractDays:0, daysPassed:0 }); }
export function saveSalary(d: SalaryData) { save(KEY.salary, d); }
 
// Ad-free
export function isAdFree(): boolean { return load(KEY.adFree, false); }
export function setAdFree(v: boolean) { save(KEY.adFree, v); }


// import type { Tank, BunkerEntry, ConsumptionEntry, ContractData, SalaryData } from './types';

// const KEY = {
//   tanks: 'mrob_tanks', bunker: 'mrob_bunker', consumption: 'mrob_consumption',
//   contract: 'mrob_contract', contractHistory: 'mrob_contract_history',
//   salary: 'mrob_salary', adFree: 'mrob_ad_free',
// };

// function load<T>(key: string, fallback: T): T {
//   try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : fallback; } catch { return fallback; }
// }
// function save(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)); }
// export function uid(): string { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// // Tanks
// export function getTanks(): Tank[] { return load(KEY.tanks, []); }
// export function saveTank(tank: Omit<Tank,'id'|'massT'>): Tank {
//   const t: Tank = { ...tank, id: uid(), massT: tank.volumeM3 * tank.density };
//   save(KEY.tanks, [...getTanks(), t]); return t;
// }
// export function updateTank(tank: Tank): Tank {
//   const u = { ...tank, massT: tank.volumeM3 * tank.density };
//   save(KEY.tanks, getTanks().map(t => t.id === tank.id ? u : t)); return u;
// }
// export function deleteTank(id: string) { save(KEY.tanks, getTanks().filter(t => t.id !== id)); }

// // Bunker
// export function getBunker(): BunkerEntry[] { return load(KEY.bunker, []); }
// export function saveBunker(entry: Omit<BunkerEntry,'id'>): BunkerEntry {
//   const e: BunkerEntry = { ...entry, id: uid() };
//   save(KEY.bunker, [e, ...getBunker()]); return e;
// }
// export function deleteBunker(id: string) { save(KEY.bunker, getBunker().filter(e => e.id !== id)); }
// export function updateBunker(entry: BunkerEntry) { save(KEY.bunker, getBunker().map(e => e.id === entry.id ? entry : e)); }

// // Consumption
// export function getConsumption(): ConsumptionEntry[] { return load(KEY.consumption, []); }
// export function saveConsumption(entry: Omit<ConsumptionEntry,'id'|'consumed'>): ConsumptionEntry {
//   const consumed = entry.previousROB - entry.currentROB;
//   const e: ConsumptionEntry = { ...entry, id: uid(), consumed };
//   save(KEY.consumption, [e, ...getConsumption()]); return e;
// }
// export function deleteConsumption(id: string) { save(KEY.consumption, getConsumption().filter(e => e.id !== id)); }
// export function updateConsumption(entry: ConsumptionEntry) { save(KEY.consumption, getConsumption().map(e => e.id === entry.id ? entry : e)); }

// // Contract (active)
// export function getContract(): ContractData { return load(KEY.contract, { totalDays:0, daysPassed:0, startDate:'', vesselName:'', rank:'' }); }
// export function saveContract(d: ContractData) { save(KEY.contract, d); }

// // Contract history (finished contracts)
// export interface FinishedContract extends ContractData { id: string; finishedAt: string; }
// export function getContractHistory(): FinishedContract[] { return load(KEY.contractHistory, []); }
// export function addFinishedContract(d: ContractData): FinishedContract {
//   const e: FinishedContract = { ...d, id: uid(), finishedAt: new Date().toISOString().slice(0,10) };
//   save(KEY.contractHistory, [e, ...getContractHistory()]); return e;
// }
// export function deleteFinishedContract(id: string) { save(KEY.contractHistory, getContractHistory().filter(e => e.id !== id)); }

// // Salary
// export function getSalary(): SalaryData { return load(KEY.salary, { monthlySalary:0, currency:'USD', contractDays:0, daysPassed:0 }); }
// export function saveSalary(d: SalaryData) { save(KEY.salary, d); }

// // Ad-free
// export function isAdFree(): boolean { return load(KEY.adFree, false); }
// export function setAdFree(v: boolean) { save(KEY.adFree, v); }



