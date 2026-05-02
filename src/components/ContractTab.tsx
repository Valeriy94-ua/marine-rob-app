import { useState } from 'react';
import { Save, CheckCircle, Trash2 } from 'lucide-react';
import type { ContractData, SalaryData } from '../types';
import type { FinishedContract } from '../localStore';

export default function ContractTab({ contract, salary, history, onSave, onSaveSalary, onFinish, onDeleteHistory }: {
  contract: ContractData;
  salary: SalaryData;
  history: FinishedContract[];
  onSave: (d: ContractData) => void;
  onSaveSalary: (d: SalaryData) => void;
  onFinish: (d: ContractData) => void;
  onDeleteHistory: (id: string) => void;
}) {
  const [vessel, setVessel] = useState(contract.vesselName);
  const [rank, setRank] = useState(contract.rank);
  const [start, setStart] = useState(contract.startDate);
  const [total, setTotal] = useState(String(contract.totalDays || ''));
const [salaryVal, setSalaryVal] = useState(String(salary.monthlySalary || ''));  const [currency, setCurrency] = useState(salary.currency || 'USD');

  const daysPassed = start ? Math.floor((Date.now() - new Date(start).getTime()) / 86400000) : 0;
  const totalN = parseInt(total) || 0;
  const daysLeft = Math.max(0, totalN - daysPassed);
  const pct = totalN > 0 ? Math.min(100, (daysPassed / totalN) * 100) : 0;
  const monthlySal = parseFloat(salaryVal) || 0;
  const earned = totalN > 0 && monthlySal > 0 ? (monthlySal / 30) * daysPassed : 0;

  const save = () => {
    onSave({ vesselName: vessel, rank, startDate: start, totalDays: totalN, daysPassed });
    onSaveSalary({ monthlySalary: monthlySal, currency, contractDays: totalN, daysPassed });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="th-card border rounded-2xl p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Contract Info</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Vessel Name</label>
            <input className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="MV Example" value={vessel} onChange={e => setVessel(e.target.value)} />
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Rank</label>
            <input className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="Chief Engineer" value={rank} onChange={e => setRank(e.target.value)} />
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Sign-on Date</label>
            <input type="date" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Contract Days</label>
            <input type="number" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="180" value={total} onChange={e => setTotal(e.target.value)} />
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly Salary</label>
            <input type="number" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="5000" value={salaryVal} onChange={e => setSalaryVal(e.target.value)} />
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Currency</label>
            <select className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </div>
        </div>
        <button onClick={save} className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white rounded-xl py-2.5 text-sm font-semibold">
          <Save size={15} /> Save
        </button>
      </div>

      {start && totalN > 0 && (
        <div className="th-card border rounded-2xl p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Progress</h2>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-sky-400">{daysPassed}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Days done</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{daysLeft}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Days left</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{earned.toFixed(0)}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Earned {currency}</p>
            </div>
          </div>
          <button onClick={() => onFinish({ vesselName: vessel, rank, startDate: start, totalDays: totalN, daysPassed })}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold">
            <CheckCircle size={15} /> Finish Contract
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>History</h2>
          {history.map(h => (
            <div key={h.id} className="th-card border rounded-xl px-4 py-3 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{h.vesselName} — {h.rank}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.startDate} · {h.totalDays} days · finished {h.finishedAt}</p>
              </div>
              <button onClick={() => onDeleteHistory(h.id)} className="text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}