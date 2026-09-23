import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Sliders,
  StepForward,
  Check,
  X
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ModuleHero } from '../ModuleHero';
import { HintCard } from '../HintCard';
import { LearningInsight } from '../LearningInsight';
import { VictoryModal } from '../VictoryModal';
import { MODULE_THEMES } from '../../designTokens';

interface GemItem {
  id: number;
  name: string;
  color: 'red' | 'blue' | 'green' | 'gray';
  colorName: string;
  weight: 'light' | 'heavy';
  weightName: string;
  icon: string;
}

const SAMPLE_GEMS: GemItem[] = [
  { id: 1, name: 'Rubi Cintilante', color: 'red', colorName: 'Vermelho', weight: 'light', weightName: 'Leve', icon: '💎' },
  { id: 2, name: 'Safira das Águas', color: 'blue', colorName: 'Azul', weight: 'heavy', weightName: 'Pesado', icon: '🔷' },
  { id: 3, name: 'Esmeralda Pura', color: 'green', colorName: 'Verde', weight: 'light', weightName: 'Leve', icon: '❇️' },
  { id: 4, name: 'Rubi Imperial', color: 'red', colorName: 'Vermelho', weight: 'heavy', weightName: 'Pesado', icon: '💎' },
  { id: 5, name: 'Rocha Comum', color: 'gray', colorName: 'Cinza', weight: 'heavy', weightName: 'Pesado', icon: '🪨' },
  { id: 6, name: 'Safira Real', color: 'blue', colorName: 'Azul', weight: 'light', weightName: 'Leve', icon: '🔷' },
];

export const ConditionModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  const [level, setLevel] = useState<1 | 2>(1);

  // User configured condition
  const [ruleProperty, setRuleProperty] = useState<'color' | 'weight'>('color');
  const [ruleValue, setRuleValue] = useState<string>('red');
  const [trueTube, setTrueTube] = useState<'A' | 'B'>('A');
  const [falseTube, setFalseTube] = useState<'A' | 'B'>('B');

  // Conveyor simulation state
  const [itemsQueue, setItemsQueue] = useState<GemItem[]>(SAMPLE_GEMS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeBranch, setActiveBranch] = useState<'none' | 'true' | 'false'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRun, setAutoRun] = useState(false);

  // Results
  const [tubeACount, setTubeACount] = useState<GemItem[]>([]);
  const [tubeBCount, setTubeBCount] = useState<GemItem[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [statusLog, setStatusLog] = useState<string>('Configure a regra SE / SENÃO e teste os itens na esteira.');
  const [showVictory, setShowVictory] = useState(false);

  const targetGoalDesc = level === 1 
    ? 'Separe todas as joias VERMELHAS no Tubo A e as demais no Tubo B.'
    : 'Separe todos os itens PESADOS no Tubo A e os LEVES no Tubo B.';

  const resetSimulation = () => {
    setCurrentIndex(0);
    setActiveBranch('none');
    setIsProcessing(false);
    setAutoRun(false);
    setTubeACount([]);
    setTubeBCount([]);
    setCorrectCount(0);
    setWrongCount(0);
    setStatusLog('Simulação reiniciada. Escolha testar um item ou executar tudo.');
  };

  const evaluateItem = (item: GemItem): boolean => {
    if (ruleProperty === 'color') {
      return item.color === ruleValue;
    } else {
      return item.weight === ruleValue;
    }
  };

  const checkItemCorrect = (item: GemItem, chosenTube: 'A' | 'B'): boolean => {
    if (level === 1) {
      const isRed = item.color === 'red';
      return isRed ? chosenTube === 'A' : chosenTube === 'B';
    } else {
      const isHeavy = item.weight === 'heavy';
      return isHeavy ? chosenTube === 'A' : chosenTube === 'B';
    }
  };

  const stepItem = () => {
    if (currentIndex >= itemsQueue.length) {
      return;
    }

    const item = itemsQueue[currentIndex];
    setIsProcessing(true);

    const conditionResult = evaluateItem(item);
    sound.condition(conditionResult);
    setActiveBranch(conditionResult ? 'true' : 'false');

    const destinationTube = conditionResult ? trueTube : falseTube;
    const isCorrect = checkItemCorrect(item, destinationTube);

    setTimeout(() => {
      if (destinationTube === 'A') {
        setTubeACount((prev) => [...prev, item]);
      } else {
        setTubeBCount((prev) => [...prev, item]);
      }

      if (isCorrect) {
        sound.collect();
        setCorrectCount((prev) => prev + 1);
        setStatusLog(
          `Sensor leu [${item.name}]: Condição deu ${conditionResult ? 'VERDADEIRO' : 'FALSO'}. Enviado para Tubo ${destinationTube} com sucesso! ✨`
        );
      } else {
        sound.failure();
        setWrongCount((prev) => prev + 1);
        setStatusLog(
          `Opa! [${item.name}] foi parar no Tubo ${destinationTube}, mas a regra da missão pedia o outro tubo. Ajuste os blocos!`
        );
      }

      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsProcessing(false);

      if (nextIdx >= itemsQueue.length) {
        setAutoRun(false);
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        if (finalCorrect === itemsQueue.length) {
          sound.success();
          triggerConfetti();
          setShowVictory(true);
          onLevelCompleted(level);
        } else {
          setStatusLog(`Teste finalizado: ${finalCorrect} de ${itemsQueue.length} corretos. Ajuste a condição para acertar 100%!`);
        }
      }
    }, 600);
  };

  useEffect(() => {
    if (!autoRun || isProcessing || currentIndex >= itemsQueue.length) return;

    const timer = setTimeout(() => {
      stepItem();
    }, 900);

    return () => clearTimeout(timer);
  }, [autoRun, isProcessing, currentIndex]);

  const currentItem = currentIndex < itemsQueue.length ? itemsQueue[currentIndex] : null;
  const theme = MODULE_THEMES.condition;

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <ModuleHero
        moduleId="condition"
        title={level === 1 ? 'A Esteira de Triagem' : 'O Sensor de Densidade'}
        subtitle={targetGoalDesc}
        currentLevel={level}
        totalLevels={2}
      />

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Conveyor & Visual Stage (60%) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-7 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-base font-bold text-[#15213D] flex items-center gap-2">
              ⚙️ Esteira de Triagem Automatizada
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {correctCount} de {itemsQueue.length} classificados
            </span>
          </div>

          {/* Narrative status message */}
          <div className="flex items-center gap-3 bg-[#F0EBFF] border border-[#D8CCFF] rounded-2xl p-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#D8CCFF] flex items-center justify-center text-purple-700 shrink-0 shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#15213D] leading-snug">
              {statusLog}
            </p>
          </div>

          {/* Physical Conveyor Simulation Deck */}
          <div className="bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 space-y-6 shadow-inner">
            {/* Top Queue: Arrival Belt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8491A5]">
                  Fila de Itens na Entrada
                </span>
                <span className="text-xs font-semibold text-[#536178]">
                  Restantes: {Math.max(0, itemsQueue.length - currentIndex)}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-[#E2E8F0] overflow-x-auto min-h-[64px]">
                {itemsQueue.slice(currentIndex).map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 ${
                      i === 0
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200 shadow-sm'
                        : 'bg-[#F8FAFD] border-[#E2E8F0] opacity-75'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#15213D] block leading-tight">{item.name}</span>
                      <span className="text-[10px] text-[#8491A5]">
                        {item.colorName} • {item.weightName}
                      </span>
                    </div>
                  </div>
                ))}
                {currentIndex >= itemsQueue.length && (
                  <div className="w-full text-center py-2 text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Todos os itens foram triados!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Decision Laser Sensor */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-600" />
                  Sensor de Inspeção
                </span>
                {currentItem ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    Examinando: {currentItem.name}
                  </span>
                ) : (
                  <span className="text-xs text-[#8491A5]">Aguardando próximo item...</span>
                )}
              </div>

              {/* Branch Light Indicators */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div 
                  className={`p-3 rounded-xl border text-center transition-all ${
                    activeBranch === 'true'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-200 font-bold scale-[1.02]'
                      : 'bg-[#F8FAFD] border-[#E2E8F0] text-[#8491A5]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs font-bold mb-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>SE FOR VERDADE</span>
                  </div>
                  <span className="text-xs block font-semibold text-emerald-700">
                    Desviar para Tubo {trueTube}
                  </span>
                </div>

                <div 
                  className={`p-3 rounded-xl border text-center transition-all ${
                    activeBranch === 'false'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-200 font-bold scale-[1.02]'
                      : 'bg-[#F8FAFD] border-[#E2E8F0] text-[#8491A5]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs font-bold mb-0.5">
                    <X className="w-3.5 h-3.5" />
                    <span>SENÃO (FALSO)</span>
                  </div>
                  <span className="text-xs block font-semibold text-rose-700">
                    Desviar para Tubo {falseTube}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: Destination Tubes A & B */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tube A */}
              <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-blue-100 mb-2">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Recipiente Tubo A
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {tubeACount.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[48px] items-center">
                  {tubeACount.map((gem, idx) => (
                    <span key={idx} className="text-xl animate-in zoom-in" title={gem.name}>
                      {gem.icon}
                    </span>
                  ))}
                  {tubeACount.length === 0 && (
                    <span className="text-xs text-[#8491A5] italic">Vazio</span>
                  )}
                </div>
              </div>

              {/* Tube B */}
              <div className="bg-white rounded-2xl border border-purple-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100 mb-2">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                    Recipiente Tubo B
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {tubeBCount.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[48px] items-center">
                  {tubeBCount.map((gem, idx) => (
                    <span key={idx} className="text-xl animate-in zoom-in" title={gem.name}>
                      {gem.icon}
                    </span>
                  ))}
                  {tubeBCount.length === 0 && (
                    <span className="text-xs text-[#8491A5] italic">Vazio</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-card-soft">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.click();
                  stepItem();
                }}
                disabled={isProcessing || currentIndex >= itemsQueue.length}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#8057E8] hover:bg-purple-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <StepForward className="w-4 h-4" />
                <span>Testar 1 Peça</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  setAutoRun(!autoRun);
                }}
                disabled={currentIndex >= itemsQueue.length}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                  autoRun
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-[#F8FAFD] hover:bg-slate-100 text-[#15213D] border-[#CBD5E1]'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>{autoRun ? 'Pausar' : 'Testar Fila Toda'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.click();
                resetSimulation();
              }}
              title="Reiniciar esteira"
              className="p-2.5 bg-[#F8FAFD] hover:bg-slate-100 text-[#536178] hover:text-[#15213D] rounded-xl border border-[#CBD5E1] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Rule Builder Deck (40%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#15213D] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                Configure o Bloco Condicional
              </h3>
              <p className="text-xs text-[#536178]">
                Ajuste os parâmetros da regra de decisão lógica
              </p>
            </div>

            {/* Block Representation */}
            <div className="bg-[#F0EBFF] border-2 border-[#8057E8] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <GitFork className="w-4 h-4" />
                Bloco: SE / ENTÃO / SENÃO
              </div>

              {/* SE (Condição) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-950 block">
                  1. O que o sensor deve verificar?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={ruleProperty}
                    onChange={(e) => {
                      sound.click();
                      const val = e.target.value as 'color' | 'weight';
                      setRuleProperty(val);
                      setRuleValue(val === 'color' ? 'red' : 'heavy');
                    }}
                    className="p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-[#15213D] focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  >
                    <option value="color">Cor da Joia</option>
                    <option value="weight">Peso do Item</option>
                  </select>

                  <select
                    value={ruleValue}
                    onChange={(e) => {
                      sound.click();
                      setRuleValue(e.target.value);
                    }}
                    className="p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-[#15213D] focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  >
                    {ruleProperty === 'color' ? (
                      <>
                        <option value="red">Vermelho (Rubi)</option>
                        <option value="blue">Azul (Safira)</option>
                        <option value="green">Verde (Esmeralda)</option>
                      </>
                    ) : (
                      <>
                        <option value="heavy">Pesado</option>
                        <option value="light">Leve</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* ENTÃO (Ação se Verdadeiro) */}
              <div className="space-y-1.5 pt-2 border-t border-purple-200">
                <label className="text-xs font-bold text-purple-950 block">
                  2. SE a condição for verdadeira, envie para:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sound.click();
                      setTrueTube('A');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      trueTube === 'A'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    Tubo A
                  </button>
                  <button
                    onClick={() => {
                      sound.click();
                      setTrueTube('B');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      trueTube === 'B'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    Tubo B
                  </button>
                </div>
              </div>

              {/* SENÃO (Ação se Falso) */}
              <div className="space-y-1.5 pt-2 border-t border-purple-200">
                <label className="text-xs font-bold text-purple-950 block">
                  3. SENÃO (caso seja falso), envie para:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sound.click();
                      setFalseTube('A');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      falseTube === 'A'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    Tubo A
                  </button>
                  <button
                    onClick={() => {
                      sound.click();
                      setFalseTube('B');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      falseTube === 'B'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    Tubo B
                  </button>
                </div>
              </div>
            </div>

            {/* Hint Card */}
            <HintCard 
              hint={level === 1 
                ? 'Queremos que todos os Rubis (Vermelho) vão para o Tubo A. Logo, configure: SE Cor == Vermelho -> Tubo A, SENÃO -> Tubo B!' 
                : 'Queremos itens pesados no Tubo A e leves no Tubo B. Troque o sensor para verificar o Peso!'
              } 
            />
          </div>
        </div>
      </div>

      {/* Pedagogical "Por que isso funciona?" Block */}
      <LearningInsight
        title="Por que decisões são o coração da lógica?"
        explanation="Sem decisões, os programas seriam robôs cegos que fariam sempre a mesma coisa. As estruturas SE e SENÃO permitem que o algoritmo examine o mundo ao redor e mude seu comportamento de acordo com as circunstâncias!"
        analogy="Pense em um sensor de porta automática: SE alguém se aproximar da porta, ENTÃO ela abre; SENÃO ela permanece fechada."
        accentColor={theme.primary}
        pillars={[
          { title: 'Condição (Pergunta)', description: 'Uma expressão que resulta unicamente em Verdadeiro ou Falso.' },
          { title: 'Bifurcação (Caminhos)', description: 'O algoritmo nunca segue os dois ramos ao mesmo tempo.' },
          { title: 'Adaptabilidade', description: 'Permite que a máquina tome a atitude correta em qualquer cenário.' },
        ]}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictory}
        title={level === 1 ? 'Triagem de Cores Concluída!' : 'Classificação por Densidade Perfeita!'}
        explanation="Sua regra condicional conseguiu classificar 100% dos itens da esteira sem nenhum erro! Você dominou o conceito de bifurcação lógica SE / SENÃO."
        hasNextLevel={level === 1}
        onNextLevel={() => {
          setShowVictory(false);
          setLevel(2);
          resetSimulation();
        }}
        onRestart={() => {
          setShowVictory(false);
          resetSimulation();
        }}
      />
    </div>
  );
};
