import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BunkerEntry, FuelCategory } from '../types';
import { FUEL_LABELS, DEFAULT_DENSITY } from '../types';

const CATS: FuelCategory[] = ['HFO', 'VLSFO', 'MDO', 'LUBE', 'SLUDGE'];

export default function BunkerTab({ entries, onAdd, onDelete }: {
  entries: BunkerEntry[];
  onAdd: (e: Omit<BunkerEntry, 'id'>) => void;
  onDelete: (id: string) => void;
}) {
  const [show, setShow] = useState(false);
  const [cat, setCat] = useState<FuelCategory>('HFO');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [port, setPort] = useState('');
  const [qty, setQty] = useState('');
  const [den, setDen] = useState('');
  const [note, setNote] = useState('');

  const submit = () => {
    if (!qty) return;
    onAdd({ category: cat, date, port, quantityT: parseFloat(qty), density: parseFloat(den) || DEFAULT_DENSITY[cat], note });
    setQty(''); setPort(''); setNote(''); setShow(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Bunker Log</h2>
        <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 bg-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={15} /> Add Entry
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Date</label>
              <input type="date" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Port</label>
              <input className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="Rotterdam" value={port} onChange={e => setPort(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Quantity (MT)</label>
              <input type="number" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="500" value={qty} onChange={e => setQty(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Density (t/m³)</label>
              <input type="number" step="0.001" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder={String(DEFAULT_DENSITY[cat])} value={den} onChange={e => setDen(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Note</label>
              <input className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="Optional" value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 bg-sky-600 text-white rounded-xl py-2.5 text-sm font-semibold">Save</button>
            <button onClick={() => setShow(false)} className="px-4 rounded-xl text-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No bunker entries yet</p>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.id} className="th-card border rounded-xl px-4 py-3 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{FUEL_LABELS[e.category]} — {e.quantityT} MT</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.date}{e.port ? ` · ${e.port}` : ''}{e.note ? ` · ${e.note}` : ''}</p>
              </div>
              <button onClick={() => onDelete(e.id)} className="text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}