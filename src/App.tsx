import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  GitFork, 
  Repeat, 
  Box, 
  ArrowUpDown, 
  Search, 
  Wrench, 
  Award,
  CheckCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { ModuleId, UserProgress } from './types';
import { loadProgress, saveProgress, markLevelCompleted } from './utils/storage';
import { sound } from './utils/sound';
import { Navbar } from './components/Navbar';
import { SequenceModule } from './components/modules/SequenceModule';
import { ConditionModule } from './components/modules/ConditionModule';
import { LoopModule } from './components/modules/LoopModule';
import { VariableModule } from './components/modules/VariableModule';
import { SortModule } from './components/modules/SortModule';
import { SearchModule } from './components/modules/SearchModule';
import { SandboxModule } from './components/modules/SandboxModule';

const MODULES_META: Array<{
  id: ModuleId;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
}> = [
  {
    id: 'sequence',
    number: '01',
    title: 'Sequência & Precisão',
    subtitle: 'O que é um algoritmo e por que a ordem importa',
    icon: <Bot className="w-4 h-4 text-blue-400" />,
    tag: 'Fundamento',
  },
  {
    id: 'condition',
    number: '02',
    title: 'Decisões no Caminho',
    subtitle: 'Como o computador escolhe usando SE / SENÃO',
    icon: <GitFork className="w-4 h-4 text-purple-400" />,
    tag: 'Bifurcações',
  },
  {
    id: 'loop',
    number: '03',
    title: 'Mágica da Repetição',
    subtitle: 'Loops: economize 90% do seu trabalho',
    icon: <Repeat className="w-4 h-4 text-emerald-400" />,
    tag: 'Automação',
  },
  {
    id: 'variable',
    number: '04',
    title: 'Memória & Variáveis',
    subtitle: 'As caixas etiquetadas que guardam informações',
    icon: <Box className="w-4 h-4 text-amber-400" />,
    tag: 'Memória RAM',
  },
  {
    id: 'sort',
    number: '05',
    title: 'Balança da Ordenação',
    subtitle: 'Como organizar listas gigantescas passo a passo',
    icon: <ArrowUpDown className="w-4 h-4 text-cyan-400" />,
    tag: 'Bubble Sort',
  },
  {
    id: 'search',
    number: '06',
    title: 'O Enigma da Busca',
    subtitle: 'Por que cortar ao meio é o segredo do Google',
    icon: <Search className="w-4 h-4 text-rose-400" />,
    tag: 'Busca Binária',
  },
  {
    id: 'sandbox',
    number: '07',
    title: 'Oficina Livre',
    subtitle: 'Crie seus próprios mapas e quebra-cabeças',
    icon: <Wrench className="w-4 h-4 text-slate-400" />,
    tag: 'Criativo',
  },
];

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('sequence');
  const [progress, setProgress] = useState<UserProgress>(loadProgress());
  const [soundActive, setSoundActive] = useState<boolean>(true);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
    setSoundActive(loaded.soundEnabled);
  }, []);

  const handleToggleSound = () => {
    const nextState = !soundActive;
    setSoundActive(nextState);
    sound.setMuted(!nextState);
    const updated = { ...progress, soundEnabled: nextState };
    setProgress(updated);
    saveProgress(updated);
  };

  const handleLevelCompleted = (levelId: number) => {
    const levelKey = `${currentModule}-${levelId}`;
    const updated = markLevelCompleted(levelKey, currentModule);
    setProgress(updated);
  };

  const currentMeta = MODULES_META.find((m) => m.id === currentModule) || MODULES_META[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar with Contract */}
      <Navbar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        totalStars={progress.totalStars}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Educational Application Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Module Selector Banner */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                <span>{currentMeta.number} · {currentMeta.tag}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {currentMeta.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {currentMeta.subtitle}
              </p>
            </div>

            {/* Overall Progress Tracker */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
              <Award className="w-5 h-5 text-amber-400" />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Desafios Concluídos
                </span>
                <span className="text-slate-200 font-bold font-mono">
                  {Object.keys(progress.completedLevels).length} etapas vencidas
                </span>
              </div>
            </div>
          </div>

          {/* Module Carousel Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-4">
            {MODULES_META.map((mod) => {
              const isSelected = currentModule === mod.id;
              const hasCompletedAny = Object.keys(progress.completedLevels).some((k) =>
                k.startsWith(mod.id)
              );

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    sound.click();
                    setCurrentModule(mod.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {mod.number}
                    </span>
                    {hasCompletedAny && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {mod.icon}
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {mod.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Interactive Simulation Stage */}
        <section className="min-h-[500px]">
          {currentModule === 'sequence' && (
            <SequenceModule onLevelCompleted={handleLevelCompleted} />
          )}
          {currentModule === 'condition' && (
            <ConditionModule onLevelCompleted={handleLevelCompleted} />
          )}
          {currentModule === 'loop' && (
            <LoopModule onLevelCompleted={handleLevelCompleted} />
          )}
          {currentModule === 'variable' && (
            <VariableModule onLevelCompleted={handleLevelCompleted} />
          )}
          {currentModule === 'sort' && (
            <SortModule onLevelCompleted={handleLevelCompleted} />
          )}
          {currentModule === 'search' && (
            <SearchModule onLevelCompleted={handleLevelCompleted} />
          )}
          {currentModule === 'sandbox' && <SandboxModule />}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500 space-y-1">
        <p>Lógica Viva · Desenvolvido para ensinar algoritmos a qualquer pessoa, sem código.</p>
        <p className="text-[11px] text-slate-600">
          Baseado nos princípios fundamentais de Sequência, Seleção, Iteração e Estruturas de Dados.
        </p>
      </footer>
    </div>
  );
}
