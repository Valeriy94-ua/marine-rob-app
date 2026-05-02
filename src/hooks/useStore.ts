import { useState, useCallback } from 'react';
import type { Tank, BunkerEntry, ConsumptionEntry, FuelCategory, ContractData, SalaryData } from '../types';
import {
  getTanks, saveTank, updateTank as _ut, deleteTank as _dt,
  getBunker, saveBunker, deleteBunker as _db, updateBunker as _ub,
  getConsumption, saveConsumption, deleteConsumption as _dc, updateConsumption as _uc,
  getContract, saveContract as _sc,
  getSalary, saveSalary as _ss,
  getContractHistory, addFinishedContract as _afc, deleteFinishedContract as _dfc,
  isAdFree, setAdFree,
} from '../localStore';
import type { FinishedContract } from '../localStore';

export function useStore() {
  const [tanks, setTanks] = useState<Tank[]>(() => getTanks());
  const [bunkerLog, setBunker] = useState<BunkerEntry[]>(() => getBunker());
  const [consumptionLog, setConsumption] = useState<ConsumptionEntry[]>(() => getConsumption());
  const [contract, setContract] = useState<ContractData>(() => getContract());
  const [contractHistory, setContractHistory] = useState<FinishedContract[]>(() => getContractHistory());
  const [salary, setSalaryState] = useState<SalaryData>(() => getSalary());
  const [adFree, setAdFreeState] = useState<boolean>(() => isAdFree());

  // Tanks
  const addTank = useCallback((tank: Omit<Tank,'id'|'massT'>) => { const t = saveTank(tank); setTanks(p => [...p, t]); }, []);
  const updateTank = useCallback((tank: Tank) => { const u = _ut(tank); setTanks(p => p.map(t => t.id===tank.id ? u : t)); }, []);
  const deleteTank = useCallback((id: string) => { _dt(id); setTanks(p => p.filter(t => t.id!==id)); }, []);

  // Bunker
  const addBunker = useCallback((entry: Omit<BunkerEntry,'id'>) => { const e = saveBunker(entry); setBunker(p => [e,...p]); }, []);
  const delBunker = useCallback((id: string) => { _db(id); setBunker(p => p.filter(e => e.id!==id)); }, []);
  const editBunker = useCallback((entry: BunkerEntry) => { _ub(entry); setBunker(p => p.map(e => e.id===entry.id ? entry : e)); }, []);

  // Consumption
  const addConsumption = useCallback((entry: Omit<ConsumptionEntry,'id'|'consumed'>) => {
    const e = saveConsumption(entry); setConsumption(p => [e,...p]); return e.consumed;
  }, []);
  const delConsumption = useCallback((id: string) => { _dc(id); setConsumption(p => p.filter(e => e.id!==id)); }, []);
  const editConsumption = useCallback((entry: ConsumptionEntry) => { _uc(entry); setConsumption(p => p.map(e => e.id===entry.id ? entry : e)); }, []);

  // Contract
  const saveContract = useCallback((d: ContractData) => { _sc(d); setContract({...d}); }, []);
  const finishContract = useCallback((d: ContractData) => {
    const fc = _afc(d); _sc({ totalDays:0, daysPassed:0, startDate:'', vesselName:'', rank:'' });
    setContract({ totalDays:0, daysPassed:0, startDate:'', vesselName:'', rank:'' });
    setContractHistory(p => [fc,...p]);
  }, []);
  const deleteFinished = useCallback((id: string) => { _dfc(id); setContractHistory(p => p.filter(e => e.id!==id)); }, []);

  // Salary
  const saveSalary = useCallback((d: SalaryData) => { _ss(d); setSalaryState({...d}); }, []);

  const purchaseAdFree = useCallback(() => { setAdFree(true); setAdFreeState(true); }, []);

  const robByCategory = useCallback((cat: FuelCategory) =>
    tanks.filter(t => t.category===cat).reduce((s,t) => s+t.massT, 0), [tanks]);

  return {
    tanks, bunkerLog, consumptionLog, contract, contractHistory, salary, adFree,
    addTank, updateTank, deleteTank,
    addBunker, delBunker, editBunker,
    addConsumption, delConsumption, editConsumption,
    saveContract, finishContract, deleteFinished,
    saveSalary, purchaseAdFree, robByCategory,
  };
}



