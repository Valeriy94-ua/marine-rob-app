import { useState } from 'react';
import { Share2 } from 'lucide-react';
import type { FuelCategory, SFOCEntry } from '../types';
import { FUEL_LABELS } from '../types';
import type { Locale, TKey } from '../i18n';
import { t } from '../i18n';
import { fmtMT } from '../utils';
import SFOCCalculator from './SFOCCalculator';

interface Props {
  robByCategory: (cat: FuelCategory) => number;
  avgConsumption: number;
  onAvgConsumptionChange: (v: number) => void;
  locale: Locale;
  sfocEntries: SFOCEntry[];
  onSaveSFOC: (entry: SFOCEntry) => void;
  onDeleteSFOC: (id: string) => void;
}

const FUEL_CATS: FuelCategory[] = ['HFO', 'VLSFO', 'MDO'];

const FUEL_HEX: Record<string, string> = {
  HFO: '#991b1b',
  VLSFO: '#713f12',
  MDO: '#dc2626',
  LUBE: '#ca8a04',
  SLUDGE: '#64748b',
};

export default function SummaryTab({ robByCategory, avgConsumption, onAvgConsumptionChange, locale, sfocEntries, onSaveSFOC, onDeleteSFOC }: Props) {
  const T = (k: TKey) => t(locale, k);
  const [localAvg, setLocalAvg] = useState<string>(avgConsumption>0 ? String(avgConsumption) : '');

  const robs = FUEL_CATS.map(c => ({ cat: c, rob: robByCategory(c) }));
  const maxROB = Math.max(...robs.map(r=>r.rob), 1);
  const totalROB = robs.reduce((s,r)=>s+r.rob, 0);
  const avg = parseFloat(localAvg)||0;
  const enduranceDays = avg>0 ? Math.floor(totalROB/avg) : null;

  const shareApp = async () => {
    const text = 'Marine ROB Calculator — fuel & oil tracker for seafarers';
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title:'Marine ROB', text, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); alert('App link copied!'); }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="th-card border rounded-2xl p-4">
        <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>{T('totalROB')}</h3>
        <div className="space-y-3">
          {robs.map(({cat,rob}) => (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{color:'var(--text-secondary)'}}>{FUEL_LABELS[cat]}</span>
                <span className="font-bold" style={{color:'var(--text-primary)'}}>{fmtMT(rob)}</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{backgroundColor:'var(--border)'}}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{width:`${(rob/maxROB)*100}%`,backgroundColor:FUEL_HEX[cat]}} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 flex justify-between" style={{borderTop:'1px solid var(--border)'}}>
          <span className="text-sm" style={{color:'var(--text-secondary)'}}>{T('totalROB')}</span>
          <span className="font-bold text-lg" style={{color:'var(--text-primary)'}}>{fmtMT(totalROB)}</span>
        </div>
      </div>

      <div className="th-card border rounded-2xl p-4">
        <h3 className="font-semibold mb-3 text-sm" style={{color:'var(--text-primary)'}}>{T('fuelEndurance')}</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('avgConsumption')}</label>
            <input
              type="number" placeholder="45" step="0.1" min="0"
              className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none"
              value={localAvg}
              onChange={e => {
                setLocalAvg(e.target.value);
                onAvgConsumptionChange(parseFloat(e.target.value)||0);
              }}
            />
          </div>
          <div className="text-center min-w-[64px]">
            <p className="text-3xl font-bold" style={{color:enduranceDays!==null?'#22c55e':'var(--text-muted)'}}>
              {enduranceDays!==null ? enduranceDays : '—'}
            </p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{T('enduranceDays')}</p>
          </div>
        </div>
      </div>

      <SFOCCalculator
        onSaveEntry={onSaveSFOC}
        entries={sfocEntries}
        onDeleteEntry={onDeleteSFOC}
      />

      <div className="th-card border rounded-2xl p-4">
        <button onClick={shareApp} className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-3 text-sm font-medium transition-colors">
          <Share2 size={16}/> {T('shareApp')}
        </button>
      </div>
    </div>
  );
}