import React, { useState, useEffect, useRef } from 'react';
import { 
  Repeat, 
  Sparkles, 
  Sprout, 
  Droplets, 
  ArrowRight, 
  Trash2, 
  CheckCircle2, 
  Bot,
  Layers
} from 'lucide-react';
import { ActionType, GridPos } from '../../types';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ExecutionControls } from '../ExecutionControls';
import { ModuleHero } from '../ModuleHero';
import { HintCard } from '../HintCard';
import { LearningInsight } from '../LearningInsight';
import { VictoryModal } from '../VictoryModal';
import { MODULE_THEMES } from '../../designTokens';

interface PlotCell {
  x: number;
  y: number;
  state: 'soil' | 'seeded' | 'bloomed';
}

const ACTION_INFO: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  plant: {
    label: 'Plantar Semente',
    icon: <Sprout className="w-4 h-4 text-emerald-600" />,
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  water: {
    label: 'Regar Canteiro',
    icon: <Droplets className="w-4 h-4 text-sky-600" />,
    bg: 'bg-sky-50 hover:bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-200',
  },
  forward: {
    label: 'Avançar 1 Casa',
    icon: <ArrowRight className="w-4 h-4 text-blue-600" />,
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
};

export const LoopModule: React.FC<{ onLevelCompleted: (id: number) => void }> = ({ onLevelCompleted }) => {
  const [level, setLevel] = useState<1 | 2>(1);

  // Loop program config
  const [loopIterations, setLoopIterations] = useState<number>(5);
  const [loopBody, setLoopBody] = useState<ActionType[]>(['plant', 'water', 'forward']);

  // Simulation state
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
    setStatusMessage('Canteiro limpo e pronto para o plantio automatizado!');
  };

  useEffect(() => {
    resetState();
  }, [level]);

  const addActionToBody = (action: ActionType) => {
    if (isRunning) return;
    if (loopBody.length >= 4) {
      sound.failure();
      setStatusMessage('Limite atingido: máximo de 4 comandos no interior deste laço.');
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

  const executeAction = (action: ActionType, iter: number, subIdx: number) => {
    setCurrentLoopIteration(iter);
    setCurrentSubStepIndex(subIdx);

    switch (action) {
      case 'forward': {
        sound.step();
        setRobotPos((prev) => ({ ...prev, x: Math.min(4, prev.x + 1) }));
        setStatusMessage(`Ciclo ${iter + 1}/${loopIterations} (Passo ${subIdx + 1}): Robô avançou para o próximo canteiro.`);
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
        setStatusMessage(`Ciclo ${iter + 1}/${loopIterations} (Passo ${subIdx + 1}): Semente plantada na terra! 🌱`);
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
        setStatusMessage(`Ciclo ${iter + 1}/${loopIterations} (Passo ${subIdx + 1}): Regada com sucesso! A flor desabrochou! 🌻`);
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
      setStatusMessage('Sucesso maravilhoso! Todas as 5 flores nasceram usando apenas 1 laço!');
    } else {
      setStatusMessage('O laço terminou, mas faltou plantar ou regar alguns canteiros. Revise a ordem interna!');
    }
  };

  const executeStep = (iter: number, subIdx: number) => {
    if (subIdx >= loopBody.length) {
      const nextIter = iter + 1;
      if (nextIter >= loopIterations) {
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

  const theme = MODULE_THEMES.loop;
  const bloomedCount = plots.filter((p) => p.state === 'bloomed').length;
  const equivalentSteps = loopIterations * loopBody.length;

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <ModuleHero
        moduleId="loop"
        title="O Canteiro de Girassóis"
        subtitle="Cultive todos os 5 canteiros repetindo o mesmo padrão com um único laço de repetição."
        currentLevel={level}
        totalLevels={2}
      />

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: The Garden Visual Stage (60%) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-7 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-base font-bold text-[#15213D] flex items-center gap-2">
              🌻 Estufa Automatizada
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {bloomedCount} de 5 Florescidas
            </span>
          </div>

          {/* Narrative status message */}
          <div className="flex items-center gap-3 bg-[#FFEDEA] border border-[#FFD0C9] rounded-2xl p-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#FFD0C9] flex items-center justify-center text-[#F56A5D] shrink-0 shadow-xs">
              <Repeat className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#15213D] leading-snug">
              {statusMessage}
            </p>
          </div>

          {/* Garden Plots Row */}
          <div className="p-5 sm:p-7 bg-[#F4F9EE] rounded-2xl border border-[#D5E8C4] shadow-inner flex flex-col justify-center items-center min-h-[260px]">
            <div className="grid grid-cols-5 gap-3 w-full max-w-xl">
              {plots.map((plot) => {
                const isRobotHere = robotPos.x === plot.x;
                return (
                  <div
                    key={plot.x}
                    className={`relative h-32 rounded-2xl border-2 flex flex-col items-center justify-between p-3 transition-all duration-300 ${
                      isRobotHere
                        ? 'border-coral-400 bg-white ring-4 ring-rose-200 shadow-md scale-105'
                        : 'border-[#CBD5E1] bg-[#FAF8F5]'
                    }`}
                    style={{
                      borderColor: isRobotHere ? '#F56A5D' : undefined,
                    }}
                  >
                    {/* Plot number */}
                    <span className="text-[10px] font-bold text-[#94A3B8]">
                      #{plot.x + 1}
                    </span>

                    {/* Crop state */}
                    <div className="flex flex-col items-center justify-center my-auto">
                      {plot.state === 'soil' && (
                        <div className="w-10 h-6 rounded-full bg-[#D4A373]/30 border border-[#D4A373] flex items-center justify-center text-[10px] text-[#A06D08]">
                          Terra
                        </div>
                      )}
                      {plot.state === 'seeded' && (
                        <div className="flex flex-col items-center animate-pulse">
                          <span className="text-2xl">🌱</span>
                          <span className="text-[9px] font-bold text-emerald-700">Semente</span>
                        </div>
                      )}
                      {plot.state === 'bloomed' && (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                          <span className="text-3xl">🌻</span>
                          <span className="text-[9px] font-bold text-amber-600">Floresceu</span>
                        </div>
                      )}
                    </div>

                    {/* Robot Position Marker */}
                    {isRobotHere && (
                      <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#F56A5D] border border-rose-200">
                        <Bot className="w-3 h-3" />
                        <span>Aqui</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Playback Controls */}
          <ExecutionControls
            isRunning={isRunning}
            isPaused={isPaused}
            currentStepIndex={currentLoopIteration * loopBody.length + currentSubStepIndex}
            totalSteps={equivalentSteps}
            speed={speed}
            onPlay={handleStartPlay}
            onPause={() => setIsPaused(true)}
            onStepForward={handleStepForward}
            onReset={resetState}
            onSpeedChange={setSpeed}
            primaryColor={theme.primary}
          />
        </div>

        {/* Right: The Loop Assembler (40%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h3 className="text-base font-bold text-[#15213D] flex items-center gap-1.5">
                🔁 Estrutura do Laço (Loop)
              </h3>
              <p className="text-xs text-[#536178]">
                Defina quantas vezes repetir e quais ações executar por ciclo
              </p>
            </div>

            {/* Loop Container Representation */}
            <div className="bg-[#FFEDEA] border-2 border-[#F56A5D] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
              {/* Loop repetition selector */}
              <div className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-[#FFD0C9]">
                <span className="text-xs font-bold text-[#15213D] flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-[#F56A5D]" />
                  Repetir este bloco:
                </span>

                <div className="flex items-center gap-1">
                  {[3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        sound.click();
                        setLoopIterations(num);
                      }}
                      disabled={isRunning}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        loopIterations === num
                          ? 'bg-[#F56A5D] text-white shadow-xs'
                          : 'bg-[#F8FAFD] text-[#536178] hover:bg-slate-100'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Inside body of loop */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
                  Ações executadas em cada volta:
                </span>

                {loopBody.length === 0 ? (
                  <div className="p-4 text-center border-2 border-dashed border-[#FFD0C9] rounded-xl bg-white/70 text-xs text-[#8491A5]">
                    Adicione ações abaixo para rodar no laço
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {loopBody.map((action, idx) => {
                      const info = ACTION_INFO[action];
                      const isSubActive = currentSubStepIndex === idx && isRunning;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            isSubActive
                              ? 'bg-rose-500 text-white border-rose-600 shadow-sm translate-x-1'
                              : 'bg-white border-[#FFD0C9] text-[#15213D]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              isSubActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {idx + 1}
                            </span>
                            <span>{info.label}</span>
                          </div>

                          <button
                            onClick={() => removeActionFromBody(idx)}
                            disabled={isRunning}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Action Buttons */}
              <div className="pt-2 border-t border-[#FFD0C9] space-y-2">
                <span className="text-[11px] font-bold text-[#536178]">
                  Clique para inserir no laço:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => addActionToBody('plant')}
                    disabled={isRunning || loopBody.length >= 4}
                    className="p-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>Plantar</span>
                  </button>

                  <button
                    onClick={() => addActionToBody('water')}
                    disabled={isRunning || loopBody.length >= 4}
                    className="p-2 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl text-[11px] font-bold text-sky-800 flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>Regar</span>
                  </button>

                  <button
                    onClick={() => addActionToBody('forward')}
                    disabled={isRunning || loopBody.length >= 4}
                    className="p-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-[11px] font-bold text-blue-800 flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    <span>Avançar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Smart efficiency metric badge */}
            <div className="flex items-center gap-2 bg-[#F8FAFD] border border-[#E2E8F0] p-3 rounded-xl text-xs text-[#536178]">
              <Layers className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                Este laço executa <strong>{equivalentSteps} instruções</strong> escrevendo apenas <strong>{loopBody.length} comandos</strong>!
              </span>
            </div>

            {/* Hint Card */}
            <HintCard hint="Para cada canteiro, o robô deve Plantar, depois Regar para florir, e por fim Avançar para o próximo canteiro!" />
          </div>
        </div>
      </div>

      {/* Pedagogical "Por que isso funciona?" Block */}
      <LearningInsight
        title="Por que laços evitam repetição inútil?"
        explanation="Escrever o mesmo comando dezenas de vezes é cansativo e gera muitos erros. Com um Laço (Loop), ensinamos o padrão uma única vez e o computador o repete com perfeição quantas vezes forem necessárias!"
        analogy="Quando você escova os dentes, ninguém diz 'escove para cima, escove para baixo' 100 vezes. Nós simplesmente dizemos: 'Repita os movimentos de escovação por 2 minutos'."
        accentColor={theme.primary}
        pillars={[
          { title: 'Iteração', description: 'Cada repetição completa das instruções é chamada de uma iteração do laço.' },
          { title: 'Economia de Código', description: 'Transforma centenas de linhas repetitivas em um bloco pequeno e elegante.' },
          { title: 'Automação Escalável', description: 'O mesmo algoritmo cuida de 5 canteiros ou de 5.000 canteiros!' },
        ]}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictory}
        title="Colheita Automatizada com Sucesso!"
        explanation="Você descobriu o padrão que precisava se repetir (Plantar -> Regar -> Avançar) e o colocou dentro de um laço de 5 voltas. Todas as flores nasceram com elegância!"
        hasNextLevel={false}
        onRestart={() => {
          setShowVictory(false);
          resetState();
        }}
      />
    </div>
  );
};
