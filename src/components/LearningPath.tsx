import React from 'react';
import { 
  Footprints, 
  GitFork, 
  Repeat, 
  Box, 
  ArrowDownUp, 
  Search, 
  Wrench,
  Check
} from 'lucide-react';
import { ModuleId } from '../types';
import { MODULE_THEMES } from '../designTokens';
import { sound } from '../utils/sound';

interface LearningPathProps {
  currentModule: ModuleId;
  onSelectModule: (mod: ModuleId) => void;
  completedLevels?: Record<string, boolean>;
  completedModules?: Record<ModuleId, boolean>;
}

interface PathItem {
  id: ModuleId;
  number: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PATH_ITEMS: PathItem[] = [
  { id: 'sequence', number: '01', name: 'Sequência', icon: Footprints },
  { id: 'condition', number: '02', name: 'Decisões', icon: GitFork },
  { id: 'loop', number: '03', name: 'Repetições', icon: Repeat },
  { id: 'variable', number: '04', name: 'Memória', icon: Box },
  { id: 'sort', number: '05', name: 'Ordenação', icon: ArrowDownUp },
  { id: 'search', number: '06', name: 'Busca', icon: Search },
  { id: 'sandbox', number: '07', name: 'Oficina', icon: Wrench },
];

export const LearningPath: React.FC<LearningPathProps> = ({
  currentModule,
  onSelectModule,
  completedLevels = {},
  completedModules = {},
}) => {
  return (
    <section className="learning-path w-full bg-white/90 border border-[#cde1f4] rounded-2xl py-2.5 px-2.5 sm:px-3 shadow-card-soft">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-stretch gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none scroll-smooth">
          {PATH_ITEMS.map((item, idx) => {
            const isActive = currentModule === item.id;
            const isDone = Boolean(
              completedModules[item.id] || 
              Object.keys(completedLevels).some((k) => k.startsWith(item.id))
            );
            const theme = MODULE_THEMES[item.id];
            const Icon = item.icon;

            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => {
                    sound.click();
                    onSelectModule(item.id);
                  }}
                  className={`module-tab group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer text-left ${
                    isActive
                      ? 'shadow-sm font-semibold'
                      : 'hover:bg-[#F8FAFD] font-medium text-[#536178] hover:text-[#15213D]'
                  }`}
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${theme.primary}, ${theme.textDark})` : theme.light,
                    border: `1.5px solid ${isActive ? theme.primary : theme.border}`,
                  }}
                >
                  {/* Number / State Icon Circle */}
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 shrink-0"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,.18)' : isDone ? '#22A06B' : theme.primary,
                      color: '#FFFFFF',
                    }}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Label & Number */}
                  <div className="flex flex-col">
                    <span 
                      className="text-[10px] tracking-wider uppercase font-bold"
                      style={{ color: isActive ? '#FFFFFF' : theme.textDark }}
                    >
                      {item.number}
                    </span>
                    <span
                      className="text-xs sm:text-sm whitespace-nowrap"
                      style={{ color: isActive ? '#FFFFFF' : theme.textDark }}
                    >
                      {item.name}
                    </span>
                  </div>

                  {/* Active bottom pill indicator */}
                  {isActive && (
                    <span
                      className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                  )}
                </button>

                {/* Connecting dots between items */}
                {idx < PATH_ITEMS.length - 1 && (
                  <div className="hidden lg:flex items-center text-[#CBD5E1] shrink-0">
                    <span className="w-3 h-0.5 bg-[#9ab9db] rounded-full" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};