import React from 'react';
import { Volume2, VolumeX, Sparkles, Award } from 'lucide-react';
import { ModuleId } from '../types';
import { sound } from '../utils/sound';

interface NavbarProps {
  currentModule: ModuleId;
  onSelectModule: (mod: ModuleId) => void;
  totalStars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const navItems: Array<{ id: ModuleId; label: string; number: string }> = [
  { id: 'sequence', label: 'Sequência', number: '01' },
  { id: 'condition', label: 'Decisões', number: '02' },
  { id: 'loop', label: 'Repetições', number: '03' },
  { id: 'variable', label: 'Memória', number: '04' },
  { id: 'sort', label: 'Ordenação', number: '05' },
  { id: 'search', label: 'Busca', number: '06' },
  { id: 'sandbox', label: 'Oficina', number: '07' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onSelectModule,
  totalStars,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => {
            sound.click();
            onSelectModule('sequence');
          }}
          className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            Lógica Viva
          </span>
          <span className="hidden sm:inline text-xs text-slate-500 font-medium">
            · Algoritmos sem Código
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.click();
                  onSelectModule(item.id);
                }}
                className={`whitespace-nowrap px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all rounded-md flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[10px] text-slate-500 font-mono">{item.number}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Sound & Stars) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-amber-400 text-xs font-semibold tabular-nums">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalStars}</span>
          </div>

          <button
            onClick={() => {
              sound.click();
              onToggleSound();
            }}
            title={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
            aria-label={soundEnabled ? 'Silenciar som' : 'Ativar som'}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
