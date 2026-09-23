import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Coins, 
  Key, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Plus, 
  Minus, 
  CheckCircle2, 
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { TheoryCard } from '../TheoryCard';
import { VictoryModal } from '../VictoryModal';

interface MemoryBox {
  name: string;
  label: string;
  value: number;
  initialValue: number;
  color: string;
}

export const VariableModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  // Labeled memory boxes (variables)
  const [coinsVar, setCoinsVar] = useState<number>(0);
  const [energyVar, setEnergyVar] = useState<number>(5);
  const [hasPassVar, setHasPassVar] = useState<boolean>(false);

  // Puzzle State
  // Bridge puzzle: Robot needs to collect at least 3 coins, each step costs 1 energy. If coins >= 3 and energy > 0, bridge opens!
  const [robotStep, setRobotStep] = useState<number>(0); // 0 to 4
  const [bridgeLowered, setBridgeLowered] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Veja como os valores mudam dentro das caixas de memória a cada passo.');
  const [showVictory, setShowVictory] = useState<boolean>(false);

  const resetAll = () => {
    setIsRunning(false);
    setRobotStep(0);
    setCoinsVar(0);
    setEnergyVar(5);
    setHasPassVar(false);
    setBridgeLowered(false);
    setStatusText('Memória reiniciada. Valores voltaram ao estado inicial.');
  };

  const executeNextStep = () => {
    if (robotStep >= 4) return;
    const nextStep = robotStep + 1;
    setRobotStep(nextStep);

    // Step actions
    if (nextStep === 1) {
      sound.step();
      setEnergyVar((prev) => prev - 1);
      setStatusText('Passo 1: Robô andou. Caixa [energia] diminuiu de 5 para 4.');
    } else if (nextStep === 2) {
      sound.collect();
      setCoinsVar((prev) => prev + 2); // found 2 coins!
      setEnergyVar((prev) => prev - 1);
      setStatusText('Passo 2: Baú encontrado! Caixa [moedas] aumentou em +2 (agora vale 2).');
    } else if (nextStep === 3) {
      sound.collect();
      setCoinsVar((prev) => prev + 1); // found 1 more coin!
      setEnergyVar((prev) => prev - 1);
      setStatusText('Passo 3: Mais uma moeda encontrada! Caixa [moedas] agora vale 3.');
    } else if (nextStep === 4) {
      // At bridge guard check
      sound.turn();
      const conditionMet = coinsVar + 1 >= 3 && energyVar - 1 >= 0;
      if (conditionMet) {
        sound.success();
        triggerConfetti();
        setBridgeLowered(true);
        setShowVictory(true);
        onLevelCompleted(1);
        setStatusText('O Guardião leu a caixa [moedas] (valor = 3). Requisito cumprido! A ponte baixou!');
      } else {
        sound.failure();
        setStatusText('O Guardião verificou a memória: você não possui moedas suficientes.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <TheoryCard
        title="Memória e Variáveis"
        subtitle="As Caixas com Etiqueta do Computador"
        concept="Computadores têm memória rápida (RAM) onde guardam informações temporárias enquanto o programa roda. Para não se perder, eles colocam cada dado dentro de uma 'caixa' com uma etiqueta chamada Variável."
        analogyTitle="Analogia do Mundo Real:"
        analogyText="Imagine um placar de jogo de futebol: existe a caixinha do Time A e a do Time B. Quando sai um gol, o placar não cria um novo time: ele apenas substitui o número antigo pelo número novo!"
        keyTakeaway="Uma variável tem Nome (a etiqueta), Tipo (número, texto ou sim/não) e Conteúdo (o valor que está lá dentro agora)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Physical Bridge Quest */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Database className="w-4 h-4" />
              <span>O Guardião da Ponte e o Teste de Memória</span>
            </div>
            <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Regra: Abrir ponte se [moedas] ≥ 3
            </span>
          </div>

          {/* Visual Track */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-h-[260px] flex flex-col justify-between">
            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((stepIdx) => {
                const isRobotHere = robotStep === stepIdx;
                const isChest1 = stepIdx === 2;
                const isChest2 = stepIdx === 3;
                const isBridge = stepIdx === 4;

                return (
                  <div
                    key={stepIdx}
                    className={`h-36 rounded-xl border flex flex-col items-center justify-between p-2.5 transition-all relative ${
                      isRobotHere
                        ? 'bg-indigo-950/50 border-indigo-400 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 font-mono">
                      Passo {stepIdx}
                    </span>

                    {/* Content */}
                    <div className="flex flex-col items-center my-auto">
                      {isChest1 && (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{robotStep >= 2 ? '📦' : '💰'}</span>
                          <span className="text-[9px] text-amber-400 font-bold">+2 Moedas</span>
                        </div>
                      )}
                      {isChest2 && (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{robotStep >= 3 ? '📦' : '🪙'}</span>
                          <span className="text-[9px] text-amber-400 font-bold">+1 Moeda</span>
                        </div>
                      )}
                      {isBridge && (
                        <div className="flex flex-col items-center text-center">
                          <span className="text-2xl">{bridgeLowered ? '🌉' : '🛑'}</span>
                          <span className="text-[9px] font-bold text-slate-300">
                            {bridgeLowered ? 'PONTE BAIXADA' : 'GUARDIÃO'}
                          </span>
                        </div>
                      )}
                      {!isChest1 && !isChest2 && !isBridge && (
                        <span className="text-xl opacity-40">🐾</span>
                      )}
                    </div>

                    {/* Robot */}
                    {isRobotHere && (
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-600 border border-indigo-300 text-white text-[9px] font-bold shadow-md">
                        🤖 Robô
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bridge Status Indicator */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Estado da Ponte:</span>
              <span className={`font-bold ${bridgeLowered ? 'text-emerald-400' : 'text-rose-400'}`}>
                {bridgeLowered ? '✓ Aberta e Segura' : '✗ Bloqueada pelo Guardião'}
              </span>
            </div>
          </div>

          {/* Real-time Narrative Status Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
            <span>{statusText}</span>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                sound.click();
                executeNextStep();
              }}
              disabled={robotStep >= 4}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-40"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Avançar 1 Passo no Caminho</span>
            </button>

            <button
              onClick={() => {
                sound.click();
                resetAll();
              }}
              className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Right Zone: Interactive Memory Inspection Lab */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Caixas de Memória em Tempo Real (RAM)
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">VARIÁVEIS VIVAS</span>
            </div>

            {/* Box 1: Moedas */}
            <div className="p-4 rounded-xl bg-amber-950/20 border-2 border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-300">moedas</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tipo: Número</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400">Valor guardado agora:</span>
                <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {coinsVar}
                </span>
              </div>
            </div>

            {/* Box 2: Energia */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border-2 border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-cyan-300">energia</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tipo: Número</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400">Valor guardado agora:</span>
                <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                  {energyVar}
                </span>
              </div>
            </div>

            {/* Interactive Variable Experimenter */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                Laboratório Prático: Altere os Valores
              </span>
              <p className="text-[11px] text-slate-400">
                Você pode testar alterar a caixa <code className="text-amber-300 font-mono">moedas</code> manualmente para ver como a condição reage:
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.click();
                    setCoinsVar((prev) => Math.max(0, prev - 1));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  - 1 Moeda
                </button>
                <button
                  onClick={() => {
                    sound.click();
                    setCoinsVar((prev) => prev + 1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 text-xs font-bold border border-amber-500/50 cursor-pointer"
                >
                  + 1 Moeda
                </button>
              </div>
            </div>

            {/* Educational take */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">O Segredo das Variáveis:</span>
                <p>
                  Quando o robô pega 2 moedas, o computador executa a instrução mental:
                  <code className="text-indigo-300 font-mono block mt-1">moedas = moedas + 2</code>
                  Ou seja: pega o valor que já estava lá, adiciona 2, e guarda o novo total na mesma caixa!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VictoryModal
        isOpen={showVictory}
        title="O Guardião Liberou a Passagem!"
        explanation="O Guardião leu o conteúdo da variável [moedas]. Como o valor era igual ou maior que 3, a condição booleana resultou em VERDADEIRO e a ponte se abaixou. Isso é como todos os jogos do mundo salvam sua pontuação e vidas!"
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetAll();
        }}
      />
    </div>
  );
};
