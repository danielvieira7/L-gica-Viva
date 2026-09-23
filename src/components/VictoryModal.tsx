import React from 'react';
import { Award, ArrowRight, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-white border border-[#E2E8F0] rounded-[28px] shadow-2xl space-y-6 text-center">
        {/* Glowing Badge / Star */}
        <div className="relative w-16 h-16 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center shadow-lg shadow-amber-300/30">
          <Sparkles className="w-9 h-9 text-amber-500 fill-amber-400" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#15213D] tracking-tight">
            Excelente Raciocínio!
          </h2>
          <p className="text-sm font-semibold text-[#2787F5]">
            {title}
          </p>
        </div>

        {/* Pedagogical validation message */}
        <div className="p-4 sm:p-5 bg-[#F8FAFD] border border-[#E2E8F0] rounded-2xl text-left text-xs sm:text-sm leading-relaxed text-[#536178] space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Por que o seu algoritmo venceu:</span>
          </div>
          <p className="font-medium text-[#15213D]">
            {explanation}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => {
              sound.click();
              onRestart();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F8FAFD] hover:bg-slate-100 active:scale-95 text-[#536178] hover:text-[#15213D] text-sm font-semibold rounded-xl border border-[#CBD5E1] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refazer</span>
          </button>

          {hasNextLevel && onNextLevel ? (
            <button
              onClick={() => {
                sound.click();
                onNextLevel();
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2787F5] hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>Próximo Desafio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.click();
                onRestart();
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <span>Concluir e Explorar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
