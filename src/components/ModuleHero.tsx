import React from 'react';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { MODULE_THEMES } from '../designTokens';
import heroRobotImg from '../assets/images/hero_robot_landscape_1790197584388.jpg';

interface ModuleHeroProps {
  moduleId: string;
  title: string;
  subtitle: string;
  currentLevel?: number;
  totalLevels?: number;
  isCompleted?: boolean;
}

export const ModuleHero: React.FC<ModuleHeroProps> = ({
  moduleId,
  title,
  subtitle,
  currentLevel,
  totalLevels,
  isCompleted,
}) => {
  const theme = MODULE_THEMES[moduleId] || MODULE_THEMES.sequence;

  return (
    <div 
      className="w-full rounded-[24px] p-6 sm:p-8 relative overflow-hidden border transition-all shadow-card-soft"
      style={{
        background: theme.heroBg,
        borderColor: theme.border,
      }}
    >
      {/* Visual background artwork for Sequence, or decorative motif */}
      {moduleId === 'sequence' ? (
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 lg:w-5/12 overflow-hidden pointer-events-none opacity-85 mix-blend-multiply flex items-center justify-end">
          <img 
            src={heroRobotImg} 
            alt="Ilustração do robô na trilha" 
            className="h-full w-full object-cover object-center mask-radial sm:rounded-r-[24px]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 40%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 40%, black 100%)',
            }}
          />
        </div>
      ) : (
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-2xl"
          style={{ backgroundColor: theme.primary }}
        />
      )}

      {/* Hero Content */}
      <div className="relative z-10 max-w-2xl">
        {/* Top Tag & Level Badge */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs"
            style={{
              backgroundColor: '#FFFFFF',
              color: theme.primary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
            {theme.number} • {theme.tag}
          </span>

          {currentLevel && totalLevels && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 text-[#536178] border border-[#E2E8F0]">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Nível {currentLevel} de {totalLevels}
            </span>
          )}

          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Módulo Concluído
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15213D] tracking-tight leading-tight mb-2">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#536178] font-normal leading-relaxed max-w-xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
