import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import type { SalaryData } from '../types';
import type { Locale, TKey } from '../i18n';
import { t } from '../i18n';

interface Props {
  salary: SalaryData;
  contractDaysFromContract: number;
  daysPassedFromContract: number;
  onSave: (d: SalaryData) => void;
  locale: Locale;
}

const CURRENCIES = ['USD','EUR','GBP','NOK','PHP','SGD','AUD','JPY','UAH','RUB'];

export default function SalaryTab({ salary, contractDaysFromContract, daysPassedFromContract, onSave, locale }: Props) {
  const T = (k: TKey) => t(locale, k);
  const [form, setForm] = useState<SalaryData>(() => ({
    monthlySalary: salary.monthlySalary,
    currency: salary.currency||'USD',
    contractDays: salary.contractDays||contractDaysFromContract,
    daysPassed: salary.daysPassed||daysPassedFromContract,
  }));

  useEffect(() => {
    setForm(f => ({
      ...f,
      contractDays: f.contractDays||contractDaysFromContract,
      daysPassed: f.daysPassed||daysPassedFromContract,
    }));
  }, [contractDaysFromContract, daysPassedFromContract]);

  const update = <K extends keyof SalaryData>(k: K, v: SalaryData[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onSave(next);
  };

  const dailyRate = form.monthlySalary>0 ? form.monthlySalary/30 : 0;
  const totalContract = dailyRate * Math.max(form.contractDays,0);
  const alreadyEarned = dailyRate * Math.max(form.daysPassed,0);
  const remaining = Math.max(totalContract-alreadyEarned,0);
  const pct = form.contractDays>0 ? Math.min((form.daysPassed/form.contractDays)*100,100) : 0;
  const fmtN = (n: number) => n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border p-4 text-center" style={{background:'rgba(16,185,129,0.1)',borderColor:'#065f46'}}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{color:'#6ee7b7'}}>{T('earnedSoFar')}</p>
          <p className="text-2xl font-bold" style={{color:'#34d399'}}>{fmtN(alreadyEarned)}</p>
          <p className="text-xs" style={{color:'var(--text-muted)'}}>{form.currency}</p>
        </div>
        <div className="rounded-2xl border p-4 text-center" style={{background:'rgba(14,165,233,0.1)',borderColor:'#0c4a6e'}}>
          <p className="text-xs uppercase tracking-wide mb-1" style={{color:'#7dd3fc'}}>{T('stillToEarn')}</p>
          <p className="text-2xl font-bold" style={{color:'#38bdf8'}}>{fmtN(remaining)}</p>
          <p className="text-xs" style={{color:'var(--text-muted)'}}>{form.currency}</p>
        </div>
      </div>
      <div className="th-card border rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm flex items-center gap-1" style={{color:'var(--text-secondary)'}}><TrendingUp size={13}/> {T('totalEarnings')}</span>
          <span className="font-bold" style={{color:'var(--text-primary)'}}>{fmtN(totalContract)} {form.currency}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{backgroundColor:'var(--border)'}}>
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}} />
        </div>
        <div className="flex justify-between text-xs mt-1" style={{color:'var(--text-muted)'}}>
          <span>Day {form.daysPassed}</span><span>Day {form.contractDays}</span>
        </div>
      </div>
      <div className="th-card border rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><DollarSign size={15}/> {T('monthlySalary')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('monthlySalary')}</label>
            <input type="number" placeholder="3000" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={form.monthlySalary||''} onChange={e=>update('monthlySalary',parseFloat(e.target.value)||0)} /></div>
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('currency')}</label>
            <select className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={form.currency} onChange={e=>update('currency',e.target.value)}>
              {CURRENCIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('contractDays')}</label>
            <input type="number" placeholder="180" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={form.contractDays||''} onChange={e=>update('contractDays',parseInt(e.target.value)||0)} /></div>
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>{T('daysPassed')}</label>
            <input type="number" placeholder="0" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={form.daysPassed||''} onChange={e=>update('daysPassed',parseInt(e.target.value)||0)} /></div>
        </div>
        <div className="rounded-xl px-3 py-2 text-xs flex justify-between" style={{backgroundColor:'var(--bg-input)',color:'var(--text-muted)'}}>
          <span>{T('dailyRate')}</span>
          <span className="font-semibold" style={{color:'var(--text-primary)'}}>{fmtN(dailyRate)} {form.currency}/day</span>
        </div>
        <p className="text-xs" style={{color:'var(--text-muted)'}}>Changes are saved automatically.</p>
      </div>
    </div>
  );
}
