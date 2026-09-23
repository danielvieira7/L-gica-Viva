import React from 'react';
import { Award, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface VictoryModalProps {
  isOpen: boolean;
  title: string;
  explanation: string;
  onNextLevel?: () => void;
  onRestart: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  title,
  explanation,
  onNextLevel,
  onRestart,
  hasNextLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl space-y-5 text-center">
        {/* Badge */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
          <Award className="w-7 h-7 text-amber-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Desafio Concluído!</h2>
          <p className="text-sm font-medium text-indigo-300 mt-1">{title}</p>
        </div>

        <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl text-left text-xs leading-relaxed text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Por que o seu algoritmo funcionou:</span>
          </div>
          <p>{explanation}</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.click();
              onRestart();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refazer</span>
          </button>

          {hasNextLevel && onNextLevel && (
            <button
              onClick={() => {
                sound.click();
                onNextLevel();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Próximo Nível</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
