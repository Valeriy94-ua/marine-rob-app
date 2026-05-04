import { useState } from 'react';
import { Calculator, Trash2, TrendingDown, Zap, Ship, HelpCircle, X } from 'lucide-react';

interface SFOCEntry {
  id: string;
  date: string;
  engineType: 'ME' | 'AE';
  meMCR: number;
  aeMCR: number;
  meLoad: number;
  aeLoad: number;
  speed: number;
  hours: number;
  sfoc: number;
  meConsumption: number;
  aeConsumption: number;
  totalConsumption: number;
}

interface Props {
  onSaveEntry: (entry: SFOCEntry) => void;
  entries: SFOCEntry[];
  onDeleteEntry: (id: string) => void;
}

function calculateConsumption(meMCR: number, aeMCR: number, meLoad: number, aeLoad: number, sfoc: number, hours: number) {
  const mePower = (meMCR * meLoad) / 100;
  const aePower = (aeMCR * aeLoad) / 100;
  const me = (sfoc * mePower * hours) / 1_000_000;
  const ae = (sfoc * aePower * hours) / 1_000_000;
  return { me, ae, total: me + ae };
}

export default function SFOCCalculator({ onSaveEntry, entries, onDeleteEntry }: Props) {
  const [engineType, setEngineType] = useState<'ME' | 'AE'>('ME');
  const [meMCR, setMeMCR] = useState<string>('5000');
  const [aeMCR, setAeMCR] = useState<string>('500');  
  const [meLoad, setMeLoad] = useState(75);
  const [aeLoad, setAeLoad] = useState(30);
  const [speed, setSpeed] = useState(12);
  const [hours, setHours] = useState(24);
  const [sfoc, setSfoc] = useState(190);
  const [showHelp, setShowHelp] = useState(false);

  const { me: meConsumption, ae: aeConsumption, total: totalConsumption } =
  calculateConsumption(
    parseFloat(meMCR) || 5000,
    parseFloat(aeMCR) || 500,
    meLoad, aeLoad, sfoc, hours
  );
  const fmt = (n: number | undefined) => (n ?? 0).toFixed(2);

  const maxTotal = entries.length > 0
    ? Math.max(...entries.map(e => e.totalConsumption), totalConsumption || 1)
    : totalConsumption || 1;

  const handleSave = () => {
    onSaveEntry({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      date: new Date().toISOString().slice(0, 10),
      engineType,
      meMCR: parseFloat(meMCR) || 5000,
      aeMCR: parseFloat(aeMCR) || 500,
      meLoad, aeLoad, speed, hours, sfoc,
      meConsumption, aeConsumption, totalConsumption,
    });
  };
  return (
    <div className="th-card border rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div className="flex items-center gap-2">
          <Calculator size={16} style={{color:'var(--text-muted)'}}/>
          <h3 className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Daily Consumption (SFOC)</h3>
        </div>
        <button onClick={() => setShowHelp(true)} className="rounded-full p-0.5 transition-colors hover:opacity-70" style={{color:'var(--text-muted)'}}>
          <HelpCircle size={18}/>
        </button>
      </div>

      {/* Help modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border p-5 max-w-sm w-full space-y-3" style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}>
                <Calculator size={15}/> How SFOC is Calculated
              </h4>
              <button onClick={() => setShowHelp(false)} style={{color:'var(--text-muted)'}}><X size={18}/></button>
            </div>
            <div className="rounded-xl p-3 text-xs space-y-2" style={{background:'var(--bg-input)', color:'var(--text-secondary)'}}>
              <p className="font-bold" style={{color:'var(--text-primary)'}}>Main Formula:</p>
              <p className="font-mono text-sky-400">Consumption (MT) =</p>
              <p className="font-mono text-sky-400 pl-2">(SFOC × Power × Hours)</p>
              <p className="font-mono text-sky-400 pl-2">÷ 1,000,000</p>
            </div>
            <div className="text-xs space-y-1.5" style={{color:'var(--text-secondary)'}}>
              <p><span className="font-semibold" style={{color:'var(--text-primary)'}}>SFOC</span> — Specific Fuel Oil Consumption (g/kWh). Typical ME: 160–200 g/kWh</p>
              <p><span className="font-semibold" style={{color:'var(--text-primary)'}}>Power (kW)</span> = MCR × Load% ÷ 100</p>
              <p><span className="font-semibold" style={{color:'var(--text-primary)'}}>MCR</span> — Maximum Continuous Rating of engine (kW)</p>
              <p><span className="font-semibold" style={{color:'var(--text-primary)'}}>Hours</span> — operating hours per day (max 24)</p>
            </div>
            <div className="rounded-xl p-3 text-xs" style={{background:'var(--bg-input)'}}>
              <p className="font-semibold mb-1" style={{color:'var(--text-primary)'}}>Example:</p>
              <p style={{color:'var(--text-muted)'}}>SFOC=190, MCR=5000kW, Load=75%, Hours=24</p>
              <p style={{color:'#34d399'}}>= (190 × 3750 × 24) ÷ 1,000,000 = <strong>17.1 MT/day</strong></p>
            </div>
            <button onClick={() => setShowHelp(false)}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
              Got it!
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">

        {/* Engine type toggle */}
        <div className="flex gap-2">
          {(['ME','AE'] as const).map(type => (
            <button key={type} onClick={() => setEngineType(type)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border"
              style={{
                background: engineType === type ? '#0ea5e9' : 'transparent',
                color: engineType === type ? 'white' : 'var(--text-muted)',
                borderColor: engineType === type ? '#0ea5e9' : 'var(--border)',
              }}>
              {type === 'ME' ? <Ship size={14}/> : <Zap size={14}/>}
              {type === 'ME' ? 'Main Engine' : 'Aux Engine'}
            </button>
          ))}
        </div>

        {/* MCR inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>ME MCR (kW)</label>
            <input type="number" step="100" min="100"
              className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none"
              value={meMCR}
              onChange={e => setMeMCR(e.target.value)}
              onBlur={() => { if (!meMCR || parseFloat(meMCR) < 100) setMeMCR('5000'); }}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>AE MCR (kW)</label>
            <input type="number" step="50" min="50"
              className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none"
              value={aeMCR}
              onChange={e => setAeMCR(e.target.value)}
              onBlur={() => { if (!aeMCR || parseFloat(aeMCR) < 50) setAeMCR('500'); }}
            />
          </div>
        </div>
        {/* SFOC + Hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>SFOC (g/kWh)</label>
            <input type="number" step="1" min="140" max="250"
              className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none"
              value={sfoc} onChange={e => setSfoc(parseFloat(e.target.value) || 190)}/>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Hours/Day</label>
            <input type="number" step="0.5" min="0" max="24"
              className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none"
              value={hours} onChange={e => setHours(parseFloat(e.target.value) || 24)}/>
          </div>
        </div>

        {/* ME Load */}
        {engineType === 'ME' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs" style={{color:'var(--text-muted)'}}>
                ME Load <span style={{color:'var(--text-muted)'}}>({((meMCR * meLoad) / 100).toFixed(0)} kW)</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => setMeLoad(v => Math.max(0, v-1))}
                  className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors hover:bg-slate-600"
                  style={{background:'var(--bg-input)', color:'var(--text-primary)'}}>−</button>
                <span className="text-sm font-bold w-8 text-center" style={{color:'var(--text-primary)'}}>{meLoad}%</span>
                <button onClick={() => setMeLoad(v => Math.min(100, v+1))}
                  className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors hover:bg-slate-600"
                  style={{background:'var(--bg-input)', color:'var(--text-primary)'}}>+</button>
              </div>
            </div>
            <input type="range" min="0" max="100" step="1" className="w-full" value={meLoad}
              onChange={e => setMeLoad(parseFloat(e.target.value))}/>
            <div className="flex justify-between text-xs mt-1" style={{color:'var(--text-muted)'}}>
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
        )}

        {/* AE Load */}
        {engineType === 'AE' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs" style={{color:'var(--text-muted)'}}>
                AE Load <span style={{color:'var(--text-muted)'}}>({((aeMCR * aeLoad) / 100).toFixed(0)} kW)</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => setAeLoad(v => Math.max(0, v-1))}
                  className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors hover:bg-slate-600"
                  style={{background:'var(--bg-input)', color:'var(--text-primary)'}}>−</button>
                <span className="text-sm font-bold w-8 text-center" style={{color:'var(--text-primary)'}}>{aeLoad}%</span>
                <button onClick={() => setAeLoad(v => Math.min(100, v+1))}
                  className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors hover:bg-slate-600"
                  style={{background:'var(--bg-input)', color:'var(--text-primary)'}}>+</button>
              </div>
            </div>
            <input type="range" min="0" max="100" step="1" className="w-full" value={aeLoad}
              onChange={e => setAeLoad(parseFloat(e.target.value))}/>
            <div className="flex justify-between text-xs mt-1" style={{color:'var(--text-muted)'}}>
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
        )}

        {/* Speed */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs" style={{color:'var(--text-muted)'}}>Ship Speed</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setSpeed(v => Math.max(0, parseFloat((v-0.5).toFixed(1))))}
                className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-slate-600"
                style={{background:'var(--bg-input)', color:'var(--text-primary)'}}>−</button>
              <span className="text-sm font-bold w-12 text-center" style={{color:'var(--text-primary)'}}>{speed.toFixed(1)} kn</span>
              <button onClick={() => setSpeed(v => Math.min(30, parseFloat((v+0.5).toFixed(1))))}
                className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-slate-600"
                style={{background:'var(--bg-input)', color:'var(--text-primary)'}}>+</button>
            </div>
          </div>
          <input type="range" min="0" max="30" step="0.5" className="w-full" value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}/>
          <div className="flex justify-between text-xs mt-1" style={{color:'var(--text-muted)'}}>
            <span>0 kn</span><span>8 kn</span><span>15 kn</span><span>22 kn</span><span>30 kn</span>
          </div>
        </div>

        {/* Result cards */}
        <div className="grid grid-cols-3 gap-2 pt-2" style={{borderTop:'1px solid var(--border)'}}>
          <div className="rounded-xl p-3 text-center" style={{background:'var(--bg-input)'}}>
            <p className="text-xs mb-1" style={{color:'var(--text-muted)'}}>ME</p>
            <p className="text-xl font-bold text-amber-400">{fmt(meConsumption)}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>MT</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{background:'var(--bg-input)'}}>
            <p className="text-xs mb-1" style={{color:'var(--text-muted)'}}>AE</p>
            <p className="text-xl font-bold text-violet-400">{fmt(aeConsumption)}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>MT</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{background:'var(--bg-input)'}}>
            <p className="text-xs mb-1" style={{color:'var(--text-muted)'}}>Total</p>
            <p className="text-xl font-bold" style={{color:'#34d399'}}>{fmt(totalConsumption)}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>MT/day</p>
          </div>
        </div>

        {/* Save button */}
        <button onClick={handleSave}
          className="w-full bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl py-3 font-semibold text-sm transition-all">
          Save Entry
        </button>

      </div>

      {/* Saved entries comparison */}
      {entries.length > 0 && (
        <div className="border-t p-4 space-y-3" style={{borderColor:'var(--border)'}}>
          <h4 className="text-xs font-semibold uppercase tracking-wide flex items-center gap-2"
            style={{color:'var(--text-secondary)'}}>
            <TrendingDown size={13}/> Comparison ({entries.length} entries)
          </h4>
          <div className="space-y-2">
            {entries.slice(0, 10).map((e, i) => (
              <div key={e.id} className="rounded-xl p-3 border" style={{background:'var(--bg-input)', borderColor:'var(--border)'}}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                      style={{background: e.engineType === 'ME' ? '#0ea5e9' : '#8b5cf6', color:'white'}}>
                      {e.engineType}
                    </span>
                    <span className="text-xs" style={{color:'var(--text-muted)'}}>
                      {e.engineType === 'ME' ? `${e.meLoad}%` : `${e.aeLoad}%`} · {e.speed.toFixed(1)}kn · {e.hours}h
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{color:'#34d399'}}>{fmt(e.totalConsumption)} MT</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>ME {fmt(e.meConsumption ?? 0)} · AE {fmt(e.aeConsumption ?? 0)}</p>
                    </div>
                    <button onClick={() => onDeleteEntry(e.id)}
                      className="p-1 rounded-lg hover:bg-red-700 transition-colors"
                      style={{color:'var(--text-muted)'}}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{background:'var(--border)'}}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(e.totalConsumption / maxTotal) * 100}%`,
                      background: i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#34d399' : '#f59e0b'
                    }}/>
                </div>
                <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>
                  {e.date} · SFOC {e.sfoc} g/kWh · MCR ME {e.meMCR}kW / AE {e.aeMCR}kW
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
