import React from 'react';
import { Play, Pause, StepForward, RotateCcw, Zap } from 'lucide-react';
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
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
      {/* Play / Step / Reset cluster */}
      <div className="flex items-center gap-2">
        {isRunning && !isPaused ? (
          <button
            onClick={() => {
              sound.click();
              onPause();
            }}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
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
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
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
          title="Avança exatamente 1 comando na visualização"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer disabled:opacity-40"
        >
          <StepForward className="w-3.5 h-3.5" />
          <span>Passo a Passo</span>
        </button>

        <button
          onClick={() => {
            sound.click();
            onReset();
          }}
          title="Reiniciar posição inicial"
          className="p-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-slate-100 rounded-lg border border-slate-700/60 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Speed */}
      <div className="flex items-center gap-3">
        {totalSteps > 0 && (
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            Passo <span className="text-indigo-400 font-bold">{Math.max(0, currentStepIndex + 1)}</span>
            <span className="text-slate-600"> / </span>
            <span>{totalSteps}</span>
          </div>
        )}

        {/* Speed toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.click();
                onSpeedChange(s);
              }}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                speed === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
