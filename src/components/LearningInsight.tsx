import React from 'react';
import { Lightbulb, CheckCircle, Sparkles, BookOpen } from 'lucide-react';

interface ConceptPillar {
  title: string;
  description: string;
}

interface LearningInsightProps {
  title?: string;
  explanation: string;
  analogy: string;
  pillars?: ConceptPillar[];
  accentColor?: string;
}

export const LearningInsight: React.FC<LearningInsightProps> = ({
  title = 'Por que isso funciona?',
  explanation,
  analogy,
  pillars = [
    { title: 'Sequência', description: 'Uma instrução depois da outra sem pular etapas.' },
    { title: 'Ordem', description: 'A posição de cada bloco altera completamente o resultado.' },
    { title: 'Precisão', description: 'O robô cumpre à risca o que você mandar, sem adivinhar.' },
  ],
  accentColor = '#2787F5',
}) => {
  return (
    <div className="w-full bg-[#EEF5FF] rounded-[24px] border border-[#BBDDFF] p-6 sm:p-8 shadow-card-soft relative overflow-hidden">
      {/* Decorative gentle glow */}
      <div 
        className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full opacity-30 blur-2xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Insight & Analogy */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 fill-amber-400 stroke-[2]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#15213D] tracking-tight">
              {title}
            </h3>
          </div>

          <p className="text-sm sm:text-base text-[#15213D] leading-relaxed font-medium">
            {explanation}
          </p>

          <div className="flex items-start gap-3 bg-white/80 rounded-2xl p-4 border border-[#BBDDFF]/70 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs sm:text-sm text-[#536178] leading-relaxed">
              <strong className="text-[#15213D]">Analogia do dia a dia:</strong> {analogy}
            </p>
          </div>
        </div>

        {/* Right Column: 3 Concept Pillars */}
        <div className="lg:col-span-5 space-y-2.5">
          {pillars.map((pillar, i) => (
            <div 
              key={i}
              className="bg-white rounded-2xl p-3.5 border border-[#BBDDFF]/60 shadow-2xs flex items-start gap-3 transition-transform hover:translate-x-1"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundColor: accentColor }}
              >
                {i + 1}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#15213D]">
                  {pillar.title}
                </h4>
                <p className="text-xs text-[#536178] mt-0.5 leading-normal">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
