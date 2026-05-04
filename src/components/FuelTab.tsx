import { useState } from 'react';
import { Plus, Fuel, Droplets } from 'lucide-react';
import type { FuelCategory, Tank } from '../types';
import { FUEL_LABELS, FUEL_COLORS } from '../types';
import type { Locale, TKey } from '../i18n';
import { t } from '../i18n';
import { fmtMT } from '../utils';
import TankCard from './TankCard';
import AddTankModal from './AddTankModal';

interface Props {
  category: FuelCategory;
  tanks: Tank[];
  rob: number;
  onAdd: (tank: Omit<Tank, 'id' | 'massT'>) => void;
  onUpdate: (tank: Tank) => void;
  onDelete: (id: string) => void;
  locale: Locale;
}

export default function FuelTab({ category, tanks, rob, onAdd, onUpdate, onDelete, locale }: Props) {
  const [showModal, setShowModal] = useState(false);
  const T = (k: TKey) => t(locale, k);
  const colorClass = FUEL_COLORS[category];
  const isSludge = category === 'SLUDGE';
  const isLube = category === 'LUBE';
  const isCustom = category === 'CUSTOM';
  const headerLabel = isSludge ? 'Total Sludge ROB' 
  : isLube ? 'Total Lube Oil ROB'
  : isCustom ? 'Total Custom Fuel ROB'
  : `Total ROB — ${FUEL_LABELS[category]}`;

  return (
    <div className="p-4 space-y-4">
      <div className={`${colorClass} bg-opacity-20 rounded-2xl p-5 flex items-center justify-between`} style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>{headerLabel}</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{fmtMT(rob)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{tanks.length} tank{tanks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={`${colorClass} p-3 rounded-xl bg-opacity-40`}>
          {isSludge ? <Droplets size={28} className="text-white" /> : <Fuel size={28} className="text-white" />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {isSludge ? 'Sludge Tanks' : isLube ? 'Lube Oil Tanks' : isCustom ? 'Custom Fuel Tanks' : 'Fuel Tanks'}
        </h3>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors">
          <Plus size={16}/> {T('addTank')}
        </button>
      </div>

      {tanks.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          {isSludge ? <Droplets size={36} className="mx-auto mb-3 opacity-40" /> : <Fuel size={36} className="mx-auto mb-3 opacity-40" />}
          <p className="text-sm">{T('noTanks')}</p>
          <p className="text-xs mt-1">{T('addFirst')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tanks.map(tk => <TankCard key={tk.id} tank={tk} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      )}

      {showModal && <AddTankModal category={category} onAdd={onAdd} onClose={() => setShowModal(false)} />}
    </div>
  );
}
