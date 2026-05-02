import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { Tank, FuelCategory } from '../types';
import { FUEL_LABELS, DEFAULT_DENSITY } from '../types';

const CATS: FuelCategory[] = ['HFO', 'VLSFO', 'MDO', 'LUBE', 'SLUDGE'];
const fmt = (n: number) => n.toFixed(3);

function TankRow({ tank, onUpdate, onDelete }: { tank: Tank; onUpdate: (t: Tank) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [vol, setVol] = useState(String(tank.volumeM3));
  const [den, setDen] = useState(String(tank.density));

  const save = () => {
    onUpdate({ ...tank, volumeM3: parseFloat(vol) || 0, density: parseFloat(den) || tank.density });
    setEditing(false);
  };

  return (
    <div className="th-card border rounded-xl p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{tank.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{FUEL_LABELS[tank.category]}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-sky-400">{fmt(tank.massT)} MT</span>
          <button onClick={() => setEditing(!editing)} style={{ color: 'var(--text-muted)' }}><Pencil size={14} /></button>
          <button onClick={() => onDelete(tank.id)} className="text-red-400"><Trash2 size={14} /></button>
        </div>
      </div>
      {editing && (
        <div className="grid grid-cols-2 gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Volume m³</label>
            <input type="number" className="th-input w-full rounded-lg px-2 py-1.5 text-sm border mt-1" value={vol} onChange={e => setVol(e.target.value)} />
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Density t/m³</label>
            <input type="number" step="0.001" className="th-input w-full rounded-lg px-2 py-1.5 text-sm border mt-1" value={den} onChange={e => setDen(e.target.value)} />
          </div>
          <div className="col-span-2 flex gap-2">
            <button onClick={save} className="flex items-center gap-1 bg-sky-600 text-white rounded-lg px-3 py-1.5 text-xs"><Check size={12} /> Save</button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}><X size={12} /> Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TanksTab({ tanks, onAdd, onUpdate, onDelete }: {
  tanks: Tank[];
  onAdd: (t: Omit<Tank, 'id' | 'massT'>) => void;
  onUpdate: (t: Tank) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [cat, setCat] = useState<FuelCategory>('HFO');
  const [vol, setVol] = useState('');
  const [den, setDen] = useState('');

  const submit = () => {
    if (!name.trim() || !vol) return;
    onAdd({ name: name.trim(), category: cat, volumeM3: parseFloat(vol), density: parseFloat(den) || DEFAULT_DENSITY[cat] });
    setName(''); setVol(''); setDen(''); setShowForm(false);
  };

  const totalROB = tanks.reduce((s, t) => s + t.massT, 0);

  return (
    <div className="p-4 space-y-4">
      <div className="th-card border rounded-2xl p-4 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total ROB</p>
          <p className="text-2xl font-bold text-sky-400">{totalROB.toFixed(3)} MT</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={15} /> Add Tank
        </button>
      </div>

      {showForm && (
        <div className="th-card border rounded-2xl p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>New Tank</h3>
          <input className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" placeholder="Tank name (e.g. HFO DB P)" value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            {CATS.map(c => (
              <button key={c} onClick={() => { setCat(c); setDen(String(DEFAULT_DENSITY[c])); }}
                className="py-2 rounded-xl text-xs font-medium border"
                style={{ background: cat === c ? '#0ea5e9' : 'var(--bg-input)', color: cat === c ? '#fff' : 'var(--text-muted)', borderColor: 'var(--border)' }}>
                {FUEL_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Volume (m³)</label>
              <input type="number" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder="100" value={vol} onChange={e => setVol(e.target.value)} />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Density (t/m³)</label>
              <input type="number" step="0.001" className="th-input w-full rounded-xl px-3 py-2 text-sm border mt-1" placeholder={String(DEFAULT_DENSITY[cat])} value={den} onChange={e => setDen(e.target.value)} />
            </div>
          </div>
          {vol && <p className="text-xs text-sky-400">Mass: {(parseFloat(vol) * (parseFloat(den) || DEFAULT_DENSITY[cat])).toFixed(3)} MT</p>}
          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 bg-sky-600 text-white rounded-xl py-2.5 text-sm font-semibold">Add Tank</button>
            <button onClick={() => setShowForm(false)} className="px-4 rounded-xl text-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {tanks.length === 0 ? (
        <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No tanks yet — tap Add Tank</p>
      ) : (
        <div className="space-y-2">
          {tanks.map(t => <TankRow key={t.id} tank={t} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}