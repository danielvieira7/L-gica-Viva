import React, { useState, useEffect } from 'react';
import { 
  ArrowUpDown, 
  Scale, 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  ArrowRightLeft
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ModuleHero } from '../ModuleHero';
import { HintCard } from '../HintCard';
import { LearningInsight } from '../LearningInsight';
import { VictoryModal } from '../VictoryModal';
import { MODULE_THEMES } from '../../designTokens';

interface Chest {
  id: string;
  weight: number;
  label: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

const INITIAL_CHESTS: Chest[] = [
  { id: '1', weight: 45, label: 'Baú Âmbar', color: 'text-amber-700', bgLight: 'bg-amber-50', borderColor: 'border-amber-300' },
  { id: '2', weight: 12, label: 'Baú Safira', color: 'text-blue-700', bgLight: 'bg-blue-50', borderColor: 'border-blue-300' },
  { id: '3', weight: 68, label: 'Baú Ametista', color: 'text-purple-700', bgLight: 'bg-purple-50', borderColor: 'border-purple-300' },
  { id: '4', weight: 25, label: 'Baú Esmeralda', color: 'text-emerald-700', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-300' },
  { id: '5', weight: 8, label: 'Baú Rubi', color: 'text-rose-700', bgLight: 'bg-rose-50', borderColor: 'border-rose-300' },
];

export const SortModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  const [chests, setChests] = useState<Chest[]>(INITIAL_CHESTS);

  // Sorting state (Bubble Sort Stepper)
  const [iIndex, setIIndex] = useState<number>(0);
  const [jIndex, setJIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [comparisonsCount, setComparisonsCount] = useState<number>(0);
  const [swapsCount, setSwapsCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Clique em "Passo a passo" ou "Executar" para ver o algoritmo comparar e ordenar cada par.'
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
    setStatusMessage('Lista restaurada. Pronto para nova demonstração!');
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

  const stepBubbleSort = (): boolean => {
    const n = chests.length;
    let currentI = iIndex;
    let currentJ = jIndex;

    if (currentI >= n - 1) {
      setIsRunning(false);
      checkIfSorted(chests);
      return false;
    }

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

    let nextJ = currentJ + 1;
    let nextI = currentI;

    if (nextJ >= n - 1 - currentI) {
      nextJ = 0;
      nextI = currentI + 1;
      setStatusMessage(
        `Passada ${currentI + 1} concluída! O maior peso desta rodada flutuou até o final da fila.`
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

  useEffect(() => {
    if (!isRunning || isPaused || isSorted) return;

    const delay = 800 / speed;
    const timer = setTimeout(() => {
      stepBubbleSort();
    }, delay);

    return () => clearTimeout(timer);
  }, [isRunning, isPaused, iIndex, jIndex, chests, speed, isSorted]);

  const theme = MODULE_THEMES.sort;

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <ModuleHero
        moduleId="sort"
        title="O Armazém dos Baús e a Ordenação"
        subtitle="Descubra como o computador organiza itens do menor para o maior comparando apenas dois por vez (Método da Bolha)."
        currentLevel={1}
        totalLevels={1}
      />

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chests Row & Stepper Stage (60%) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-7 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-base font-bold text-[#15213D] flex items-center gap-2">
              ⚖️ Fila dos Baús e Comparações
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {comparisonsCount} comparações • {swapsCount} trocas
              </span>
            </div>
          </div>

          {/* Narrative status message */}
          <div className="flex items-center gap-3 bg-[#E1F7F4] border border-[#B0EFE7] rounded-2xl p-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#B0EFE7] flex items-center justify-center text-[#23B6A6] shrink-0 shadow-xs">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#15213D] leading-snug">
              {statusMessage}
            </p>
          </div>

          {/* The Visual Chests Line */}
          <div className="p-5 sm:p-6 bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] shadow-inner flex flex-col justify-center min-h-[260px]">
            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {chests.map((chest, idx) => {
                const isCurrentPair = isRunning && (idx === jIndex || idx === jIndex + 1);
                const isLeftOfPair = isRunning && idx === jIndex;
                const isRightOfPair = isRunning && idx === jIndex + 1;

                return (
                  <div
                    key={chest.id}
                    className={`relative rounded-2xl border-2 p-3 flex flex-col items-center justify-between transition-all duration-300 ${
                      isCurrentPair
                        ? 'border-[#23B6A6] bg-teal-50 ring-4 ring-teal-100 shadow-md scale-102'
                        : isSorted
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#8491A5]">
                      Posição #{idx + 1}
                    </span>

                    {/* Chest Box Graphic */}
                    <div className="my-auto flex flex-col items-center">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${chest.bgLight} border ${chest.borderColor} flex items-center justify-center text-2xl shadow-xs`}>
                        📦
                      </div>
                      <span className="text-sm sm:text-base font-extrabold text-[#15213D] mt-2 tabular-nums">
                        {chest.weight} kg
                      </span>
                      <span className="text-[10px] font-semibold text-[#536178] truncate max-w-[64px]">
                        {chest.label}
                      </span>
                    </div>

                    {/* Comparison badge */}
                    {isCurrentPair && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#23B6A6] text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                        {isLeftOfPair ? 'Item A' : 'Item B'}
                      </div>
                    )}

                    {/* Manual neighbor swap button */}
                    {!isRunning && idx < chests.length - 1 && (
                      <button
                        onClick={() => manualSwap(idx, idx + 1)}
                        title="Trocar manualmente com o vizinho"
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white hover:bg-teal-50 border border-[#CBD5E1] text-[#23B6A6] flex items-center justify-center shadow-xs cursor-pointer transition-transform active:scale-90"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pass Progress */}
            <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#536178]">
              <span>Passada atual: <strong className="text-[#15213D]">{iIndex + 1}</strong> de {chests.length - 1}</span>
              <span className="font-semibold text-teal-700">
                {isSorted ? '✓ Lista perfeitamente organizada!' : 'Comparando da esquerda para a direita'}
              </span>
            </div>
          </div>

          {/* Stepper Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-card-soft">
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
                className="flex items-center gap-2 px-5 py-2.5 bg-[#23B6A6] hover:bg-teal-600 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-teal-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8FAFD] hover:bg-slate-100 active:scale-95 text-[#15213D] text-sm font-semibold rounded-xl border border-[#CBD5E1] transition-all cursor-pointer disabled:opacity-40"
              >
                <StepForward className="w-4 h-4 text-[#536178]" />
                <span>Passo a Passo</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      sound.click();
                      setSpeed(s);
                    }}
                    className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      speed === s
                        ? 'bg-white text-[#15213D] shadow-xs'
                        : 'text-[#8491A5] hover:text-[#536178]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  sound.click();
                  resetAll();
                }}
                title="Reiniciar lista"
                className="p-2.5 bg-[#F8FAFD] hover:bg-slate-100 text-[#536178] hover:text-[#15213D] rounded-xl border border-[#CBD5E1] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Interactive Balance Scale (40%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#15213D] flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" />
                Balança de Dois Pratos Interativa
              </h3>
              <p className="text-xs text-[#536178]">
                Clique nos baús abaixo para colocá-los na balança e testar pesos
              </p>
            </div>

            {/* Visual Balance Scale */}
            <div className="p-4 rounded-2xl bg-[#E1F7F4]/60 border border-[#B0EFE7] space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                {/* Left Pan */}
                <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-teal-800 block mb-1">
                    Prato Esquerdo
                  </span>
                  {scaleLeft ? (
                    <div className="space-y-1">
                      <span className="text-xl">📦</span>
                      <p className="text-xs font-bold text-[#15213D]">{scaleLeft.label}</p>
                      <span className="text-xs font-black text-teal-700">{scaleLeft.weight} kg</span>
                      <button
                        onClick={() => setScaleLeft(null)}
                        className="text-[10px] text-rose-500 hover:underline block mx-auto cursor-pointer"
                      >
                        Retirar
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#8491A5] italic block py-4">Vazio</span>
                  )}
                </div>

                {/* Right Pan */}
                <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-teal-800 block mb-1">
                    Prato Direito
                  </span>
                  {scaleRight ? (
                    <div className="space-y-1">
                      <span className="text-xl">📦</span>
                      <p className="text-xs font-bold text-[#15213D]">{scaleRight.label}</p>
                      <span className="text-xs font-black text-teal-700">{scaleRight.weight} kg</span>
                      <button
                        onClick={() => setScaleRight(null)}
                        className="text-[10px] text-rose-500 hover:underline block mx-auto cursor-pointer"
                      >
                        Retirar
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#8491A5] italic block py-4">Vazio</span>
                  )}
                </div>
              </div>

              {/* Balance Verdict Indicator */}
              <div className="p-3 bg-white rounded-xl border border-teal-200 text-center text-xs font-bold text-[#15213D] shadow-2xs">
                {scaleLeft && scaleRight ? (
                  scaleLeft.weight > scaleRight.weight ? (
                    <span className="text-amber-700">◀ Prato Esquerdo é mais pesado ({scaleLeft.weight}kg &gt; {scaleRight.weight}kg)</span>
                  ) : scaleLeft.weight < scaleRight.weight ? (
                    <span className="text-amber-700">Prato Direito é mais pesado ({scaleLeft.weight}kg &lt; {scaleRight.weight}kg) ▶</span>
                  ) : (
                    <span className="text-teal-700">⚖ Pesos iguais! ({scaleLeft.weight}kg)</span>
                  )
                ) : (
                  <span className="text-[#8491A5] font-normal">Coloque dois baús para verificar a balança</span>
                )}
              </div>
            </div>

            {/* Quick picker chips for scale */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#536178]">Clique em um baú para pesar:</span>
              <div className="flex flex-wrap gap-1.5">
                {chests.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      sound.click();
                      if (!scaleLeft) setScaleLeft(c);
                      else if (!scaleRight) setScaleRight(c);
                      else setScaleLeft(c);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#F8FAFD] hover:bg-teal-50 border border-[#E2E8F0] hover:border-teal-300 text-xs font-bold text-[#15213D] transition-all cursor-pointer shadow-2xs"
                  >
                    {c.label} ({c.weight}kg)
                  </button>
                ))}
              </div>
            </div>

            {/* Hint Card */}
            <HintCard hint="O computador não vê a lista toda de uma vez. Ele compara dois vizinhos, decide se troca, e repete até que nenhuma troca seja necessária!" />
          </div>
        </div>
      </div>

      {/* Pedagogical "Por que isso funciona?" Block */}
      <LearningInsight
        title="Por que o algoritmo da bolha funciona?"
        explanation="O computador só tem um processador que olha dois valores por vez. Comparando pares de vizinhos e empurrando o maior para o final sucessivamente, no final de algumas passadas todos os itens encontram seu lugar exato!"
        analogy="Pense em bolhas de gás subindo num refrigerante: as bolhas maiores e mais leves escapam velozmente para o topo. Aqui, o maior peso flutua até o final a cada passada!"
        accentColor={theme.primary}
        pillars={[
          { title: 'Comparação em Pares', description: 'O computador examina apenas [Item A] e [Item B] a cada instante.' },
          { title: 'Flutuação Garantida', description: 'A cada rodada completa, pelo menos um elemento chega à sua posição definitiva.' },
          { title: 'Critério de Parada', description: 'Se uma passada inteira acontecer sem nenhuma troca, a lista está 100% ordenada!' },
        ]}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictory}
        title="Fila de Baús Ordenada com Sucesso!"
        explanation="Todos os pesos foram colocados em ordem crescente! Você entendeu como algoritmos de ordenação resolvem um problema aparentemente grande dividindo-o em comparações simples de dois em dois."
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetAll();
        }}
      />
    </div>
  );
};
