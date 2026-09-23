import React, { useState, useEffect, useRef } from 'react';
import { 
  Repeat, 
  Sparkles, 
  Sprout, 
  Droplet, 
  ArrowUp, 
  RotateCw, 
  Trash2, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ActionType, ActionBlock, GridPos, Direction } from '../../types';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ExecutionControls } from '../ExecutionControls';
import { TheoryCard } from '../TheoryCard';
import { VictoryModal } from '../VictoryModal';

interface PlotCell {
  x: number;
  y: number;
  state: 'soil' | 'seeded' | 'bloomed';
}

export const LoopModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  const [level, setLevel] = useState<1 | 2>(1);

  // Level configuration
  // Level 1: 5 plots in a straight line
  // Max blocks allowed: 4! (User must use a loop block with repeat 5)
  const maxAllowedBlocks = level === 1 ? 4 : 5;

  // Program with loop
  // The loop encapsulates a body of actions
  const [loopIterations, setLoopIterations] = useState<number>(5);
  const [loopBody, setLoopBody] = useState<ActionType[]>(['plant', 'water', 'forward']);

  // Execution state
  const [robotPos, setRobotPos] = useState<GridPos>({ x: 0, y: 0 });
  const [plots, setPlots] = useState<PlotCell[]>([
    { x: 0, y: 0, state: 'soil' },
    { x: 1, y: 0, state: 'soil' },
    { x: 2, y: 0, state: 'soil' },
    { x: 3, y: 0, state: 'soil' },
    { x: 4, y: 0, state: 'soil' },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLoopIteration, setCurrentLoopIteration] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState<string>('Configure o laço de repetição e clique em Executar.');
  const [speed, setSpeed] = useState<number>(1);
  const [showVictory, setShowVictory] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetState = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentLoopIteration(0);
    setCurrentSubStepIndex(-1);
    setRobotPos({ x: 0, y: 0 });
    setPlots([
      { x: 0, y: 0, state: 'soil' },
      { x: 1, y: 0, state: 'soil' },
      { x: 2, y: 0, state: 'soil' },
      { x: 3, y: 0, state: 'soil' },
      { x: 4, y: 0, state: 'soil' },
    ]);
    setStatusMessage('Canteiro reiniciado. Pronto para semear!');
  };

  useEffect(() => {
    resetState();
  }, [level]);

  const addActionToBody = (action: ActionType) => {
    if (isRunning) return;
    if (loopBody.length >= 4) {
      sound.failure();
      setStatusMessage('Máximo de 4 comandos dentro deste laço.');
      return;
    }
    sound.click();
    setLoopBody((prev) => [...prev, action]);
  };

  const removeActionFromBody = (idx: number) => {
    if (isRunning) return;
    sound.remove();
    setLoopBody((prev) => prev.filter((_, i) => i !== idx));
  };

  // Step execution through the loop
  const executeStep = (iter: number, subIdx: number) => {
    if (subIdx >= loopBody.length) {
      // Move to next iteration
      const nextIter = iter + 1;
      if (nextIter >= loopIterations) {
        // Loop finished!
        setIsRunning(false);
        checkCompletion();
        return;
      } else {
        setCurrentLoopIteration(nextIter);
        setCurrentSubStepIndex(0);
        executeAction(loopBody[0], nextIter, 0);
        return;
      }
    }

    executeAction(loopBody[subIdx], iter, subIdx);
  };

  const executeAction = (action: ActionType, iter: number, subIdx: number) => {
    setCurrentLoopIteration(iter);
    setCurrentSubStepIndex(subIdx);

    switch (action) {
      case 'forward': {
        sound.step();
        setRobotPos((prev) => {
          const nextX = Math.min(4, prev.x + 1);
          return { ...prev, x: nextX };
        });
        setStatusMessage(`Volta ${iter + 1}/${loopIterations} (Passo ${subIdx + 1}): Robô avançou para o próximo canteiro.`);
        break;
      }

      case 'plant': {
        sound.collect();
        setPlots((prev) =>
          prev.map((p) => {
            if (p.x === robotPos.x && p.y === robotPos.y) {
              return { ...p, state: p.state === 'soil' ? 'seeded' : p.state };
            }
            return p;
          })
        );
        setStatusMessage(`Volta ${iter + 1}/${loopIterations} (Passo ${subIdx + 1}): Semente plantada na terra!`);
        break;
      }

      case 'water': {
        sound.turn();
        setPlots((prev) =>
          prev.map((p) => {
            if (p.x === robotPos.x && p.y === robotPos.y) {
              return { ...p, state: p.state === 'seeded' ? 'bloomed' : p.state };
            }
            return p;
          })
        );
        setStatusMessage(`Volta ${iter + 1}/${loopIterations} (Passo ${subIdx + 1}): Água aplicada! A planta floresceu!`);
        break;
      }

      default:
        break;
    }
  };

  const checkCompletion = () => {
    const allBloomed = plots.every((p) => p.state === 'bloomed');
    if (allBloomed) {
      sound.success();
      triggerConfetti();
      setShowVictory(true);
      onLevelCompleted(level);
      setStatusMessage('Sucesso maravilhoso! Todas as 5 plantas cresceram usando pouquíssimas instruções!');
    } else {
      setStatusMessage('O laço terminou, mas algumas plantas não floresceram. Confira se você plantou E regou antes de avançar!');
    }
  };

  // Continuous execution
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const delay = 650 / speed;
    timerRef.current = setTimeout(() => {
      const nextSub = currentSubStepIndex + 1;
      executeStep(currentLoopIteration, nextSub);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, isPaused, currentLoopIteration, currentSubStepIndex, speed, loopBody, loopIterations, robotPos]);

  const handleStartPlay = () => {
    if (loopBody.length === 0) return;
    if (currentLoopIteration >= loopIterations - 1 && currentSubStepIndex >= loopBody.length - 1) {
      resetState();
    }
    setIsPaused(false);
    setIsRunning(true);
  };

  const handleStepForward = () => {
    if (loopBody.length === 0) return;
    const nextSub = currentSubStepIndex + 1;
    executeStep(currentLoopIteration, nextSub);
  };

  // Equivalent non-loop block count:
  const equivalentWithoutLoop = loopIterations * loopBody.length;

  return (
    <div className="space-y-6">
      <TheoryCard
        title="Repetições e Laços (Loops)"
        subtitle="Como evitar escrever 100 vezes o mesmo comando"
        concept="Na programação, nós não escrevemos a mesma instrução dezenas de vezes. Usamos Laços (Loops) para ordenar ao computador: 'Repita este bloco de instruções X vezes'!"
        analogyTitle="Analogia do Mundo Real:"
        analogyText="Quando você escova os dentes, ninguém diz 'escove para cima, escove para baixo, escove para cima, escove para baixo...' 50 vezes. Dizemos: 'Repita os movimentos de escovação por 2 minutos'."
        keyTakeaway="Loops economizam memória, evitam erros humanos de cópia e tornam o algoritmo elegante e poderoso."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: The Garden Visual Stage */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>A Estufa Automatizada do Fazendeiro</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Florescidas:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {plots.filter((p) => p.state === 'bloomed').length} / 5
              </span>
            </div>
          </div>

          {/* Visual Garden Bed */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-h-[260px] flex flex-col justify-center items-center">
            {/* The 5 plots in horizontal row */}
            <div className="grid grid-cols-5 gap-3 w-full max-w-xl">
              {plots.map((plot) => {
                const isRobotHere = robotPos.x === plot.x;
                return (
                  <div
                    key={plot.x}
                    className={`relative h-28 rounded-2xl border-2 flex flex-col items-center justify-between p-2.5 transition-all duration-300 ${
                      plot.state === 'bloomed'
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/20'
                        : plot.state === 'seeded'
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-stone-900/70 border-stone-700/60'
                    }`}
                  >
                    {/* Position index */}
                    <span className="text-[10px] text-slate-500 font-mono self-start">
                      Canteiro #{plot.x + 1}
                    </span>

                    {/* Plot plant graphic */}
                    <div className="my-auto flex flex-col items-center transition-transform">
                      {plot.state === 'bloomed' ? (
                        <div className="flex flex-col items-center animate-bounce">
                          <span className="text-3xl">🌻</span>
                          <span className="text-[9px] font-bold text-emerald-300 mt-1">FLORIDA</span>
                        </div>
                      ) : plot.state === 'seeded' ? (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">🌱</span>
                          <span className="text-[9px] font-bold text-amber-300 mt-1">SEMENTE</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center opacity-60">
                          <span className="text-2xl">🟫</span>
                          <span className="text-[9px] text-stone-400 mt-1">TERRA</span>
                        </div>
                      )}
                    </div>

                    {/* Robot visitor */}
                    {isRobotHere && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <div className="px-2 py-0.5 rounded-full bg-indigo-600 border border-indigo-300 text-white text-[10px] font-bold flex items-center gap-1 shadow-md animate-pulse">
                          <span>🤖</span> Robô
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Narrative Status Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 font-mono">
            <span className="truncate">{statusMessage}</span>
            <div className="text-indigo-400 font-bold shrink-0">
              Iteração: {currentLoopIteration + 1} / {loopIterations}
            </div>
          </div>

          {/* Execution Controls */}
          <ExecutionControls
            isRunning={isRunning}
            isPaused={isPaused}
            currentStepIndex={currentLoopIteration * loopBody.length + currentSubStepIndex}
            totalSteps={loopIterations * loopBody.length}
            speed={speed}
            onPlay={handleStartPlay}
            onPause={() => setIsPaused(true)}
            onStepForward={handleStepForward}
            onReset={resetState}
            onSpeedChange={setSpeed}
          />
        </div>

        {/* Right Zone: The Loop Block Assembler */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Montador do Laço de Repetição
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">ECONOMIA DE CÓDIGO</span>
            </div>

            {/* Loop Container Visual */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border-2 border-indigo-500/50 space-y-3 relative">
              {/* Loop Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Repeat className="w-4 h-4 text-indigo-400" />
                  <span>REPITA</span>
                </div>

                {/* Iterations selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                  <select
                    value={loopIterations}
                    onChange={(e) => {
                      sound.click();
                      setLoopIterations(Number(e.target.value));
                    }}
                    disabled={isRunning}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num} className="bg-slate-900">
                        {num}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 font-semibold">VEZES:</span>
                </div>
              </div>

              {/* Loop body slots (the actions repeated) */}
              <div className="ml-3 pl-3 border-l-2 border-indigo-500/40 space-y-2 py-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
                  Ações Repetidas a Cada Volta:
                </span>

                {loopBody.map((action, idx) => {
                  const isCurrentSub = isRunning && currentSubStepIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                        isCurrentSub
                          ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-md translate-x-1'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-700 text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-medium">
                          {action === 'plant' && '🌱 Plantar Semente'}
                          {action === 'water' && '💧 Regar Canteiro'}
                          {action === 'forward' && '➡️ Avançar 1 Canteiro'}
                        </span>
                      </div>

                      <button
                        onClick={() => removeActionFromBody(idx)}
                        disabled={isRunning}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {loopBody.length === 0 && (
                  <p className="text-xs text-rose-300 italic">O corpo do laço está vazio! Adicione ações abaixo.</p>
                )}
              </div>

              <div className="text-[10px] text-indigo-400 font-mono text-right">
                ↺ Fim do laço (retorna ao topo)
              </div>
            </div>

            {/* Quick action buttons to insert into loop body */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Adicionar ação ao laço:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => addActionToBody('plant')}
                  disabled={isRunning}
                  className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-medium text-center cursor-pointer disabled:opacity-40"
                >
                  🌱 Plantar
                </button>
                <button
                  onClick={() => addActionToBody('water')}
                  disabled={isRunning}
                  className="p-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 font-medium text-center cursor-pointer disabled:opacity-40"
                >
                  💧 Regar
                </button>
                <button
                  onClick={() => addActionToBody('forward')}
                  disabled={isRunning}
                  className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-medium text-center cursor-pointer disabled:opacity-40"
                >
                  ➡️ Avançar
                </button>
              </div>
            </div>

            {/* Algorithmic Efficiency Comparison Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  Poder do Laço:
                </span>
                <span className="font-mono text-emerald-400">
                  {loopBody.length + 1} blocos usados
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sem o laço de repetição, você teria que arrastar manualmente{' '}
                <span className="text-white font-bold">{equivalentWithoutLoop}</span> blocos individuais na sequência!
              </p>
            </div>
          </div>
        </div>
      </div>

      <VictoryModal
        isOpen={showVictory}
        title="Colheita Automatizada Perfeita!"
        explanation="Você usou um Laço de Repetição! O computador repetiu o trio de ações (Plantar, Regar, Avançar) para todos os canteiros, economizando muito esforço e tornando a lógica imbatível."
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetState();
        }}
      />
    </div>
  );
};
