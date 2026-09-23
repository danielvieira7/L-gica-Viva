import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  ArrowUp, 
  RotateCw, 
  Sparkles, 
  Bot, 
  Grid,
  Plus
} from 'lucide-react';
import { ActionType, ActionBlock, Direction, GridPos } from '../../types';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ExecutionControls } from '../ExecutionControls';
import { TheoryCard } from '../TheoryCard';

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
  const [statusMessage, setStatusMessage] = useState('Oficina Livre: crie seu próprio mapa e monte seu algoritmo personalizado!');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetSimulation = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setRobotPos(robotStart);
    setRobotDir('east');
    setCollectedCrystals([]);
    setStatusMessage('Posição reiniciada.');
  };

  const handleCellClick = (x: number, y: number) => {
    if (isRunning) return;
    if (x === robotStart.x && y === robotStart.y) return; // cannot overwrite start cell

    sound.click();
    const key = `${x},${y}`;
    setCells((prev) => {
      const copy = { ...prev };
      if (copy[key] === placeTool) {
        delete copy[key]; // toggle off
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
          setStatusMessage('O robô tentou sair dos limites do mapa!');
          setIsRunning(false);
          return;
        }

        const cellType = cells[`${target.x},${target.y}`];
        if (cellType === 'wall') {
          sound.failure();
          setStatusMessage('Colisão! Bateu em uma parede.');
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
          setStatusMessage(`Passo ${stepIdx + 1}: Cristal coletado!`);
        } else {
          setStatusMessage(`Passo ${stepIdx + 1}: Nada para coletar aqui.`);
        }
        break;
      }

      default:
        break;
    }

    // Check exit
    if (cells[`${nextPos.x},${nextPos.y}`] === 'exit') {
      sound.success();
      triggerConfetti();
      setIsRunning(false);
      setStatusMessage('🎉 Você atingiu o portal de saída!');
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

  return (
    <div className="space-y-6">
      <TheoryCard
        title="Oficina Livre de Algoritmos"
        subtitle="O Laboratório do Criador"
        concept="Agora que você já entendeu o pensamento algorítmico, aqui você é o engenheiro! Desenhe seus próprios desafios, posicione paredes e cristais, e teste se seu algoritmo é capaz de resolver qualquer quebra-cabeça."
        analogyTitle="Dica de Arquiteto de Software:"
        analogyText="Bons programadores testam seu algoritmo em cenários fáceis e difíceis. Se o algoritmo resolve qualquer labirinto sem mudar de código, você criou uma solução universal!"
        keyTakeaway="Aprender programação não é decorar comandos; é saber decompor problemas em passos lógicos simples."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Custom Map Stage */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Wrench className="w-4 h-4" />
              <span>Editor de Cenário (Clique no grid para alterar)</span>
            </div>
            {/* Tool picker */}
            <div className="flex items-center gap-1.5">
              {(['crystal', 'wall', 'exit', 'empty'] as CellType[]).map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    sound.click();
                    setPlaceTool(tool);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    placeTool === tool
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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

          {/* Grid */}
          <div className="flex justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/80">
            <div
              className="grid gap-2 select-none"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(56px, 64px))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(56px, 64px))`,
              }}
            >
              {Array.from({ length: gridSize }).map((_, y) =>
                Array.from({ length: gridSize }).map((_, x) => {
                  const key = `${x},${y}`;
                  const type = cells[key] || 'empty';
                  const isRobot = robotPos.x === x && robotPos.y === y;
                  const isStart = x === robotStart.x && y === robotStart.y;
                  const isCollected = collectedCrystals.includes(key);

                  return (
                    <button
                      key={key}
                      onClick={() => handleCellClick(x, y)}
                      className={`relative rounded-xl border flex items-center justify-center text-xs transition-all cursor-pointer ${
                        type === 'wall'
                          ? 'bg-slate-800 border-slate-700'
                          : type === 'exit'
                          ? 'bg-indigo-950/60 border-indigo-500/60'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <span className="absolute top-1 left-1.5 text-[8px] text-slate-600 font-mono">
                        {x},{y}
                      </span>

                      {type === 'wall' && <span className="text-sm">🧱</span>}
                      {type === 'crystal' && !isCollected && (
                        <span className="text-xl animate-bounce">💎</span>
                      )}
                      {type === 'exit' && <span className="text-xl">🌀</span>}
                      {isStart && type === 'empty' && !isRobot && (
                        <span className="text-[10px] text-slate-500 font-bold">INÍCIO</span>
                      )}

                      {/* Robot */}
                      {isRobot && (
                        <div
                          className="absolute inset-0 flex items-center justify-center transition-transform duration-200 z-10"
                          style={{
                            transform: `rotate(${
                              robotDir === 'north' ? 0 : robotDir === 'east' ? 90 : robotDir === 'south' ? 180 : 270
                            }deg)`,
                          }}
                        >
                          <div className="w-9 h-9 rounded-lg bg-indigo-600 border border-indigo-300 flex items-center justify-center shadow-lg">
                            <span>🤖</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Real-time Narrative Status Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
            <span>{statusMessage}</span>
          </div>

          {/* Stepper Controls */}
          <ExecutionControls
            isRunning={isRunning}
            isPaused={isPaused}
            currentStepIndex={currentStepIndex}
            totalSteps={program.length}
            speed={speed}
            onPlay={() => {
              if (program.length === 0) return;
              setIsPaused(false);
              setIsRunning(true);
            }}
            onPause={() => setIsPaused(true)}
            onStepForward={() => {
              if (program.length === 0) return;
              const next = currentStepIndex + 1;
              executeStep(next);
            }}
            onReset={resetSimulation}
            onSpeedChange={setSpeed}
          />
        </div>

        {/* Right: Program Builder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Comandos para seu Robô
              </span>
              <button
                onClick={() => {
                  sound.remove();
                  setProgram([]);
                  resetSimulation();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => addAction('forward', 'Avançar')}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Avançar</span>
              </button>
              <button
                onClick={() => addAction('turn_right', 'Girar à Direita')}
                className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCw className="w-4 h-4" />
                <span>Girar 90° Dir.</span>
              </button>
              <button
                onClick={() => addAction('turn_left', 'Girar à Esquerda')}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCw className="w-4 h-4 -scale-x-100" />
                <span>Girar 90° Esq.</span>
              </button>
              <button
                onClick={() => addAction('collect', 'Coletar')}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Coletar</span>
              </button>
            </div>

            {/* Program list */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 max-h-[260px] overflow-y-auto">
              {program.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Nenhum comando adicionado. Monte seu algoritmo clicando nos botões acima!
                </p>
              ) : (
                program.map((block, idx) => (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      currentStepIndex === idx
                        ? 'bg-indigo-600/40 border border-indigo-400 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-slate-500 mr-2">{idx + 1}.</span>
                    <span className="font-medium flex-1">{block.label}</span>
                    <button
                      onClick={() => setProgram((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
