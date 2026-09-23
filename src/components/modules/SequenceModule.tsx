import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, 
  RotateCcw as TurnLeftIcon, 
  RotateCw as TurnRightIcon, 
  Sparkles, 
  Key, 
  Trash2, 
  Play, 
  HelpCircle,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { ActionType, ActionBlock, Direction, GridPos, SequenceLevel } from '../../types';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ExecutionControls } from '../ExecutionControls';
import { TheoryCard } from '../TheoryCard';
import { VictoryModal } from '../VictoryModal';

const ACTION_DEFINITIONS: Record<ActionType, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  forward: {
    label: 'Avançar 1 Casa',
    icon: <ArrowUp className="w-4 h-4" />,
    color: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/40',
    desc: 'Move o robô 1 passo na direção em que está olhando',
  },
  turn_left: {
    label: 'Girar 90° à Esquerda',
    icon: <TurnLeftIcon className="w-4 h-4" />,
    color: 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/40',
    desc: 'Muda a direção do robô para a esquerda sem sair do lugar',
  },
  turn_right: {
    label: 'Girar 90° à Direita',
    icon: <TurnRightIcon className="w-4 h-4" />,
    color: 'bg-orange-600 hover:bg-orange-500 text-white border-orange-400/40',
    desc: 'Muda a direção do robô para a direita sem sair do lugar',
  },
  collect: {
    label: 'Coletar Cristal',
    icon: <Sparkles className="w-4 h-4 text-cyan-200" />,
    color: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40',
    desc: 'Guarda o cristal que está na mesma casa do robô',
  },
  use_key: {
    label: 'Usar Chave / Abrir',
    icon: <Key className="w-4 h-4 text-amber-200" />,
    color: 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400/40',
    desc: 'Desativa a barreira de segurança à frente',
  },
  plant: {
    label: 'Plantar',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-green-600 hover:bg-green-500 text-white border-green-400/40',
    desc: 'Planta na casa atual',
  },
  water: {
    label: 'Regar',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400/40',
    desc: 'Rega a planta na casa atual',
  },
  jump: {
    label: 'Pular',
    icon: <ArrowUp className="w-4 h-4" />,
    color: 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/40',
    desc: 'Pula um obstáculo',
  },
};

const LEVELS: SequenceLevel[] = [
  {
    id: 1,
    title: 'O Primeiro Passo do Robô',
    subtitle: 'Sequência Linear',
    conceptTitle: 'O que é um algoritmo?',
    conceptDescription: 'Um algoritmo é simplesmente uma sequência ordenada de passos claros e sem ambiguidades para resolver um problema.',
    analogy: 'Pense em uma receita de bolo: você não pode colocar o bolo no forno antes de misturar a farinha! A ordem de cada passo é sagrada.',
    gridSize: { width: 5, height: 3 },
    robotStart: { pos: { x: 0, y: 1 }, dir: 'east' },
    cells: [
      { x: 2, y: 1, type: 'crystal' },
      { x: 4, y: 1, type: 'exit' },
      { x: 0, y: 0, type: 'wall' },
      { x: 1, y: 0, type: 'wall' },
      { x: 2, y: 0, type: 'wall' },
      { x: 3, y: 0, type: 'wall' },
      { x: 4, y: 0, type: 'wall' },
      { x: 0, y: 2, type: 'wall' },
      { x: 1, y: 2, type: 'wall' },
      { x: 2, y: 2, type: 'wall' },
      { x: 3, y: 2, type: 'wall' },
      { x: 4, y: 2, type: 'wall' },
    ],
    allowedActions: ['forward', 'collect'],
    maxBlocks: 6,
    hint: 'O robô já está olhando para a direita. Diga para ele avançar até o cristal, coletar, e depois continuar avançando até o portal!',
  },
  {
    id: 2,
    title: 'A Curva Cega',
    subtitle: 'Orientação Espacial e Rotação',
    conceptTitle: 'O computador não adivinha intenções',
    conceptDescription: 'Robôs não "sabem" para onde ir por conta própria. Girar é uma ação separada de andar! Para virar à direita, você deve dar um comando explícito de giro.',
    analogy: 'Imagine dar instruções com olhos vendados: "Dê 2 passos, gire o corpo para a direita, dê mais 2 passos". Se você esquecer de dizer para girar, a pessoa baterá na parede!',
    gridSize: { width: 4, height: 4 },
    robotStart: { pos: { x: 0, y: 0 }, dir: 'east' },
    cells: [
      { x: 2, y: 0, type: 'crystal' },
      { x: 2, y: 2, type: 'crystal' },
      { x: 0, y: 2, type: 'exit' },
      { x: 0, y: 1, type: 'wall' },
      { x: 1, y: 1, type: 'wall' },
      { x: 3, y: 0, type: 'wall' },
      { x: 3, y: 1, type: 'wall' },
      { x: 3, y: 2, type: 'wall' },
      { x: 3, y: 3, type: 'wall' },
      { x: 2, y: 3, type: 'wall' },
      { x: 1, y: 3, type: 'wall' },
    ],
    allowedActions: ['forward', 'turn_left', 'turn_right', 'collect'],
    maxBlocks: 10,
    hint: 'Avance 2 casas, pegue o cristal. Gire à direita (para olhar para o sul), avance 2 casas, pegue outro cristal. Gire à direita novamente e chegue à saída!',
  },
  {
    id: 3,
    title: 'A Barreira do Castelo',
    subtitle: 'Pré-requisitos e Dependências',
    conceptTitle: 'Dependências em Algoritmos',
    conceptDescription: 'Alguns passos só podem ser executados após outros terem sido cumpridos com sucesso. A ordem das causas e efeitos dita o resultado.',
    analogy: 'Você não pode abrir uma porta trancada com chave se você ainda não foi até a gaveta pegar a chave!',
    gridSize: { width: 5, height: 4 },
    robotStart: { pos: { x: 0, y: 3 }, dir: 'north' },
    cells: [
      { x: 0, y: 0, type: 'key' },
      { x: 2, y: 1, type: 'gate', gateClosed: true },
      { x: 4, y: 1, type: 'exit' },
      { x: 1, y: 1, type: 'wall' },
      { x: 1, y: 2, type: 'wall' },
      { x: 1, y: 3, type: 'wall' },
      { x: 3, y: 0, type: 'wall' },
      { x: 3, y: 2, type: 'wall' },
      { x: 3, y: 3, type: 'wall' },
    ],
    allowedActions: ['forward', 'turn_left', 'turn_right', 'collect', 'use_key'],
    maxBlocks: 14,
    hint: 'Suba até o fim para pegar a Chave com "Coletar Cristal/Item". Depois dê meia-volta ou vire à direita pelo corredor, use a chave no portão e saia!',
  },
];

interface SequenceModuleProps {
  onLevelCompleted: (levelId: number) => void;
}

export const SequenceModule: React.FC<SequenceModuleProps> = ({ onLevelCompleted }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];

  // User program list of blocks
  const [program, setProgram] = useState<ActionBlock[]>([]);

  // Execution state
  const [robotPos, setRobotPos] = useState<GridPos>(currentLevel.robotStart.pos);
  const [robotDir, setRobotDir] = useState<Direction>(currentLevel.robotStart.dir);
  const [collectedCrystals, setCollectedCrystals] = useState<GridPos[]>([]);
  const [hasKey, setHasKey] = useState(false);
  const [gateUnlocked, setGateUnlocked] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [statusMessage, setStatusMessage] = useState<string>('Monte a sequência de blocos e clique em Executar.');
  const [speed, setSpeed] = useState<number>(1);
  const [showVictory, setShowVictory] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when level changes
  useEffect(() => {
    resetState();
    setProgram([]);
  }, [levelIndex]);

  const resetState = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setRobotPos(currentLevel.robotStart.pos);
    setRobotDir(currentLevel.robotStart.dir);
    setCollectedCrystals([]);
    setHasKey(false);
    setGateUnlocked(false);
    setStatusMessage('Posição reiniciada. Pronto para testar seu algoritmo.');
  };

  const addActionToProgram = (type: ActionType) => {
    if (isRunning) return;
    if (currentLevel.maxBlocks && program.length >= currentLevel.maxBlocks) {
      sound.failure();
      setStatusMessage(`Limite de blocos atingido (${currentLevel.maxBlocks}). Tente otimizar!`);
      return;
    }
    sound.click();
    const def = ACTION_DEFINITIONS[type];
    const newBlock: ActionBlock = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      label: def.label,
      iconName: type,
      description: def.desc,
      color: def.color,
    };
    setProgram((prev) => [...prev, newBlock]);
  };

  const removeActionFromProgram = (index: number) => {
    if (isRunning) return;
    sound.remove();
    setProgram((prev) => prev.filter((_, i) => i !== index));
  };

  const clearProgram = () => {
    if (isRunning) return;
    sound.remove();
    setProgram([]);
    resetState();
  };

  // Helper direction rotation
  const getNextDirection = (current: Direction, turn: 'left' | 'right'): Direction => {
    const dirs: Direction[] = ['north', 'east', 'south', 'west'];
    const idx = dirs.indexOf(current);
    if (turn === 'right') {
      return dirs[(idx + 1) % 4];
    } else {
      return dirs[(idx + 3) % 4];
    }
  };

  // Helper forward position
  const getForwardPos = (pos: GridPos, dir: Direction): GridPos => {
    switch (dir) {
      case 'north': return { x: pos.x, y: pos.y - 1 };
      case 'east': return { x: pos.x + 1, y: pos.y };
      case 'south': return { x: pos.x, y: pos.y + 1 };
      case 'west': return { x: pos.x - 1, y: pos.y };
    }
  };

  // Execute a single step
  const executeSingleStep = (stepIdx: number): { success: boolean; finished: boolean } => {
    if (stepIdx < 0 || stepIdx >= program.length) {
      return { success: false, finished: true };
    }

    const action = program[stepIdx].type;
    setCurrentStepIndex(stepIdx);

    let nextPos = { ...robotPos };
    let nextDir = robotDir;
    let nextCollected = [...collectedCrystals];
    let nextHasKey = hasKey;
    let nextGate = gateUnlocked;

    switch (action) {
      case 'forward': {
        const target = getForwardPos(robotPos, robotDir);
        // Check grid boundary
        if (target.x < 0 || target.x >= currentLevel.gridSize.width || target.y < 0 || target.y >= currentLevel.gridSize.height) {
          sound.failure();
          setStatusMessage('Opa! O robô tentou sair do mapa. O algoritmo falhou por tentar andar no vazio!');
          setIsRunning(false);
          return { success: false, finished: true };
        }

        // Check walls & closed gates
        const cell = currentLevel.cells.find((c) => c.x === target.x && c.y === target.y);
        if (cell?.type === 'wall') {
          sound.failure();
          setStatusMessage('Colisão! O robô bateu de frente com uma parede.');
          setIsRunning(false);
          return { success: false, finished: true };
        }
        if (cell?.type === 'gate' && !gateUnlocked) {
          sound.failure();
          setStatusMessage('Barreira trancada! O portão com laser impediu o robô de passar.');
          setIsRunning(false);
          return { success: false, finished: true };
        }

        sound.step();
        nextPos = target;
        setRobotPos(nextPos);
        setStatusMessage(`Passo ${stepIdx + 1}: Robô avançou para (${nextPos.x}, ${nextPos.y}).`);
        break;
      }

      case 'turn_left': {
        sound.turn();
        nextDir = getNextDirection(robotDir, 'left');
        setRobotDir(nextDir);
        setStatusMessage(`Passo ${stepIdx + 1}: Robô virou 90° à esquerda.`);
        break;
      }

      case 'turn_right': {
        sound.turn();
        nextDir = getNextDirection(robotDir, 'right');
        setRobotDir(nextDir);
        setStatusMessage(`Passo ${stepIdx + 1}: Robô virou 90° à direita.`);
        break;
      }

      case 'collect': {
        // Check if there is crystal or key at robot's current position
        const cell = currentLevel.cells.find((c) => c.x === robotPos.x && c.y === robotPos.y);
        if (cell?.type === 'crystal') {
          const already = collectedCrystals.some((p) => p.x === robotPos.x && p.y === robotPos.y);
          if (!already) {
            sound.collect();
            nextCollected.push({ ...robotPos });
            setCollectedCrystals(nextCollected);
            setStatusMessage(`Passo ${stepIdx + 1}: Cristal valioso coletado com sucesso!`);
          } else {
            setStatusMessage(`Passo ${stepIdx + 1}: Tentou coletar, mas o cristal daqui já foi recolhido.`);
          }
        } else if (cell?.type === 'key') {
          sound.collect();
          nextHasKey = true;
          setHasKey(true);
          setStatusMessage(`Passo ${stepIdx + 1}: Chave de segurança obtida!`);
        } else {
          setStatusMessage(`Passo ${stepIdx + 1}: Coletar executado, mas não havia nada nesta casa.`);
        }
        break;
      }

      case 'use_key': {
        if (!hasKey) {
          sound.failure();
          setStatusMessage('Falha: Você tentou usar a chave, mas ainda não a pegou!');
        } else {
          sound.collect();
          nextGate = true;
          setGateUnlocked(true);
          setStatusMessage(`Passo ${stepIdx + 1}: Chave inserida! Barreira desativada.`);
        }
        break;
      }

      default:
        break;
    }

    // Check if reached exit
    const exitCell = currentLevel.cells.find((c) => c.type === 'exit');
    const allCrystals = currentLevel.cells.filter((c) => c.type === 'crystal');
    const allCrystalsCollected = allCrystals.every((c) => 
      nextCollected.some((item) => item.x === c.x && item.y === c.y)
    );

    if (exitCell && nextPos.x === exitCell.x && nextPos.y === exitCell.y) {
      if (allCrystalsCollected) {
        sound.success();
        triggerConfetti();
        setIsRunning(false);
        setStatusMessage('Sucesso absoluto! O robô seguiu o algoritmo perfeitamente e alcançou o objetivo.');
        setShowVictory(true);
        onLevelCompleted(currentLevel.id);
        return { success: true, finished: true };
      } else {
        setStatusMessage('Você chegou ao portal, mas esqueceu de coletar todos os cristais no caminho!');
      }
    }

    const isLastStep = stepIdx + 1 >= program.length;
    if (isLastStep) {
      setIsRunning(false);
      if (!(exitCell && nextPos.x === exitCell.x && nextPos.y === exitCell.y && allCrystalsCollected)) {
        setStatusMessage('O algoritmo terminou todos os passos, mas o robô não chegou à saída com todos os itens.');
      }
      return { success: true, finished: true };
    }

    return { success: true, finished: false };
  };

  // Step-by-step debug forward button
  const handleStepForward = () => {
    if (program.length === 0) return;
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= program.length) {
      resetState();
      return;
    }
    executeSingleStep(nextIdx);
  };

  // Continuous execution loop
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const delay = 750 / speed;
    timerRef.current = setTimeout(() => {
      const nextIdx = currentStepIndex + 1;
      if (nextIdx < program.length) {
        const res = executeSingleStep(nextIdx);
        if (!res.success || res.finished) {
          setIsRunning(false);
        }
      } else {
        setIsRunning(false);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, isPaused, currentStepIndex, speed, program, robotPos, robotDir, collectedCrystals, hasKey, gateUnlocked]);

  const handleStartPlay = () => {
    if (program.length === 0) return;
    if (currentStepIndex >= program.length - 1) {
      // Re-run from beginning
      setRobotPos(currentLevel.robotStart.pos);
      setRobotDir(currentLevel.robotStart.dir);
      setCollectedCrystals([]);
      setHasKey(false);
      setGateUnlocked(false);
      setCurrentStepIndex(-1);
    }
    setIsPaused(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  return (
    <div className="space-y-6">
      {/* Educational Concept Header */}
      <TheoryCard
        title={currentLevel.conceptTitle}
        subtitle={`Nível ${currentLevel.id}: ${currentLevel.title}`}
        concept={currentLevel.conceptDescription}
        analogyTitle="Analogia do Mundo Real:"
        analogyText={currentLevel.analogy}
        keyTakeaway="Computadores seguem instruções à risca na ordem exata que você determinar. Um passo no lugar errado muda todo o destino."
      />

      {/* Main Two-Zone Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: The Visual Stage Grid */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-200">Ambiente de Execução Visual</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Cristais: {collectedCrystals.length} / {currentLevel.cells.filter(c => c.type === 'crystal').length}
              </span>
              {hasKey && (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Key className="w-3.5 h-3.5" /> Chave OK
                </span>
              )}
            </div>
          </div>

          {/* The Physical Grid */}
          <div className="flex justify-center p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto">
            <div 
              className="grid gap-2 select-none"
              style={{
                gridTemplateColumns: `repeat(${currentLevel.gridSize.width}, minmax(56px, 68px))`,
                gridTemplateRows: `repeat(${currentLevel.gridSize.height}, minmax(56px, 68px))`,
              }}
            >
              {Array.from({ length: currentLevel.gridSize.height }).map((_, y) =>
                Array.from({ length: currentLevel.gridSize.width }).map((_, x) => {
                  const cell = currentLevel.cells.find((c) => c.x === x && c.y === y);
                  const isRobot = robotPos.x === x && robotPos.y === y;
                  const isCollected = collectedCrystals.some((c) => c.x === x && c.y === y);
                  const isExit = cell?.type === 'exit';
                  const isWall = cell?.type === 'wall';
                  const isCrystal = cell?.type === 'crystal' && !isCollected;
                  const isKey = cell?.type === 'key' && !hasKey;
                  const isGate = cell?.type === 'gate';

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`relative rounded-xl flex items-center justify-center transition-all duration-200 text-xs border ${
                        isWall
                          ? 'bg-slate-800/90 border-slate-700/60 shadow-inner'
                          : isExit
                          ? 'bg-indigo-950/60 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                          : isGate
                          ? gateUnlocked
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-950/50 border-rose-500/60 text-rose-400'
                          : 'bg-slate-900/60 border-slate-800/60'
                      }`}
                    >
                      {/* Grid coordinates subtle label */}
                      <span className="absolute top-1 left-1.5 text-[9px] text-slate-600 font-mono">
                        {x},{y}
                      </span>

                      {/* Content inside cell */}
                      {isWall && (
                        <div className="w-6 h-6 rounded bg-slate-700/40 border border-slate-600/30 flex items-center justify-center text-[10px] text-slate-500">
                          🧱
                        </div>
                      )}

                      {isExit && (
                        <div className="flex flex-col items-center">
                          <span className="text-xl animate-pulse">🌀</span>
                          <span className="text-[9px] font-bold text-indigo-300">PORTAL</span>
                        </div>
                      )}

                      {isCrystal && (
                        <div className="flex flex-col items-center animate-bounce">
                          <span className="text-xl">💎</span>
                        </div>
                      )}

                      {isKey && (
                        <div className="flex flex-col items-center">
                          <Key className="w-5 h-5 text-amber-400" />
                        </div>
                      )}

                      {isGate && (
                        <div className="flex flex-col items-center">
                          <span className="text-base">{gateUnlocked ? '🔓' : '🚧'}</span>
                          <span className="text-[8px] font-bold">
                            {gateUnlocked ? 'ABERTO' : 'LASER'}
                          </span>
                        </div>
                      )}

                      {/* The Robot Character */}
                      {isRobot && (
                        <div
                          className="absolute inset-0 flex items-center justify-center transition-transform duration-300 z-20"
                          style={{
                            transform: `rotate(${
                              robotDir === 'north' ? 0 : robotDir === 'east' ? 90 : robotDir === 'south' ? 180 : 270
                            }deg)`,
                          }}
                        >
                          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-md flex items-center justify-center border-2 border-indigo-200">
                            {/* Robot face & pointer */}
                            <span className="text-xs">🤖</span>
                            <div className="absolute -top-1 w-2 h-2 bg-amber-400 rotate-45 rounded-[1px] shadow-sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real-time Narrative Status Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="truncate">{statusMessage}</span>
          </div>

          {/* Playback Controls */}
          <ExecutionControls
            isRunning={isRunning}
            isPaused={isPaused}
            currentStepIndex={currentStepIndex}
            totalSteps={program.length}
            speed={speed}
            onPlay={handleStartPlay}
            onPause={handlePause}
            onStepForward={handleStepForward}
            onReset={resetState}
            onSpeedChange={setSpeed}
          />
        </div>

        {/* Right Zone: The Program Assembler Deck */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Instruction Palette */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Peças Disponíveis (Clique para Adicionar)
              </span>
              {currentLevel.maxBlocks && (
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {program.length} / {currentLevel.maxBlocks} blocos
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {currentLevel.allowedActions.map((actType) => {
                const def = ACTION_DEFINITIONS[actType];
                return (
                  <button
                    key={actType}
                    onClick={() => addActionToProgram(actType)}
                    disabled={isRunning}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50 ${def.color}`}
                  >
                    <div className="flex items-center gap-2">
                      {def.icon}
                      <span>{def.label}</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-normal">+ Adicionar</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: The Sequence Tape (Algorithm Program) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Sua Fita de Algoritmo
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({program.length} {program.length === 1 ? 'instrução' : 'instruções'})
                </span>
              </div>
              {program.length > 0 && (
                <button
                  onClick={clearProgram}
                  disabled={isRunning}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Tudo</span>
                </button>
              )}
            </div>

            {program.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl space-y-2">
                <p className="text-xs text-slate-400">A fita de comandos está vazia.</p>
                <p className="text-[11px] text-slate-500">
                  Clique nas peças acima para montar a lista de passos do robô!
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {program.map((block, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  return (
                    <div
                      key={block.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md shadow-indigo-500/20 translate-x-1'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                          isCurrent ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-medium">{block.label}</span>
                      </div>

                      <button
                        onClick={() => removeActionFromProgram(idx)}
                        disabled={isRunning}
                        title="Remover esta instrução"
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hint Accordion */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">Dica do Mentor:</span>
                <p>{currentLevel.hint}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      <VictoryModal
        isOpen={showVictory}
        title={currentLevel.title}
        explanation="Seu algoritmo seguiu a ordem correta de ações passo a passo! Sem um plano ordenado, o robô jamais conseguiria desviar dos muros e recolher os itens."
        hasNextLevel={levelIndex < LEVELS.length - 1}
        onNextLevel={() => {
          setShowVictory(false);
          setLevelIndex((prev) => prev + 1);
        }}
        onRestart={() => {
          setShowVictory(false);
          resetState();
        }}
      />
    </div>
  );
};
