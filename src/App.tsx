import { useState, useEffect } from 'react';
import { BarChart3, Droplets, Zap, Ship, BookOpen, Settings } from 'lucide-react';
import type { FuelCategory } from './types';
import { useStore } from './hooks/useStore';
import { loadTheme, saveTheme, resolveTheme, applyTheme } from './theme';
import type { Theme } from './theme';
import { detectLocale } from './i18n';
import type { Locale } from './i18n';
import SummaryTab from './components/SummaryTab';
import TanksTab from './components/TanksTab';
import BunkerTab from './components/BunkerTab';
import ConsumptionTab from './components/ConsumptionTab';
import ContractTab from './components/ContractTab';

type Tab = 'overview' | 'tanks' | 'bunker' | 'consumption' | 'contract';

function App() {
  const store = useStore();
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());
  const [locale] = useState<Locale>(() => detectLocale());
  const [tab, setTab] = useState<Tab>('overview');
  const [avgConsumption, setAvgConsumption] = useState<number>(
    () => parseFloat(localStorage.getItem('mrob_avg_consumption') || '0') || 0
  );

  useEffect(() => { applyTheme(resolveTheme(theme)); }, [theme]);

  const handleAvgChange = (v: number) => {
    setAvgConsumption(v);
    localStorage.setItem('mrob_avg_consumption', String(v));
  };

  const NAV: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'overview',    icon: <BarChart3 size={20}/>,  label: 'Overview' },
    { id: 'tanks',       icon: <Droplets size={20}/>,   label: 'Tanks' },
    { id: 'bunker',      icon: <Ship size={20}/>,       label: 'Bunker' },
    { id: 'consumption', icon: <BookOpen size={20}/>,   label: 'Log' },
    { id: 'contract',    icon: <Settings size={20}/>,   label: 'Contract' },
  ];

  return (
    <div className="flex flex-col max-w-2xl mx-auto" style={{ minHeight: '100dvh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-40" style={{ background: 'var(--bg-nav)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex-1">
          <h1 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Marine ROB</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fuel Calculator</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'overview'    && <SummaryTab robByCategory={store.robByCategory} avgConsumption={avgConsumption} onAvgConsumptionChange={handleAvgChange} locale={locale} />}
        {tab === 'tanks'       && <TanksTab tanks={store.tanks} onAdd={store.addTank} onUpdate={store.updateTank} onDelete={store.deleteTank} />}
        {tab === 'bunker'      && <BunkerTab entries={store.bunkerLog} onAdd={store.addBunker} onDelete={store.delBunker} />}
        {tab === 'consumption' && <ConsumptionTab entries={store.consumptionLog} tanks={store.tanks} onAdd={store.addConsumption} onDelete={store.delConsumption} />}
        {tab === 'contract'    && <ContractTab contract={store.contract} salary={store.salary} history={store.contractHistory} onSave={store.saveContract} onSaveSalary={store.saveSalary} onFinish={store.finishContract} onDeleteHistory={store.deleteFinished} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-2xl mx-auto flex" style={{ background: 'var(--bg-nav)', borderTop: '1px solid var(--border)' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors"
            style={{ color: tab === n.id ? '#38bdf8' : 'var(--text-muted)' }}>
            {n.icon}<span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;