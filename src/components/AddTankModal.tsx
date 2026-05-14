import { useState } from 'react';
import { X, Plus, HelpCircle } from 'lucide-react';
import type { FuelCategory, Tank } from '../types';
import { DEFAULT_DENSITY, FUEL_LABELS, VCF_ALPHA, calcVCF, calcMassWithTemp } from '../types';
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
  const [temp, setTemp] = useState('30');
  const [showHelp, setShowHelp] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const volumeNum = parseFloat(vol) || 0;
  const densityNum = parseFloat(den) || DEFAULT_DENSITY[category];
  const tempNum = parseFloat(temp) || 30;
  const vcf = calcVCF(category, tempNum);
  const mass = calcMassWithTemp(volumeNum, densityNum, category, tempNum);
  const massRaw = volumeNum * densityNum;

  const submit = () => {
    if (!name.trim() || !vol) return;
    onAdd({
      name: name.trim(),
      category,
      volumeM3: volumeNum,
      density: densityNum,
      temperature: tempNum,
      customLabel: category === 'CUSTOM' ? customLabel.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-600 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="font-bold text-white">Add {FUEL_LABELS[category]} Tank</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>

        {/* Help modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl border p-5 max-w-sm w-full space-y-3" style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}>
                  <HelpCircle size={15}/> Temperature Correction (VCF)
                </h4>
                <button onClick={() => setShowHelp(false)} style={{color:'var(--text-muted)'}}><X size={18}/></button>
              </div>

              <div className="rounded-xl p-3 text-xs space-y-1" style={{background:'var(--bg-input)', color:'var(--text-secondary)'}}>
                <p className="font-bold" style={{color:'var(--text-primary)'}}>Formula (ASTM D1250):</p>
                <p className="font-mono text-sky-400">VCF = 1 - (α × (T - 15))</p>
                <p className="font-mono text-sky-400">Mass = Volume × VCF × Density</p>
              </div>

              <div className="text-xs space-y-1.5" style={{color:'var(--text-secondary)'}}>
                <p><span className="font-semibold" style={{color:'var(--text-primary)'}}>T</span> — measured fuel temperature (°C)</p>
                <p><span className="font-semibold" style={{color:'var(--text-primary)'}}>15°C</span> — standard reference temperature</p>
                <p><span className="font-semibold" style={{color:'var(--text-primary)'}}>α</span> — thermal expansion coefficient:</p>
              </div>

              <div className="rounded-xl p-3 text-xs" style={{background:'var(--bg-input)'}}>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(VCF_ALPHA).map(([cat, alpha]) => (
                    <div key={cat} className="flex justify-between">
                      <span style={{color:'var(--text-muted)'}}>{cat}:</span>
                      <span style={{color:'var(--text-primary)'}}>{alpha}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-3 text-xs" style={{background:'var(--bg-input)'}}>
                <p className="font-semibold mb-1" style={{color:'var(--text-primary)'}}>Example:</p>
                <p style={{color:'var(--text-muted)'}}>HFO, 500 m³, 50°C, 0.991 t/m³</p>
                <p style={{color:'#34d399'}}>VCF = 1 - (0.00060 × 35) = 0.979</p>
                <p style={{color:'#34d399'}}>Mass = 500 × 0.979 × 0.991 = <strong>485.1 MT</strong></p>
              </div>

              <button onClick={() => setShowHelp(false)}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
                Got it!
              </button>
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">

          {/* Custom label */}
          {category === 'CUSTOM' && (
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Fuel Type Name</label>
              <input
                placeholder="e.g. LNG, Methanol..."
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:border-sky-500 focus:outline-none"
                value={customLabel} onChange={e => setCustomLabel(e.target.value)}
              />
            </div>
          )}

          {/* Tank name */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Tank Name</label>
            <input
              placeholder="e.g. HFO PORT"
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:border-sky-500 focus:outline-none"
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Volume + Density */}
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

          {/* Temperature + help */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400">Temperature (°C)</label>
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                <HelpCircle size={13}/> VCF correction
              </button>
            </div>
            <input
              type="number" step="1" min="-10" max="100"
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:border-sky-500 focus:outline-none"
              value={temp} onChange={e => setTemp(e.target.value)}
            />
          </div>

          {/* VCF info */}
          <div className="rounded-xl px-4 py-2 flex items-center justify-between" style={{background:'var(--bg-input)'}}>
            <span className="text-xs" style={{color:'var(--text-muted)'}}>VCF @ {tempNum}°C</span>
            <span className="text-sm font-semibold text-sky-400">{vcf.toFixed(4)}</span>
          </div>

          {/* Calculated mass */}
          <div className="bg-slate-700 rounded-xl px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Mass (corrected)</span>
              <span className="font-bold text-emerald-400 text-lg">{fmt(mass, 2)} MT</span>
            </div>
            {Math.abs(mass - massRaw) > 0.01 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Without correction</span>
                <span className="text-xs text-slate-500">{fmt(massRaw, 2)} MT</span>
              </div>
            )}
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
