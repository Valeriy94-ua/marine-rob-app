import { Moon, Sun, Monitor, Globe, Star, Info, Mail } from 'lucide-react';
import type { Theme } from '../theme';
import type { Locale, TKey } from '../i18n';
import { t, LOCALE_LABELS } from '../i18n';

interface Props {
  theme: Theme; locale: Locale; adFree: boolean;
  onTheme: (t: Theme) => void;
  onLocale: (l: Locale) => void;
  onRemoveAds: () => void;
}

export default function SettingsScreen({ theme, locale, adFree, onTheme, onLocale, onRemoveAds }: Props) {
  const T = (k: TKey) => t(locale, k);
  const themes: {value:Theme;label:string;icon:React.ReactNode}[] = [
    {value:'dark',   label:T('themeDark'),   icon:<Moon size={16}/>},
    {value:'light',  label:T('themeLight'),  icon:<Sun size={16}/>},
    {value:'system', label:T('themeSystem'), icon:<Monitor size={16}/>},
  ];
  const locales: Locale[] = ['en','tl','ru','uk','hi'];

  return (
    <div className="p-4 space-y-4">
      <div className="th-card border rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><Moon size={15}/> {T('theme')}</h3>
        <div className="flex gap-2">
          {themes.map(th=>(
            <button key={th.value} onClick={()=>onTheme(th.value)}
              className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition-all border ${
                theme===th.value?'bg-sky-600 border-sky-500 text-white':'border-transparent text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>{th.icon}{th.label}</button>
          ))}
        </div>
      </div>
      <div className="th-card border rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><Globe size={15}/> {T('language')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {locales.map(loc=>(
            <button key={loc} onClick={()=>{localStorage.setItem('mrob_locale',loc);onLocale(loc);}}
              className={`rounded-xl py-2.5 text-xs font-medium transition-all border ${
                locale===loc?'bg-sky-600 border-sky-500 text-white':'border-transparent text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>{LOCALE_LABELS[loc]}</button>
          ))}
        </div>
      </div>
      {!adFree ? (
        <div className="th-card border rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><Star size={15}/> {T('removeAds')}</h3>
          <p className="text-xs" style={{color:'var(--text-secondary)'}}>{T('removeAdsDesc')}</p>
          <button onClick={onRemoveAds} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl py-3 text-sm transition-colors">{T('removeAdsPrice')}</button>
        </div>
      ) : (
        <div className="th-card border border-emerald-700 rounded-2xl p-4 text-center">
          <p className="text-emerald-400 font-semibold">✓ Ad-free</p>
          <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>Thank you for supporting Marine ROB!</p>
        </div>
      )}
      <div className="th-card border rounded-2xl p-4 space-y-2">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><Mail size={15}/> {T('contactUs')}</h3>
        <a href="mailto:nordaneastow@gmail.com" className="block text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors">nordaneastow@gmail.com</a>
        <p className="text-xs" style={{color:'var(--text-muted)'}}>Questions, feedback, feature requests — all welcome.</p>
      </div>
      <div className="th-card border rounded-2xl p-4 space-y-1">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><Info size={15}/> About</h3>
        <p className="text-xs" style={{color:'var(--text-muted)'}}>{T('dataInfo')}</p>
        <p className="text-xs" style={{color:'var(--text-muted)'}}>{T('version')}</p>
      </div>
    </div>
  );
}
