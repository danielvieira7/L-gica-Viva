import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Lock, 
  Unlock,
  CheckCircle2,
  Swords
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ModuleHero } from '../ModuleHero';
import { HintCard } from '../HintCard';
import { LearningInsight } from '../LearningInsight';
import { VictoryModal } from '../VictoryModal';
import { MODULE_THEMES } from '../../designTokens';

interface Locker {
  id: number;
  value: number;
  isOpened: boolean;
  isEliminated: boolean;
}

const DEFAULT_VALUES = [4, 9, 15, 22, 28, 33, 41, 48, 55, 62, 70, 77, 83, 89, 94, 99];

export const SearchModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
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
  const [statusMessage, setStatusMessage] = useState<string>(
    'Encontre o armário que guarda o número 70 com o menor número de palpites possível!'
  );
  const [foundLocker, setFoundLocker] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Showdown state
  const [showdownRunning, setShowdownRunning] = useState<boolean>(false);
  const [linearStep, setLinearStep] = useState<number>(-1);
  const [binaryStep, setBinaryStep] = useState<number>(-1);
  const [linearCount, setLinearCount] = useState<number>(0);
  const [binaryCount, setBinaryCount] = useState<number>(0);

  const resetGame = (newTarget?: number) => {
    const target = newTarget || DEFAULT_VALUES[Math.floor(Math.random() * DEFAULT_VALUES.length)];
    setTargetValue(target);
    setUserTries(0);
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
    setStatusMessage(`Novo número secreto: ${target}! Dica: comece abrindo o armário do meio!`);
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
      setStatusMessage(`Fantástico! Você localizou o número secreto ${targetValue} em apenas ${nextTries} palpites! ✨`);
    } else if (val < targetValue) {
      sound.step();
      for (let i = 0; i <= index; i++) {
        updated[i].isEliminated = true;
      }
      setStatusMessage(`Armário #${index + 1} guarda ${val}. É MENOR que ${targetValue}! Eliminamos a metade esquerda.`);
    } else {
      sound.step();
      for (let i = index; i < updated.length; i++) {
        updated[i].isEliminated = true;
      }
      setStatusMessage(`Armário #${index + 1} guarda ${val}. É MAIOR que ${targetValue}! Eliminamos a metade direita.`);
    }

    setLockers(updated);
  };

  const runShowdown = async () => {
    setShowdownRunning(true);
    let lCount = 0;
    let bCount = 0;

    // Linear search step
    for (let i = 0; i < DEFAULT_VALUES.length; i++) {
      lCount++;
      setLinearStep(i);
      setLinearCount(lCount);
      sound.step();
      await new Promise((r) => setTimeout(r, 220));
      if (DEFAULT_VALUES[i] === targetValue) {
        break;
      }
    }

    // Binary search step
    let low = 0;
    let high = DEFAULT_VALUES.length - 1;
    while (low <= high) {
      bCount++;
      const mid = Math.floor((low + high) / 2);
      setBinaryStep(mid);
      setBinaryCount(bCount);
      sound.turn();
      await new Promise((r) => setTimeout(r, 450));

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

  const theme = MODULE_THEMES.search;

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <ModuleHero
        moduleId="search"
        title="O Cofre dos 16 Armários e a Busca Binária"
        subtitle="Entenda como a estratégia de 'Dividir para Conquistar' localiza qualquer dado em pouquíssimos passos."
        currentLevel={1}
        totalLevels={1}
      />

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: The Lockers Grid (60%) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-7 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-base font-bold text-[#15213D] flex items-center gap-2">
              🔐 16 Armários Ordenados
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                Alvo Secreto: <strong className="text-pink-900 text-sm">{targetValue}</strong>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-[#536178]">
                {userTries} {userTries === 1 ? 'tentativa' : 'tentativas'}
              </span>
            </div>
          </div>

          {/* Narrative status message */}
          <div className="flex items-center gap-3 bg-[#FCE8F1] border border-[#F8BFD8] rounded-2xl p-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#F8BFD8] flex items-center justify-center text-[#E94E8B] shrink-0 shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#15213D] leading-snug">
              {statusMessage}
            </p>
          </div>

          {/* 16 Lockers Grid (4x4) */}
          <div className="p-5 sm:p-6 bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] shadow-inner">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {lockers.map((locker, idx) => {
                const isTarget = locker.isOpened && locker.value === targetValue;

                return (
                  <button
                    key={locker.id}
                    onClick={() => handleOpenLocker(idx)}
                    disabled={foundLocker || locker.isOpened || showdownRunning}
                    className={`h-24 rounded-2xl border-2 p-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                      isTarget
                        ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-200 shadow-md scale-105'
                        : locker.isOpened
                        ? 'bg-amber-50 border-amber-300'
                        : locker.isEliminated
                        ? 'bg-slate-100 border-slate-200 opacity-40 hover:opacity-60'
                        : 'bg-white border-[#E2E8F0] hover:border-pink-300 hover:shadow-xs active:scale-95'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#8491A5]">
                      #{idx + 1}
                    </span>

                    {/* Locker Icon / Value */}
                    <div className="my-auto flex flex-col items-center">
                      {locker.isOpened ? (
                        <>
                          <span className={`text-base font-extrabold tabular-nums ${
                            isTarget ? 'text-emerald-700' : 'text-amber-800'
                          }`}>
                            {locker.value}
                          </span>
                          <span className="text-[9px] font-bold text-[#536178]">
                            {isTarget ? 'ALVO!' : locker.value < targetValue ? '< 70' : '> 70'}
                          </span>
                        </>
                      ) : locker.isEliminated ? (
                        <span className="text-lg opacity-40 select-none">❌</span>
                      ) : (
                        <Lock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <span className="text-[9px] font-medium text-[#8491A5]">
                      {locker.isOpened ? 'Aberto' : locker.isEliminated ? 'Fora' : 'Ver'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Controls Bar */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-card-soft">
            <button
              onClick={() => {
                sound.click();
                resetGame();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E94E8B] hover:bg-pink-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Novo Número Secreto</span>
            </button>

            <button
              onClick={() => {
                sound.click();
                resetGame(targetValue);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8FAFD] hover:bg-slate-100 text-[#536178] hover:text-[#15213D] text-xs font-semibold rounded-xl border border-[#CBD5E1] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Tentativas</span>
            </button>
          </div>
        </div>

        {/* Right: Showdown Race (40%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#15213D] flex items-center gap-2">
                <Swords className="w-4 h-4 text-pink-600" />
                Duelo: Busca Linear vs Binária
              </h3>
              <p className="text-xs text-[#536178]">
                Compare o tempo de busca olhando um a um vs cortando ao meio
              </p>
            </div>

            {/* Linear Search Bar */}
            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#15213D]">1. Busca Linear (Um por Um)</span>
                <span className="font-extrabold text-slate-700 font-mono">
                  {linearCount} passos
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-500 transition-all duration-200"
                  style={{ width: `${(linearCount / DEFAULT_VALUES.length) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-[#8491A5] block">
                No pior caso, testa todos os 16 armários (ou 1 milhão se houvesse 1 milhão!).
              </span>
            </div>

            {/* Binary Search Bar */}
            <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pink-900">2. Busca Binária (Corte ao Meio)</span>
                <span className="font-extrabold text-pink-700 font-mono">
                  {binaryCount} passos
                </span>
              </div>
              <div className="w-full h-3 bg-pink-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#E94E8B] transition-all duration-200"
                  style={{ width: `${(binaryCount / 4) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-pink-800 font-semibold block">
                Garante achar qualquer número entre 16 itens em no máximo 4 perguntas!
              </span>
            </div>

            {/* Showdown Trigger Button */}
            <button
              onClick={() => {
                sound.click();
                runShowdown();
              }}
              disabled={showdownRunning}
              className="w-full py-3 px-4 rounded-xl bg-[#2787F5] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{showdownRunning ? 'Simulando Corrida...' : 'Iniciar Corrida de Algoritmos'}</span>
            </button>

            {/* Hint Card */}
            <HintCard hint="Se o armário do meio for menor que o número secreto, descarte toda a metade esquerda! Isso economiza metade do trabalho a cada palpite." />
          </div>
        </div>
      </div>

      {/* Pedagogical "Por que isso funciona?" Block */}
      <LearningInsight
        title="Por que a busca binária é tão incrivelmente rápida?"
        explanation="Quando você procura uma palavra no dicionário físico, você não lê a partir da letra A folha por folha! Você abre direto no meio. Se caiu no 'M' e sua palavra começa com 'S', você ignora metade do livro na hora!"
        analogy="Pense no jogo de adivinhar um número de 1 a 100: se você perguntar 'É 50?' e a resposta for 'Maior', você acabou de eliminar 50 números com uma única pergunta!"
        accentColor={theme.primary}
        pillars={[
          { title: 'Requisito Sagrado', description: 'A lista precisa estar previamente em ordem crescente ou alfabética.' },
          { title: 'Divisão Exponencial', description: '16 itens viram 8, depois 4, depois 2, depois 1. Máximo de 4 passos!' },
          { title: 'Superpoder em Escala', description: 'Em uma lista de 1 bilhão de itens, a busca binária precisa de apenas 30 palpites!' },
        ]}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictory}
        title="Número Secreto Localizado!"
        explanation="Você experimentou o poder de cortar pela metade o espaço de busca! Com esse método, o Google e os bancos de dados encontram registros no meio de bilhões em frações de segundo."
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetGame();
        }}
      />
    </div>
  );
};
