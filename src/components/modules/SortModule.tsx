import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpDown, 
  Scale, 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  Flame
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { TheoryCard } from '../TheoryCard';
import { VictoryModal } from '../VictoryModal';

interface Chest {
  id: string;
  weight: number;
  label: string;
  color: string;
}

const INITIAL_CHESTS: Chest[] = [
  { id: '1', weight: 45, label: 'Baú Âmbar', color: 'from-amber-600 to-amber-800' },
  { id: '2', weight: 12, label: 'Baú Safira', color: 'from-blue-600 to-blue-800' },
  { id: '3', weight: 68, label: 'Baú Obsidiana', color: 'from-purple-600 to-purple-800' },
  { id: '4', weight: 25, label: 'Baú Esmeralda', color: 'from-emerald-600 to-emerald-800' },
  { id: '5', weight: 8, label: 'Baú Rubi', color: 'from-rose-600 to-rose-800' },
];

export const SortModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  const [chests, setChests] = useState<Chest[]>(INITIAL_CHESTS);

  // Sorting execution state (Bubble Sort Stepper)
  const [iIndex, setIIndex] = useState<number>(0);
  const [jIndex, setJIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [comparisonsCount, setComparisonsCount] = useState<number>(0);
  const [swapsCount, setSwapsCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Clique em "Passo a Passo" ou "Executar" para ver o algoritmo comparar e ordenar cada par.'
  );
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Manual interactive balance scale state
  const [scaleLeft, setScaleLeft] = useState<Chest | null>(null);
  const [scaleRight, setScaleRight] = useState<Chest | null>(null);

  const resetAll = () => {
    setIsRunning(false);
    setIsPaused(false);
    setChests([...INITIAL_CHESTS]);
    setIIndex(0);
    setJIndex(0);
    setComparisonsCount(0);
    setSwapsCount(0);
    setIsSorted(false);
    setScaleLeft(null);
    setScaleRight(null);
    setStatusMessage('Lista desordenada restaurada. Pronto para nova demonstração!');
  };

  const manualSwap = (idxA: number, idxB: number) => {
    if (isRunning) return;
    sound.swap();
    const updated = [...chests];
    const temp = updated[idxA];
    updated[idxA] = updated[idxB];
    updated[idxB] = temp;
    setChests(updated);
    setSwapsCount((prev) => prev + 1);
    checkIfSorted(updated);
  };

  const checkIfSorted = (arr: Chest[]) => {
    const sorted = arr.every((c, idx) => idx === 0 || arr[idx - 1].weight <= c.weight);
    if (sorted && !isSorted) {
      setIsSorted(true);
      sound.success();
      triggerConfetti();
      setShowVictory(true);
      onLevelCompleted(1);
      setStatusMessage('Parabéns! Todos os baús estão perfeitamente ordenados do mais leve para o mais pesado!');
    }
  };

  // Perform 1 bubble sort step
  const stepBubbleSort = (): boolean => {
    const n = chests.length;
    let currentI = iIndex;
    let currentJ = jIndex;

    // Check if entire sort is complete
    if (currentI >= n - 1) {
      setIsRunning(false);
      checkIfSorted(chests);
      return false;
    }

    // Compare chests[currentJ] with chests[currentJ + 1]
    const leftChest = chests[currentJ];
    const rightChest = chests[currentJ + 1];
    setComparisonsCount((prev) => prev + 1);

    const needsSwap = leftChest.weight > rightChest.weight;
    let nextChests = [...chests];

    if (needsSwap) {
      sound.swap();
      nextChests[currentJ] = rightChest;
      nextChests[currentJ + 1] = leftChest;
      setChests(nextChests);
      setSwapsCount((prev) => prev + 1);
      setStatusMessage(
        `Comparando (${leftChest.weight}kg e ${rightChest.weight}kg): ${leftChest.weight}kg é MAIOR que ${rightChest.weight}kg! Trocamos de lugar!`
      );
    } else {
      sound.step();
      setStatusMessage(
        `Comparando (${leftChest.weight}kg e ${rightChest.weight}kg): Já estão na ordem certa (${leftChest.weight}kg ≤ ${rightChest.weight}kg). Mantemos a posição.`
      );
    }

    // Advance indices
    let nextJ = currentJ + 1;
    let nextI = currentI;

    if (nextJ >= n - 1 - currentI) {
      // Reached end of this bubbling pass!
      nextJ = 0;
      nextI = currentI + 1;
      setStatusMessage(
        `Passada ${currentI + 1} concluída! O maior elemento da rodada flutuou até sua posição final correta.`
      );
    }

    setJIndex(nextJ);
    setIIndex(nextI);

    if (nextI >= n - 1) {
      setIsRunning(false);
      checkIfSorted(nextChests);
      return false;
    }

    return true;
  };

  // Auto-run stepper loop
  useEffect(() => {
    if (!isRunning || isPaused || isSorted) return;

    const delay = 800 / speed;
    const timer = setTimeout(() => {
      stepBubbleSort();
    }, delay);

    return () => clearTimeout(timer);
  }, [isRunning, isPaused, iIndex, jIndex, chests, speed, isSorted]);

  return (
    <div className="space-y-6">
      <TheoryCard
        title="Algoritmos de Ordenação"
        subtitle="O Método da Bolha (Bubble Sort)"
        concept="Como o computador coloca milhares de coisas em ordem crescente? Ele não tem olhos para ver tudo de uma vez: ele só consegue comparar dois itens por vez e decidir se precisa trocar a ordem deles."
        analogyTitle="Analogia do Mundo Real:"
        analogyText="Pense em bolhas de ar na água: as bolhas maiores e mais leves sobem rapidamente para a superfície. No Bubble Sort, o elemento mais pesado vai sendo 'empurrado' até o final da fila a cada rodada de trocas!"
        keyTakeaway="Comparando pares vizinhos sucessivamente, qualquer lista desordenada se torna perfeitamente organizada."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Interactive Chests Row & Stepper Stage */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <ArrowUpDown className="w-4 h-4" />
              <span>A Fila dos Baús de Pesos Misteriosos</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
              <span>Comparações: <strong className="text-white">{comparisonsCount}</strong></span>
              <span>Trocas: <strong className="text-amber-400">{swapsCount}</strong></span>
            </div>
          </div>

          {/* Chests Display Visual */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-h-[280px] flex flex-col justify-center">
            <div className="grid grid-cols-5 gap-3">
              {chests.map((chest, idx) => {
                const isCurrentPair = isRunning && (idx === jIndex || idx === jIndex + 1);
                const isLeftOfPair = isRunning && idx === jIndex;
                const isRightOfPair = isRunning && idx === jIndex + 1;
                const isLockedInPlace = idx >= chests.length - iIndex && isSorted;

                return (
                  <div
                    key={chest.id}
                    className={`relative rounded-2xl border-2 p-3 flex flex-col items-center justify-between transition-all duration-300 ${
                      isCurrentPair
                        ? 'border-indigo-400 bg-indigo-950/40 shadow-xl shadow-indigo-500/20 scale-105'
                        : isSorted
                        ? 'border-emerald-500/50 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-900/70'
                    }`}
                  >
                    {/* Index & Pointer indicator */}
                    <span className="text-[10px] text-slate-500 font-mono">
                      Posição {idx + 1}
                    </span>

                    {/* Chest Box Graphic */}
                    <div className="my-auto flex flex-col items-center">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${chest.color} flex items-center justify-center text-2xl shadow-md border border-white/20`}
                      >
                        📦
                      </div>
                      <span className="text-sm font-mono font-bold text-white mt-2 tabular-nums">
                        {chest.weight} kg
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[70px]">
                        {chest.label}
                      </span>
                    </div>

                    {/* Bubble comparison indicator */}
                    {isCurrentPair && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold shadow-md animate-pulse">
                        {isLeftOfPair ? 'Item A' : 'Item B'}
                      </div>
                    )}

                    {/* Swap button between neighbors */}
                    {!isRunning && idx < chests.length - 1 && (
                      <button
                        onClick={() => manualSwap(idx, idx + 1)}
                        title="Trocar com o vizinho da direita"
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-800 hover:bg-indigo-600 border border-slate-700 text-white flex items-center justify-center text-[10px] shadow cursor-pointer transition-transform active:scale-90"
                      >
                        ⇄
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bubble sort pass progress bar */}
            <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Passada atual: <strong className="text-indigo-400 font-mono">{iIndex + 1}</strong> de {chests.length - 1}</span>
              <span className="text-[11px]">
                {isSorted ? '✓ Lista perfeitamente ordenada' : 'Organizando da esquerda para a direita'}
              </span>
            </div>
          </div>

          {/* Real-time Narrative Status Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
            <span>{statusMessage}</span>
          </div>

          {/* Stepper Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.click();
                  if (isRunning) {
                    setIsPaused(true);
                  } else {
                    setIsPaused(false);
                    setIsRunning(true);
                  }
                }}
                disabled={isSorted}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-40"
              >
                {isRunning && !isPaused ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isRunning && !isPaused ? 'Pausar' : 'Executar Algoritmo'}</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  stepBubbleSort();
                }}
                disabled={isRunning || isSorted}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer disabled:opacity-40"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>Comparar Próximo Par</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  resetAll();
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed selection */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    sound.click();
                    setSpeed(s);
                  }}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                    speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Zone: The 2-Pan Balance Scale Lab */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                A Balança de Comparação de 2 Pratos
              </span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              O computador só consegue comparar <strong className="text-slate-200">dois itens por vez</strong>. Escolha dois baús para colocar na balança e ver qual lado desce:
            </p>

            {/* Interactive Scale Graphic */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Left Pan */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Prato Esquerdo</span>
                  <select
                    value={scaleLeft ? scaleLeft.id : ''}
                    onChange={(e) => {
                      sound.click();
                      const found = chests.find((c) => c.id === e.target.value) || null;
                      setScaleLeft(found);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">Selecione um baú...</option>
                    {chests.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.weight}kg)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right Pan */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Prato Direito</span>
                  <select
                    value={scaleRight ? scaleRight.id : ''}
                    onChange={(e) => {
                      sound.click();
                      const found = chests.find((c) => c.id === e.target.value) || null;
                      setScaleRight(found);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">Selecione um baú...</option>
                    {chests.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.weight}kg)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scale Result */}
              {scaleLeft && scaleRight ? (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/40 text-center space-y-1">
                  <div className="text-lg font-bold text-white">
                    {scaleLeft.weight > scaleRight.weight ? (
                      <span>◀ O Prato Esquerdo é MAIOR ({scaleLeft.weight}kg &gt; {scaleRight.weight}kg)</span>
                    ) : scaleLeft.weight < scaleRight.weight ? (
                      <span>▶ O Prato Direito é MAIOR ({scaleLeft.weight}kg &lt; {scaleRight.weight}kg)</span>
                    ) : (
                      <span>= Têm o mesmo peso ({scaleLeft.weight}kg = {scaleRight.weight}kg)</span>
                    )}
                  </div>
                  <span className="text-[11px] text-indigo-300 block">
                    {scaleLeft.weight > scaleRight.weight
                      ? 'No algoritmo de ordenação, estes dois deveriam ser trocados de lugar!'
                      : 'Eles já estão na ordem correta! Nenhuma troca necessária.'}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-xs">
                  Coloque um baú em cada prato para ver o comparador físico funcionar.
                </div>
              )}
            </div>

            {/* Educational insight */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">Por que isso é genial?</span>
                <p>
                  Mesmo sem ter inteligência ou consciência, o computador consegue ordenar 1 milhão de músicas ou preços aplicando repetidamente essa simples regra de balança!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VictoryModal
        isOpen={showVictory}
        title="Todos os Baús Foram Ordenados!"
        explanation="O Algoritmo da Bolha comparou cada par consecutivo e trocou de posição sempre que o item da esquerda era maior. Ao final de todas as passadas, a lista inteira ficou em perfeita ordem crescente!"
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetAll();
        }}
      />
    </div>
  );
};
