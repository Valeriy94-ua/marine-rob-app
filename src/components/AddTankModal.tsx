import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { FuelCategory, Tank } from '../types';
import { DEFAULT_DENSITY, FUEL_LABELS } from '../types';
import { fmt } from '../utils';

interface Props {
  category: FuelCategory;
  onAdd: (t: Omit<Tank, 'id' | 'massT'>) => void;
  onClose: () => void;
}

export default function AddTankModal({ category, onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [vol, setVol] = useState('');
  const [den, setDen] = useState(String(DEFAULT_DENSITY[category]));

  const mass = (parseFloat(vol) || 0) * (parseFloat(den) || 0);

  const submit = () => {
    if (!name.trim() || !vol) return;
    onAdd({ name: name.trim(), category, volumeM3: parseFloat(vol), density: parseFloat(den) || DEFAULT_DENSITY[category] });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-600 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="font-bold text-white">Add {FUEL_LABELS[category]} Tank</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Tank Name</label>
            <input
              placeholder="e.g. HFO PORT"
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:border-sky-500 focus:outline-none"
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Volume (m³)</label>
              <input
                type="number" placeholder="0.000" step="0.1"
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:border-sky-500 focus:outline-none"
                value={vol} onChange={e => setVol(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Density (t/m³)</label>
              <input
                type="number" placeholder={String(DEFAULT_DENSITY[category])} step="0.001"
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:border-sky-500 focus:outline-none"
                value={den} onChange={e => setDen(e.target.value)}
              />
            </div>
          </div>
          <div className="bg-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">Calculated Mass</span>
            <span className="font-bold text-emerald-400 text-lg">{fmt(mass, 2)} MT</span>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button
            onClick={submit}
            disabled={!name.trim() || !vol}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-xl py-3 font-semibold transition-colors"
          >
            <Plus size={18}/> Add Tank
          </button>
        </div>
      </div>
    </div>
  );
}
