import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, X, Compass, Lightbulb } from 'lucide-react';
import { sound } from '../utils/sound';

interface AppHeaderProps {
  totalStars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetAllProgress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  totalStars,
  soundEnabled,
  onToggleSound,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-200/60 ring-2 ring-amber-100 flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-950 fill-amber-400 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-[#15213D]">
                  Lógica Viva
                </span>
                <span className="hidden md:inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Playground Educacional
                </span>
              </div>
              <p className="hidden sm:block text-xs font-medium text-[#536178]">
                Algoritmos visuais para aprender sem código
              </p>
            </div>
          </div>

          {/* Action Zone: Stars & Audio & Guide */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Stars Counter Pill */}
            <div 
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 font-bold text-sm shadow-xs transition-transform hover:scale-105"
              title="Estrelas conquistadas ao concluir desafios"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{totalStars}</span>
              <span className="hidden sm:inline text-xs font-medium text-amber-700">estrelas</span>
            </div>

            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                sound.click();
                onToggleSound();
              }}
              title={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
              aria-label={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
              className="w-10 h-10 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-[#536178] hover:text-[#15213D] hover:bg-white hover:border-slate-300 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              {soundEnabled ? (
                <Volume2 className="w-4.5 h-4.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-4.5 h-4.5 text-[#8491A5]" />
              )}
            </button>

            {/* Help / Manifesto Button */}
            <button
              onClick={() => {
                sound.click();
                setShowHelpModal(true);
              }}
              title="Como funciona o Lógica Viva"
              aria-label="Abrir guia do laboratório"
              className="w-10 h-10 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-[#536178] hover:text-[#15213D] hover:bg-white hover:border-slate-300 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <HelpCircle className="w-4.5 h-4.5 text-[#536178]" />
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Guide / Manifesto Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-[#536178] hover:text-[#15213D] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#15213D]">
                  Bem-vindo ao Lógica Viva!
                </h3>
                <p className="text-xs font-semibold text-[#2787F5] uppercase tracking-wider">
                  Aprenda lógica brincando e testando
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-[#536178] leading-relaxed mb-6">
              <p>
                Este é um <strong>laboratório de pensamento computacional</strong>. Não há linhas de código complexas nem sintaxes misteriosas.
              </p>
              <div className="bg-[#F8FAFD] rounded-2xl p-4 border border-[#E2E8F0] space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong>Missão:</strong> Observe o que precisa ser resolvido no mundo visual.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong>Experimentação:</strong> Encaixe comandos como blocos e quebra-cabeças.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong>Feedback & Passo a Passo:</strong> Dê Play e veja o robô ou máquina agir na hora!</span>
                </div>
              </div>
              <p className="text-xs text-[#8491A5]">
                Dica: Se errar, não tem problema! Programar é errar, consertar um bloquinho e tentar de novo até vencer!
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#2787F5] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Vamos Começar!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
