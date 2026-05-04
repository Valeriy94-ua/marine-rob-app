import { useState, useEffect } from 'react';
import { BarChart3, Layers, BookOpen, Users, Settings } from 'lucide-react';
import type { FuelCategory, SFOCEntry } from './types';
import { FUEL_LABELS, FUEL_COLORS } from './types';
import { useStore } from './hooks/useStore';
import { loadTheme, saveTheme, resolveTheme, applyTheme } from './theme';
import type { Theme } from './theme';
import { detectLocale } from './i18n';
import type { Locale } from './i18n';
import SummaryTab from './components/SummaryTab';
import FuelTab from './components/FuelTab';
import ConsumptionTab from './components/ConsumptionTab';
import BunkerTab from './components/BunkerTab';
import ContractTab from './components/ContractTab';
import SalaryTab from './components/SalaryTab';
import SettingsScreen from './components/SettingsScreen';
import AdBanner from './components/AdBanner';

type Screen = 'overview' | 'tanks' | 'log' | 'crew' | 'settings';
type TanksCat = FuelCategory;
type LogTab = 'consumption' | 'bunker';
type CrewTab = 'contract' | 'salary';

const TANK_CATS: FuelCategory[] = ['HFO','VLSFO','MDO','LUBE','SLUDGE', 'CUSTOM'];

function App() {
  const store = useStore();
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());
  const [locale, setLocale] = useState<Locale>(() => detectLocale());
  const [screen, setScreen] = useState<Screen>('overview');
  const [tanksCat, setTanksCat] = useState<TanksCat>('HFO');
  const [logTab, setLogTab] = useState<LogTab>('consumption');
  const [crewTab, setCrewTab] = useState<CrewTab>('contract');
  const [showAdPrompt, setShowAdPrompt] = useState(false);
  const [avgConsumption, setAvgConsumption] = useState<number>(
    () => parseFloat(localStorage.getItem('mrob_avg_consumption')||'0')||0
  );
  const [sfocEntries, setSfocEntries] = useState<SFOCEntry[]>(() => {
  try {
    const saved = localStorage.getItem('mrob_sfoc_entries');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
});

const handleSaveSFOC = (entry: SFOCEntry) => {
  const next = [entry, ...sfocEntries];
  setSfocEntries(next);
  localStorage.setItem('mrob_sfoc_entries', JSON.stringify(next));
};

const handleDeleteSFOC = (id: string) => {
  const next = sfocEntries.filter(e => e.id !== id);
  setSfocEntries(next);
  localStorage.setItem('mrob_sfoc_entries', JSON.stringify(next));
};

  useEffect(() => {
    applyTheme(resolveTheme(theme));
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme==='system') applyTheme(resolveTheme('system')); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const handleTheme = (th: Theme) => { saveTheme(th); setThemeState(th); applyTheme(resolveTheme(th)); };
  const handleAvgChange = (v: number) => {
    setAvgConsumption(v);
    localStorage.setItem('mrob_avg_consumption', String(v));
  };

  const navItems: {id:Screen;label:string;icon:React.ReactNode}[] = [
    {id:'overview', label:'Overview', icon:<BarChart3 size={20}/>},
    {id:'tanks',    label:'Tanks',    icon:<Layers size={20}/>},
    {id:'log',      label:'Log',      icon:<BookOpen size={20}/>},
    {id:'crew',     label:'Crew',     icon:<Users size={20}/>},
    {id:'settings', label:'Settings', icon:<Settings size={20}/>},
  ];

  const bottomPad = store.adFree ? 'pb-20' : 'pb-32';

  return (
    <div className="flex flex-col max-w-2xl mx-auto" style={{minHeight:'100dvh',background:'var(--bg-base)',color:'var(--text-primary)'}}>
      <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-40"
        style={{background:'var(--bg-nav)',borderBottom:'1px solid var(--border)'}}>
        <img src="./icon.svg" alt="Marine ROB" className="w-9 h-9 rounded-xl" />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base leading-tight" style={{color:'var(--text-primary)'}}>Marine ROB</h1>
          <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>Built for the people who keep ships moving</p>
        </div>
      </header>

      {/* Sub-nav Tanks */}
      {screen==='tanks' && (
        <div className="px-2 overflow-x-auto" style={{background:'var(--bg-nav)',borderBottom:'1px solid var(--border)'}}>
          <div className="flex gap-1 py-2 min-w-max">
            {TANK_CATS.map(cat=>(
              <button key={cat} onClick={()=>setTanksCat(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  tanksCat===cat?`${FUEL_COLORS[cat]} text-white`:'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}>{FUEL_LABELS[cat]}</button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-nav Log */}
      {screen==='log' && (
        <div className="px-4 py-2 flex gap-2" style={{background:'var(--bg-nav)',borderBottom:'1px solid var(--border)'}}>
          {(['consumption','bunker'] as LogTab[]).map(lt=>(
            <button key={lt} onClick={()=>setLogTab(lt)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                logTab===lt?'bg-sky-600 text-white':'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              {lt==='consumption' ? 'Consumption' : 'Bunker Log'}
            </button>
          ))}
        </div>
      )}

      {/* Sub-nav Crew */}
      {screen==='crew' && (
        <div className="px-4 py-2 flex gap-2" style={{background:'var(--bg-nav)',borderBottom:'1px solid var(--border)'}}>
          {(['contract','salary'] as CrewTab[]).map(ct=>(
            <button key={ct} onClick={()=>setCrewTab(ct)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                crewTab===ct?'bg-violet-600 text-white':'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              {ct==='contract' ? 'Contract' : 'Salary'}
            </button>
          ))}
        </div>
      )}

      <main className={`flex-1 overflow-y-auto ${bottomPad}`}>
       {screen==='overview' && <SummaryTab robByCategory={store.robByCategory} avgConsumption={avgConsumption} onAvgConsumptionChange={handleAvgChange} locale={locale} sfocEntries={sfocEntries} onSaveSFOC={handleSaveSFOC} onDeleteSFOC={handleDeleteSFOC} />}
        {screen==='tanks' && <FuelTab category={tanksCat} tanks={store.tanks.filter(t=>t.category===tanksCat)} rob={store.robByCategory(tanksCat)} onAdd={store.addTank} onUpdate={store.updateTank} onDelete={store.deleteTank} locale={locale} />}
        {screen==='log' && logTab==='consumption' && <ConsumptionTab log={store.consumptionLog} onAdd={store.addConsumption} onDelete={store.delConsumption} onEdit={store.editConsumption} />}
        {screen==='log' && logTab==='bunker' && <BunkerTab log={store.bunkerLog} onAdd={store.addBunker} onDelete={store.delBunker} onEdit={store.editBunker} />}
        {screen==='crew' && crewTab==='contract' && <ContractTab contract={store.contract} contractHistory={store.contractHistory} onSave={store.saveContract} onFinish={store.finishContract} onDeleteHistory={store.deleteFinished} locale={locale} />}
        {screen==='crew' && crewTab==='salary' && <SalaryTab salary={store.salary} contractDaysFromContract={store.contract.totalDays} daysPassedFromContract={store.contract.daysPassed} onSave={store.saveSalary} locale={locale} />}
        {screen==='settings' && <SettingsScreen theme={theme} locale={locale} adFree={store.adFree} onTheme={handleTheme} onLocale={setLocale} onRemoveAds={()=>setShowAdPrompt(true)} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-2xl mx-auto"
        style={{background:'var(--bg-nav)',borderTop:'1px solid var(--border)',paddingBottom:'env(safe-area-inset-bottom,8px)'}}>
        {!store.adFree && <AdBanner />}
        <div className="flex">
          {navItems.map(item=>{
            const active=screen===item.id;
            return (
              <button key={item.id} onClick={()=>setScreen(item.id)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all"
                style={{color:active?'#38bdf8':'var(--text-muted)'}}>
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showAdPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="rounded-2xl border p-6 max-w-sm w-full text-center space-y-4" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
            <p className="text-3xl">🚢</p>
            <h3 className="font-bold text-lg" style={{color:'var(--text-primary)'}}>Remove Ads — $4.99</h3>
            <p className="text-sm" style={{color:'var(--text-secondary)'}}>One-time purchase. No subscription.</p>
            <div className="flex gap-3">
              <button onClick={()=>{store.purchaseAdFree();setShowAdPrompt(false);}} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl py-3 transition-colors">Unlock — $4.99</button>
              <button onClick={()=>setShowAdPrompt(false)} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white rounded-xl py-3 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;