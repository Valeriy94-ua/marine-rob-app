import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Tank } from '../types';
import { fmt, fmtMT } from '../utils';

interface Props {
  tank: Tank;
  onUpdate: (t: Tank) => void;
  onDelete: (id: string) => void;
}

export default function TankCard({ tank, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tank.name);
  const [vol, setVol] = useState(String(tank.volumeM3));
  const [den, setDen] = useState(String(tank.density));

  const save = () => {
    onUpdate({ ...tank, name, volumeM3: parseFloat(vol) || 0, density: parseFloat(den) || 0 });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-slate-700 rounded-xl p-4 border border-slate-500">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="col-span-3">
            <label className="text-xs text-slate-400 mb-1 block">Tank Name</label>
            <input className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 text-sm" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Volume (m³)</label>
            <input type="number" className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 text-sm" value={vol} onChange={e => setVol(e.target.value)} step="0.1" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Density (t/m³)</label>
            <input type="number" className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 text-sm" value={den} onChange={e => setDen(e.target.value)} step="0.001" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Mass (MT)</label>
            <div className="bg-slate-500 text-emerald-300 rounded-lg px-3 py-2 text-sm font-mono">{fmt((parseFloat(vol)||0)*(parseFloat(den)||0),2)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-sm transition-colors"><Check size={14}/> Save</button>
          <button onClick={() => setEditing(false)} className="flex-1 flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg py-2 text-sm transition-colors"><X size={14}/> Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-white text-sm">{tank.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{fmt(tank.volumeM3)} m³ × {fmt(tank.density)} t/m³</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-emerald-400 text-lg">{fmtMT(tank.massT)}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-600 hover:bg-slate-500 rounded-lg px-3 py-1.5 transition-colors"><Pencil size={12}/> Edit</button>
        <button onClick={() => onDelete(tank.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-white hover:bg-red-700 bg-slate-600 rounded-lg px-3 py-1.5 transition-colors"><Trash2 size={12}/> Delete</button>
      </div>
    </div>
  );
}
