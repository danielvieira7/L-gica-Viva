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
    <div className="min-h-screen bg-[#dff1ff] text-[#15213D] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Friendly Light Header */}
      <AppHeader
        totalStars={progress.totalStars}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Educational Learning Deck */}
      <main className="app-shell flex-1 w-full mx-auto px-3 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4">
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
    </div>
  );
}