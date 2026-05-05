import { useState } from 'react';
import { Play, CheckCircle } from 'lucide-react';

interface Props {
  onRewarded: () => void;
  label: string;
  description?: string;
}

export default function RewardedAd({ onRewarded, label, description }: Props) {
  const [phase, setPhase] = useState<'idle' | 'watching' | 'done'>('idle');
  const [countdown, setCountdown] = useState(5);
  const [showModal, setShowModal] = useState(false);

  const startAd = () => {
    setShowModal(true);
    setPhase('watching');
    setCountdown(5);
    let t = 5;
    const interval = setInterval(() => {
      t -= 1;
      setCountdown(t);
      if (t <= 0) { clearInterval(interval); setPhase('done'); }
    }, 1000);
  };

  const claim = () => {
    setShowModal(false);
    setPhase('idle');
    onRewarded();
  };

  return (
    <>
      <button onClick={startAd}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all border"
        style={{ background:'rgba(251,191,36,0.1)', borderColor:'#f59e0b', color:'#f59e0b' }}>
        <Play size={14} fill="#f59e0b"/> {label}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border p-6 max-w-sm w-full text-center space-y-4"
            style={{ background:'var(--bg-card)', borderColor:'var(--border)' }}>

            {phase === 'watching' && (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ background:'rgba(251,191,36,0.15)', border:'2px solid #f59e0b' }}>
                  <span className="text-3xl font-bold" style={{ color:'#f59e0b' }}>{countdown}</span>
                </div>
                <p className="font-semibold" style={{ color:'var(--text-primary)' }}>Watching ad...</p>
                {description && <p className="text-xs" style={{ color:'var(--text-muted)' }}>{description}</p>}
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width:`${((5-countdown)/5)*100}%`, background:'#f59e0b' }}/>
                </div>
                <div className="rounded-xl p-4" style={{ background:'var(--bg-input)' }}>
                  <p className="text-xs" style={{ color:'var(--text-muted)' }}>[ Advertisement ]</p>
                </div>
              </>
            )}

            {phase === 'done' && (
              <>
                <CheckCircle size={48} className="mx-auto text-emerald-400"/>
                <p className="font-bold text-lg" style={{ color:'var(--text-primary)' }}>Unlocked! 🎉</p>
                {description && <p className="text-sm" style={{ color:'var(--text-secondary)' }}>{description}</p>}
                <button onClick={claim}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-semibold transition-colors">
                  Claim Reward
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
