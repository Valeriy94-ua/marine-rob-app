import { useState, useEffect } from 'react';
import { BarChart3, Layers, BookOpen, Users, Settings } from 'lucide-react';
import type { FuelCategory } from './types';
import { FUEL_LABELS, FUEL_COLORS } from './types';
import { useStore } from './hooks/useStore';
import { loadTheme, saveTheme, resolveTheme, applyTheme } from './theme';
import type { Theme } from './theme';
import { detectLocale } from './i18n';
import type { Locale } from './i18n';
import { t } from './i18n';
import SummaryTab from './components/SummaryTab';

type Screen = 'overview';

function App() {
  const store = useStore();
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());
  const [locale, setLocale] = useState<Locale>(() => detectLocale());
  const [screen, setScreen] = useState<Screen>('overview');

  useEffect(() => {
    applyTheme(resolveTheme(theme));
  }, [theme]);

  const [avgConsumption, setAvgConsumption] = useState<number>(
    () => parseFloat(localStorage.getItem('mrob_avg_consumption')||'0')||0
  );
  const handleAvgChange = (v: number) => {
    setAvgConsumption(v);
    localStorage.setItem('mrob_avg_consumption', String(v));
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto" style={{minHeight:'100dvh',background:'var(--bg-base)',color:'var(--text-primary)'}}>
      <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-40" style={{background:'var(--bg-nav)',borderBottom:'1px solid var(--border)'}}>
        <div className="flex-1">
          <h1 className="font-bold text-base" style={{color:'var(--text-primary)'}}>Marine ROB</h1>
          <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>Fuel Calculator</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {screen === 'overview' && <SummaryTab robByCategory={store.robByCategory} avgConsumption={avgConsumption} onAvgConsumptionChange={handleAvgChange} locale={locale} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-2xl mx-auto flex" style={{background:'var(--bg-nav)',borderTop:'1px solid var(--border)'}}>
        <button onClick={()=>setScreen('overview')} className="flex-1 flex flex-col items-center gap-0.5 py-2" style={{color:'#38bdf8'}}>
          <BarChart3 size={20} /><span className="text-xs">Overview</span>
        </button>
      </nav>
    </div>
  );
}

export default App;



