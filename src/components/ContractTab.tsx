import { useState, useEffect, useRef } from 'react';
import { Flag, Trash2 } from 'lucide-react';
import type { ContractData } from '../types';
import type { FinishedContract } from '../localStore';
import type { Locale, TKey } from '../i18n';
import { t } from '../i18n';
import { today } from '../utils';
import CircularProgress from './CircularProgress';

interface Props {
  contract: ContractData;
  contractHistory: FinishedContract[];
  onSave: (d: ContractData) => void;
  onFinish: (d: ContractData) => void;
  onDeleteHistory: (id: string) => void;
  locale: Locale;
}

function contractMessage(pct: number, locale: Locale): string {
  if (pct>=1) return t(locale,'msg100');
  if (pct>=0.9) return t(locale,'msg90');
  if (pct>=0.75) return t(locale,'msg75');
  if (pct>=0.45) return t(locale,'msg50');
  if (pct>=0.2) return t(locale,'msg25');
  return t(locale,'msg0');
}

export default function ContractTab({ contract, contractHistory, onSave, onFinish, onDeleteHistory, locale }: Props) {
  const [form, setForm] = useState<ContractData>(contract);
  const [now, setNow] = useState(Date.now());
  const autoCalcRef = useRef(false);
  const T = (k: TKey) => t(locale, k);

  useEffect(() => { setForm(contract); }, [contract]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const update = <K extends keyof ContractData>(k: K, v: ContractData[K]) => {
    if (k==='startDate') autoCalcRef.current = true;
    const next = { ...form, [k]: v };
    setForm(next);
    onSave(next);
  };

  useEffect(() => {
    if (!autoCalcRef.current||!form.startDate||!form.totalDays) return;
    const diff = Math.floor((now - new Date(form.startDate).getTime()) / 86_400_000);
    if (diff>=0) { const next={...form,daysPassed:Math.min(diff,form.totalDays)}; setForm(next); onSave(next); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.startDate, now]);

  const total = Math.max(form.totalDays, 1);
  const passed = Math.min(Math.max(form.daysPassed,0), total);
  const remaining = total - passed;
  const pct = passed / total;

  const handleFinish = () => {
    if (!form.vesselName && !form.totalDays) return;
    if (!confirm(`Finish contract on ${form.vesselName || 'this vessel'}?`)) return;
    onFinish(form);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="th-card border rounded-2xl p-6 flex flex-col items-center gap-4">
        <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>{T('contractProgress')}</h3>
        <CircularProgress
          pct={pct} size={200} strokeWidth={16}
          label={String(remaining)} sublabel={T('daysRemaining')}
          caption={form.vesselName ? `${form.vesselName}${form.rank?' · '+form.rank:''}` : undefined}
          message={contractMessage(pct, locale)}
        />
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1" style={{color:'var(--text-muted)'}}>
            <span>{passed} {T('daysPassed')}</span>
            <span>{form.totalDays} {T('contractDays').toLowerCase()}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{backgroundColor:'var(--border)'}}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{width:`${Math.round(pct*100)}%`,backgroundColor:pct<0.5?'#22c55e':pct<0.8?'#f59e0b':'#ef4444'}} />
          </div>
        </div>
      </div>

      <div className="th-card border rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Contract Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('vesselName')}</label>
            <input className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" placeholder="MV Horizon" value={form.vesselName} onChange={e=>update('vesselName',e.target.value)} /></div>
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('rank')}</label>
            <input className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" placeholder="2nd Engineer" value={form.rank} onChange={e=>update('rank',e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('contractDays')}</label>
            <input type="number" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" placeholder="180" value={form.totalDays||''} onChange={e=>update('totalDays',parseInt(e.target.value)||0)} /></div>
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('signOnDate')}</label>
            <input type="date" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={form.startDate} onChange={e=>update('startDate',e.target.value)} max={today()} /></div>
        </div>
        {!form.startDate && (
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('daysPassedManual')}</label>
            <input type="number" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" placeholder="0" value={form.daysPassed||''} onChange={e=>update('daysPassed',parseInt(e.target.value)||0)} /></div>
        )}
        <p className="text-xs" style={{color:'var(--text-muted)'}}>Changes are saved automatically.</p>
        <button onClick={handleFinish} className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl py-3 font-semibold text-sm transition-colors">
          <Flag size={15}/> {T('finishContract')}
        </button>
      </div>

      {contractHistory.length>0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{color:'var(--text-secondary)'}}>{T('contractHistory')}</h3>
          <div className="space-y-2">
            {contractHistory.map(fc => (
              <div key={fc.id} className="th-card border rounded-xl p-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{fc.vesselName||'—'} {fc.rank?`· ${fc.rank}`:''}</p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>{fc.startDate||'?'} → {fc.finishedAt} · {fc.totalDays} days</p>
                </div>
                <button onClick={()=>onDeleteHistory(fc.id)} className="p-1.5 rounded-lg hover:bg-red-700 transition-colors ml-2" style={{color:'var(--text-muted)'}}><Trash2 size={13}/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
