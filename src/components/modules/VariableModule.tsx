import React, { useState } from 'react';
import { 
  Box, 
  Coins, 
  Zap, 
  RotateCcw, 
  Plus, 
  Minus, 
  ArrowRight,
  Database,
  ShieldCheck,
  Lock,
  Unlock,
  Bot
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ModuleHero } from '../ModuleHero';
import { HintCard } from '../HintCard';
import { LearningInsight } from '../LearningInsight';
import { VictoryModal } from '../VictoryModal';
import { MODULE_THEMES } from '../../designTokens';

export const VariableModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  // Labeled memory boxes (variables)
  const [coinsVar, setCoinsVar] = useState<number>(0);
  const [energyVar, setEnergyVar] = useState<number>(5);

  // Quest State
  const [robotStep, setRobotStep] = useState<number>(0); // 0 to 4
  const [bridgeLowered, setBridgeLowered] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Veja como os valores mudam dentro das caixas de memória a cada passo.');
  const [showVictory, setShowVictory] = useState<boolean>(false);

  const resetAll = () => {
    setRobotStep(0);
    setCoinsVar(0);
    setEnergyVar(5);
    setBridgeLowered(false);
    setStatusText('Memória reiniciada. Os valores voltaram ao estado inicial.');
  };

  const executeNextStep = () => {
    if (robotStep >= 4) return;
    const nextStep = robotStep + 1;
    setRobotStep(nextStep);

    if (nextStep === 1) {
      sound.step();
      setEnergyVar((prev) => Math.max(0, prev - 1));
      setStatusText('Passo 1: O robô caminhou. A caixa [energia] diminuiu de 5 para 4.');
    } else if (nextStep === 2) {
      sound.collect();
      setCoinsVar((prev) => prev + 2);
      setEnergyVar((prev) => Math.max(0, prev - 1));
      setStatusText('Passo 2: Baú de tesouro! A caixa [moedas] somou +2 moedas.');
    } else if (nextStep === 3) {
      sound.collect();
      setCoinsVar((prev) => prev + 1);
      setEnergyVar((prev) => Math.max(0, prev - 1));
      setStatusText('Passo 3: Mais uma moeda coletada! A caixa [moedas] agora guarda 3 moedas.');
    } else if (nextStep === 4) {
      sound.turn();
      const conditionMet = coinsVar + 1 >= 3 && energyVar - 1 >= 0;
      if (conditionMet) {
        sound.success();
        triggerConfetti();
        setBridgeLowered(true);
        setShowVictory(true);
        onLevelCompleted(1);
        setStatusText('O Guardião verificou a caixa [moedas] (valor = 3). Requisito cumprido! A ponte baixou!');
      } else {
        sound.failure();
        setStatusText('O Guardião verificou a caixa [moedas]: faltam moedas para abrir a passagem.');
      }
    }
  };

  const theme = MODULE_THEMES.variable;

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <ModuleHero
        moduleId="variable"
        title="O Guardião da Ponte e a Memória"
        subtitle="Entenda como os computadores guardam, alteram e consultam valores usando caixas etiquetadas chamadas Variáveis."
        currentLevel={1}
        totalLevels={1}
      />

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: The Bridge Adventure Stage (60%) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-7 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-base font-bold text-[#15213D] flex items-center gap-2">
              🗺️ Trilha de Aventura e Condição
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              Regra da Ponte: [moedas] ≥ 3
            </span>
          </div>

          {/* Narrative status message */}
          <div className="flex items-center gap-3 bg-[#FFF5D8] border border-[#FFE299] rounded-2xl p-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#FFE299] flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#15213D] leading-snug">
              {statusText}
            </p>
          </div>

          {/* Visual Track (5 Steps) */}
          <div className="p-5 sm:p-6 bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] shadow-inner space-y-4">
            <div className="grid grid-cols-5 gap-2.5">
              {[0, 1, 2, 3, 4].map((stepIdx) => {
                const isRobotHere = robotStep === stepIdx;
                const isChest1 = stepIdx === 2;
                const isChest2 = stepIdx === 3;
                const isBridge = stepIdx === 4;

                return (
                  <div
                    key={stepIdx}
                    className={`h-36 rounded-2xl border-2 flex flex-col items-center justify-between p-2.5 transition-all relative ${
                      isRobotHere
                        ? 'border-amber-400 bg-white ring-4 ring-amber-100 shadow-md scale-102'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#8491A5]">
                      Passo {stepIdx}
                    </span>

                    {/* Step Landmark */}
                    <div className="flex flex-col items-center my-auto">
                      {isChest1 && (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl select-none">
                            {robotStep >= 2 ? '📦' : '💰'}
                          </span>
                          <span className="text-[9px] font-bold text-amber-700 mt-1">
                            +2 Moedas
                          </span>
                        </div>
                      )}
                      {isChest2 && (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl select-none">
                            {robotStep >= 3 ? '📦' : '🪙'}
                          </span>
                          <span className="text-[9px] font-bold text-amber-700 mt-1">
                            +1 Moeda
                          </span>
                        </div>
                      )}
                      {isBridge && (
                        <div className="flex flex-col items-center text-center">
                          <span className="text-2xl select-none">
                            {bridgeLowered ? '🌉' : '🛑'}
                          </span>
                          <span className="text-[9px] font-bold text-[#15213D] mt-1">
                            {bridgeLowered ? 'Ponte Aberta' : 'Guardião'}
                          </span>
                        </div>
                      )}
                      {!isChest1 && !isChest2 && !isBridge && (
                        <span className="text-xl opacity-30 select-none">👣</span>
                      )}
                    </div>

                    {/* Robot Position Indicator */}
                    {isRobotHere && (
                      <div className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                        <Bot className="w-3 h-3" />
                        <span>Aqui</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bridge Status Card */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs text-xs">
              <span className="font-semibold text-[#536178]">Portão de Passagem:</span>
              <div className={`flex items-center gap-1.5 font-bold ${
                bridgeLowered ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {bridgeLowered ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Liberada com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Trancada pelo Guardião</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Controls Bar */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-card-soft">
            <button
              onClick={() => {
                sound.click();
                executeNextStep();
              }}
              disabled={robotStep >= 4}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E8A928] hover:bg-amber-600 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Avançar 1 Passo no Caminho</span>
            </button>

            <button
              onClick={() => {
                sound.click();
                resetAll();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8FAFD] hover:bg-slate-100 text-[#536178] hover:text-[#15213D] text-sm font-semibold rounded-xl border border-[#CBD5E1] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Right Zone: Live RAM Memory Inspector (40%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#15213D] flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-600" />
                Caixas de Memória Vivas (RAM)
              </h3>
              <p className="text-xs text-[#536178]">
                Inspecione o conteúdo das variáveis enquanto o programa avança
              </p>
            </div>

            {/* Variable Box: Moedas */}
            <div className="p-4 rounded-2xl bg-[#FFF5D8] border-2 border-[#FFE299] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    Variável: [ moedas ]
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-amber-800 border border-amber-200">
                  Tipo: Número
                </span>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-xs font-semibold text-[#536178]">Valor armazenado:</span>
                <span className="text-2xl font-black text-amber-700 tabular-nums">
                  {coinsVar}
                </span>
              </div>
            </div>

            {/* Variable Box: Energia */}
            <div className="p-4 rounded-2xl bg-[#E0F2FE] border-2 border-[#7DD3FC] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-700" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                    Variável: [ energia ]
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-sky-800 border border-sky-200">
                  Tipo: Número
                </span>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-sky-200 shadow-xs">
                <span className="text-xs font-semibold text-[#536178]">Valor armazenado:</span>
                <span className="text-2xl font-black text-sky-700 tabular-nums">
                  {energyVar}
                </span>
              </div>
            </div>

            {/* Interactive Sandbox: Change Variable directly */}
            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-2.5">
              <span className="text-xs font-bold text-[#15213D] block">
                🧪 Teste de Laboratório: Altere a Variável
              </span>
              <p className="text-xs text-[#536178]">
                Experimente somar ou subtrair o valor da caixa <strong>[moedas]</strong> manualmente:
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.click();
                    setCoinsVar((prev) => Math.max(0, prev - 1));
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-[#CBD5E1] text-xs font-bold text-[#15213D] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>- 1 Moeda</span>
                </button>
                <button
                  onClick={() => {
                    sound.click();
                    setCoinsVar((prev) => prev + 1);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 border border-amber-600 text-xs font-bold text-white flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 1 Moeda</span>
                </button>
              </div>
            </div>

            {/* Hint Card */}
            <HintCard hint="A cada passo, o valor antigo da caixa é substituído pelo novo total. O robô precisa de pelo menos 3 moedas para convencer o Guardião!" />
          </div>
        </div>
      </div>

      {/* Pedagogical "Por que isso funciona?" Block */}
      <LearningInsight
        title="Por que variáveis são a memória dos programas?"
        explanation="Se o computador não tivesse variáveis, ele esqueceria tudo o que aconteceu no milissegundo anterior! As variáveis guardam seu score nos jogos, o número de vidas, o nome do jogador e os cálculos matemáticos."
        analogy="Pense em um placar de futebol: quando sai um gol, o placar não cria um novo time: ele apenas apaga o número antigo e escreve o novo valor na mesma caixinha!"
        accentColor={theme.primary}
        pillars={[
          { title: 'Etiqueta / Nome', description: 'O identificador único para que você ache o dado certo quando precisar.' },
          { title: 'Conteúdo / Valor', description: 'A informação atual que fica guardada dentro da caixa temporariamente.' },
          { title: 'Substituição (Atribuição)', description: 'Guardar um novo valor substitui automaticamente o valor anterior.' },
        ]}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictory}
        title="O Guardião Liberou a Passagem!"
        explanation="O Guardião leu a variável [moedas]. Como o valor era igual ou maior que 3, a condição foi satisfeita e a ponte abaixou. Você compreendeu como variáveis guardam o estado do seu mundo!"
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetAll();
        }}
      />
    </div>
  );
};
