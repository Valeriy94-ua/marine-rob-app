import { useState } from 'react';
import { Calculator, ChevronDown, TrendingDown, Trash2, Pencil, Check, X } from 'lucide-react';
import type { FuelCategory, ConsumptionEntry } from '../types';
import { FUEL_LABELS } from '../types';
import { today, fmtMT, fmt } from '../utils';

interface Props {
  log: ConsumptionEntry[];
  onAdd: (e: Omit<ConsumptionEntry,'id'|'consumed'>) => number;
  onDelete: (id: string) => void;
  onEdit: (e: ConsumptionEntry) => void;
}

const CATS: FuelCategory[] = ['HFO', 'VLSFO', 'MDO', 'LUBE'];

function EditRow({ entry, onSave, onCancel }: { entry: ConsumptionEntry; onSave: (e: ConsumptionEntry) => void; onCancel: () => void }) {
  const [prev, setPrev] = useState(String(entry.previousROB));
  const [curr, setCurr] = useState(String(entry.currentROB));
  const consumed = parseFloat(prev) - parseFloat(curr);
  return (
    <div className="th-card border rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Prev ROB</label>
          <input type="number" className="th-input w-full rounded-lg px-2 py-1.5 text-sm border" value={prev} onChange={e=>setPrev(e.target.value)} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Curr ROB</label>
          <input type="number" className="th-input w-full rounded-lg px-2 py-1.5 text-sm border" value={curr} onChange={e=>setCurr(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({...entry, previousROB:parseFloat(prev), currentROB:parseFloat(curr), consumed})} className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-xs"><Check size={12}/> Save</button>
        <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg py-1.5 text-xs"><X size={12}/> Cancel</button>
      </div>
    </div>
  );
}

export default function ConsumptionTab({ log, onAdd, onDelete, onEdit }: Props) {
  const [cat, setCat] = useState<FuelCategory>('HFO');
  const [date, setDate] = useState(today());
  const [prev, setPrev] = useState('');
  const [curr, setCurr] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const consumed = prev && curr ? parseFloat(prev) - parseFloat(curr) : null;

  const save = () => {
    if (!prev || !curr) return;
    setSaving(true);
    const c = onAdd({ date, category: cat, previousROB: parseFloat(prev), currentROB: parseFloat(curr) });
    setResult(c); setPrev(''); setCurr('');
    setSaving(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="th-card border rounded-2xl overflow-hidden">
        <div className="p-4 border-b" style={{borderColor:'var(--border)'}}>
          <h3 className="font-semibold flex items-center gap-2" style={{color:'var(--text-primary)'}}><Calculator size={16}/> Daily Consumption</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Date</label>
              <input type="date" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Fuel Type</label>
              <div className="relative">
                <select className="th-input w-full appearance-none rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none" value={cat} onChange={e=>setCat(e.target.value as FuelCategory)}>
                  {CATS.map(c=><option key={c} value={c}>{FUEL_LABELS[c]}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none" style={{color:'var(--text-muted)'}} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Previous ROB (MT)</label>
              <input type="number" placeholder="0.00" step="0.01" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none" value={prev} onChange={e=>setPrev(e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Current ROB (MT)</label>
              <input type="number" placeholder="0.00" step="0.01" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none" value={curr} onChange={e=>setCurr(e.target.value)} />
            </div>
          </div>
          {consumed !== null && (
            <div className={`rounded-xl p-3 text-center border ${consumed<0?'border-red-700':'border-emerald-700'}`} style={{background:consumed<0?'rgba(185,28,28,0.15)':'rgba(5,150,105,0.15)'}}>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>Consumption</p>
              <p className="text-2xl font-bold" style={{color:consumed<0?'#f87171':'#34d399'}}>{fmt(consumed,2)} MT</p>
            </div>
          )}
          <button onClick={save} disabled={!prev||!curr||saving} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl py-3 font-semibold transition-colors text-sm">
            {saving?'Saving…':'Save Entry'}
          </button>
          {result!==null && <p className="text-center text-xs text-emerald-400">✓ Saved — {fmtMT(result)}</p>}
        </div>
      </div>
      {log.length>0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{color:'var(--text-secondary)'}}><TrendingDown size={14}/> Recent Log</h3>
          <div className="space-y-2">
            {log.slice(0,30).map(e => editingId===e.id ? (
              <EditRow key={e.id} entry={e} onSave={u=>{onEdit(u);setEditingId(null);}} onCancel={()=>setEditingId(null)} />
            ) : (
              <div key={e.id} className="th-card border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{FUEL_LABELS[e.category]}</p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>{e.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{fmt(e.consumed,2)} MT</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>ROB {fmt(e.currentROB,1)}</p>
                  </div>
                  <button onClick={()=>setEditingId(e.id)} className="p-1.5 rounded-lg hover:bg-sky-600 transition-colors" style={{color:'var(--text-muted)'}}><Pencil size={13}/></button>
                  <button onClick={()=>onDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-700 transition-colors" style={{color:'var(--text-muted)'}}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
