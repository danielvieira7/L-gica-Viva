import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, 
  RotateCcw as TurnLeftIcon, 
  RotateCw as TurnRightIcon, 
  Sparkles, 
  Key, 
  Trash2, 
  Bot,
  MessageSquareQuote,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';
import { ActionType, ActionBlock, Direction, GridPos, SequenceLevel } from '../../types';
import { sound } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { ExecutionControls } from '../ExecutionControls';
import { ModuleHero } from '../ModuleHero';
import { HintCard } from '../HintCard';
import { LearningInsight } from '../LearningInsight';
import { VictoryModal } from '../VictoryModal';
import { MODULE_THEMES } from '../../designTokens';

const ACTION_DEFINITIONS: Record<ActionType, { 
  label: string; 
  shortLabel: string;
  icon: React.ReactNode; 
  bg: string; 
  hoverBg: string; 
  textColor: string; 
  border: string;
  desc: string;
}> = {
  forward: {
    label: 'Avançar 1 Casa',
    shortLabel: 'Avançar',
    icon: <ArrowUp className="w-4 h-4 stroke-[2.5]" />,
    bg: 'bg-[#E7F2FF]',
    hoverBg: 'hover:bg-[#D4E8FF]',
    textColor: 'text-[#1B6AD5]',
    border: 'border-[#BBDDFF]',
    desc: 'Move o robô 1 passo na direção em que está olhando',
  },
  turn_right: {
    label: 'Girar à Direita',
    shortLabel: 'Girar Direita',
    icon: <TurnRightIcon className="w-4 h-4 stroke-[2.5]" />,
    bg: 'bg-[#F0EBFF]',
    hoverBg: 'hover:bg-[#E3D9FF]',
    textColor: 'text-[#6A3ED4]',
    border: 'border-[#D8CCFF]',
    desc: 'Muda a direção do robô 90° para a direita sem sair do lugar',
  },
  turn_left: {
    label: 'Girar à Esquerda',
    shortLabel: 'Girar Esquerda',
    icon: <TurnLeftIcon className="w-4 h-4 stroke-[2.5]" />,
    bg: 'bg-[#FFEDEA]',
    hoverBg: 'hover:bg-[#FFDCD6]',
    textColor: 'text-[#D34537]',
    border: 'border-[#FFD0C9]',
    desc: 'Muda a direção do robô 90° para a esquerda sem sair do lugar',
  },
  collect: {
    label: 'Coletar Cristal',
    shortLabel: 'Coletar',
    icon: <Sparkles className="w-4 h-4 stroke-[2.5]" />,
    bg: 'bg-[#FFF5D8]',
    hoverBg: 'hover:bg-[#FEEBB5]',
    textColor: 'text-[#A06D08]',
    border: 'border-[#FFE299]',
    desc: 'Guarda o cristal ou item que está na mesma casa do robô',
  },
  use_key: {
    label: 'Usar Chave',
    shortLabel: 'Usar Chave',
    icon: <Key className="w-4 h-4 stroke-[2.5]" />,
    bg: 'bg-[#F3E8FF]',
    hoverBg: 'hover:bg-[#E9D5FF]',
    textColor: 'text-[#7E22CE]',
    border: 'border-[#D8B4FE]',
    desc: 'Desativa a barreira de segurança à frente',
  },
  plant: {
    label: 'Plantar',
    shortLabel: 'Plantar',
    icon: <Sparkles className="w-4 h-4" />,
    bg: 'bg-[#E6F7EB]',
    hoverBg: 'hover:bg-[#CFF2D8]',
    textColor: 'text-[#297B44]',
    border: 'border-[#BCEDC8]',
    desc: 'Planta na casa atual',
  },
  water: {
    label: 'Regar',
    shortLabel: 'Regar',
    icon: <Sparkles className="w-4 h-4" />,
    bg: 'bg-[#E0F2FE]',
    hoverBg: 'hover:bg-[#BAE6FD]',
    textColor: 'text-[#0369A1]',
    border: 'border-[#7DD3FC]',
    desc: 'Rega a planta na casa atual',
  },
  jump: {
    label: 'Pular',
    shortLabel: 'Pular',
    icon: <ArrowUp className="w-4 h-4" />,
    bg: 'bg-[#FFE4E6]',
    hoverBg: 'hover:bg-[#FECDD3]',
    textColor: 'text-[#E11D48]',
    border: 'border-[#FDA4AF]',
    desc: 'Pula um obstáculo',
  },
};

const LEVELS: SequenceLevel[] = [
  {
    id: 1,
    title: 'O Primeiro Passo do Robô',
    subtitle: 'Leve o robô até o portal e colete o cristal.',
    conceptTitle: 'O que é um algoritmo?',
    conceptDescription: 'Um algoritmo é simplesmente uma sequência ordenada de passos claros e sem ambiguidades para resolver um problema.',
    analogy: 'Pense em uma receita de bolo: você não pode colocar o bolo no forno antes de misturar os ovos e a farinha! A ordem de cada passo é sagrada.',
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
    subtitle: 'Oriente o robô pelo caminho sinuoso usando rotações.',
    conceptTitle: 'O computador não adivinha intenções',
    conceptDescription: 'Robôs não "sabem" virar sozinhos. Girar é uma ação separada de andar! Para virar, você deve fornecer um comando explícito de rotação.',
    analogy: 'Imagine dar instruções a alguém vendado: "Dê 2 passos, gire 90° à direita, dê mais 2 passos". Se você esquecer de dizer para girar, a pessoa baterá na parede!',
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
    hint: 'Avance 2 casas, pegue o primeiro cristal. Gire à direita para olhar para baixo, avance 2 casas, colete o segundo cristal. Gire à direita novamente e siga ao portal!',
  },
  {
    id: 3,
    title: 'A Barreira do Castelo',
    subtitle: 'Encontre a chave e destranque a passagem do portal.',
    conceptTitle: 'Dependências e Pré-requisitos',
    conceptDescription: 'Alguns passos só podem ser executados após outros terem sido cumpridos com sucesso. A causa antecede o efeito.',
    analogy: 'Você não pode abrir uma porta trancada com chave se antes não foi até a gaveta pegar a chave!',
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
    hint: 'Suba até o fim do corredor norte para coletar a Chave. Depois faça o caminho pelo corredor central, use a chave para abrir o laser e alcance a saída!',
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
  const [statusMessage, setStatusMessage] = useState<string>('Monte a sequência certa e teste sua solução!');
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
    setStatusMessage('Robô reposicionado. Pronto para testar seu algoritmo!');
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
      color: def.textColor,
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

  const getNextDirection = (current: Direction, turn: 'left' | 'right'): Direction => {
    const dirs: Direction[] = ['north', 'east', 'south', 'west'];
    const idx = dirs.indexOf(current);
    return turn === 'right' ? dirs[(idx + 1) % 4] : dirs[(idx + 3) % 4];
  };

  const getForwardPos = (pos: GridPos, dir: Direction): GridPos => {
    switch (dir) {
      case 'north': return { x: pos.x, y: pos.y - 1 };
      case 'east': return { x: pos.x + 1, y: pos.y };
      case 'south': return { x: pos.x, y: pos.y + 1 };
      case 'west': return { x: pos.x - 1, y: pos.y };
    }
  };

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
        // Boundary check
        if (target.x < 0 || target.x >= currentLevel.gridSize.width || target.y < 0 || target.y >= currentLevel.gridSize.height) {
          sound.failure();
          setStatusMessage('Ops! O robô tentou andar fora do mapa. Revise os passos!');
          setIsRunning(false);
          return { success: false, finished: true };
        }

        // Obstacles check
        const cell = currentLevel.cells.find((c) => c.x === target.x && c.y === target.y);
        if (cell?.type === 'wall') {
          sound.failure();
          setStatusMessage('Bateu na rocha! O robô encontrou um obstáculo no caminho.');
          setIsRunning(false);
          return { success: false, finished: true };
        }
        if (cell?.type === 'gate' && !gateUnlocked) {
          sound.failure();
          setStatusMessage('Barreira trancada! Desative o portão antes de tentar passar.');
          setIsRunning(false);
          return { success: false, finished: true };
        }

        sound.step();
        nextPos = target;
        setRobotPos(nextPos);
        setStatusMessage(`Passo ${stepIdx + 1}: Robô avançou para frente!`);
        break;
      }

      case 'turn_left': {
        sound.turn();
        nextDir = getNextDirection(robotDir, 'left');
        setRobotDir(nextDir);
        setStatusMessage(`Passo ${stepIdx + 1}: Robô girou 90° à esquerda.`);
        break;
      }

      case 'turn_right': {
        sound.turn();
        nextDir = getNextDirection(robotDir, 'right');
        setRobotDir(nextDir);
        setStatusMessage(`Passo ${stepIdx + 1}: Robô girou 90° à direita.`);
        break;
      }

      case 'collect': {
        const cell = currentLevel.cells.find((c) => c.x === robotPos.x && c.y === robotPos.y);
        if (cell?.type === 'crystal') {
          const already = collectedCrystals.some((p) => p.x === robotPos.x && p.y === robotPos.y);
          if (!already) {
            sound.collect();
            nextCollected.push({ ...robotPos });
            setCollectedCrystals(nextCollected);
            setStatusMessage(`Passo ${stepIdx + 1}: Cristal coletado com sucesso! ✨`);
          } else {
            setStatusMessage(`Passo ${stepIdx + 1}: O cristal deste local já foi guardado.`);
          }
        } else if (cell?.type === 'key') {
          sound.collect();
          nextHasKey = true;
          setHasKey(true);
          setStatusMessage(`Passo ${stepIdx + 1}: Chave de segurança recolhida! 🔑`);
        } else {
          setStatusMessage(`Passo ${stepIdx + 1}: Coletar executado, mas não havia itens aqui.`);
        }
        break;
      }

      case 'use_key': {
        if (!hasKey) {
          sound.failure();
          setStatusMessage('Falha: Você ainda não tem a chave para abrir o portão!');
        } else {
          sound.collect();
          nextGate = true;
          setGateUnlocked(true);
          setStatusMessage(`Passo ${stepIdx + 1}: Chave usada! Portão aberto.`);
        }
        break;
      }

      default:
        break;
    }

    // Victory condition check
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
        setStatusMessage('Incrível! O robô seguiu os passos perfeitamente e chegou ao portal!');
        setShowVictory(true);
        onLevelCompleted(currentLevel.id);
        return { success: true, finished: true };
      } else {
        setStatusMessage('Você alcançou o portal, mas faltou recolher todos os cristais!');
      }
    }

    const isLastStep = stepIdx + 1 >= program.length;
    if (isLastStep) {
      setIsRunning(false);
      if (!(exitCell && nextPos.x === exitCell.x && nextPos.y === exitCell.y && allCrystalsCollected)) {
        setStatusMessage('O algoritmo executou todos os comandos, mas o robô não completou a missão.');
      }
      return { success: true, finished: true };
    }

    return { success: true, finished: false };
  };

  const handleStepForward = () => {
    if (program.length === 0) return;
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= program.length) {
      resetState();
      return;
    }
    executeSingleStep(nextIdx);
  };

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

  const theme = MODULE_THEMES.sequence;

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <ModuleHero
        moduleId="sequence"
        title={currentLevel.title}
        subtitle={currentLevel.subtitle}
        currentLevel={currentLevel.id}
        totalLevels={LEVELS.length}
      />

      {/* Main Two-Zone Laboratory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Zone 1: Interactive Mission & Stage (60%) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-7 shadow-card-soft space-y-4">
          {/* Header of Stage */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#15213D] flex items-center gap-2">
                🎮 Missão Interativa
              </span>
            </div>

            {/* Crystals & Keys Indicators */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 fill-cyan-400" />
                <span>Cristais: {collectedCrystals.length} / {currentLevel.cells.filter(c => c.type === 'crystal').length}</span>
              </div>

              {currentLevel.cells.some(c => c.type === 'key') && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                  hasKey 
                    ? 'bg-amber-50 text-amber-900 border-amber-300' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  <Key className="w-3.5 h-3.5" />
                  <span>{hasKey ? 'Chave OK' : 'Sem Chave'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mentor Speech Bubble */}
          <div className="flex items-center gap-3 bg-[#EEF5FF] border border-[#BBDDFF] rounded-2xl p-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#BBDDFF] flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#15213D] leading-snug">
              {statusMessage}
            </p>
          </div>

          {/* The Visual World Board (Grassy Trail & Obstacles) */}
          <div className="p-4 sm:p-6 bg-[#F4F9EE] rounded-2xl border border-[#D5E8C4] overflow-x-auto shadow-inner flex justify-center items-center min-h-[300px]">
            <div 
              className="grid gap-2 select-none"
              style={{
                gridTemplateColumns: `repeat(${currentLevel.gridSize.width}, minmax(60px, 74px))`,
                gridTemplateRows: `repeat(${currentLevel.gridSize.height}, minmax(60px, 74px))`,
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
                      className={`relative rounded-2xl flex items-center justify-center transition-all duration-200 border text-xs ${
                        isWall
                          ? 'bg-[#94A3B8] border-[#64748B] shadow-md shadow-slate-400/30'
                          : isExit
                          ? 'bg-[#EEF2FF] border-[#818CF8] shadow-md shadow-indigo-300/40'
                          : isGate
                          ? gateUnlocked
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                            : 'bg-rose-50 border-rose-400 text-rose-700'
                          : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      {/* Gentle coordinate label */}
                      <span className="absolute top-1 left-2 text-[9px] font-semibold text-[#94A3B8] select-none">
                        {x},{y}
                      </span>

                      {/* Wall: cute solid rock */}
                      {isWall && (
                        <div className="flex flex-col items-center justify-center text-slate-100">
                          <span className="text-lg select-none">🪨</span>
                        </div>
                      )}

                      {/* Exit: magical blue vortex */}
                      {isExit && (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-2xl animate-spin" style={{ animationDuration: '8s' }}>🌀</span>
                          <span className="text-[9px] font-extrabold text-[#4338CA] tracking-wider uppercase mt-0.5">
                            Portal
                          </span>
                        </div>
                      )}

                      {/* Crystal: glowing cyan gem */}
                      {isCrystal && (
                        <div className="flex flex-col items-center justify-center animate-bounce">
                          <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center shadow-md shadow-cyan-300/40">
                            <span className="text-base select-none">💎</span>
                          </div>
                        </div>
                      )}

                      {/* Key: golden shiny key */}
                      {isKey && (
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shadow-md shadow-amber-300/40">
                            <Key className="w-4 h-4 text-amber-700 stroke-[2.5]" />
                          </div>
                        </div>
                      )}

                      {/* Gate: laser security barrier */}
                      {isGate && (
                        <div className="flex flex-col items-center justify-center">
                          {gateUnlocked ? (
                            <Unlock className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <Lock className="w-5 h-5 text-rose-600 stroke-[2.5]" />
                          )}
                          <span className="text-[8px] font-bold mt-0.5">
                            {gateUnlocked ? 'ABERTO' : 'LASER'}
                          </span>
                        </div>
                      )}

                      {/* The Friendly Robot Character */}
                      {isRobot && (
                        <div
                          className="absolute inset-0 flex items-center justify-center transition-transform duration-300 z-20"
                          style={{
                            transform: `rotate(${
                              robotDir === 'north' ? 0 : robotDir === 'east' ? 90 : robotDir === 'south' ? 180 : 270
                            }deg)`,
                          }}
                        >
                          <div className="relative w-11 h-11 rounded-2xl bg-white border-2 border-[#2787F5] shadow-lg flex items-center justify-center">
                            {/* Direction Pointer Arrow */}
                            <div className="absolute -top-2 w-3 h-3 bg-amber-400 rotate-45 rounded-[2px] shadow-sm border border-amber-500" />
                            
                            {/* Robot digital face */}
                            <div className="w-7 h-6 rounded-lg bg-[#0F172A] flex items-center justify-center text-[10px] text-cyan-300 font-bold select-none">
                              ^‿^
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Playback & Step Controls */}
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
            primaryColor={theme.primary}
          />
        </div>

        {/* Zone 2: Program Assembler Deck (40%) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Command Palette */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-bold text-[#15213D] flex items-center gap-1.5">
                  🧩 Monte seu algoritmo
                </h3>
                <p className="text-xs text-[#536178]">
                  Clique nos blocos para adicionar à sequência
                </p>
              </div>

              {currentLevel.maxBlocks && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-[#536178]">
                  {program.length} / {currentLevel.maxBlocks} máx
                </span>
              )}
            </div>

            {/* Chunky tactile command buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {currentLevel.allowedActions.map((actType) => {
                const def = ACTION_DEFINITIONS[actType];
                return (
                  <button
                    key={actType}
                    onClick={() => addActionToProgram(actType)}
                    disabled={isRunning}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all tactile-btn shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${def.bg} ${def.hoverBg} ${def.textColor} ${def.border}`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-white/90 flex items-center justify-center shrink-0 shadow-2xs">
                      {def.icon}
                    </div>
                    <span className="text-left">{def.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: Algorithm Sequence Tape */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card-soft space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#15213D]">
                  Sequência Montada
                </span>
                <span className="text-xs font-semibold text-[#8491A5]">
                  ({program.length} {program.length === 1 ? 'passo' : 'passos'})
                </span>
              </div>

              {program.length > 0 && (
                <button
                  onClick={clearProgram}
                  disabled={isRunning}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {program.length === 0 ? (
              <div className="py-8 px-4 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl space-y-1.5 bg-[#F8FAFD]">
                <p className="text-xs sm:text-sm font-semibold text-[#536178]">
                  Sua sequência está vazia.
                </p>
                <p className="text-xs text-[#8491A5]">
                  Clique nos blocos de comando acima para traçar o caminho do robô!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {program.map((block, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  const def = ACTION_DEFINITIONS[block.type];

                  return (
                    <div
                      key={block.id}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                        isCurrent
                          ? 'bg-blue-50 border-[#2787F5] ring-2 ring-blue-400/40 text-blue-900 shadow-sm translate-x-1 font-bold'
                          : 'bg-[#F8FAFD] border-[#E2E8F0] text-[#15213D] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent ? 'bg-[#2787F5] text-white' : 'bg-slate-200 text-[#536178]'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={def.textColor}>{def.icon}</span>
                          <span>{def.label}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeActionFromProgram(idx)}
                        disabled={isRunning}
                        title="Remover este comando"
                        aria-label="Remover comando"
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hint Card */}
            <HintCard hint={currentLevel.hint} />
          </div>
        </div>
      </div>

      {/* Pedagogical "Por que isso funciona?" Block */}
      <LearningInsight
        explanation={currentLevel.conceptDescription}
        analogy={currentLevel.analogy}
        accentColor={theme.primary}
        pillars={[
          { title: 'Sequência', description: 'Instruções executadas uma após a outra sem saltos arbitrários.' },
          { title: 'Ordem Importa', description: 'Mudar a posição de um bloco altera completamente a rota final.' },
          { title: 'Precisão Absoluta', description: 'O robô não supõe intenções: ele faz estritamente o que foi instruído.' },
        ]}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictory}
        title={currentLevel.title}
        explanation="O robô seguiu rigorosamente a ordem de comandos que você montou. O algoritmo funcionou porque você previu cada movimento e cada rotação antes da execução!"
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
