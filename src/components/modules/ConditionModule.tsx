import React, { useState, useEffect, useRef } from 'react';
import { 
  GitFork, 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { TheoryCard } from '../TheoryCard';
import { VictoryModal } from '../VictoryModal';

interface GemItem {
  id: number;
  name: string;
  color: 'red' | 'blue' | 'green' | 'gray';
  colorName: string;
  weight: 'light' | 'heavy';
  weightName: string;
  icon: string;
}

interface ConditionRule {
  property: 'color' | 'weight';
  operator: 'equals';
  value: string;
  targetTubeIfTrue: 'A' | 'B';
  targetTubeIfFalse: 'A' | 'B';
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

  // Conveyor test simulation state
  const [itemsQueue, setItemsQueue] = useState<GemItem[]>(SAMPLE_GEMS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeBranch, setActiveBranch] = useState<'none' | 'true' | 'false'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRun, setAutoRun] = useState(false);

  // Tally & stats
  const [tubeACount, setTubeACount] = useState<GemItem[]>([]);
  const [tubeBCount, setTubeBCount] = useState<GemItem[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [statusLog, setStatusLog] = useState<string>('Configure a regra SE / SENÃO e teste os itens na esteira.');
  const [showVictory, setShowVictory] = useState(false);

  // Challenge goals:
  // Level 1: Enviar todos os itens vermelhos (Rubis) para o Tubo A e os demais para o Tubo B.
  // Level 2: Enviar itens "Pesados" para o Tubo A e itens "Leves" para o Tubo B.
  const targetProperty = level === 1 ? 'color' : 'weight';
  const targetValue = level === 1 ? 'red' : 'heavy';
  const targetGoalDesc = level === 1 
    ? 'Meta: Separe todas as joias VERMELHAS no Tubo A e todas as outras no Tubo B.'
    : 'Meta: Separe todos os itens PESADOS no Tubo A e todos os LEVES no Tubo B.';

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

    // Evaluate user condition
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
          `Sensor leu [${item.name}]: Condição deu ${conditionResult ? 'VERDADEIRO' : 'FALSO'}. Enviado para Tubo ${destinationTube} com sucesso!`
        );
      } else {
        sound.failure();
        setWrongCount((prev) => prev + 1);
        setStatusLog(
          `Opa! [${item.name}] caiu no Tubo ${destinationTube}, mas a meta exigia o outro tubo. Ajuste sua lógica!`
        );
      }

      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsProcessing(false);

      if (nextIdx >= itemsQueue.length) {
        // Finished all items
        setAutoRun(false);
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        if (finalCorrect === itemsQueue.length) {
          sound.success();
          triggerConfetti();
          setShowVictory(true);
          onLevelCompleted(level);
        } else {
          setStatusLog(`Teste concluído: ${finalCorrect} de ${itemsQueue.length} corretos. Tente ajustar os parâmetros!`);
        }
      }
    }, 600);
  };

  // Auto-run effect
  useEffect(() => {
    if (!autoRun || isProcessing || currentIndex >= itemsQueue.length) return;

    const timer = setTimeout(() => {
      stepItem();
    }, 900);

    return () => clearTimeout(timer);
  }, [autoRun, isProcessing, currentIndex]);

  const currentItem = currentIndex < itemsQueue.length ? itemsQueue[currentIndex] : null;

  return (
    <div className="space-y-6">
      <TheoryCard
        title="Decisões e Condicionais"
        subtitle={`Nível ${level}: O Poder do SE / SENÃO`}
        concept="Em programação, um computador não pode seguir apenas passos fixos quando o ambiente muda. Ele faz perguntas: SE algo for verdadeiro, toma um caminho; SENÃO, toma outro caminho."
        analogyTitle="Analogia do Mundo Real:"
        analogyText="Imagine um guarda-chuva: SE estiver chovendo lá fora, ENTÃO você abre o guarda-chuva; SENÃO, você o deixa guardado na mochila. Você não abre o guarda-chuva todos os dias sem olhar para o céu!"
        keyTakeaway="Toda decisão computacional é uma bifurcação binária: Verdadeiro ou Falso. Isso permite criar inteligência e adaptação."
      />

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Conveyor & Visual Sorter Stage */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <GitFork className="w-4 h-4" />
              <span>A Esteira de Triagem Automatizada</span>
            </div>
            <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {targetGoalDesc}
            </span>
          </div>

          {/* Interactive Conveyor Graphic */}
          <div className="relative bg-slate-950 p-6 rounded-2xl border border-slate-800/80 overflow-hidden min-h-[300px] flex flex-col justify-between">
            {/* Top: Arrival conveyor belt */}
            <div className="relative flex items-center justify-between bg-slate-900/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Esteira de Entrada
              </span>
              <div className="flex items-center gap-2 overflow-hidden">
                {itemsQueue.slice(currentIndex).map((item, i) => (
                  <div
                    key={item.id}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all ${
                      i === 0
                        ? 'bg-indigo-600/30 border-indigo-400 scale-110 shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-800/50 border-slate-700/40 opacity-60'
                    }`}
                  >
                    <span>{item.icon}</span>
                  </div>
                ))}
                {currentIndex >= itemsQueue.length && (
                  <span className="text-xs text-slate-500 italic">Todos os itens foram processados!</span>
                )}
              </div>
            </div>

            {/* Middle: The Decision Sensor Chamber */}
            <div className="my-6 relative flex flex-col items-center">
              <div
                className={`w-full max-w-sm p-4 rounded-xl border transition-all duration-300 ${
                  activeBranch !== 'none'
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-500/20'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>SENSOR DE DECISÃO</span>
                  </div>
                  {currentItem ? (
                    <span className="text-[11px] font-mono text-amber-300">
                      Lendo: {currentItem.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Aguardando item...</span>
                  )}
                </div>

                {/* Live comparison logic preview */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1 text-slate-300">
                    <span className="text-purple-400 font-bold">SE</span>
                    <span className="text-sky-300">[{ruleProperty === 'color' ? 'Cor do item' : 'Peso do item'}]</span>
                    <span className="text-slate-400">é igual a</span>
                    <span className="text-amber-300">"{ruleProperty === 'color' ? (ruleValue === 'red' ? 'Vermelho' : ruleValue === 'blue' ? 'Azul' : 'Verde') : (ruleValue === 'heavy' ? 'Pesado' : 'Leve')}"</span>
                  </div>
                  {currentItem && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Valor atual do item:</span>
                      <span className="font-semibold text-white">
                        {ruleProperty === 'color' ? currentItem.colorName : currentItem.weightName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Glowing decision branches */}
              <div className="w-full max-w-md flex justify-between items-center px-8 mt-2 text-xs font-bold">
                <div
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                    activeBranch === 'true'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20 scale-105'
                      : 'border-slate-800 text-slate-500'
                  }`}
                >
                  <span>✓ VERDADEIRO</span>
                  <span className="text-[10px] font-normal text-slate-400">Ir para Tubo {trueTube}</span>
                </div>

                <div
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                    activeBranch === 'false'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20 scale-105'
                      : 'border-slate-800 text-slate-500'
                  }`}
                >
                  <span>✗ FALSO</span>
                  <span className="text-[10px] font-normal text-slate-400">Ir para Tubo {falseTube}</span>
                </div>
              </div>
            </div>

            {/* Bottom: Destination Tubes */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tube A */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-300 border-b border-slate-800 pb-1">
                  <span>Tubo A</span>
                  <span className="text-[10px] text-slate-500 font-mono">({tubeACount.length} itens)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {tubeACount.map((item, idx) => (
                    <span key={idx} className="text-base" title={`${item.name} (${item.colorName}, ${item.weightName})`}>
                      {item.icon}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tube B */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-300 border-b border-slate-800 pb-1">
                  <span>Tubo B</span>
                  <span className="text-[10px] text-slate-500 font-mono">({tubeBCount.length} itens)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {tubeBCount.map((item, idx) => (
                    <span key={idx} className="text-base" title={`${item.name} (${item.colorName}, ${item.weightName})`}>
                      {item.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Narrative Status Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 font-mono">
            <span className="truncate">{statusLog}</span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-emerald-400 font-bold">Acertos: {correctCount}</span>
              <span className="text-rose-400 font-bold">Erros: {wrongCount}</span>
            </div>
          </div>

          {/* Action trigger buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.click();
                  stepItem();
                }}
                disabled={isProcessing || currentIndex >= itemsQueue.length}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-40"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Testar Próximo Item</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  setAutoRun(!autoRun);
                }}
                disabled={currentIndex >= itemsQueue.length}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  autoRun
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{autoRun ? 'Pausar Automático' : 'Executar Todos'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.click();
                resetSimulation();
              }}
              className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Esteira</span>
            </button>
          </div>
        </div>

        {/* Right: The Condition Puzzle Builder Deck */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Montador Visual de Condição
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">SE / SENÃO</span>
            </div>

            {/* Visual Block Formatter */}
            <div className="space-y-4 text-xs">
              {/* IF Condition block */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-300">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px]">SE</span>
                  <span>(A condição que o sensor irá testar)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Qual característica testar?</label>
                    <select
                      value={ruleProperty}
                      onChange={(e) => {
                        sound.click();
                        const p = e.target.value as 'color' | 'weight';
                        setRuleProperty(p);
                        setRuleValue(p === 'color' ? 'red' : 'heavy');
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="color">Cor da Joia</option>
                      <option value="weight">Peso da Joia</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Deve ser igual a:</label>
                    <select
                      value={ruleValue}
                      onChange={(e) => {
                        sound.click();
                        setRuleValue(e.target.value);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              </div>

              {/* THEN Branch */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px]">ENTÃO</span>
                    <span>Se for Verdadeiro:</span>
                  </div>
                  <select
                    value={trueTube}
                    onChange={(e) => {
                      sound.click();
                      setTrueTube(e.target.value as 'A' | 'B');
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="A">Enviar para Tubo A</option>
                    <option value="B">Enviar para Tubo B</option>
                  </select>
                </div>
              </div>

              {/* ELSE Branch */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px]">SENÃO</span>
                    <span>Se for Falso:</span>
                  </div>
                  <select
                    value={falseTube}
                    onChange={(e) => {
                      sound.click();
                      setFalseTube(e.target.value as 'A' | 'B');
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="A">Enviar para Tubo A</option>
                    <option value="B">Enviar para Tubo B</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mentor hint */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">Dica Pedagógica:</span>
                <p>
                  Observe o objetivo da meta no topo! Se você quer que os itens vermelhos vão para o Tubo A e os demais para o B, a regra deve ser: SE Cor == Vermelho ENTÃO Tubo A SENÃO Tubo B.
                </p>
              </div>
            </div>

            {/* Switch Level */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Mudar desafio:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    sound.click();
                    setLevel(1);
                    setRuleProperty('color');
                    setRuleValue('red');
                    resetSimulation();
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer ${
                    level === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Nível 1 (Cor)
                </button>
                <button
                  onClick={() => {
                    sound.click();
                    setLevel(2);
                    setRuleProperty('weight');
                    setRuleValue('heavy');
                    resetSimulation();
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer ${
                    level === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Nível 2 (Peso)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory celebration */}
      <VictoryModal
        isOpen={showVictory}
        title={level === 1 ? 'Mestre da Triagem por Cor' : 'Mestre da Triagem por Peso'}
        explanation="O sensor avaliou cada item dinamicamente! O computador não precisou de regras manuais para cada objeto; ele usou uma regra lógica única (SE / SENÃO) para classificar infinitos itens automaticamente!"
        hasNextLevel={level === 1}
        onNextLevel={() => {
          setShowVictory(false);
          setLevel(2);
          setRuleProperty('weight');
          setRuleValue('heavy');
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
