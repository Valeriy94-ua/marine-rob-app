import { Moon, Sun, Monitor, Globe, Star, Info, Mail, CheckCircle } from 'lucide-react';
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

      {/* Theme */}
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

      {/* Language */}
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

      {/* Remove Ads */}
      {!adFree ? (
        <div className="th-card border rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}>
            <Star size={15}/> {T('removeAds')}
          </h3>
          <ul className="space-y-1">
            {['Remove all banner ads forever','One-time payment — no subscription','Supports the developer ⚓'].map(item=>(
              <li key={item} className="text-xs flex items-center gap-2" style={{color:'var(--text-secondary)'}}>
                <span className="text-emerald-400">✓</span> {item}
              </li>
            ))}
          </ul>
          <button
            onClick={onRemoveAds}
            className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-amber-900/30"
          >
            🔓 {T('removeAdsPrice')}
          </button>
          <p className="text-xs text-center" style={{color:'var(--text-muted)'}}>
            Secure payment via Google Play
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-5 text-center space-y-2 border border-emerald-600"
          style={{background:'rgba(16,185,129,0.08)'}}>
          <CheckCircle size={32} className="mx-auto text-emerald-400"/>
          <p className="font-bold text-emerald-400 text-lg">Ad-free unlocked!</p>
          <p className="text-xs" style={{color:'var(--text-muted)'}}>
            Thank you for supporting Marine ROB! 🚢
          </p>
        </div>
      )}

      {/* Contact */}
      <div className="th-card border rounded-2xl p-4 space-y-2">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><Mail size={15}/> {T('contactUs')}</h3>
        <a href="mailto:nordaneastow@gmail.com" className="block text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors">
          nordaneastow@gmail.com
        </a>
        <p className="text-xs" style={{color:'var(--text-muted)'}}>Questions, feedback, feature requests — all welcome.</p>
      </div>

      {/* About */}
      <div className="th-card border rounded-2xl p-4 space-y-1">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{color:'var(--text-primary)'}}><Info size={15}/> About</h3>
        <p className="text-xs" style={{color:'var(--text-muted)'}}>{T('dataInfo')}</p>
        <p className="text-xs" style={{color:'var(--text-muted)'}}>{T('version')}</p>
      </div>

    </div>
  );
}