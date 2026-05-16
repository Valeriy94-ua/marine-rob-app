import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Ship, Zap, Flame, HelpCircle, X, Save, TrendingDown, Copy, CheckCheck } from 'lucide-react';
import type { FuelCategory, FuelParams, FlowmeterReading, ConsumptionLogEntry, OperatingMode } from '../types';
import { calcVCF, DEFAULT_DENSITY, FUEL_LABELS, VCF_ALPHA } from '../types';
import { today, fmt } from '../utils';

const FUEL_CATS: FuelCategory[] = ['HFO', 'VLSFO', 'MDO'];
const STORAGE_KEY = 'mrob_consumption_draft';

interface Props {
  log: ConsumptionLogEntry[];
  onAdd: (e: ConsumptionLogEntry) => void;
  onDelete: (id: string) => void;
}

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function litersToMTWithFlag(liters: number, density15: number, category: string, tempC: number, useVCF: boolean): number {
  const vcf = useVCF ? calcVCF(category, tempC) : 1.0;
  return (liters / 1000) * vcf * density15;
}

function theoryMT(loadKw: number, sfoc: string, hours: number): number {
  return ((parseFloat(sfoc) || 0) * loadKw * hours) / 1_000_000;
}

function genAvgKw(kwhBefore: string, kwhAfter: string, runHours: string): number {
  const diff = (parseFloat(kwhAfter) || 0) - (parseFloat(kwhBefore) || 0);
  const h = parseFloat(runHours) || 1;
  return h > 0 ? diff / h : 0;
}

function calcRunHours(prev: string, curr: string): number {
  const p = parseFloat(prev);
  const c = parseFloat(curr);
  if (!isNaN(p) && !isNaN(c) && c > p) return parseFloat((c - p).toFixed(2));
  return 0;
}

// ── VCF Help Modal ──
function VCFHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl border p-5 max-w-sm w-full space-y-3" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm" style={{color:'var(--text-primary)'}}>Temperature correction (VCF)</h4>
          <button onClick={onClose} style={{color:'var(--text-muted)'}}><X size={18}/></button>
        </div>
        <div className="space-y-2 text-xs" style={{color:'var(--text-secondary)'}}>
          <p>VCF (Volume Correction Factor) is the international standard (ASTM D1250 / ISO 91) used in maritime fuel measurement to correct observed volume to the standard reference temperature of 15°C.</p>
          <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
            <p className="font-bold mb-1" style={{color:'var(--text-primary)'}}>Formula:</p>
            <p className="font-mono text-sky-400">VCF = 1 - α × (T - 15°C)</p>
            <p className="font-mono text-sky-400">MT = Litres ÷ 1000 × VCF × ρ₁₅</p>
          </div>
          <p><b style={{color:'var(--text-primary)'}}>Why it matters:</b> Warm fuel expands — 1000 L at 50°C contains less mass than 1000 L at 15°C. Without VCF you overestimate consumption by up to 2–3%.</p>
          <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
            <p className="font-bold mb-1" style={{color:'var(--text-primary)'}}>α coefficients:</p>
            {Object.entries(VCF_ALPHA).filter(([k])=>k!=='CUSTOM'&&k!=='SLUDGE').map(([k,v])=>(
              <div key={k} className="flex justify-between"><span>{k}:</span><span style={{color:'#38bdf8'}}>{v}</span></div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
            <p className="font-bold mb-1" style={{color:'var(--text-primary)'}}>Example (HFO 50°C):</p>
            <p>VCF = 1 - 0.00060×35 = <b style={{color:'#34d399'}}>0.9790</b></p>
            <p>1000 L × 0.979 × 0.991 = <b style={{color:'#34d399'}}>0.971 MT</b></p>
            <p style={{color:'#f59e0b'}}>Without VCF: 1000 L × 0.991 = 0.991 MT (+2%)</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-2.5 text-sm">Got it!</button>
      </div>
    </div>
  );
}

// ── Fuel + VCF row ──
function FuelParamsRow({ value, onChange, useVCF, onUseVCFChange }: {
  value: FuelParams; onChange: (v: FuelParams) => void;
  useVCF: boolean; onUseVCFChange: (v: boolean) => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [tempStr, setTempStr] = useState(String(value.tempC));
  const vcf = calcVCF(value.category, value.tempC);
  return (
    <div className="space-y-2">
      {showHelp && <VCFHelpModal onClose={() => setShowHelp(false)} />}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Fuel type</label>
          <select className="th-input w-full rounded-lg px-2 py-2 text-xs border" value={value.category}
            onChange={e => onChange({...value, category: e.target.value as FuelCategory, density15: DEFAULT_DENSITY[e.target.value as FuelCategory]})}>
            {FUEL_CATS.map(c => <option key={c} value={c}>{FUEL_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Density @15°C</label>
          <input type="number" step="0.001" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
            value={value.density15} onChange={e => onChange({...value, density15: parseFloat(e.target.value)||DEFAULT_DENSITY[value.category]})} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Temp (°C)</label>
          <input type="number" step="1" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
            value={tempStr}
            onChange={e => { setTempStr(e.target.value); if (e.target.value !== '' && e.target.value !== '-') onChange({...value, tempC: parseFloat(e.target.value)||0}); }}
            onBlur={() => { if (tempStr===''||tempStr==='-') { setTempStr('15'); onChange({...value, tempC:15}); } }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{background:'var(--bg-input)'}}>
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`vcf-${value.category}-${value.tempC}`} checked={useVCF} onChange={e => onUseVCFChange(e.target.checked)} />
          <label htmlFor={`vcf-${value.category}-${value.tempC}`} className="text-xs" style={{color:'var(--text-primary)'}}>Apply temperature correction</label>
          <span className="text-xs font-bold" style={{color: useVCF ? '#38bdf8' : 'var(--text-muted)'}}>
            {useVCF ? `(${vcf.toFixed(4)})` : '(off)'}
          </span>
        </div>
        <button onClick={() => setShowHelp(true)} style={{color:'var(--text-muted)'}}><HelpCircle size={14}/></button>
      </div>
    </div>
  );
}

// ── Flowmeter input (no period field) ──
function FlowmeterInput({ fm, manualL, onFmChange, onManualChange }: {
  fm: FlowmeterReading|null; manualL: string;
  onFmChange: (v: FlowmeterReading|null) => void; onManualChange: (v: string) => void;
}) {
  const [mode, setMode] = useState<'flowmeter'|'manual'>(fm ? 'flowmeter' : 'manual');
  const netL = fm ? fm.supply - fm.return_ : parseFloat(manualL)||0;
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => { setMode('flowmeter'); onFmChange({supply:0,return_:0,periodH:0}); onManualChange(''); }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mode==='flowmeter'?'bg-sky-600 text-white border-sky-600':'border-slate-600 text-slate-400'}`}>Flowmeter</button>
        <button onClick={() => { setMode('manual'); onFmChange(null); }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mode==='manual'?'bg-sky-600 text-white border-sky-600':'border-slate-600 text-slate-400'}`}>Manual (L)</button>
      </div>
      {mode==='flowmeter' && fm && (
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Supply (L)</label>
            <input type="number" step="1" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
              value={fm.supply||''} onChange={e => onFmChange({...fm, supply:parseFloat(e.target.value)||0})} /></div>
          <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Return (L)</label>
            <input type="number" step="1" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
              value={fm.return_||''} onChange={e => onFmChange({...fm, return_:parseFloat(e.target.value)||0})} /></div>
          {netL > 0 && <div className="col-span-2 text-xs" style={{color:'var(--text-muted)'}}>Net: <b style={{color:'#34d399'}}>{netL.toLocaleString()} L</b></div>}
        </div>
      )}
      {mode==='manual' && (
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Volume (L)</label>
          <input type="number" step="1" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
            value={manualL} onChange={e => onManualChange(e.target.value)} />
          {netL > 0 && <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>Volume: <b style={{color:'#34d399'}}>{netL.toLocaleString()} L</b></p>}
        </div>
      )}
    </div>
  );
}

// ── Running hours counter ──
function RunHoursCounter({ prevH, currH, manualH, onChange, onManualChange, label }: {
  prevH: string; currH: string; manualH: string;
  onChange: (prev: string, curr: string) => void;
  onManualChange: (v: string) => void;
  label: string;
}) {
  const diff = calcRunHours(prevH, currH);
  const hasCounter = prevH !== '' || currH !== '';
  const effectiveH = diff > 0 ? diff : parseFloat(manualH)||0;

  return (
    <div className="rounded-xl p-3 space-y-2" style={{background:'var(--bg-input)'}}>
      <p className="text-xs font-medium" style={{color:'var(--text-primary)'}}>⏱ {label} counter (hours)</p>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Previous</label>
          <input type="number" step="0.1" placeholder="—" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
            value={prevH} onChange={e => { onChange(e.target.value, currH); if(e.target.value) onManualChange(''); }} /></div>
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Current</label>
          <input type="number" step="0.1" placeholder="—" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
            value={currH} onChange={e => { onChange(prevH, e.target.value); if(e.target.value) onManualChange(''); }} /></div>
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>{hasCounter ? '= Run hours' : 'Run hours'}</label>
          {hasCounter
            ? <input type="number" className="th-input w-full rounded-lg px-2 py-2 text-xs border opacity-60" value={diff||''} readOnly />
            : <input type="number" step="0.5" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
                value={manualH}
                onChange={e => { onManualChange(e.target.value); onChange('',''); }}
              />
          }
        </div>
      </div>
      {effectiveH > 0 && <p className="text-xs" style={{color:'var(--text-muted)'}}>Period: <b style={{color:'#34d399'}}>{effectiveH} h</b></p>}
    </div>
  );
}

// ── kWh counter (for ME and Gen) ──
function KwhCounter({ prev, curr, manualKw, onChange, onManualChange, label }: {
  prev: string; curr: string; manualKw: string;
  onChange: (prev: string, curr: string) => void;
  onManualChange: (v: string) => void;
  label: string;
}) {
  const diff = (parseFloat(curr)||0) - (parseFloat(prev)||0);
  const hasCounter = prev !== '' || curr !== '';
  const effectiveKw = diff > 0 ? diff : parseFloat(manualKw)||0;

  return (
    <div className="rounded-xl p-3 space-y-2" style={{background:'var(--bg-input)'}}>
      <p className="text-xs font-medium" style={{color:'var(--text-primary)'}}>⚡ {label} counter (kW)</p>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Previous</label>
          <input type="number" step="1" placeholder="—" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
            value={prev} onChange={e => { onChange(e.target.value, curr); if(e.target.value) onManualChange(''); }} /></div>
        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Current</label>
          <input type="number" step="1" placeholder="—" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
            value={curr} onChange={e => { onChange(prev, e.target.value); if(e.target.value) onManualChange(''); }} /></div>
        <div>
          <label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>{hasCounter ? '= Load (kW)' : 'Load (kW)'}</label>
          {hasCounter
            ? <input type="number" className="th-input w-full rounded-lg px-2 py-2 text-xs border opacity-60"
                value={diff > 0 ? diff : ''} readOnly />
            : <input type="number" step="1" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
                value={manualKw}
                onChange={e => { onManualChange(e.target.value); onChange('',''); }}
              />
          }
        </div>
      </div>
      {effectiveKw > 0 && <p className="text-xs" style={{color:'var(--text-muted)'}}>Load: <b style={{color:'#38bdf8'}}>{effectiveKw.toFixed(0)} kW</b></p>}
    </div>
  );
}

// ── Collapsible section ──
function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden" style={{borderColor:'var(--border)'}}>
      <button onClick={() => setOpen(o=>!o)}
        className="w-full flex items-center justify-between px-3 py-2.5" style={{background:'var(--bg-input)'}}>
        <span className="flex items-center gap-2 text-xs font-medium" style={{color:'var(--text-primary)'}}>{icon}{title}</span>
        {open ? <ChevronUp size={13} style={{color:'var(--text-muted)'}}/> : <ChevronDown size={13} style={{color:'var(--text-muted)'}}/>}
      </button>
      {open && <div className="p-3 space-y-3" style={{borderTop:'0.5px solid var(--border)'}}>{children}</div>}
    </div>
  );
}

// ── Log entry detail modal ──
function LogEntryModal({ entry, onClose, onDelete }: {
  entry: ConsumptionLogEntry; onClose: () => void; onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const modeEmoji: Record<string,string> = { voyage:'🚢', port:'⚓', maneuvering:'⚙️' };
  const diffPct = entry.totalTheoryMT > 0
    ? ((entry.totalFactMT - entry.totalTheoryMT) / entry.totalTheoryMT * 100).toFixed(2)
    : null;
  const pad = (s: string, n=16) => s.padEnd(n);

  const buildText = () => {
    const lines: string[] = [
      'CONSUMPTION REPORT',
      `Date:    ${entry.date}`,
      `Mode:    ${entry.mode}  |  Period: ${entry.periodH} h`,
      '',
    ];
    if (entry.me.loadKw > 0) {
      lines.push('MAIN ENGINE');
      if (entry.me.mcr) lines.push(`  ${pad('MCR:')}${entry.me.mcr} kW`);
      lines.push(`  ${pad('Load:')}${entry.me.loadKw.toFixed(0)} kW${entry.me.mcr ? ` (${(entry.me.loadKw/entry.me.mcr*100).toFixed(1)}% MCR)` : ''}`);
      if (entry.me.runHours) lines.push(`  ${pad('Run hours:')}${entry.me.runHours} h`);
      lines.push(`  ${pad('SFOC:')}${entry.me.sfoc} g/kWh`);
      if (entry.me.fuel) lines.push(`  ${pad('Fuel:')}${entry.me.fuel.category}  ρ${entry.me.fuel.density15} t/m³  @${entry.me.fuel.tempC}°C  VCF=${entry.me.fuel.vcf.toFixed(4)}${entry.me.fuel.useVCF?'':' (off)'}`);
      if (entry.me.netL) lines.push(`  ${pad('Flowmeter net:')}${entry.me.netL.toLocaleString()} L`);
      lines.push(`  ${pad('Fact:')}${entry.me.factMT.toFixed(3)} MT`);
      lines.push(`  ${pad('Theory:')}${entry.me.theoryMT.toFixed(3)} MT`);
      const d = entry.me.theoryMT>0?((entry.me.factMT-entry.me.theoryMT)/entry.me.theoryMT*100).toFixed(2):null;
      if (d) lines.push(`  ${pad('Deviation:')}${parseFloat(d)>0?'+':''}${d}%`);
      lines.push('');
    }
    if (entry.gen.items && entry.gen.items.length > 0) {
      entry.gen.items.forEach((g, i) => {
        lines.push(`GENERATOR ${i+1}`);
        lines.push(`  ${pad('Avg load:')}${g.loadKw.toFixed(1)} kW`);
        if (g.kwhBefore !== undefined) lines.push(`  ${pad('kWh before:')}${g.kwhBefore}`);
        if (g.kwhAfter !== undefined) lines.push(`  ${pad('kWh after:')}${g.kwhAfter}`);
        if (g.runHours) lines.push(`  ${pad('Run hours:')}${g.runHours} h`);
        lines.push(`  ${pad('SFOC:')}${g.sfoc} g/kWh`);
        if (g.fuel) lines.push(`  ${pad('Fuel:')}${g.fuel.category}  ρ${g.fuel.density15} t/m³  @${g.fuel.tempC}°C  VCF=${g.fuel.vcf.toFixed(4)}${g.fuel.useVCF?'':' (off)'}`);
        if (g.netL) lines.push(`  ${pad('Flowmeter net:')}${g.netL.toLocaleString()} L`);
        lines.push(`  ${pad('Fact:')}${g.factMT.toFixed(3)} MT`);
        lines.push(`  ${pad('Theory:')}${g.theoryMT.toFixed(3)} MT`);
        lines.push('');
      });
    } else if (entry.gen.count > 0) {
      lines.push(`GENERATORS (×${entry.gen.count})`);
      lines.push(`  ${pad('Total load:')}${entry.gen.loadKw.toFixed(1)} kW`);
      lines.push(`  ${pad('Fact:')}${entry.gen.factMT.toFixed(3)} MT`);
      lines.push(`  ${pad('Theory:')}${entry.gen.theoryMT.toFixed(3)} MT`);
      lines.push('');
    }
    if (entry.boiler.factMT > 0) {
      lines.push('BOILER');
      if (entry.boiler.fuel) lines.push(`  ${pad('Fuel:')}${entry.boiler.fuel.category}  ρ${entry.boiler.fuel.density15} t/m³  @${entry.boiler.fuel.tempC}°C`);
      if (entry.boiler.netL) lines.push(`  ${pad('Flowmeter net:')}${entry.boiler.netL.toLocaleString()} L`);
      lines.push(`  ${pad('Fact:')}${entry.boiler.factMT.toFixed(3)} MT`);
      lines.push('');
    }
    lines.push('TOTAL');
    lines.push(`  ${pad('Fact:')}${entry.totalFactMT.toFixed(3)} MT`);
    lines.push(`  ${pad('Theory:')}${entry.totalTheoryMT.toFixed(3)} MT`);
    if (diffPct) lines.push(`  ${pad('Deviation:')}${parseFloat(diffPct)>0?'+':''}${diffPct}%`);
    return lines.join('\n');
  };

  const copyText = () => {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const DRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1.5 border-b" style={{borderColor:'var(--border)'}}>
      <span className="text-xs" style={{color:'var(--text-muted)'}}>{label}</span>
      <span className="text-xs font-medium" style={{color:'var(--text-primary)'}}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-3">
      <div className="rounded-2xl border w-full max-w-sm overflow-hidden" style={{background:'var(--bg-card)',borderColor:'var(--border)',maxHeight:'90vh'}}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--border)'}}>
          <div>
            <p className="font-bold text-sm" style={{color:'var(--text-primary)'}}>{entry.date}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>{modeEmoji[entry.mode]} {entry.mode} · {entry.periodH} h</p>
          </div>
          <button onClick={onClose} style={{color:'var(--text-muted)'}}><X size={20}/></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4" style={{maxHeight:'65vh'}}>
          {entry.me.loadKw > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1" style={{color:'var(--text-secondary)'}}>
                <Ship size={11} style={{color:'#38bdf8'}}/>Main Engine
              </p>
              <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
                {entry.me.mcr && <DRow label="MCR" value={`${entry.me.mcr} kW`}/>}
                <DRow label="Load" value={`${entry.me.loadKw.toFixed(0)} kW${entry.me.mcr?` (${(entry.me.loadKw/entry.me.mcr*100).toFixed(1)}% MCR)`:''}`}/>
                {entry.me.runHours && <DRow label="Run hours" value={`${entry.me.runHours} h`}/>}
                <DRow label="SFOC" value={`${entry.me.sfoc} g/kWh`}/>
                {entry.me.fuel && <DRow label="Fuel" value={`${entry.me.fuel.category} · ρ${entry.me.fuel.density15} · ${entry.me.fuel.tempC}°C · VCF ${entry.me.fuel.vcf.toFixed(4)}${entry.me.fuel.useVCF?'':' (off)'}`}/>}
                {entry.me.netL ? <DRow label="Flowmeter net" value={`${entry.me.netL.toLocaleString()} L`}/> : null}
                <DRow label="Fact" value={`${entry.me.factMT.toFixed(3)} MT`}/>
                <DRow label="Theory" value={`${entry.me.theoryMT.toFixed(3)} MT`}/>
                {entry.me.theoryMT>0 && <DRow label="Deviation" value={`${((entry.me.factMT-entry.me.theoryMT)/entry.me.theoryMT*100)>0?'+':''}${((entry.me.factMT-entry.me.theoryMT)/entry.me.theoryMT*100).toFixed(2)}%`}/>}
              </div>
            </div>
          )}
          {(entry.gen.items||[]).map((g,i) => (
            <div key={i}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1" style={{color:'var(--text-secondary)'}}>
                <Zap size={11} style={{color:'#34d399'}}/>Generator {i+1}
              </p>
              <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
                <DRow label="Avg load" value={`${g.loadKw.toFixed(1)} kW`}/>
                {g.kwhBefore!==undefined && <DRow label="kWh before/after" value={`${g.kwhBefore} / ${g.kwhAfter}`}/>}
                {g.runHours && <DRow label="Run hours" value={`${g.runHours} h`}/>}
                <DRow label="SFOC" value={`${g.sfoc} g/kWh`}/>
                {g.fuel && <DRow label="Fuel" value={`${g.fuel.category} · ρ${g.fuel.density15} · ${g.fuel.tempC}°C · VCF ${g.fuel.vcf.toFixed(4)}${g.fuel.useVCF?'':' (off)'}`}/>}
                {g.netL ? <DRow label="Flowmeter net" value={`${g.netL.toLocaleString()} L`}/> : null}
                <DRow label="Fact" value={`${g.factMT.toFixed(3)} MT`}/>
                <DRow label="Theory" value={`${g.theoryMT.toFixed(3)} MT`}/>
              </div>
            </div>
          ))}
          {entry.gen.count > 0 && !entry.gen.items?.length && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1" style={{color:'var(--text-secondary)'}}>
                <Zap size={11} style={{color:'#34d399'}}/>Generators ×{entry.gen.count}
              </p>
              <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
                <DRow label="Total load" value={`${entry.gen.loadKw.toFixed(1)} kW`}/>
                <DRow label="Fact" value={`${entry.gen.factMT.toFixed(3)} MT`}/>
                <DRow label="Theory" value={`${entry.gen.theoryMT.toFixed(3)} MT`}/>
              </div>
            </div>
          )}
          {entry.boiler.factMT > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1" style={{color:'var(--text-secondary)'}}>
                <Flame size={11} style={{color:'#f59e0b'}}/>Boiler
              </p>
              <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
                {entry.boiler.fuel && <DRow label="Fuel" value={`${entry.boiler.fuel.category} · ρ${entry.boiler.fuel.density15} · ${entry.boiler.fuel.tempC}°C`}/>}
                {entry.boiler.netL ? <DRow label="Flowmeter net" value={`${entry.boiler.netL.toLocaleString()} L`}/> : null}
                <DRow label="Fact" value={`${entry.boiler.factMT.toFixed(3)} MT`}/>
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--text-secondary)'}}>Total</p>
            <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
              <DRow label="Total fact" value={`${entry.totalFactMT.toFixed(3)} MT`}/>
              <DRow label="Total theory" value={`${entry.totalTheoryMT.toFixed(3)} MT`}/>
              {diffPct && <DRow label="Fact vs theory" value={`${parseFloat(diffPct)>0?'+':''}${diffPct}%`}/>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--text-secondary)'}}>Copy summary</p>
            <pre className="rounded-xl p-3 text-xs overflow-x-auto" style={{background:'var(--bg-input)',color:'var(--text-muted)',fontFamily:'monospace',whiteSpace:'pre',lineHeight:1.5}}>{buildText()}</pre>
          </div>
        </div>
        <div className="flex gap-2 p-4 pt-3 border-t" style={{borderColor:'var(--border)'}}>
          <button onClick={copyText}
            className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
            {copied ? <><CheckCheck size={14}/> Copied!</> : <><Copy size={14}/> Copy to clipboard</>}
          </button>
          <button onClick={() => { onDelete(); onClose(); }}
            className="p-2.5 rounded-xl border transition-colors hover:bg-red-900"
            style={{borderColor:'var(--border)',color:'#f87171'}}>
            <Trash2 size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── State types ──
interface MEState {
  id: string; enabled: boolean; mcr: string; loadKw: string; sfoc: string;
  fuel: FuelParams; useVCF: boolean;
  fm: FlowmeterReading|null; manualL: string;
  runHPrev: string; runHCurr: string; manualRunH: string;
  kwPrev: string; kwCurr: string; manualKw: string;
}
interface GenState {
  id: string; sfoc: string; fuel: FuelParams; useVCF: boolean;
  fm: FlowmeterReading|null; manualL: string; periodH: number;
  kwhBefore: string; kwhAfter: string; runHours: string; enabled: boolean;
  runHPrev: string; runHCurr: string; manualKwh: string;
}
interface BoilerState {
  id: string; enabled: boolean; fuel: FuelParams; useVCF: boolean;
  fm: FlowmeterReading|null; manualL: string;
  runHPrev: string; runHCurr: string; manualRunH: string;
}
interface DraftState {
  date: string; mode: OperatingMode; periodH: number;
  mes: MEState[]; gens: GenState[]; boilers: BoilerState[];
}

function defaultFuel(cat: FuelCategory = 'HFO'): FuelParams {
  return { category: cat, density15: DEFAULT_DENSITY[cat], tempC: 50 };
}

function defaultME(id?: string): MEState {
  return { id: id||uid(), enabled: true, mcr: '5000', loadKw: '3750', sfoc: '190', fuel: defaultFuel('HFO'), useVCF: true, fm: null, manualL: '', runHPrev: '', runHCurr: '', manualRunH: '', kwPrev: '', kwCurr: '', manualKw: '' };
}
function defaultBoiler(id?: string): BoilerState {
  return { id: id||uid(), enabled: false, fuel: defaultFuel('HFO'), useVCF: true, fm: null, manualL: '', runHPrev: '', runHCurr: '', manualRunH: '' };
}
function defaultDraft(): DraftState {
  return {
    date: today(), mode: 'voyage', periodH: 24,
    mes: [defaultME()],
    gens: [],
    boilers: [defaultBoiler()],
  };
}

function loadDraft(): DraftState {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return defaultDraft();
    const p = JSON.parse(s);
    if (p.me && !p.mes) p.mes = [p.me];
    if (p.boiler && !p.boilers) p.boilers = [p.boiler];
    return { ...defaultDraft(), ...p };
  } catch { return defaultDraft(); }
}

function saveDraftToStorage(d: DraftState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

function calcFact(fm: FlowmeterReading|null, manualL: string, fuel: FuelParams, useVCF: boolean): number {
  const liters = fm ? (fm.supply - fm.return_) : (parseFloat(manualL)||0);
  return litersToMTWithFlag(liters, fuel.density15, fuel.category, fuel.tempC, useVCF);
}

function getNetL(fm: FlowmeterReading|null, manualL: string): number {
  return fm ? (fm.supply - fm.return_) : (parseFloat(manualL)||0);
}

export default function ConsumptionTab({ log, onAdd, onDelete }: Props) {
  const [draft, setDraftState] = useState<DraftState>(loadDraft);
  const [showHelp, setShowHelp] = useState(false);
  const [expandMe, setExpandMe] = useState(true);
  const [expandBoiler, setExpandBoiler] = useState(false);
  const [expandedGens, setExpandedGens] = useState<Set<string>>(new Set());
  const [showLog, setShowLog] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ConsumptionLogEntry|null>(null);

  const { date, mode, periodH, mes, gens, boilers } = draft;

  const setDraft = (updater: (d: DraftState) => DraftState) => {
    setDraftState(prev => { const next = updater(prev); saveDraftToStorage(next); return next; });
  };
  const updateME = (id: string, patch: Partial<MEState>) => setDraft(d => ({...d, mes: d.mes.map(x => x.id===id?{...x,...patch}:x)}));
  const addME = () => setDraft(d => ({...d, mes: [...d.mes, defaultME()]}));
  const removeME = (id: string) => setDraft(d => ({...d, mes: d.mes.filter(x => x.id!==id)}));
  const updateBoiler = (id: string, patch: Partial<BoilerState>) => setDraft(d => ({...d, boilers: d.boilers.map(x => x.id===id?{...x,...patch}:x)}));
  const addBoiler = () => setDraft(d => ({...d, boilers: [...d.boilers, defaultBoiler()]}));
  const removeBoiler = (id: string) => setDraft(d => ({...d, boilers: d.boilers.filter(x => x.id!==id)}));
  const setGens = (updater: (g: GenState[]) => GenState[]) => setDraft(d => ({...d, gens: updater(d.gens)}));
  const addGen = () => { const id = uid(); setGens(g => [...g, { id, sfoc:'200', fuel:defaultFuel('HFO'), useVCF:true, fm:null, manualL:'', periodH:24, kwhBefore:'', kwhAfter:'', runHours:'', enabled:false, runHPrev:'', runHCurr:'', manualKwh:'' }]); setExpandedGens(s => { const n = new Set(s); n.add(id); return n; }); };
  const removeGen = (id: string) => setGens(g => g.filter(x => x.id !== id));
  const updateGen = (id: string, patch: Partial<GenState>) => setGens(g => g.map(x => x.id===id?{...x,...patch}:x));
  const toggleGen = (id: string) => setExpandedGens(s => { const n = new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const meCalcs = mes.map(me => {
    const rhCalc = calcRunHours(me.runHPrev, me.runHCurr);
    const rh = rhCalc || parseFloat(me.manualRunH)||periodH;
    const kwDiff = (parseFloat(me.kwCurr)||0) - (parseFloat(me.kwPrev)||0);
    const hasKwCounter = me.kwPrev !== '' || me.kwCurr !== '';
    const loadKw = hasKwCounter && kwDiff > 0 ? kwDiff : (parseFloat(me.manualKw)||0) || (parseFloat(me.loadKw)||0);
    return {
      id: me.id, enabled: me.enabled,
      factMT: me.enabled ? calcFact(me.fm, me.manualL, me.fuel, me.useVCF) : 0,
      theoryMT: me.enabled ? theoryMT(loadKw, me.sfoc, rh) : 0,
      loadKw, runH: rh,
      pct: me.mcr ? (loadKw/(parseFloat(me.mcr)||1)*100).toFixed(1) : null,
      sfoc: parseFloat(me.sfoc)||0,
      netL: getNetL(me.fm, me.manualL),
      fuel: me.fuel, useVCF: me.useVCF,
      mcr: parseFloat(me.mcr)||undefined,
    };
  });

  const genResults = gens.filter(g => g.enabled).map(g => {
    const rhCalc = calcRunHours(g.runHPrev, g.runHCurr);
    const rh = rhCalc || parseFloat(g.runHours)||periodH;
    const kwhDiff = g.kwhBefore||g.kwhAfter
    ? (parseFloat(g.kwhAfter)||0) - (parseFloat(g.kwhBefore)||0)
    : parseFloat(g.manualKwh)||0;
    const lkw = rh > 0 ? kwhDiff / rh : 0;
    return { id: g.id, factMT: calcFact(g.fm, g.manualL, g.fuel, g.useVCF), theoryMT: theoryMT(lkw, g.sfoc, rh), loadKw: lkw, runHours: rh, kwhBefore: parseFloat(g.kwhBefore)||0, kwhAfter: parseFloat(g.kwhAfter)||0, sfoc: parseFloat(g.sfoc)||0, netL: getNetL(g.fm, g.manualL), fuel: g.fuel, useVCF: g.useVCF };
  });

  const boilerCalcs = boilers.map(b => ({
    id: b.id, enabled: b.enabled,
    factMT: b.enabled ? calcFact(b.fm, b.manualL, b.fuel, b.useVCF) : 0,
    runH: calcRunHours(b.runHPrev, b.runHCurr) || parseFloat(b.manualRunH)||periodH,
    netL: getNetL(b.fm, b.manualL), fuel: b.fuel, useVCF: b.useVCF,
  }));

  const meFactTotal = meCalcs.reduce((s,m)=>s+(m.enabled?m.factMT:0),0);
  const meTheoryTotal = meCalcs.reduce((s,m)=>s+(m.enabled?m.theoryMT:0),0);
  const genFactTotal = genResults.reduce((s,g)=>s+g.factMT,0);
  const genTheoryTotal = genResults.reduce((s,g)=>s+g.theoryMT,0);
  const genLoadTotal = genResults.reduce((s,g)=>s+g.loadKw,0);
  const boilerFactTotal = boilerCalcs.reduce((s,b)=>s+(b.enabled?b.factMT:0),0);

  const totalFact = meFactTotal + genFactTotal + boilerFactTotal;
  const totalTheory = meTheoryTotal + genTheoryTotal;
  const diffPct = totalTheory > 0 ? ((totalFact-totalTheory)/totalTheory*100).toFixed(1) : null;

  const modeLabels: Record<OperatingMode,string> = { voyage:'Voyage', port:'Port/Anchor', maneuvering:'Maneuvering' };

  const save = () => {
    const firstME = meCalcs[0];
    onAdd({
      id: uid(), date, periodH, mode,
      me: {
        factMT: meFactTotal, theoryMT: meTheoryTotal,
        loadKw: firstME?.loadKw||0, sfoc: firstME?.sfoc||0,
        mcr: firstME?.mcr,
        runHours: firstME?.runH,
        fuel: firstME ? { category: firstME.fuel.category, density15: firstME.fuel.density15, tempC: firstME.fuel.tempC, vcf: calcVCF(firstME.fuel.category, firstME.fuel.tempC), useVCF: firstME.useVCF } : undefined,
        netL: firstME?.netL||undefined,
      },
      gen: {
        factMT: genFactTotal, theoryMT: genTheoryTotal, loadKw: genLoadTotal,
        sfoc: gens[0]?parseFloat(gens[0].sfoc)||0:0, count: genResults.length,
        items: genResults.map(g => ({ factMT: g.factMT, theoryMT: g.theoryMT, loadKw: g.loadKw, sfoc: g.sfoc, kwhBefore: g.kwhBefore, kwhAfter: g.kwhAfter, runHours: g.runHours, fuel: { category: g.fuel.category, density15: g.fuel.density15, tempC: g.fuel.tempC, vcf: calcVCF(g.fuel.category, g.fuel.tempC), useVCF: g.useVCF }, netL: g.netL||undefined })),
      },
      boiler: {
        factMT: boilerFactTotal,
        fuel: boilerCalcs[0]?.enabled ? { category: boilerCalcs[0].fuel.category, density15: boilerCalcs[0].fuel.density15, tempC: boilerCalcs[0].fuel.tempC, vcf: calcVCF(boilerCalcs[0].fuel.category, boilerCalcs[0].fuel.tempC), useVCF: boilerCalcs[0].useVCF } : undefined,
        netL: boilerCalcs[0]?.enabled ? boilerCalcs[0].netL||undefined : undefined,
      },
      totalFactMT: totalFact, totalTheoryMT: totalTheory,
    });
  };

  return (
    <div className="p-4 space-y-3">

      {selectedEntry && (
        <LogEntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDelete={() => { onDelete(selectedEntry.id); setSelectedEntry(null); }}
        />
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border p-5 max-w-sm w-full space-y-3" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm" style={{color:'var(--text-primary)'}}>How consumption is calculated</h4>
              <button onClick={() => setShowHelp(false)} style={{color:'var(--text-muted)'}}><X size={18}/></button>
            </div>
            <div className="space-y-3 text-xs" style={{color:'var(--text-secondary)'}}>
              <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
                <p className="font-bold mb-1" style={{color:'#38bdf8'}}>Flowmeter / Manual → MT (Fact)</p>
                <p className="font-mono">Net (L) = Supply - Return</p>
                <p className="font-mono">VCF = 1 - α × (T - 15°C)  [ASTM D1250]</p>
                <p className="font-mono">MT = L ÷ 1000 × VCF × ρ₁₅</p>
              </div>
              <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
                <p className="font-bold mb-1" style={{color:'#a78bfa'}}>ME / Generator → MT (Theory)</p>
                <p className="font-mono">MT = SFOC × kW × hours ÷ 1,000,000</p>
                <p className="mt-1" style={{color:'var(--text-muted)'}}>Gen kW = (kWh after - kWh before) ÷ run hours</p>
              </div>
              <div className="rounded-xl p-3" style={{background:'var(--bg-input)'}}>
                <p className="font-bold mb-1" style={{color:'#f59e0b'}}>Boiler (fact only)</p>
                <p className="font-mono">Same formula as flowmeter. No theory.</p>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-2.5 text-sm">Got it!</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="th-card border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Consumption Log</h3>
          <button onClick={() => setShowHelp(true)} style={{color:'var(--text-muted)'}}><HelpCircle size={17}/></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Date</label>
            <input type="date" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border" value={date} onChange={e=>setDraft(d=>({...d,date:e.target.value}))} /></div>
          <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Period (hours)</label>
            <input type="number" step="0.5" min="0.5" placeholder="24" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border"
              value={periodH || ''}
              onChange={e=>setDraft(d=>({...d,periodH:parseFloat(e.target.value)||0}))}
              onBlur={e=>{if(!e.target.value||parseFloat(e.target.value)===0)setDraft(d=>({...d,periodH:24}));}} /></div>
        </div>
        <div><label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Operating mode</label>
          <div className="flex gap-2">
            {(['voyage','port','maneuvering'] as OperatingMode[]).map(m => (
              <button key={m} onClick={() => setDraft(d=>({...d,mode:m,mes:d.mes.map(me=>({...me,enabled:m!=='port'}))}))}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${mode===m?'bg-sky-600 text-white border-sky-600':'border-slate-600 text-slate-400'}`}>
                {modeLabels[m]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Engines */}
      {mes.map((me, meIdx) => {
        const calc = meCalcs.find(c=>c.id===me.id)||meCalcs[0];
        const label = meIdx===0 ? 'Main Engine' : `Main Engine ${meIdx+1}`;
        return (
          <div key={me.id} className="th-card border rounded-2xl overflow-hidden">
            <button onClick={() => setExpandMe(e=>!e)}
              className="w-full flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--border)'}}>
              <div className="flex items-center gap-2">
                <Ship size={15} style={{color:'#38bdf8'}}/>
                <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{label}</span>
                {!me.enabled && <span className="text-xs px-2 py-0.5 rounded-lg" style={{background:'var(--bg-input)',color:'var(--text-muted)'}}>off</span>}
                {me.enabled && <span className="text-xs" style={{color:'var(--text-muted)'}}>{me.loadKw} kW{calc?.pct?` · ${calc.pct}% MCR`:''}</span>}
              </div>
              <div className="flex items-center gap-3">
                {me.enabled && calc && calc.factMT>0 && <span className="text-xs font-bold text-amber-400">{fmt(calc.factMT,3)} MT</span>}
                {mes.length>1 && <button onClick={e=>{e.stopPropagation();removeME(me.id);}} className="p-1 rounded-lg hover:bg-red-700" style={{color:'var(--text-muted)'}}><Trash2 size={12}/></button>}
                {expandMe?<ChevronUp size={14} style={{color:'var(--text-muted)'}}/>:<ChevronDown size={14} style={{color:'var(--text-muted)'}}/>}
              </div>
            </button>
            {expandMe && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`me-on-${me.id}`} checked={me.enabled} onChange={e=>updateME(me.id,{enabled:e.target.checked})} />
                  <label htmlFor={`me-on-${me.id}`} className="text-xs" style={{color:'var(--text-muted)'}}>ME in operation</label>
                </div>
                {me.enabled && (
                  <>
                    <Section title="Power" icon={<Zap size={12} style={{color:'#38bdf8'}}/>} defaultOpen>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>MCR (kW) opt.</label>
                          <input type="number" placeholder="5000" className="th-input w-full rounded-lg px-2 py-2 text-sm border" value={me.mcr} onChange={e=>updateME(me.id,{mcr:e.target.value})} /></div>
                        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Load manual (kW)</label>
                          <input type="number" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-sm border" value={me.loadKw} onChange={e=>updateME(me.id,{loadKw:e.target.value,manualKw:'',kwPrev:'',kwCurr:''})} /></div>
                      </div>
                      <KwhCounter
                        prev={me.kwPrev} curr={me.kwCurr} manualKw={me.manualKw}
                        onChange={(p,c) => updateME(me.id,{kwPrev:p,kwCurr:c,loadKw:''})}
                        onManualChange={v => updateME(me.id,{manualKw:v,kwPrev:'',kwCurr:'',loadKw:''})}
                        label="Power"
                      />
                      <RunHoursCounter prevH={me.runHPrev} currH={me.runHCurr} manualH={me.manualRunH} label="Running hours" onChange={(p,c)=>updateME(me.id,{runHPrev:p,runHCurr:c})} onManualChange={v=>updateME(me.id,{manualRunH:v})} />
                      {calc?.pct && <p className="text-xs" style={{color:'var(--text-muted)'}}>Load: <b style={{color:'#38bdf8'}}>{calc.pct}% of MCR</b></p>}
                    </Section>
                    <Section title="SFOC & theory" icon={<span style={{fontSize:12}}>📐</span>}>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>SFOC (g/kWh)</label>
                          <input type="number" placeholder="190" className="th-input w-full rounded-lg px-2 py-2 text-sm border" value={me.sfoc} onChange={e=>updateME(me.id,{sfoc:e.target.value})} /></div>
                        <div className="rounded-xl p-2.5 text-center" style={{background:'var(--bg-input)'}}>
                          <p className="text-xs mb-0.5" style={{color:'var(--text-muted)'}}>Theory</p>
                          <p className="font-bold text-violet-400">{fmt(calc?.theoryMT||0,3)} MT</p>
                        </div>
                      </div>
                    </Section>
                    <Section title="Fuel flowmeter (fact)" icon={<span style={{fontSize:12}}>⛽</span>}>
                      <FuelParamsRow value={me.fuel} onChange={v=>updateME(me.id,{fuel:v})} useVCF={me.useVCF} onUseVCFChange={v=>updateME(me.id,{useVCF:v})} />
                      <FlowmeterInput fm={me.fm} manualL={me.manualL} onFmChange={v=>updateME(me.id,{fm:v})} onManualChange={v=>updateME(me.id,{manualL:v})} />
                      {calc && calc.factMT>0 && <p className="text-xs" style={{color:'var(--text-muted)'}}>Fact: <b className="text-amber-400">{fmt(calc.factMT,3)} MT</b></p>}
                    </Section>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-2.5 text-center" style={{background:'var(--bg-input)'}}>
                        <p className="text-xs mb-0.5" style={{color:'var(--text-muted)'}}>Fact</p>
                        <p className="font-bold text-amber-400">{fmt(calc?.factMT||0,3)} MT</p>
                      </div>
                      <div className="rounded-xl p-2.5 text-center" style={{background:'var(--bg-input)'}}>
                        <p className="text-xs mb-0.5" style={{color:'var(--text-muted)'}}>Theory</p>
                        <p className="font-bold text-violet-400">{fmt(calc?.theoryMT||0,3)} MT</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button onClick={addME}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed text-xs transition-colors hover:border-sky-500"
        style={{borderColor:'var(--border)',color:'var(--text-muted)'}}>
        <Plus size={13}/><Ship size={12} style={{color:'#38bdf8'}}/> Add Main Engine
      </button>

      {/* Generators */}
      {gens.map((g, idx) => {
        const rhCalc = calcRunHours(g.runHPrev, g.runHCurr);
        const rh = rhCalc || parseFloat(g.runHours)||periodH;
        const lkw = genAvgKw(g.kwhBefore, g.kwhAfter, String(rh));
        const gFact = calcFact(g.fm, g.manualL, g.fuel, g.useVCF);
        const gTheory = theoryMT(lkw, g.sfoc, rh);
        const isExp = expandedGens.has(g.id);
        return (
          <div key={g.id} className="th-card border rounded-2xl overflow-hidden">
            <button onClick={() => toggleGen(g.id)}
              className="w-full flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--border)'}}>
              <div className="flex items-center gap-2">
                <Zap size={15} style={{color:'#34d399'}}/>
                <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Generator {idx+1}</span>
                {!g.enabled && <span className="text-xs px-2 py-0.5 rounded-lg" style={{background:'var(--bg-input)',color:'var(--text-muted)'}}>off</span>}
                {g.enabled && lkw>0 && <span className="text-xs" style={{color:'var(--text-muted)'}}>{lkw.toFixed(0)} kW avg</span>}
              </div>
              <div className="flex items-center gap-2">
                {g.enabled && gFact>0 && <span className="text-xs font-bold text-amber-400">{fmt(gFact,3)} MT</span>}
                <button onClick={e=>{e.stopPropagation();removeGen(g.id);}} className="p-1 rounded-lg hover:bg-red-700" style={{color:'var(--text-muted)'}}><Trash2 size={12}/></button>
                {isExp?<ChevronUp size={14} style={{color:'var(--text-muted)'}}/>:<ChevronDown size={14} style={{color:'var(--text-muted)'}}/>}
              </div>
            </button>
            {isExp && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`gen-on-${g.id}`} checked={g.enabled} onChange={e=>updateGen(g.id,{enabled:e.target.checked})} />
                  <label htmlFor={`gen-on-${g.id}`} className="text-xs" style={{color:'var(--text-muted)'}}>Generator in operation</label>
                </div>
                {g.enabled && (
                  <>
                    <Section title="Electricity meter (kWh)" icon={<span style={{fontSize:12}}>⚡</span>} defaultOpen>
                      <div className="grid grid-cols-3 gap-2">
                        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Previous</label>
                          <input type="number" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border" value={g.kwhBefore} onChange={e=>updateGen(g.id,{kwhBefore:e.target.value})} /></div>
                        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>Present</label>
                          <input type="number" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border" value={g.kwhAfter} onChange={e=>updateGen(g.id,{kwhAfter:e.target.value})} /></div>
                        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>
                          {g.kwhBefore||g.kwhAfter ? 'kWh Produced' : 'kWh manual'}
                          </label>
                          {g.kwhBefore||g.kwhAfter
                            ? <input type="number" className="th-input w-full rounded-lg px-2 py-2 text-xs border opacity-60"
                                value={((parseFloat(g.kwhAfter)||0)-(parseFloat(g.kwhBefore)||0))||''} readOnly />
                            : <input type="number" step="1" placeholder="0" className="th-input w-full rounded-lg px-2 py-2 text-xs border"
                                value={g.manualKwh}
                                onChange={e => updateGen(g.id,{manualKwh:e.target.value,kwhBefore:'',kwhAfter:''})}
                              />
                          }
                        </div>
                      </div>
                      {lkw>0 && <p className="text-xs" style={{color:'var(--text-muted)'}}>Avg load: <b style={{color:'#34d399'}}>{lkw.toFixed(1)} kW</b></p>}
                    </Section>
                    <RunHoursCounter prevH={g.runHPrev} currH={g.runHCurr} manualH={g.runHours} label="Running hours" onChange={(p,c)=>updateGen(g.id,{runHPrev:p,runHCurr:c})} onManualChange={v=>updateGen(g.id,{runHours:v})} />
                    <Section title="SFOC & theory" icon={<span style={{fontSize:12}}>📐</span>}>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs mb-1 block" style={{color:'var(--text-muted)'}}>SFOC (g/kWh)</label>
                          <input type="number" placeholder="200" className="th-input w-full rounded-lg px-2 py-2 text-sm border" value={g.sfoc} onChange={e=>updateGen(g.id,{sfoc:e.target.value})} /></div>
                        <div className="rounded-xl p-2.5 text-center" style={{background:'var(--bg-input)'}}>
                          <p className="text-xs mb-0.5" style={{color:'var(--text-muted)'}}>Theory</p>
                          <p className="font-bold text-violet-400">{fmt(gTheory,3)} MT</p>
                        </div>
                      </div>
                    </Section>
                    <Section title="Fuel flowmeter (fact)" icon={<span style={{fontSize:12}}>⛽</span>}>
                      <FuelParamsRow value={g.fuel} onChange={v=>updateGen(g.id,{fuel:v})} useVCF={g.useVCF} onUseVCFChange={v=>updateGen(g.id,{useVCF:v})} />
                      <FlowmeterInput fm={g.fm} manualL={g.manualL} onFmChange={v=>updateGen(g.id,{fm:v})} onManualChange={v=>updateGen(g.id,{manualL:v})} />
                      {gFact>0 && <p className="text-xs" style={{color:'var(--text-muted)'}}>Fact: <b className="text-amber-400">{fmt(gFact,3)} MT</b></p>}
                    </Section>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-2.5 text-center" style={{background:'var(--bg-input)'}}>
                        <p className="text-xs mb-0.5" style={{color:'var(--text-muted)'}}>Fact</p>
                        <p className="font-bold text-amber-400">{fmt(gFact,3)} MT</p>
                      </div>
                      <div className="rounded-xl p-2.5 text-center" style={{background:'var(--bg-input)'}}>
                        <p className="text-xs mb-0.5" style={{color:'var(--text-muted)'}}>Theory</p>
                        <p className="font-bold text-violet-400">{fmt(gTheory,3)} MT</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={addGen}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-sm transition-colors hover:border-emerald-500"
        style={{borderColor:'var(--border)',color:'var(--text-muted)'}}>
        <Plus size={15}/><Zap size={13} style={{color:'#34d399'}}/> Add Generator
      </button>

      {/* Boilers */}
      {boilers.map((boiler, bIdx) => {
        const bcalc = boilerCalcs.find(c=>c.id===boiler.id)||boilerCalcs[0];
        const blabel = bIdx===0 ? 'Boiler' : `Boiler ${bIdx+1}`;
        return (
          <div key={boiler.id} className="th-card border rounded-2xl overflow-hidden">
            <button onClick={() => setExpandBoiler(e=>!e)}
              className="w-full flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--border)'}}>
              <div className="flex items-center gap-2">
                <Flame size={15} style={{color:'#f59e0b'}}/>
                <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{blabel}</span>
                {!boiler.enabled && <span className="text-xs px-2 py-0.5 rounded-lg" style={{background:'var(--bg-input)',color:'var(--text-muted)'}}>off</span>}
                {boiler.enabled && bcalc && bcalc.factMT>0 && <span className="text-xs font-bold text-amber-400">{fmt(bcalc.factMT,3)} MT</span>}
              </div>
              <div className="flex items-center gap-2">
                {boilers.length>1 && <button onClick={e=>{e.stopPropagation();removeBoiler(boiler.id);}} className="p-1 rounded-lg hover:bg-red-700" style={{color:'var(--text-muted)'}}><Trash2 size={12}/></button>}
                {expandBoiler?<ChevronUp size={14} style={{color:'var(--text-muted)'}}/>:<ChevronDown size={14} style={{color:'var(--text-muted)'}}/>}
              </div>
            </button>
            {expandBoiler && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`boiler-on-${boiler.id}`} checked={boiler.enabled} onChange={e=>updateBoiler(boiler.id,{enabled:e.target.checked})} />
                  <label htmlFor={`boiler-on-${boiler.id}`} className="text-xs" style={{color:'var(--text-muted)'}}>Boiler in operation</label>
                </div>
                {boiler.enabled && (
                  <>
                    <RunHoursCounter prevH={boiler.runHPrev} currH={boiler.runHCurr} manualH={boiler.manualRunH} label="Running hours" onChange={(p,c)=>updateBoiler(boiler.id,{runHPrev:p,runHCurr:c})} onManualChange={v=>updateBoiler(boiler.id,{manualRunH:v})} />
                    <Section title="Fuel flowmeter (fact)" icon={<span style={{fontSize:12}}>⛽</span>} defaultOpen>
                      <FuelParamsRow value={boiler.fuel} onChange={v=>updateBoiler(boiler.id,{fuel:v})} useVCF={boiler.useVCF} onUseVCFChange={v=>updateBoiler(boiler.id,{useVCF:v})} />
                      <FlowmeterInput fm={boiler.fm} manualL={boiler.manualL} onFmChange={v=>updateBoiler(boiler.id,{fm:v})} onManualChange={v=>updateBoiler(boiler.id,{manualL:v})} />
                      {bcalc && bcalc.factMT>0 && <p className="text-xs" style={{color:'var(--text-muted)'}}>Fact: <b className="text-amber-400">{fmt(bcalc.factMT,3)} MT</b></p>}
                    </Section>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button onClick={addBoiler}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed text-xs transition-colors hover:border-amber-500"
        style={{borderColor:'var(--border)',color:'var(--text-muted)'}}>
        <Plus size={13}/><Flame size={12} style={{color:'#f59e0b'}}/> Add Boiler
      </button>

      {/* Results */}
      <div className="th-card border rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Results</h3>
        <div className="rounded-xl overflow-hidden border" style={{borderColor:'var(--border)'}}>
          <table className="w-full text-xs">
            <thead><tr style={{background:'var(--bg-input)'}}>
              <th className="text-left px-3 py-2" style={{color:'var(--text-muted)'}}>Source</th>
              <th className="text-right px-3 py-2 text-amber-400">Fact (MT)</th>
              <th className="text-right px-3 py-2 text-violet-400">Theory (MT)</th>
            </tr></thead>
            <tbody>
              {meCalcs.filter(m=>m.enabled).map((m,i) => (
                <tr key={m.id} className="border-t" style={{borderColor:'var(--border)'}}>
                  <td className="px-3 py-2" style={{color:'var(--text-secondary)'}}><span style={{display:'flex',alignItems:'center',gap:4}}><Ship size={11} style={{color:'#38bdf8'}}/>{mes.length>1?`ME ${i+1}`:'ME'}</span></td>
                  <td className="px-3 py-2 text-right font-bold text-amber-400">{fmt(m.factMT,3)}</td>
                  <td className="px-3 py-2 text-right font-bold text-violet-400">{fmt(m.theoryMT,3)}</td>
                </tr>
              ))}
              {genResults.map((g,i) => (
                <tr key={g.id} className="border-t" style={{borderColor:'var(--border)'}}>
                  <td className="px-3 py-2" style={{color:'var(--text-secondary)'}}><span style={{display:'flex',alignItems:'center',gap:4}}><Zap size={11} style={{color:'#34d399'}}/>Gen {i+1}</span></td>
                  <td className="px-3 py-2 text-right font-bold text-amber-400">{fmt(g.factMT,3)}</td>
                  <td className="px-3 py-2 text-right font-bold text-violet-400">{fmt(g.theoryMT,3)}</td>
                </tr>
              ))}
              {boilerCalcs.filter(b=>b.enabled).map((b,i) => (
                <tr key={b.id} className="border-t" style={{borderColor:'var(--border)'}}>
                  <td className="px-3 py-2" style={{color:'var(--text-secondary)'}}><span style={{display:'flex',alignItems:'center',gap:4}}><Flame size={11} style={{color:'#f59e0b'}}/>{boilers.length>1?`Boiler ${i+1}`:'Boiler'}</span></td>
                  <td className="px-3 py-2 text-right font-bold text-amber-400">{fmt(b.factMT,3)}</td>
                  <td className="px-3 py-2 text-right" style={{color:'var(--text-muted)'}}>-</td>
                </tr>
              ))}
              <tr className="border-t" style={{borderColor:'var(--border)',background:'var(--bg-input)'}}>
                <td className="px-3 py-2 font-bold" style={{color:'var(--text-primary)'}}>Total</td>
                <td className="px-3 py-2 text-right font-bold text-amber-400 text-sm">{fmt(totalFact,3)}</td>
                <td className="px-3 py-2 text-right font-bold text-violet-400 text-sm">{fmt(totalTheory,3)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {diffPct !== null && (
          <p className="text-xs text-center" style={{color:'var(--text-muted)'}}>
            Fact vs Theory: <b style={{color:parseFloat(diffPct)>0?'#f87171':'#34d399'}}>{parseFloat(diffPct)>0?'+':''}{diffPct}%</b>
          </p>
        )}
        <button onClick={save}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl py-3 font-semibold text-sm transition-all">
          <Save size={16}/> Save Entry
        </button>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div>
          <button onClick={()=>setShowLog(s=>!s)}
            className="w-full flex items-center justify-between py-2 text-sm font-semibold uppercase tracking-wide" style={{color:'var(--text-secondary)'}}>
            <span className="flex items-center gap-2"><TrendingDown size={14}/> Log ({log.length})</span>
            {showLog?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
          </button>
          {showLog && (
            <div className="space-y-2 mt-2">
              {log.slice(0,30).map(e => (
                <button key={e.id} onClick={() => setSelectedEntry(e)}
                  className="w-full th-card border rounded-xl p-3 text-left transition-colors hover:border-sky-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{e.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{background:'var(--bg-input)',color:'var(--text-muted)'}}>{e.mode}</span>
                      <span className="text-xs" style={{color:'var(--text-muted)'}}>{e.periodH}h</span>
                    </div>
                    <ChevronDown size={13} style={{color:'var(--text-muted)'}}/>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {e.me.loadKw>0 && (
                      <div className="rounded-lg p-2 text-center" style={{background:'var(--bg-input)'}}>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>ME</p>
                        <p className="font-bold text-xs text-amber-400">{e.me.factMT.toFixed(2)} MT</p>
                      </div>
                    )}
                    {e.gen.count>0 && (
                      <div className="rounded-lg p-2 text-center" style={{background:'var(--bg-input)'}}>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>Gen×{e.gen.count}</p>
                        <p className="font-bold text-xs text-amber-400">{e.gen.factMT.toFixed(2)} MT</p>
                      </div>
                    )}
                    <div className="rounded-lg p-2 text-center" style={{background:'var(--bg-input)'}}>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>Total</p>
                      <p className="font-bold text-sm text-amber-400">{e.totalFactMT.toFixed(2)} MT</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
