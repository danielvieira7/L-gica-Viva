import React from 'react';
import { Lightbulb, Bot } from 'lucide-react';

interface HintCardProps {
  hint: string;
}

export const HintCard: React.FC<HintCardProps> = ({ hint }) => {
  return (
    <div className="w-full bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden transition-all">
      <div className="flex items-start gap-3.5">
        {/* Glow bulb icon */}
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
          <Lightbulb className="w-5 h-5 fill-amber-400 stroke-[2.2]" />
        </div>

        {/* Content */}
        <div className="flex-1 pr-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-1">
            Dica do Mentor
          </span>
          <p className="text-xs sm:text-sm text-[#15213D] leading-relaxed font-medium">
            {hint}
          </p>
        </div>

        {/* Friendly cute Robot peeking */}
        <div className="absolute -right-2 -bottom-2 w-14 h-14 bg-white/60 rounded-full border border-amber-200/80 flex items-center justify-center shadow-xs">
          <div className="relative">
            <Bot className="w-7 h-7 text-blue-600" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
