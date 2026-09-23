import { UserProgress, ModuleId } from '../types';
import { sound } from './sound';

const STORAGE_KEY = 'logica_viva_progresso_v1';

const defaultProgress: UserProgress = {
  completedLevels: {},
  completedModules: {
    sequence: false,
    condition: false,
    loop: false,
    variable: false,
    sort: false,
    search: false,
    sandbox: false,
  },
  totalStars: 0,
  soundEnabled: true,
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as UserProgress;
    if (parsed.soundEnabled !== undefined) {
      sound.setMuted(!parsed.soundEnabled);
    }
    return { ...defaultProgress, ...parsed };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

export function markLevelCompleted(levelKey: string, moduleId: ModuleId): UserProgress {
  const current = loadProgress();
  const wasCompleted = current.completedLevels[levelKey];
  
  const updatedLevels = {
    ...current.completedLevels,
    [levelKey]: true,
  };

  const newStars = wasCompleted ? current.totalStars : current.totalStars + 1;

  const updatedProgress: UserProgress = {
    ...current,
    completedLevels: updatedLevels,
    totalStars: newStars,
  };

  saveProgress(updatedProgress);
  return updatedProgress;
}
