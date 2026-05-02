import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ConsumptionEntry, Tank, FuelCategory } from '../types';
import { FUEL_LABELS } from '../types';

const CATS: FuelCategory[] = ['HFO', 'VLSFO', 'MDO', 'LUBE', 'SLUDGE'];

export default function ConsumptionTab({ entries, tanks, onAdd, onDelete }: {
  entries: ConsumptionEntry[];
  tanks: Tank[];
  onAdd: (e: Omit<ConsumptionEntry, 'id' | 'consumed'>) => void;
  onDelete: (id: string) => void;
}) {
  const [show, setShow] = useState(false);
  const [cat, setCat] = useState<FuelCategory>('HFO');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [prev, setPrev] = useState('');
  const [curr, setCurr] = useState('');

  const consumed = (parseFloat(prev) || 0) - (parseFloat(curr) || 0);

  const submit = () => {
    if (!prev || !curr) return;
    onAdd({ category: cat, date, previousROB: parseFloat(prev), currentROB: parseFloat(curr) });
    setPrev(''); setCurr(''); setShow(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Consumption Log</h2>
        <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 bg-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={15} /> Log Entry
        </button>
      </div>

      {show && (
        <div className="th-card border rounded-2xl p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-3 gap-2">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="py-2 rounded-xl text-xs font-medium border"
                style={{ background: cat === c ? '#0ea5e9' : 'var(--bg-input)', color: cat === c ? '#fff' : 'var(--text-muted)', borderColor: 'var(--border)' }}>
                {FUEL_LABELS[c]}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Date</label>
            <input type="date" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Previous ROB (MT)</label>
              <input type="number" step="0.1" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="0.0" value={prev} onChange={e => setPrev(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Current ROB (MT)</label>
              <input type="number" step="0.1" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="0.0" value={curr} onChange={e => setCurr(e.target.value)} />
            </div>
          </div>
          {prev && curr && (
            <p className="text-sm font-semibold" style={{ color: consumed >= 0 ? '#34d399' : '#f87171' }}>
              Consumed: {consumed.toFixed(3)} MT
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 bg-sky-600 text-white rounded-xl py-2.5 text-sm font-semibold">Save</button>
            <button onClick={() => setShow(false)} className="px-4 rounded-xl text-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No entries yet</p>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.id} className="th-card border rounded-xl px-4 py-3 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{FUEL_LABELS[e.category]} — {e.consumed.toFixed(3)} MT</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.date} · {e.previousROB} → {e.currentROB} MT</p>
              </div>
              <button onClick={() => onDelete(e.id)} className="text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}