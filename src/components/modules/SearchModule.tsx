import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Flame,
  Award
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { TheoryCard } from '../TheoryCard';
import { VictoryModal } from '../VictoryModal';

interface Locker {
  id: number;
  value: number;
  isOpened: boolean;
  isEliminated: boolean;
}

const DEFAULT_VALUES = [4, 9, 15, 22, 28, 33, 41, 48, 55, 62, 70, 77, 83, 89, 94, 99];

export const SearchModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  // 16 sorted lockers
  const [lockers, setLockers] = useState<Locker[]>(() =>
    DEFAULT_VALUES.map((val, idx) => ({
      id: idx,
      value: val,
      isOpened: false,
      isEliminated: false,
    }))
  );

  const [targetValue, setTargetValue] = useState<number>(70);
  const [userTries, setUserTries] = useState<number>(0);
  const [binaryLow, setBinaryLow] = useState<number>(0);
  const [binaryHigh, setBinaryHigh] = useState<number>(15);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Encontre o armário que contém o número secreto 70 com o menor número de tentativas!'
  );
  const [foundLocker, setFoundLocker] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Comparison showdown state
  const [showdownRunning, setShowdownRunning] = useState<boolean>(false);
  const [linearStep, setLinearStep] = useState<number>(-1);
  const [binaryStep, setBinaryStep] = useState<number>(-1);
  const [linearCount, setLinearCount] = useState<number>(0);
  const [binaryCount, setBinaryCount] = useState<number>(0);

  const resetGame = (newTarget?: number) => {
    const target = newTarget || DEFAULT_VALUES[Math.floor(Math.random() * DEFAULT_VALUES.length)];
    setTargetValue(target);
    setUserTries(0);
    setBinaryLow(0);
    setBinaryHigh(15);
    setFoundLocker(false);
    setShowdownRunning(false);
    setLinearStep(-1);
    setBinaryStep(-1);
    setLinearCount(0);
    setBinaryCount(0);
    setLockers(
      DEFAULT_VALUES.map((val, idx) => ({
        id: idx,
        value: val,
        isOpened: false,
        isEliminated: false,
      }))
    );
    setStatusMessage(`Novo número secreto: ${target}! Tente achar usando a estratégia de cortar ao meio.`);
  };

  const handleOpenLocker = (index: number) => {
    if (foundLocker || lockers[index].isOpened) return;

    sound.turn();
    const val = lockers[index].value;
    const nextTries = userTries + 1;
    setUserTries(nextTries);

    const updated = [...lockers];
    updated[index].isOpened = true;

    if (val === targetValue) {
      sound.success();
      triggerConfetti();
      setFoundLocker(true);
      setShowVictory(true);
      onLevelCompleted(1);
      setStatusMessage(`Sensacional! Você encontrou o número secreto ${targetValue} em apenas ${nextTries} tentativas!`);
    } else if (val < targetValue) {
      sound.step();
      // Target is higher! Can eliminate all to the left
      for (let i = 0; i <= index; i++) {
        updated[i].isEliminated = true;
      }
      setStatusMessage(`O armário #${index + 1} contém ${val}. É MENOR que ${targetValue}! O segredo está à DIREITA.`);
    } else {
      sound.step();
      // Target is lower! Can eliminate all to the right
      for (let i = index; i < updated.length; i++) {
        updated[i].isEliminated = true;
      }
      setStatusMessage(`O armário #${index + 1} contém ${val}. É MAIOR que ${targetValue}! O segredo está à ESQUERDA.`);
    }

    setLockers(updated);
  };

  // Run the automated showdown comparison
  const runShowdown = async () => {
    setShowdownRunning(true);
    let lCount = 0;
    let bCount = 0;

    // Linear search step by step
    for (let i = 0; i < DEFAULT_VALUES.length; i++) {
      lCount++;
      setLinearStep(i);
      setLinearCount(lCount);
      sound.step();
      await new Promise((r) => setTimeout(r, 250));
      if (DEFAULT_VALUES[i] === targetValue) {
        break;
      }
    }

    // Binary search step by step
    let low = 0;
    let high = DEFAULT_VALUES.length - 1;
    while (low <= high) {
      bCount++;
      const mid = Math.floor((low + high) / 2);
      setBinaryStep(mid);
      setBinaryCount(bCount);
      sound.turn();
      await new Promise((r) => setTimeout(r, 600));

      if (DEFAULT_VALUES[mid] === targetValue) {
        sound.success();
        break;
      } else if (DEFAULT_VALUES[mid] < targetValue) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    setShowdownRunning(false);
  };

  return (
    <div className="space-y-6">
      <TheoryCard
        title="Algoritmos de Busca"
        subtitle="Busca Linear vs. Busca Binária"
        concept="Se você precisa encontrar uma palavra num dicionário com 10.000 páginas, você folheia página por página (Busca Linear) ou abre o livro no meio e decide se vai para a esquerda ou direita (Busca Binária)?"
        analogyTitle="Analogia do Mundo Real:"
        analogyText="No jogo de adivinhar um número entre 1 e 100: se seu amigo diz 'é mais alto que 50', você acabou de descartar 50 números de uma só vez! Essa é a essência da Busca Binária."
        keyTakeaway="A Busca Binária só funciona se os dados estiverem em ordem (ordenados). Em troca, ela corta o trabalho pela metade a cada passo!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: The 16 Lockers Sandbox */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Search className="w-4 h-4" />
              <span>O Cofre dos 16 Armários Ordenados</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded font-mono font-bold">
                Número Secreto: {targetValue}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Tentativas: <strong className="text-white">{userTries}</strong>
              </span>
            </div>
          </div>

          {/* Lockers Grid */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-h-[280px] flex flex-col justify-center">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {lockers.map((locker, idx) => {
                const isTarget = locker.value === targetValue;
                return (
                  <button
                    key={locker.id}
                    onClick={() => handleOpenLocker(idx)}
                    disabled={foundLocker || locker.isOpened}
                    className={`relative h-24 rounded-xl border-2 flex flex-col items-center justify-between p-2 transition-all duration-200 cursor-pointer ${
                      locker.isOpened
                        ? isTarget
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105'
                          : 'bg-slate-800/90 border-slate-700'
                        : locker.isEliminated
                        ? 'bg-slate-950 border-slate-800/40 opacity-30 grayscale'
                        : 'bg-slate-900 hover:bg-slate-800/90 border-slate-700 hover:border-indigo-500 active:scale-95'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{idx + 1}
                    </span>

                    <div className="my-auto flex flex-col items-center">
                      {locker.isOpened ? (
                        <>
                          <span className="text-lg">{isTarget ? '👑' : '📄'}</span>
                          <span className="text-xs font-mono font-bold text-white mt-1">
                            {locker.value}
                          </span>
                        </>
                      ) : locker.isEliminated ? (
                        <span className="text-xs text-rose-500 font-bold">✗</span>
                      ) : (
                        <span className="text-xl">🚪</span>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-500 font-medium">
                      {locker.isOpened ? (isTarget ? 'ACHOU!' : 'VISTO') : 'ABRIR'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Narrative Status Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
            <span>{statusMessage}</span>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                sound.click();
                runShowdown();
              }}
              disabled={showdownRunning}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-40"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Simulação: Linear vs. Binária</span>
            </button>

            <button
              onClick={() => {
                sound.click();
                resetGame();
              }}
              className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sortear Novo Número</span>
            </button>
          </div>
        </div>

        {/* Right Zone: Educational Comparison Deck */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                O Duelo das Estratégias
              </span>
              <span className="text-[10px] text-amber-400 font-mono">EFICIÊNCIA</span>
            </div>

            {/* Showdown meters */}
            <div className="space-y-3">
              {/* Strategy A: Linear Search */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-300">1. Busca Linear (Olhar um por um)</span>
                  <span className="font-mono text-slate-400">{linearCount} passos</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${(linearCount / 16) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  No pior caso, se o item for o último da lista, o computador terá que olhar todos os 16 armários!
                </p>
              </div>

              {/* Strategy B: Binary Search */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">2. Busca Binária (Cortar pelo meio)</span>
                  <span className="font-mono text-emerald-400 font-bold">{binaryCount} passos</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(binaryCount / 4) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-indigo-300 leading-tight">
                  Em 16 armários, NUNCA precisará de mais de 4 passos! (2⁴ = 16). É matematicamente infalível.
                </p>
              </div>
            </div>

            {/* Mind-Blowing Scale Table */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block text-[11px]">
                Veja a diferença em listas gigantescas:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Itens</span>
                  <span className="text-slate-300 font-bold">1.000</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-rose-400 block">Linear</span>
                  <span className="text-white font-bold">1.000</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-indigo-500/40">
                  <span className="text-emerald-400 block">Binária</span>
                  <span className="text-emerald-300 font-bold">10</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Itens</span>
                  <span className="text-slate-300 font-bold">1.000.000</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-rose-400 block">Linear</span>
                  <span className="text-white font-bold">1.000.000</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-indigo-500/40">
                  <span className="text-emerald-400 block">Binária</span>
                  <span className="text-emerald-300 font-bold">20</span>
                </div>
              </div>
            </div>

            {/* Hint */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">Dica para o Jogo:</span>
                <p>
                  Sempre clique no armário que está exatamente na metade dos que sobraram. Você cortará metade dos candidatos de uma só vez!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VictoryModal
        isOpen={showVictory}
        title="Número Secreto Encontrado!"
        explanation={`Você encontrou o número ${targetValue} em ${userTries} tentativas. Cada vez que você abriu um armário e viu se era maior ou menor, você descartou uma seção inteira da estante! Esse é o segredo dos mecanismos de busca como o Google para encontrar respostas em milissegundos.`}
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetGame();
        }}
      />
    </div>
  );
};
