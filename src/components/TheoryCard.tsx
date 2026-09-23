import React, { useState } from 'react';
import { Lightbulb, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { sound } from '../utils/sound';

interface TheoryCardProps {
  title: string;
  subtitle: string;
  concept: string;
  analogyTitle: string;
  analogyText: string;
  keyTakeaway: string;
}

export const TheoryCard: React.FC<TheoryCardProps> = ({
  title,
  subtitle,
  concept,
  analogyTitle,
  analogyText,
  keyTakeaway,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden transition-all">
      <div 
        onClick={() => {
          sound.click();
          setExpanded(!expanded);
        }}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs text-slate-400 font-normal">· {subtitle}</span>
            </h2>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-200">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-3 text-xs leading-relaxed text-slate-300">
          <p className="text-slate-200">{concept}</p>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 block mb-0.5">{analogyTitle}</span>
              <p className="text-slate-300">{analogyText}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-300">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-400">Regra de Ouro:</span>
            <span>{keyTakeaway}</span>
          </div>
        </div>
      )}
    </div>
  );
};
