import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  Trash2, 
  ArrowUp, 
  RotateCw, 
  RotateCcw,
  Sparkles, 
  Bot, 
  Plus,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { ActionType, ActionBlock, Direction, GridPos } from '../../types';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ExecutionControls } from '../ExecutionControls';
import { ModuleHero } from '../ModuleHero';
import { HintCard } from '../HintCard';
import { LearningInsight } from '../LearningInsight';
import { MODULE_THEMES } from '../../designTokens';

type CellType = 'empty' | 'wall' | 'crystal' | 'exit';

export const SandboxModule: React.FC = () => {
  const gridSize = 5;

  // Grid editing mode
  const [placeTool, setPlaceTool] = useState<CellType>('crystal');
  const [cells, setCells] = useState<Record<string, CellType>>({
    '1,1': 'wall',
    '2,1': 'wall',
    '3,1': 'wall',
    '4,1': 'crystal',
    '4,4': 'exit',
  });

  const [robotStart] = useState<GridPos>({ x: 0, y: 0 });
  const [robotPos, setRobotPos] = useState<GridPos>({ x: 0, y: 0 });
  const [robotDir, setRobotDir] = useState<Direction>('east');
  const [collectedCrystals, setCollectedCrystals] = useState<string[]>([]);

  // Program blocks
  const [program, setProgram] = useState<ActionBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const [statusMessage, setStatusMessage] = useState('Oficina Livre: crie seu labirinto e monte seu algoritmo personalizado!');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetSimulation = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setRobotPos(robotStart);
    setRobotDir('east');
    setCollectedCrystals([]);
    setStatusMessage('Posição do robô reiniciada no ponto de partida.');
  };

  const handleCellClick = (x: number, y: number) => {
    if (isRunning) return;
    if (x === robotStart.x && y === robotStart.y) return;

    sound.click();
    const key = `${x},${y}`;
    setCells((prev) => {
      const copy = { ...prev };
      if (copy[key] === placeTool) {
        delete copy[key];
      } else {
        copy[key] = placeTool;
      }
      return copy;
    });
  };

  const addAction = (type: ActionType, label: string) => {
    if (isRunning) return;
    sound.click();
    setProgram((prev) => [
      ...prev,
      {
        id: `${type}-${Date.now()}-${Math.random()}`,
        type,
        label,
        iconName: type,
        description: '',
        color: '',
      },
    ]);
  };

  const removeAction = (idx: number) => {
    if (isRunning) return;
    sound.remove();
    setProgram((prev) => prev.filter((_, i) => i !== idx));
  };

  const executeStep = (stepIdx: number) => {
    if (stepIdx >= program.length) {
      setIsRunning(false);
      return;
    }

    setCurrentStepIndex(stepIdx);
    const action = program[stepIdx].type;

    let nextPos = { ...robotPos };
    let nextDir = robotDir;
    let nextCollected = [...collectedCrystals];

    switch (action) {
      case 'forward': {
        const deltas: Record<Direction, GridPos> = {
          north: { x: 0, y: -1 },
          east: { x: 1, y: 0 },
          south: { x: 0, y: 1 },
          west: { x: -1, y: 0 },
        };
        const delta = deltas[robotDir];
        const target = { x: robotPos.x + delta.x, y: robotPos.y + delta.y };

        if (target.x < 0 || target.x >= gridSize || target.y < 0 || target.y >= gridSize) {
          sound.failure();
          setStatusMessage('O robô tentou sair do tabuleiro!');
          setIsRunning(false);
          return;
        }

        const cellType = cells[`${target.x},${target.y}`];
        if (cellType === 'wall') {
          sound.failure();
          setStatusMessage('Colisão! O robô esbarrou em uma parede.');
          setIsRunning(false);
          return;
        }

        sound.step();
        nextPos = target;
        setRobotPos(nextPos);
        setStatusMessage(`Passo ${stepIdx + 1}: Robô avançou para (${nextPos.x}, ${nextPos.y})`);
        break;
      }

      case 'turn_right': {
        sound.turn();
        const dirs: Direction[] = ['north', 'east', 'south', 'west'];
        nextDir = dirs[(dirs.indexOf(robotDir) + 1) % 4];
        setRobotDir(nextDir);
        setStatusMessage(`Passo ${stepIdx + 1}: Girou à direita`);
        break;
      }

      case 'turn_left': {
        sound.turn();
        const dirs: Direction[] = ['north', 'east', 'south', 'west'];
        nextDir = dirs[(dirs.indexOf(robotDir) + 3) % 4];
        setRobotDir(nextDir);
        setStatusMessage(`Passo ${stepIdx + 1}: Girou à esquerda`);
        break;
      }

      case 'collect': {
        const key = `${robotPos.x},${robotPos.y}`;
        if (cells[key] === 'crystal' && !collectedCrystals.includes(key)) {
          sound.collect();
          nextCollected.push(key);
          setCollectedCrystals(nextCollected);
          setStatusMessage(`Passo ${stepIdx + 1}: Cristal coletado com sucesso! ✨`);
        } else {
          setStatusMessage(`Passo ${stepIdx + 1}: Nada para coletar nesta célula.`);
        }
        break;
      }

      default:
        break;
    }

    if (cells[`${nextPos.x},${nextPos.y}`] === 'exit') {
      sound.success();
      triggerConfetti();
      setIsRunning(false);
      setStatusMessage('🎉 Parabéns! O robô alcançou o portal de chegada!');
    }
  };

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const delay = 650 / speed;
    timerRef.current = setTimeout(() => {
      const next = currentStepIndex + 1;
      if (next < program.length) {
        executeStep(next);
      } else {
        setIsRunning(false);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, isPaused, currentStepIndex, speed, program, robotPos, robotDir, collectedCrystals]);

  const handleStartPlay = () => {
    if (program.length === 0) return;
    if (currentStepIndex >= program.length - 1) {
      resetSimulation();
    }
    setIsPaused(false);
    setIsRunning(true);
  };

  const handleStepForward = () => {
    if (program.length === 0) return;
    const next = currentStepIndex + 1;
    if (next < program.length) {
      executeStep(next);
    }
  };

  const theme = MODULE_THEMES.sandbox;

  const DIR_ROTATION: Record<Direction, string> = {
    north: '-rotate-90',
    east: 'rotate-0',
    south: 'rotate-90',
    west: 'rotate-180',
  };

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <ModuleHero
        moduleId="sandbox"
        title="Oficina Livre de Algoritmos"
        subtitle="O Laboratório do Criador: construa seus próprios labirintos, coloque cristais, desenhe obstáculos e programe sua rota!"
        currentLevel={1}
        totalLevels={1}
      />

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Custom Grid Stage (60%) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-7 shadow-card-soft space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
            <span className="text-base font-bold text-[#15213D] flex items-center gap-2">
              🛠️ Editor de Cenário
            </span>

            {/* Brush Tool Picker */}
            <div className="flex items-center gap-1 bg-[#F8FAFD] p-1 rounded-xl border border-[#E2E8F0]">
              {(['crystal', 'wall', 'exit', 'empty'] as CellType[]).map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    sound.click();
                    setPlaceTool(tool);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    placeTool === tool
                      ? 'bg-[#48B56B] text-white shadow-xs'
                      : 'text-[#536178] hover:text-[#15213D]'
                  }`}
                >
                  {tool === 'crystal' && '💎 Cristal'}
                  {tool === 'wall' && '🧱 Parede'}
                  {tool === 'exit' && '🌀 Portal'}
                  {tool === 'empty' && '🧹 Borracha'}
                </button>
              ))}
            </div>
          </div>

          {/* Narrative status message */}
          <div className="flex items-center gap-3 bg-[#E6F7EB] border border-[#BDECC9] rounded-2xl p-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#BDECC9] flex items-center justify-center text-[#48B56B] shrink-0 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#15213D] leading-snug">
              {statusMessage}
            </p>
          </div>

          {/* Grid Area */}
          <div className="flex justify-center p-6 bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] shadow-inner">
            <div
              className="grid gap-2.5 select-none"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(56px, 68px))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(56px, 68px))`,
              }}
            >
              {Array.from({ length: gridSize }).map((_, y) =>
                Array.from({ length: gridSize }).map((_, x) => {
                  const key = `${x},${y}`;
                  const type = cells[key] || 'empty';
                  const isRobot = robotPos.x === x && robotPos.y === y;
                  const isStart = x === robotStart.x && y === robotStart.y;
                  const isCrystalCollected = type === 'crystal' && collectedCrystals.includes(key);

                  return (
                    <button
                      key={key}
                      onClick={() => handleCellClick(x, y)}
                      className={`relative rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                        type === 'wall'
                          ? 'bg-[#64748B] border-[#475569] shadow-inner'
                          : type === 'exit'
                          ? 'bg-purple-50 border-purple-300'
                          : isStart
                          ? 'bg-blue-50/60 border-blue-200'
                          : 'bg-white border-[#E2E8F0] hover:border-emerald-300'
                      }`}
                    >
                      {/* Cell Items */}
                      {type === 'wall' && (
                        <span className="text-2xl select-none">🧱</span>
                      )}
                      {type === 'exit' && (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl animate-spin" style={{ animationDuration: '8s' }}>🌀</span>
                        </div>
                      )}
                      {type === 'crystal' && !isCrystalCollected && (
                        <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>💎</span>
                      )}
                      {type === 'crystal' && isCrystalCollected && (
                        <span className="text-xs text-slate-300 select-none">✨</span>
                      )}

                      {/* Robot on cell */}
                      {isRobot && (
                        <div className="absolute inset-1.5 rounded-xl bg-white border-2 border-[#48B56B] shadow-md flex items-center justify-center z-10">
                          <Bot className="w-6 h-6 text-[#48B56B]" />
                          <div className={`absolute -right-1 text-emerald-600 transition-transform ${DIR_ROTATION[robotDir]}`}>
                            ▶
                          </div>
                        </div>
                      )}

                      {/* Start label */}
                      {isStart && !isRobot && (
                        <span className="absolute bottom-1 text-[9px] font-bold text-blue-600 uppercase">
                          Início
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Execution Controls */}
          <ExecutionControls
            isRunning={isRunning}
            isPaused={isPaused}
            currentStepIndex={currentStepIndex}
            totalSteps={program.length}
            speed={speed}
            onPlay={handleStartPlay}
            onPause={() => setIsPaused(true)}
            onStepForward={handleStepForward}
            onReset={resetSimulation}
            onSpeedChange={setSpeed}
            primaryColor={theme.primary}
          />
        </div>

        {/* Right: Program Assembler (40%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-bold text-[#15213D] flex items-center gap-2">
                  🧩 Programa do Robô
                </h3>
                <p className="text-xs text-[#536178]">
                  {program.length} instruções adicionadas
                </p>
              </div>

              {program.length > 0 && (
                <button
                  onClick={() => {
                    sound.remove();
                    setProgram([]);
                    resetSimulation();
                  }}
                  disabled={isRunning}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {/* Action Palettes */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8491A5]">
                Comandos Disponíveis
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addAction('forward', 'Avançar 1 Casa')}
                  disabled={isRunning}
                  className="p-2.5 bg-[#E7F2FF] hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                >
                  <ArrowUp className="w-4 h-4 text-blue-600" />
                  <span>Avançar</span>
                </button>

                <button
                  onClick={() => addAction('collect', 'Coletar Cristal')}
                  disabled={isRunning}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Coletar</span>
                </button>

                <button
                  onClick={() => addAction('turn_right', 'Girar à Direita 90°')}
                  disabled={isRunning}
                  className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-800 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                >
                  <RotateCw className="w-4 h-4 text-purple-600" />
                  <span>Girar Direita</span>
                </button>

                <button
                  onClick={() => addAction('turn_left', 'Girar à Esquerda 90°')}
                  disabled={isRunning}
                  className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-800 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                >
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>Girar Esquerda</span>
                </button>
              </div>
            </div>

            {/* Assembled Sequence Tray */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8491A5]">
                Fila de Execução Sequencial
              </span>

              {program.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFD] text-xs text-[#8491A5]">
                  Clique nos botões acima para montar seu algoritmo livre!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {program.map((block, idx) => {
                    const isActive = currentStepIndex === idx && isRunning;
                    return (
                      <div
                        key={block.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#48B56B] text-white border-emerald-600 shadow-sm translate-x-1'
                            : 'bg-white border-[#E2E8F0] text-[#15213D]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            isActive ? 'bg-white text-emerald-700' : 'bg-slate-100 text-[#536178]'
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{block.label}</span>
                        </div>

                        <button
                          onClick={() => removeAction(idx)}
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

            {/* Hint Card */}
            <HintCard hint="Você pode criar mapas fáceis com caminho direto ou desafios com labirintos cheios de paredes! Teste seu robô nas duas situações." />
          </div>
        </div>
      </div>

      {/* Pedagogical "Por que isso funciona?" Block */}
      <LearningInsight
        title="O Que Torna Alguém um Bom Pensador Computacional?"
        explanation="Não é decorar linhas de código em inglês. Pensamento computacional é o superpoder de pegar qualquer desafio complexo e dividi-lo em pequenas etapas claras e ordenadas que qualquer pessoa ou máquina consegue seguir com facilidade."
        analogy="Como cozinhar um prato gourmet: você não faz tudo ao mesmo tempo. Você pica os ingredientes, aquece a panela, refoga e prova o sal. Cada etapa tem sua hora certa!"
        accentColor={theme.primary}
        pillars={[
          { title: 'Decomposição', description: 'Quebrar um problema grande em pequenos pedaços gerenciáveis.' },
          { title: 'Reconhecimento de Padrões', description: 'Perceber movimentos e situações que se repetem.' },
          { title: 'Depuração (Debugging)', description: 'Descobrir pacientemente onde o robô se perdeu e corrigir o passo errado.' },
        ]}
      />
    </div>
  );
};
