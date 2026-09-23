import React, { useState, useEffect } from 'react';
import { ModuleId, UserProgress } from './types';
import { loadProgress, saveProgress, markLevelCompleted } from './utils/storage';
import { sound } from './utils/sound';
import { AppHeader } from './components/AppHeader';
import { LearningPath } from './components/LearningPath';
import { SequenceModule } from './components/modules/SequenceModule';
import { ConditionModule } from './components/modules/ConditionModule';
import { LoopModule } from './components/modules/LoopModule';
import { VariableModule } from './components/modules/VariableModule';
import { SortModule } from './components/modules/SortModule';
import { SearchModule } from './components/modules/SearchModule';
import { SandboxModule } from './components/modules/SandboxModule';

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

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#15213D] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Friendly Light Header */}
      <AppHeader
        totalStars={progress.totalStars}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Educational Learning Deck */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Visual Learning Path (Trail of modules) */}
        <LearningPath
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          completedLevels={progress.completedLevels}
        />

        {/* Active Interactive Simulation Lab */}
        <section className="min-h-[500px] transition-all">
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

      {/* Friendly Educational Footer */}
      <footer className="w-full border-t border-[#E2E8F0] bg-white py-8 mt-12 text-center text-xs text-[#536178] space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold text-[#15213D] text-sm">
          <span>🧩 Lógica Viva</span>
          <span className="text-[#8491A5]">•</span>
          <span>Aprender lógica brincando, testando e observando</span>
        </div>
        <p className="max-w-md mx-auto text-[13px] text-[#536178]">
          Sem sintaxe difícil, sem códigos complexos. Apenas raciocínio algorítmico visual para todas as idades.
        </p>
      </footer>
    </div>
  );
}
