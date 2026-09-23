import React from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

interface ExecutionControlsProps {
  isRunning: boolean;
  isPaused?: boolean;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
  primaryColor?: string;
}

export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  isRunning,
  isPaused,
  currentStepIndex,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onReset,
  onSpeedChange,
  disabled = false,
  primaryColor = '#2787F5',
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-card-soft">
      {/* Play / Step / Reset cluster */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {isRunning && !isPaused ? (
          <button
            onClick={() => {
              sound.click();
              onPause();
            }}
            disabled={disabled}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pausar</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sound.click();
              onPlay();
            }}
            disabled={disabled || totalSteps === 0}
            className="flex items-center gap-2 px-5 py-2.5 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: disabled || totalSteps === 0 ? '#94A3B8' : primaryColor,
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPaused ? 'Continuar' : 'Executar'}</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.click();
            onStepForward();
          }}
          disabled={disabled || totalSteps === 0}
          title="Executa exatamente 1 comando para você acompanhar a lógica"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F8FAFD] hover:bg-slate-100 active:scale-95 text-[#15213D] text-sm font-semibold rounded-xl border border-[#CBD5E1] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <StepForward className="w-4 h-4 text-[#536178]" />
          <span className="hidden sm:inline">Passo a passo</span>
          <span className="sm:hidden">Passo</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            onReset();
          }}
          title="Reiniciar posição inicial do teste"
          aria-label="Reiniciar teste"
          className="p-2.5 bg-[#F8FAFD] hover:bg-slate-100 active:scale-95 text-[#536178] hover:text-[#15213D] rounded-xl border border-[#CBD5E1] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Speed Group */}
      <div className="flex items-center gap-3">
        {totalSteps > 0 && (
          <div className="text-xs text-[#536178] font-medium bg-[#F8FAFD] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
            Passo <strong className="text-[#15213D]">{Math.max(0, currentStepIndex + 1)}</strong> de <strong>{totalSteps}</strong>
          </div>
        )}

        {/* Speed toggle pills */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.click();
                onSpeedChange(s);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                speed === s
                  ? 'bg-white text-[#15213D] shadow-xs'
                  : 'text-[#8491A5] hover:text-[#536178]'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
