import { useState } from 'react';
import { Package, ChevronDown, Anchor, Trash2, Pencil, Check, X } from 'lucide-react';
import type { FuelCategory, BunkerEntry } from '../types';
import { FUEL_LABELS, DEFAULT_DENSITY } from '../types';
import { today, fmt } from '../utils';

interface Props {
  log: BunkerEntry[];
  onAdd: (e: Omit<BunkerEntry,'id'>) => void;
  onDelete: (id: string) => void;
  onEdit: (e: BunkerEntry) => void;
}

const CATS: FuelCategory[] = ['HFO', 'VLSFO', 'MDO', 'LUBE'];

function EditRow({ entry, onSave, onCancel }: { entry: BunkerEntry; onSave: (e: BunkerEntry) => void; onCancel: () => void }) {
  const [port, setPort] = useState(entry.port);
  const [qty, setQty] = useState(String(entry.quantityT));
  const [den, setDen] = useState(String(entry.density));
  const [note, setNote] = useState(entry.note);
  return (
    <div className="th-card border rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Port</label>
          <input className="th-input w-full rounded-lg px-2 py-1.5 text-sm border" value={port} onChange={e=>setPort(e.target.value)} /></div>
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Qty (MT)</label>
          <input type="number" className="th-input w-full rounded-lg px-2 py-1.5 text-sm border" value={qty} onChange={e=>setQty(e.target.value)} /></div>
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Density</label>
          <input type="number" step="0.001" className="th-input w-full rounded-lg px-2 py-1.5 text-sm border" value={den} onChange={e=>setDen(e.target.value)} /></div>
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Note</label>
          <input className="th-input w-full rounded-lg px-2 py-1.5 text-sm border" value={note} onChange={e=>setNote(e.target.value)} /></div>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>onSave({...entry,port,quantityT:parseFloat(qty),density:parseFloat(den),note})} className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-xs"><Check size={12}/> Save</button>
        <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg py-1.5 text-xs"><X size={12}/> Cancel</button>
      </div>
    </div>
  );
}

export default function BunkerTab({ log, onAdd, onDelete, onEdit }: Props) {
  const [cat, setCat] = useState<FuelCategory>('HFO');
  const [date, setDate] = useState(today());
  const [port, setPort] = useState('');
  const [qty, setQty] = useState('');
  const [den, setDen] = useState(String(DEFAULT_DENSITY['HFO']));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);

  const submit = () => {
    if (!qty||!port) return;
    setSaving(true);
    onAdd({date,category:cat,port,quantityT:parseFloat(qty),density:parseFloat(den)||DEFAULT_DENSITY[cat],note});
    setQty(''); setPort(''); setNote('');
    setSaved(true); setTimeout(()=>setSaved(false),3000); setSaving(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="th-card border rounded-2xl overflow-hidden">
        <div className="p-4 border-b" style={{borderColor:'var(--border)'}}>
          <h3 className="font-semibold flex items-center gap-2" style={{color:'var(--text-primary)'}}><Anchor size={16}/> Bunker Log Entry</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Date</label>
              <input type="date" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={date} onChange={e=>setDate(e.target.value)} /></div>
            <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Fuel Type</label>
              <div className="relative">
                <select className="th-input w-full appearance-none rounded-xl px-3 py-2.5 text-sm border" value={cat} onChange={e=>{setCat(e.target.value as FuelCategory);setDen(String(DEFAULT_DENSITY[e.target.value as FuelCategory]))}}>
                  {CATS.map(c=><option key={c} value={c}>{FUEL_LABELS[c]}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none" style={{color:'var(--text-muted)'}} />
              </div>
            </div>
          </div>
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Port</label>
            <input placeholder="e.g. Rotterdam" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={port} onChange={e=>setPort(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Quantity (MT)</label>
              <input type="number" placeholder="0.00" step="0.01" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={qty} onChange={e=>setQty(e.target.value)} /></div>
            <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Density (t/m³)</label>
              <input type="number" step="0.001" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={den} onChange={e=>setDen(e.target.value)} /></div>
          </div>
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Note (optional)</label>
            <input placeholder="BDN no., remarks…" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={note} onChange={e=>setNote(e.target.value)} /></div>
          <button onClick={submit} disabled={!qty||!port||saving} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl py-3 font-semibold transition-colors text-sm">
            {saving?'Saving…':'Log Bunker'}
          </button>
          {saved&&<p className="text-center text-xs text-emerald-400">✓ Bunker entry saved</p>}
        </div>
      </div>
      {log.length>0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{color:'var(--text-secondary)'}}><Package size={14}/> Bunker History</h3>
          <div className="space-y-2">
            {log.slice(0,30).map(e => editingId===e.id ? (
              <EditRow key={e.id} entry={e} onSave={u=>{onEdit(u);setEditingId(null);}} onCancel={()=>setEditingId(null)} />
            ) : (
              <div key={e.id} className="th-card border rounded-xl p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{FUEL_LABELS[e.category]} — {e.port}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{e.date}{e.note?` · ${e.note}`:''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-right mr-1">
                      <p className="text-sm font-bold text-sky-400">{fmt(e.quantityT,2)} MT</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>ρ {fmt(e.density,3)}</p>
                    </div>
                    <button onClick={()=>setEditingId(e.id)} className="p-1.5 rounded-lg hover:bg-sky-600 transition-colors" style={{color:'var(--text-muted)'}}><Pencil size={13}/></button>
                    <button onClick={()=>onDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-700 transition-colors" style={{color:'var(--text-muted)'}}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
