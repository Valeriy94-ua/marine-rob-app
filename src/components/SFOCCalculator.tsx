import { useState } from 'react';
import { Calculator, TrendingDown, Trash2 } from 'lucide-react';

interface SFOCEntry {
  id: string;
  date: string;
  meLoad: number;
  aeLoad: number;
  speed: number;
  hours: number;
  sfoc: number;
  meConsumption: number;
  totalConsumption: number;
}

interface Props {
  onSaveEntry: (entry: SFOCEntry) => void;
  entries: SFOCEntry[];
  onDeleteEntry: (id: string) => void;
}

function calculateSFOCConsumption(meLoad: number, aeLoad: number, sfoc: number, hours: number): {me: number, total: number} {
  const mePower = (5000 * meLoad) / 100;
  const aePower = (500 * aeLoad) / 100;
  const meConsumption = (sfoc * mePower * hours) / 1_000_000;
  const aeConsumption = (sfoc * aePower * hours) / 1_000_000;
  return { me: meConsumption, total: meConsumption + aeConsumption };
}

export default function SFOCCalculator({ onSaveEntry, entries, onDeleteEntry }: Props) {
  const [meLoad, setMeLoad] = useState(75);
  const [aeLoad, setAeLoad] = useState(30);
  const [speed, setSpeed] = useState(12);
  const [hours, setHours] = useState(24);
  const [sfoc, setSfoc] = useState(190);

  const { me: meConsumption, total: totalConsumption } = calculateSFOCConsumption(meLoad, aeLoad, sfoc, hours);

  const handleSave = () => {
    onSaveEntry({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      date: new Date().toISOString().slice(0, 10),
      meLoad, aeLoad, speed, hours, sfoc, meConsumption, totalConsumption,
    });
    setMeLoad(75); setAeLoad(30); setSpeed(12); setHours(24);
  };

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="th-card border rounded-2xl overflow-hidden">
      <div className="p-4 border-b" style={{borderColor:'var(--border)'}}>
        <h3 className="font-semibold flex items-center gap-2" style={{color:'var(--text-primary)'}}>
          <Calculator size={16}/> Daily Consumption (SFOC)
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>SFOC (g/kWh)</label>
            <input type="number" step="1" min="140" max="250" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none" value={sfoc} onChange={e => setSfoc(parseFloat(e.target.value) || 190)} />
            <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>Typical: 190</p>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{color:'var(--text-muted)'}}>Hours/Day</label>
            <input type="number" step="0.5" min="0" max="24" className="th-input w-full rounded-xl px-3 py-2.5 text-sm border focus:border-sky-500 focus:outline-none" value={hours} onChange={e => setHours(parseFloat(e.target.value) || 24)} />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs" style={{color:'var(--text-muted)'}}>Main Engine (ME) Load</label>
            <span className="text-sm font-bold" style={{color:'var(--text-primary)'}}>{meLoad}%</span>
          </div>
          <input type="range" min="0" max="100" step="5" className="w-full" value={meLoad} onChange={e => setMeLoad(parseFloat(e.target.value))} />
          <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>MCR: 5000 kW</p>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs" style={{color:'var(--text-muted)'}}>Auxiliary Engine (AE) Load</label>
            <span className="text-sm font-bold" style={{color:'var(--text-primary)'}}>{aeLoad}%</span>
          </div>
          <input type="range" min="0" max="100" step="5" className="w-full" value={aeLoad} onChange={e => setAeLoad(parseFloat(e.target.value))} />
          <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>MCR: 500 kW</p>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs" style={{color:'var(--text-muted)'}}>Ship Speed</label>
            <span className="text-sm font-bold" style={{color:'var(--text-primary)'}}>{speed.toFixed(1)} knots</span>
          </div>
          <input type="range" min="6" max="18" step="0.5" className="w-full" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2" style={{borderTop:'1px solid var(--border)'}}>
          <div className="rounded-xl p-3 text-center" style={{background:'var(--bg-input)'}}>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>ME Consumption</p>
            <p className="text-2xl font-bold text-amber-400" style={{marginTop:'0.25rem'}}>{fmt(meConsumption)}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>MT</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{background:'var(--bg-input)'}}>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>Total (ME+AE)</p>
            <p className="text-2xl font-bold" style={{color:'#34d399', marginTop:'0.25rem'}}>{fmt(totalConsumption)}</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>MT/day</p>
          </div>
        </div>
        <button onClick={handleSave} className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-3 font-semibold text-sm transition-colors">
          Save Entry
        </button>
      </div>
      {entries.length > 0 && (
        <div className="p-4 border-t" style={{borderColor:'var(--border)'}}>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{color:'var(--text-secondary)'}}>
            <TrendingDown size={14}/> Recent Calculations
          </h4>
          <div className="space-y-2">
            {entries.slice(0, 8).map(e => (
              <div key={e.id} className="th-card border rounded-lg p-2.5 flex items-center justify-between text-xs" style={{background:'var(--bg-input)'}}>
                <div>
                  <p className="font-semibold" style={{color:'var(--text-primary)'}}>ME {e.meLoad}% • AE {e.aeLoad}% • {e.speed.toFixed(1)}kt • {e.hours}h</p>
                  <p style={{color:'var(--text-muted)'}}>{e.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-bold" style={{color:'#34d399'}}>{fmt(e.totalConsumption)} MT</p>
                    <p style={{color:'var(--text-muted)'}}>ME: {fmt(e.meConsumption)}</p>
                  </div>
                  <button onClick={() => onDeleteEntry(e.id)} className="p-1 rounded hover:bg-red-700 transition-colors" style={{color:'var(--text-muted)'}}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
